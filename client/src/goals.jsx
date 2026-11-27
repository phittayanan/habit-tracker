import React, { useEffect, useRef, useState } from 'react';
import { api } from './api.js';
import { amountText, minutesHint } from './time-format.js';
import { DeleteAsk, deleteEntry, editEntry } from './entry-edit.jsx';
export function bangkokToday(instant = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(instant);
}
function follow(event, navigate, path) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault(); navigate(path);
}
// Entries come newest date first; consecutive entries of one date form that day (OP-08.10, OP-08.11).
function byDay(entries) {
  const days = [];
  for (const entry of entries) {
    if (days.at(-1)?.date === entry.entryDate) days.at(-1).entries.push(entry);
    else days.push({ date: entry.entryDate, entries: [entry] });
  }
  return days;
}
// Whole hundredths add exactly; values have at most 2 decimal places.
const dayTotal = entries => entries.reduce((sum, entry) => sum + Math.round(entry.value * 100), 0) / 100;
function EntryPanel({ goal, onUnauthenticated, onSaved }) {
  const [entries, setEntries] = useState(null);
  const [entryDate, setEntryDate] = useState(() => bangkokToday());
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const valueRef = useRef(null);
  useEffect(() => {
    let active = true;
    api(`/api/goals/${goal.id}/entries`, {}, onUnauthenticated).then(body => { if (active) setEntries(body.entries); }).catch(error => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, [goal.id]);
  async function save(event) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setMessage('');
    try {
      const body = await api(`/api/goals/${goal.id}/entries`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        entryDate, value: value.trim() === '' ? undefined : Number(value),
      }) }, onUnauthenticated);
      // Newest date first; the sort is stable, so the new entry stays first within its date (OP-08.10).
      setEntries(list => [body.entry, ...(list || [])].sort((x, y) => (x.entryDate === y.entryDate ? 0 : x.entryDate < y.entryDate ? 1 : -1)));
      setValue('');
      onSaved?.();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  // F-13: the edited entry keeps its place (OP-13.2); a deleted one leaves the list.
  const replace = entry => setEntries(list => list.map(item => (item.id === entry.id ? entry : item)));
  const drop = id => setEntries(list => list.filter(item => item.id !== id));
  return <div className="entry-panel">
    <form className="entry-form" onSubmit={save} noValidate aria-label={`Entries for ${goal.template.name}`}>
      <label>Date<input name="entryDate" type="date" value={entryDate} onChange={event => setEntryDate(event.target.value)} /></label>
      <label>Value ({goal.template.unit})<input ref={valueRef} name="value" type="number" step="any" inputMode="decimal" value={value} onChange={event => setValue(event.target.value)} /></label>
      {goal.template.kind === 'TIME' ? <p className="time-hint">{minutesHint(value)}</p> : null}
      <button type="submit" disabled={busy}>Save entry</button>
      {message && <p role="alert" className="error">{message}</p>}
    </form>
    {entries === null && !message ? <p role="status">Loading…</p> : null}
    {entries?.length === 0 ? <p>No entries yet</p> : null}
    {entries?.length > 0 ? <ul className="entry-list">{byDay(entries).map(day => <li key={day.date}>
      <ul>{day.entries.map(entry => <EntryRow key={entry.id} goal={goal} entry={entry} onUnauthenticated={onUnauthenticated}
        onEdited={entry => { replace(entry); onSaved?.(); }} onDeleted={() => { drop(entry.id); valueRef.current?.focus(); onSaved?.(); }} />)}</ul>
      <p className="day-total">Day total: {amountText(dayTotal(day.entries), goal.template)}</p>
    </li>)}</ul> : null}
  </div>;
}
// F-13 section 6 on the goals page: "Edit" opens a number box in place; "Delete" asks first (ADR 0082).
function EntryRow({ goal, entry, onUnauthenticated, onEdited, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [asking, setAsking] = useState(false);
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const editRef = useRef(null);
  const deleteRef = useRef(null);
  const inputRef = useRef(null);
  const refocus = useRef(null);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);
  useEffect(() => { if (refocus.current) { refocus.current.current?.focus(); refocus.current = null; } });
  const what = `${amountText(entry.value, goal.template)} on ${entry.entryDate}`;
  const inputId = `entry-${entry.id}-value`;
  function stop(focus = editRef) { setEditing(false); setMessage(''); refocus.current = focus; }
  async function save(event) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setMessage('');
    try {
      const body = await editEntry(goal.id, entry.id, value.trim() === '' ? undefined : Number(value), onUnauthenticated);
      stop();
      onEdited(body.entry);
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (busy) return;
    setBusy(true); setMessage('');
    try {
      await deleteEntry(goal.id, entry.id, onUnauthenticated);
      setAsking(false);
      onDeleted();
    } catch (error) { setAsking(false); setMessage(error.message); refocus.current = deleteRef; setBusy(false); }
  }
  return <li className="entry-row">
    <span className="entry-text">{entry.entryDate}: {amountText(entry.value, goal.template)}</span>
    {editing ? <form className="entry-edit" onSubmit={save} noValidate>
      <label htmlFor={inputId}>New value ({goal.template.unit})</label>
      <input id={inputId} ref={inputRef} type="number" step="any" inputMode="decimal" value={value} onChange={event => setValue(event.target.value)}
        aria-invalid={message ? true : undefined} aria-describedby={message ? `${inputId}-error` : undefined} />
      {goal.template.kind === 'TIME' ? <p className="time-hint">{minutesHint(value)}</p> : null}
      <div className="entry-actions">
        <button type="submit" disabled={busy}>Save</button>
        <button type="button" disabled={busy} onClick={() => stop()}>Cancel</button>
      </div>
    </form> : <div className="entry-actions">
      <button type="button" ref={editRef} aria-label={`Edit ${what}`} onClick={() => { setValue(String(entry.value)); setMessage(''); setEditing(true); }}>Edit</button>
      <button type="button" ref={deleteRef} aria-label={`Delete ${what}`} onClick={() => { setMessage(''); setAsking(true); }}>Delete</button>
    </div>}
    {message && <p id={`${inputId}-error`} role="alert" className="error">{message}</p>}
    {asking ? <DeleteAsk text={what} busy={busy} onDelete={remove} onCancel={() => { setAsking(false); refocus.current = deleteRef; }} /> : null}
  </li>;
}
// F-14 (ADR 0084): change the daily target in place on the goals page, for a goal that has not ended.
function TargetChange({ goal, onUnauthenticated, onSaved }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const buttonRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  function show() { setValue(String(goal.dailyTarget)); setMessage(''); setOpen(true); }
  function close() { setOpen(false); setMessage(''); buttonRef.current?.focus(); }
  async function save(event) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setMessage('');
    try {
      await api(`/api/goals/${goal.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        dailyTarget: value.trim() === '' ? undefined : Number(value),
      }) }, onUnauthenticated);
      // Reload the list so the target and "N of M days met" are recomputed by the server.
      await onSaved?.();
      close();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  const notStarted = goal.startDate > bangkokToday();
  const inputId = `target-${goal.id}`;
  return <div className="target-change">
    <button type="button" ref={buttonRef} aria-describedby={`goal-${goal.id}-name`} aria-expanded={open} aria-controls={open ? `${inputId}-form` : undefined} onClick={() => (open ? close() : show())}>Change target</button>
    {open ? <form id={`${inputId}-form`} className="target-form" onSubmit={save} noValidate aria-label={`Change target for ${goal.template.name}`}>
      <label htmlFor={inputId}>New daily target ({goal.template.unit})</label>
      <input id={inputId} ref={inputRef} name="dailyTarget" type="number" step="any" inputMode="decimal" value={value} onChange={event => setValue(event.target.value)} aria-invalid={message ? true : undefined} aria-describedby={[goal.template.kind === 'TIME' && minutesHint(value) ? `${inputId}-hint` : '', `${inputId}-note`, message ? `${inputId}-error` : ''].filter(Boolean).join(' ')} />
      {goal.template.kind === 'TIME' ? <p id={`${inputId}-hint`} className="time-hint">{minutesHint(value)}</p> : null}
      <p id={`${inputId}-note`}>{notStarted ? `Applies from ${goal.startDate}.` : 'Applies from today. Earlier days keep their target.'}</p>
      <div className="form-actions">
        <button type="submit" disabled={busy}>Save</button>
        <button type="button" onClick={close}>Cancel</button>
      </div>
      {message && <p id={`${inputId}-error`} role="alert" className="error">{message}</p>}
    </form> : null}
  </div>;
}
export function GoalList({ navigate, onUnauthenticated }) {
  const [goals, setGoals] = useState(null);
  const [message, setMessage] = useState('');
  const active = useRef(true);
  const load = () => api('/api/goals', {}, onUnauthenticated).then(body => { if (active.current) setGoals(body.goals); }).catch(error => { if (active.current) setMessage(error.message); });
  useEffect(() => { active.current = true; load(); return () => { active.current = false; }; }, []);
  return <>
    <h1>Goals</h1>
    <p className="toolbar"><a className="button" href="/goals/new" onClick={event => follow(event, navigate, '/goals/new')}>+ New goal</a></p>
    {message && <p role="alert" className="error">{message}</p>}
    {goals === null && !message ? <p role="status">Loading…</p> : null}
    {goals?.length === 0 ? <p>No goals yet</p> : null}
    {goals?.length > 0 ? <ul className="goal-list">{goals.map(goal => <li key={goal.id}>
      <h2 id={`goal-${goal.id}-name`}>{goal.template.name}</h2>
      <p>Daily target: {amountText(goal.dailyTarget, goal.template)}</p>
      {goal.state === 'ACTIVE' ? <TargetChange goal={goal} onUnauthenticated={onUnauthenticated} onSaved={load} /> : null}
      <p>{goal.startDate} – {goal.endDate}</p>
      <p>{goal.state === 'ACTIVE' ? 'Active' : 'Ended'}</p>
      <p>{goal.progress.daysMet} of {goal.progress.daysSoFar} days met</p>
      <EntryPanel goal={goal} onUnauthenticated={onUnauthenticated} onSaved={load} />
    </li>)}</ul> : null}
  </>;
}
export function GoalForm({ navigate, onUnauthenticated }) {
  const [templates, setTemplates] = useState(null);
  const [templateId, setTemplateId] = useState('');
  const [dailyTarget, setDailyTarget] = useState('');
  const [startDate, setStartDate] = useState(() => bangkokToday());
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const templateRef = useRef(null);
  useEffect(() => {
    let active = true;
    api('/api/templates', {}, onUnauthenticated).then(body => {
      if (active) { setTemplates(body.templates); templateRef.current?.focus(); }
    }).catch(error => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, []);
  const selected = templates?.find(template => String(template.id) === templateId);
  async function save(event) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setMessage('');
    try {
      await api('/api/goals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        templateId: templateId === '' ? undefined : Number(templateId), dailyTarget: dailyTarget.trim() === '' ? undefined : Number(dailyTarget), startDate, endDate,
      }) }, onUnauthenticated);
      navigate('/goals');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  return <>
    <h1>New goal</h1>
    <form className="goal-form" onSubmit={save} noValidate>
      {message && <p role="alert" className="error">{message}</p>}
      {templates === null && !message ? <p role="status">Loading…</p> : null}
      <label htmlFor="goal-template">Template</label><select id="goal-template" ref={templateRef} name="templateId" value={templateId} onChange={event => setTemplateId(event.target.value)}>
        <option value="">Choose a template</option>
        {templates?.map(template => <option key={template.id} value={template.id}>{template.name}</option>)}
      </select>
      <label>Daily target<input name="dailyTarget" type="number" step="any" inputMode="decimal" value={dailyTarget} onChange={event => setDailyTarget(event.target.value)} aria-describedby="goal-unit" /></label>
      <p id="goal-unit" className="goal-unit">{selected?.unit || ''}</p>
      {selected?.kind === 'TIME' ? <p className="time-hint">{minutesHint(dailyTarget)}</p> : null}
      <label>Start date<input name="startDate" type="date" value={startDate} onChange={event => setStartDate(event.target.value)} /></label>
      <label>End date<input name="endDate" type="date" value={endDate} onChange={event => setEndDate(event.target.value)} /></label>
      <div className="form-actions">
        <button type="submit" disabled={busy}>Save</button>
        <a className="button" href="/goals" onClick={event => follow(event, navigate, '/goals')}>Cancel</a>
      </div>
      {busy ? <p role="status">Saving…</p> : null}
    </form>
  </>;
}
