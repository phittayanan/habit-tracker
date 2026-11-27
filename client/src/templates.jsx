import React, { useEffect, useRef, useState } from 'react';
import { api } from './api.js';
import { formatMinutes, minutesHint } from './time-format.js';

const stateWord = { ACTIVE: 'Active', RETIRED: 'Retired' };
const kindWord = { COUNT: 'Count', TIME: 'Time' };
const rangeText = ({ kind, minValue, maxValue }) => (kind === 'TIME'
  ? `${formatMinutes(minValue)} \u2013 ${formatMinutes(maxValue)}`
  : `${minValue}\u2013${maxValue}`);

function numberOrText(value) {
  const text = value.trim();
  if (text === '') return undefined;
  const numeric = Number(text);
  return Number.isFinite(numeric) ? numeric : text;
}

// F-05 (ADR 0078): retiring is permanent, so it asks first in a modal dialog.
function RetireDialog({ template, onClose, onRetired, onUnauthenticated }) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const dialogRef = useRef(null);
  useEffect(() => { dialogRef.current.showModal(); }, []);
  // The open dialog closes first, so the page can take focus again.
  function close() { dialogRef.current.close(); onClose(); }
  // While the request runs, nothing may look like a cancel.
  function escape(event) { event.preventDefault(); if (!busy) close(); }
  async function confirm() {
    if (busy) return;
    setBusy(true); setMessage('');
    try {
      const body = await api(`/api/templates/${template.id}/retire`, { method: 'POST' }, onUnauthenticated);
      onRetired(body.template);
      close();
    } catch (error) { setMessage(error.message); setBusy(false); }
  }
  return <dialog ref={dialogRef} className="retire-dialog" aria-labelledby="retire-question" onCancel={escape}>
    <p id="retire-question">Retire "{template.name}"? New goals cannot use it. This cannot be undone.</p>
    {message && <p role="alert" className="error">{message}</p>}
    <div className="form-actions">
      <button type="button" onClick={close} disabled={busy}>Cancel</button>
      <button type="button" onClick={confirm} disabled={busy}>Retire</button>
    </div>
  </dialog>;
}

export function TemplateList({ user, navigate, onUnauthenticated }) {
  const [templates, setTemplates] = useState(null);
  const [message, setMessage] = useState('');
  const manager = user.role === 'MANAGER';
  useEffect(() => {
    let active = true;
    api('/api/templates', {}, onUnauthenticated).then(body => {
      if (active) setTemplates(body.templates);
    }).catch(error => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, []);

  function openNew(event) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate('/templates/new');
  }
  const openEdit = template => navigate(`/templates/${template.id}/edit`);
  const [asking, setAsking] = useState(null);
  const opener = useRef(null);
  function askRetire(event, template) { opener.current = event.currentTarget; setAsking(template); }
  function closeDialog() { setAsking(null); opener.current?.focus(); }
  const replace = changed => setTemplates(rows => rows.map(row => (row.id === changed.id ? changed : row)));

  return <>
    <h1>Templates</h1>
    {message && <p role="alert" className="error">{message}</p>}
    {manager && <p className="toolbar"><a className="button" href="/templates/new" onClick={openNew}>New</a></p>}
    {templates === null && !message ? <p role="status">Loading…</p> : null}
    {templates?.length === 0 ? <p>No templates yet</p> : null}
    {templates?.length > 0 ? <table className={manager ? 'manager' : 'participant'}>
      <thead><tr>
        <th scope="col">Name</th>{manager ? <th scope="col">Kind</th> : null}<th scope="col">Unit</th><th scope="col">Range</th>
        {manager ? <><th scope="col">State</th><th scope="col">Edit</th></> : null}
      </tr></thead>
      <tbody>
        {templates.map(template => <tr key={template.id}>
          <td>{template.name}</td>
          {manager ? <td>{kindWord[template.kind]}</td> : null}
          <td>{template.unit}</td>
          <td>{rangeText(template)}</td>
          {manager ? <>
            <td>{stateWord[template.state]}</td>
            <td>{template.state === 'ACTIVE' ? <div className="row-actions">
              <button type="button" onClick={() => openEdit(template)}>Edit</button>
              <button type="button" onClick={event => askRetire(event, template)}>Retire</button>
            </div> : null}</td>
          </> : null}
        </tr>)}
      </tbody>
    </table> : null}
    {asking ? <RetireDialog template={asking} onClose={closeDialog} onRetired={replace} onUnauthenticated={onUnauthenticated} /> : null}
  </>;
}

// F-04 sends only the fields that differ from the stored template.
function changedFields(stored, typed) {
  const changes = {};
  if (typed.kind !== stored.kind) changes.kind = typed.kind;
  if (typed.name !== stored.name) changes.name = typed.name;
  if (typed.unit !== stored.unit) changes.unit = typed.unit;
  const minValue = numberOrText(typed.minimum);
  const maxValue = numberOrText(typed.maximum);
  if (minValue !== stored.minValue) changes.minValue = minValue === undefined ? null : minValue;
  if (maxValue !== stored.maxValue) changes.maxValue = maxValue === undefined ? null : maxValue;
  return changes;
}

export function TemplateForm({ id, navigate, onUnauthenticated }) {
  const editing = id !== undefined;
  const [stored, setStored] = useState(null);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [kind, setKind] = useState('COUNT');
  // The unit typed before choosing Time, so choosing Count again gives it back.
  const countUnit = useRef('');
  const [minimum, setMinimum] = useState('');
  const [maximum, setMaximum] = useState('');
  const [message, setMessage] = useState('');
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const nameRef = useRef(null);
  const ready = !editing || stored !== null;
  useEffect(() => { if (ready) nameRef.current?.focus(); }, [ready]);
  useEffect(() => {
    if (!editing) return undefined;
    let active = true;
    api('/api/templates', {}, onUnauthenticated).then(body => {
      if (!active) return;
      const template = body.templates.find(row => String(row.id) === String(id));
      if (!template) { setMissing(true); return; }
      setStored(template);
      setName(template.name); setUnit(template.unit); setKind(template.kind);
      setMinimum(String(template.minValue)); setMaximum(String(template.maxValue));
    }).catch(error => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, [id]);

  async function save(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      const body = editing
        ? changedFields(stored, { name, unit, kind, minimum, maximum })
        : { name, unit, kind, minValue: numberOrText(minimum), maxValue: numberOrText(maximum) };
      await api(editing ? `/api/templates/${id}` : '/api/templates', {
        method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }, onUnauthenticated);
      navigate('/templates');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  function chooseKind(next) {
    if (next === 'TIME') { countUnit.current = unit; setUnit('minutes'); }
    else if (kind === 'TIME') setUnit(countUnit.current || unit);
    setKind(next);
  }
  function cancel(event) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate('/templates');
  }

  const heading = editing ? 'Edit template' : 'New template';
  if (missing) return <>
    <h1>{heading}</h1>
    <p role="alert" className="error">Template not found.</p>
    <div className="form-actions"><a className="button" href="/templates" onClick={cancel}>Cancel</a></div>
  </>;
  if (!ready) return <>
    <h1>{heading}</h1>
    {message ? <p role="alert" className="error">{message}</p> : <p role="status">Loading…</p>}
  </>;
  return <>
    <h1>{heading}</h1>
    <form className="template-form" onSubmit={save} noValidate>
      {message && <p role="alert" className="error">{message}</p>}
      <label>Name<input ref={nameRef} name="name" value={name} onChange={event => setName(event.target.value)} /></label>
      <label htmlFor="template-kind">Kind</label><select id="template-kind" name="kind" value={kind} onChange={event => chooseKind(event.target.value)}>
        <option value="COUNT">Count</option>
        <option value="TIME">Time</option>
      </select>
      <label>Unit<input name="unit" value={unit} readOnly={kind === 'TIME'} onChange={event => setUnit(event.target.value)} /></label>
      <label>Minimum<input name="minimum" type="number" step="any" inputMode="decimal" value={minimum} onChange={event => setMinimum(event.target.value)} aria-describedby={kind === 'TIME' ? 'minimum-time' : undefined} /></label>
      {kind === 'TIME' ? <p id="minimum-time" className="time-hint">{minutesHint(minimum)}</p> : null}
      <label>Maximum<input name="maximum" type="number" step="any" inputMode="decimal" value={maximum} onChange={event => setMaximum(event.target.value)} aria-describedby={kind === 'TIME' ? 'maximum-time' : undefined} /></label>
      {kind === 'TIME' ? <p id="maximum-time" className="time-hint">{minutesHint(maximum)}</p> : null}
      <div className="form-actions">
        <button type="submit" disabled={busy}>Save</button>
        <a className="button" href="/templates" onClick={cancel}>Cancel</a>
      </div>
      {busy ? <p role="status">Saving…</p> : null}
    </form>
  </>;
}
