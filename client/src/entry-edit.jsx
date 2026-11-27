// F-13 entry edit and delete (Issue #154; contract docs/sprints/sprint-2/F-13-entry-edit-delete.md, section 6).
// Shared by the goals page and the calendar day box.
import React, { useEffect, useId, useRef } from 'react';
import { api } from './api.js';

const json = { 'Content-Type': 'application/json' };
export const editEntry = (goalId, entryId, value, onUnauthenticated) => api(`/api/goals/${goalId}/entries/${entryId}`,
  { method: 'PATCH', headers: json, body: JSON.stringify({ value }) }, onUnauthenticated);
export const deleteEntry = (goalId, entryId, onUnauthenticated) => api(`/api/goals/${goalId}/entries/${entryId}`,
  { method: 'DELETE' }, onUnauthenticated);

// The delete question (ADR 0082): focus moves to Cancel, Tab stays inside, Escape or a click outside cancels.
export function DeleteAsk({ text, busy, onCancel, onDelete }) {
  const id = useId();
  const cancel = useRef(null);
  useEffect(() => { cancel.current?.focus(); }, []);
  return <div className="backdrop top" onClick={event => { if (event.target === event.currentTarget) onCancel(); }}>
    <div role="alertdialog" aria-modal="true" aria-labelledby={id} className="ask"
      onKeyDown={event => {
        // Kept from the day box behind, which would close on Escape or move focus on Tab.
        event.stopPropagation();
        if (event.key === 'Escape') { event.preventDefault(); onCancel(); return; }
        if (event.key !== 'Tab') return;
        const items = [...event.currentTarget.querySelectorAll('button:not(:disabled)')];
        const first = items[0]; const last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }}>
      <p id={id}>Delete {text}?</p>
      <div className="ask-actions">
        <button type="button" ref={cancel} onClick={onCancel}>Cancel</button>
        <button type="button" disabled={busy} onClick={onDelete}>Delete</button>
      </div>
    </div>
  </div>;
}
