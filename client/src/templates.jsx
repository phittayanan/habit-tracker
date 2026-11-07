import React, { useEffect, useRef, useState } from 'react';
import { api } from './api.js';

const stateWord = { ACTIVE: 'Active', RETIRED: 'Retired' };
const rangeText = (min, max) => `${min}\u2013${max}`;

function numberOrText(value) {
  const text = value.trim();
  if (text === '') return undefined;
  const numeric = Number(text);
  return Number.isFinite(numeric) ? numeric : text;
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

  return <>
    <h1>Templates</h1>
    {message && <p role="alert" className="error">{message}</p>}
    {manager && <p className="toolbar"><a className="button" href="/templates/new" onClick={openNew}>New</a></p>}
    {templates === null && !message ? <p role="status">Loading…</p> : null}
    {templates?.length === 0 ? <p>No templates yet</p> : null}
    {templates?.length > 0 ? <table className={manager ? 'manager' : 'participant'}>
      <thead><tr>
        <th scope="col">Name</th><th scope="col">Unit</th><th scope="col">Range</th>
        {manager ? <><th scope="col">State</th><th scope="col">Edit</th></> : null}
      </tr></thead>
      <tbody>
        {templates.map(template => <tr key={template.id}>
          <td>{template.name}</td>
          <td>{template.unit}</td>
          <td>{rangeText(template.minValue, template.maxValue)}</td>
          {manager ? <>
            <td>{stateWord[template.state]}</td>
            <td><button type="button">Edit</button></td>
          </> : null}
        </tr>)}
      </tbody>
    </table> : null}
  </>;
}

export function TemplateForm({ navigate, onUnauthenticated }) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [minimum, setMinimum] = useState('');
  const [maximum, setMaximum] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const nameRef = useRef(null);
  useEffect(() => { nameRef.current?.focus(); }, []);

  async function save(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      await api('/api/templates', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, unit, minValue: numberOrText(minimum), maxValue: numberOrText(maximum) }),
      }, onUnauthenticated);
      navigate('/templates');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  function cancel(event) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate('/templates');
  }

  return <>
    <h1>New template</h1>
    <form className="template-form" onSubmit={save} noValidate>
      {message && <p role="alert" className="error">{message}</p>}
      <label>Name<input ref={nameRef} name="name" value={name} onChange={event => setName(event.target.value)} /></label>
      <label>Unit<input name="unit" value={unit} onChange={event => setUnit(event.target.value)} /></label>
      <label>Minimum<input name="minimum" type="number" step="any" inputMode="decimal" value={minimum} onChange={event => setMinimum(event.target.value)} /></label>
      <label>Maximum<input name="maximum" type="number" step="any" inputMode="decimal" value={maximum} onChange={event => setMaximum(event.target.value)} /></label>
      <div className="form-actions">
        <button type="submit" disabled={busy}>Save</button>
        <a className="button" href="/templates" onClick={cancel}>Cancel</a>
      </div>
      {busy ? <p role="status">Saving…</p> : null}
    </form>
  </>;
}
