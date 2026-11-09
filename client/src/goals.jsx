import React, { useEffect, useRef, useState } from 'react';
import { api } from './api.js';
export function bangkokToday(instant = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(instant);
}
function follow(event, navigate, path) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault(); navigate(path);
}
function EntryPanel({ goal, onUnauthenticated }) {
  const [entries, setEntries] = useState(null);
  const [entryDate, setEntryDate] = useState(() => bangkokToday());
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
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
      setEntries(list => [body.entry, ...(list || [])].sort((x, y) => (x.entryDate < y.entryDate ? 1 : -1)));
      setValue('');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  return <form className="entry-form" onSubmit={save} noValidate aria-label={`Entries for ${goal.template.name}`}>
    <label>Date<input name="entryDate" type="date" value={entryDate} onChange={event => setEntryDate(event.target.value)} /></label>
    <label>Value ({goal.template.unit})<input name="value" type="number" step="any" inputMode="decimal" value={value} onChange={event => setValue(event.target.value)} /></label>
    <button type="submit" disabled={busy}>Save entry</button>
    {message && <p role="alert" className="error">{message}</p>}
    {entries === null && !message ? <p role="status">Loading…</p> : null}
    {entries?.length === 0 ? <p>No entries yet</p> : null}
    {entries?.length > 0 ? <ul className="entry-list">{entries.map(entry => <li key={entry.id}>{entry.entryDate}: {entry.value} {goal.template.unit}</li>)}</ul> : null}
  </form>;
}
export function GoalList({ navigate, onUnauthenticated }) {
  const [goals, setGoals] = useState(null);
  const [message, setMessage] = useState('');
  useEffect(() => {
    let active = true;
    api('/api/goals', {}, onUnauthenticated).then(body => { if (active) setGoals(body.goals); }).catch(error => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, []);
  return <>
    <h1>Goals</h1>
    <p className="toolbar"><a className="button" href="/goals/new" onClick={event => follow(event, navigate, '/goals/new')}>+ New goal</a></p>
    {message && <p role="alert" className="error">{message}</p>}
    {goals === null && !message ? <p role="status">Loading…</p> : null}
    {goals?.length === 0 ? <p>No goals yet</p> : null}
    {goals?.length > 0 ? <ul className="goal-list">{goals.map(goal => <li key={goal.id}>
      <h2>{goal.template.name}</h2>
      <p>Daily target: {goal.dailyTarget} {goal.template.unit}</p>
      <p>{goal.startDate} – {goal.endDate}</p>
      <p>{goal.state === 'ACTIVE' ? 'Active' : 'Ended'}</p>
      <EntryPanel goal={goal} onUnauthenticated={onUnauthenticated} />
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
