// F-11 month calendar and day box (Issue #155; contract docs/sprints/sprint-2/F-11-month-calendar.md).
// The day colour, sign and legend (F-12) and the Calendar / List switch (F-15) are from Issue #156.
import React, { useEffect, useId, useRef, useState } from 'react';
import { api } from './api.js';
import { formatMinutes } from './time-format.js';
import { DAY_STATES, LEGEND, chipText } from './day-states.js';
import { DayList } from './calendar-list.jsx';

const asDate = text => new Date(`${text}T00:00:00Z`);
const format = (text, options) => new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...options }).format(asDate(text));
const dayLabel = text => format(text, { day: 'numeric', month: 'long' });
const dayHeading = text => format(text, { weekday: 'short', day: 'numeric', month: 'long' }).replace(',', '');
const monthTitle = month => format(`${month}-01`, { month: 'long', year: 'numeric' });
const shiftMonth = (month, by) => {
  const [year, number] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, number - 1 + by, 1));
  return date.toISOString().slice(0, 7);
};
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const STEP = 15;
// Values have at most 2 decimal places, so whole hundredths add exactly.
const cents = number => Math.round(number * 100);
const add = (x, y) => (cents(x) + cents(y)) / 100;
const amount = (value, goal) => (goal.kind === 'TIME' ? formatMinutes(value) : String(value));
const withUnit = (value, goal) => (goal.kind === 'TIME' ? formatMinutes(value) : `${value} ${goal.unit}`);

function useDesktop() {
  const query = '(min-width: 600px)';
  const [desktop, setDesktop] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const list = matchMedia(query);
    const change = () => setDesktop(list.matches);
    list.addEventListener('change', change);
    return () => list.removeEventListener('change', change);
  }, []);
  return desktop;
}

// What a draft would add, for the ADR 0067 question; null when nothing is unsaved.
function unsavedText(draft, goal) {
  if (!draft || !goal) return null;
  if (draft.amount > 0) return `+${withUnit(draft.amount, goal)}`;
  if (goal.kind === 'TIME' && (draft.hours.trim() !== '' || draft.minutes.trim() !== '')) {
    return withUnit((Number(draft.hours) || 0) * 60 + (Number(draft.minutes) || 0), goal);
  }
  if (goal.kind !== 'TIME' && draft.other.trim() !== '') return withUnit(draft.other.trim(), goal);
  return null;
}

export function CalendarPage({ navigate, onUnauthenticated }) {
  const desktop = useDesktop();
  // Calendar is selected after login (F-15, ADR 0048).
  const [view, setView] = useState('calendar');
  const [shown, setShown] = useState(null);
  const [chosen, setChosen] = useState(null);
  const [boxOpen, setBoxOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [draft, setDraft] = useState(null);
  const [asking, setAsking] = useState(null);
  const [focusAfter, setFocusAfter] = useState(null);
  const dayButtons = useRef(new Map());

  async function read(month) {
    const body = await api(`/api/calendar${month ? `?month=${month}` : ''}`, {}, onUnauthenticated);
    return body;
  }
  async function showMonth(month) {
    setMessage('');
    try {
      const body = await read(month);
      setShown(body);
      return body;
    } catch (error) { setMessage(error.message); return null; }
  }
  useEffect(() => {
    let active = true;
    read().then(body => {
      if (!active) return;
      setShown(body);
      setChosen(body.days.find(item => item.date === body.today));
    }).catch(error => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (focusAfter) { focusAfter(); setFocusAfter(null); }
  }, [focusAfter]);

  const goalOfDraft = draft && chosen?.goals.find(goal => goal.goalId === draft.goalId);
  // Run `then` now, or after the ADR 0067 question when an amount is unsaved.
  function whenSaved(then) {
    const text = unsavedText(draft, goalOfDraft);
    // Keep editing puts focus back where it was (keyboard use, NFR-06).
    if (text) setAsking({ text, then, back: document.activeElement });
    else { setDraft(null); then(); }
  }
  function chooseDay(item) {
    whenSaved(() => {
      setChosen(item);
      if (!desktop) setBoxOpen(true);
    });
  }
  function closeBox() {
    whenSaved(() => {
      setBoxOpen(false);
      const date = chosen?.date;
      setFocusAfter(() => () => dayButtons.current.get(date)?.focus());
    });
  }
  // After a save, read the chosen day's month again so the card, sign, colour and List update.
  async function reloadChosen() {
    const month = chosen.date.slice(0, 7);
    const body = await read(month);
    if (shown && shown.month === month) setShown(body);
    setChosen(body.days.find(item => item.date === chosen.date));
  }

  if (!shown) return message ? <p role="alert" className="error">{message}</p> : <p role="status">Loading…</p>;
  const current = shown.today.slice(0, 7);
  const first = shown.days[0].date;
  const lead = (asDate(first).getUTCDay() + 6) % 7;
  const cells = [...Array(lead).fill(null), ...shown.days];
  while (cells.length % 7) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const showBox = chosen && (desktop || boxOpen);

  const box = showBox ? <DayBox item={chosen} today={shown.today} desktop={desktop} draft={draft} setDraft={setDraft}
    whenSaved={whenSaved} onClose={closeBox} onSaved={reloadChosen} onUnauthenticated={onUnauthenticated} /> : null;
  function newGoal(event) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate('/goals/new');
  }
  return <div className="calendar-layout">
    <section className="calendar" aria-labelledby="month-title">
      <div className="calendar-toolbar">
        <a className="button" href="/goals/new" onClick={newGoal}>+ New goal</a>
        <div className="view-switch" role="group" aria-label="View">
          <button type="button" aria-pressed={view === 'calendar'} onClick={() => setView('calendar')}>Calendar</button>
          <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>List</button>
        </div>
      </div>
      <div className="month-bar">
        <button type="button" aria-label="Previous month" onClick={() => showMonth(shiftMonth(shown.month, -1))}>‹</button>
        <h1 id="month-title" className="month-title">{monthTitle(shown.month)}</h1>
        <button type="button" aria-label="Next month" disabled={shown.month >= current} onClick={() => showMonth(shiftMonth(shown.month, 1))}>›</button>
      </div>
      {message && <p role="alert" className="error">{message}</p>}
      {view === 'list' ? <DayList month={shown.month} today={shown.today} days={shown.days} /> : <>
      <table className="month">
        <thead><tr>{WEEKDAYS.map(name => <th key={name} scope="col">{name}</th>)}</tr></thead>
        <tbody>{weeks.map((week, i) => <tr key={i}>{week.map((item, j) => <td key={j}>{item ? (() => {
          const future = item.date > shown.today;
          const state = DAY_STATES[item.state];
          return <button type="button" className={`day${state ? ` state-${item.state}` : ''}${chosen?.date === item.date && showBox ? ' chosen' : ''}`}
            ref={element => { if (element) dayButtons.current.set(item.date, element); else dayButtons.current.delete(item.date); }}
            aria-label={future ? `${dayLabel(item.date)}, future` : state ? `${dayLabel(item.date)}, ${state.words}` : dayLabel(item.date)}
            aria-current={item.date === shown.today ? 'date' : undefined}
            disabled={future} onClick={() => chooseDay(item)}><span>{Number(item.date.slice(8))}</span>
            {state ? <span className="day-sign">{state.sign}</span> : null}</button>;
        })() : null}</td>)}</tr>)}</tbody>
      </table>
      <p className="legend">{LEGEND}</p>
      </>}
    </section>
    {box}
    {asking ? <Discard text={asking.text} onKeep={() => { const back = asking.back; setAsking(null); setFocusAfter(() => () => back?.focus()); }}
      onDiscard={() => { const then = asking.then; setAsking(null); setDraft(null); then(); }} /> : null}
  </div>;
}

function Discard({ text, onKeep, onDiscard }) {
  const id = useId();
  const keep = useRef(null);
  useEffect(() => { keep.current?.focus(); }, []);
  return <div className="backdrop top" onClick={event => { if (event.target === event.currentTarget) onKeep(); }}>
    <div role="alertdialog" aria-modal="true" aria-labelledby={id} className="ask"
      onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); onKeep(); } }}>
      <p id={id}>Discard {text}?</p>
      <div className="ask-actions">
        <button type="button" ref={keep} onClick={onKeep}>Keep editing</button>
        <button type="button" onClick={onDiscard}>Discard</button>
      </div>
    </div>
  </div>;
}

function DayBox({ item, today, desktop, draft, setDraft, whenSaved, onClose, onSaved, onUnauthenticated }) {
  const id = useId();
  const close = useRef(null);
  useEffect(() => { if (!desktop) close.current?.focus(); }, [desktop]);
  const content = <>
    <h2 id={id}>{dayHeading(item.date)}</h2>
    {item.date === today ? <p className="today-note">Today</p> : null}
    {DAY_STATES[item.state] ? <p className={`state-chip state-${item.state}`}>{chipText(item.state)}</p> : null}
    {item.goals.length === 0 ? <p>No goals on this day.</p> : <ul className="goal-cards">{item.goals.map(goal =>
      <GoalCard key={goal.goalId} goal={goal} date={item.date} today={today} draft={draft?.goalId === goal.goalId ? draft : null}
        setDraft={setDraft} whenSaved={whenSaved} onSaved={onSaved} onUnauthenticated={onUnauthenticated} />)}</ul>}
  </>;
  if (desktop) return <section className="day-panel" aria-labelledby={id}>{content}</section>;
  return <div className="backdrop" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-labelledby={id} className="day-box"
      onKeyDown={event => {
        if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
        // Focus stays inside the modal box: Tab wraps from the last control to the first and back.
        if (event.key !== 'Tab') return;
        const items = [...event.currentTarget.querySelectorAll('button:not(:disabled), input, [tabindex="0"]')];
        const first = items[0]; const last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }}>
      <button type="button" className="close" ref={close} aria-label="Close" onClick={onClose}>✕</button>
      {content}
    </div>
  </div>;
}

function GoalCard({ goal, date, today, draft, setDraft, whenSaved, onSaved, onUnauthenticated }) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const openButton = useRef(null);
  const firstControl = useRef(null);
  const refocus = useRef(false);
  const fits = (cents(goal.maxValue) - cents(goal.total)) / 100;
  const full = fits <= 0;
  const focusInput = useRef(false);
  // Focus moves to the input once when it opens, and back to "+ Check in" after a save or Cancel.
  useEffect(() => { if (draft && focusInput.current && firstControl.current) { focusInput.current = false; firstControl.current.focus(); } });
  const fullText = useRef(null);
  // When the day is now full there is no "+ Check in", so focus goes to the "is full" text.
  useEffect(() => { if (!draft && refocus.current) { refocus.current = false; (openButton.current || fullText.current)?.focus(); } });
  function open() {
    whenSaved(() => { setMessage(''); focusInput.current = true; setDraft({ goalId: goal.goalId, amount: 0, other: '', hours: '', minutes: '' }); });
  }
  async function save(value) {
    if (busy) return;
    setBusy(true); setMessage('');
    try {
      await api(`/api/goals/${goal.goalId}/entries`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryDate: date, value }) }, onUnauthenticated);
      setDraft(null);
      await onSaved();
      // Set after the re-read, so focus goes to what the updated card shows.
      refocus.current = true;
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  const total = goal.total;
  const pct = goal.target > 0 ? Math.min(100, (cents(total) / cents(goal.target)) * 100) : 0;
  const when = date === today ? 'Today' : date;
  return <li className="goal-card">
    <h3>{goal.name}</h3>
    <p className="goal-total">{goal.kind === 'TIME' ? `${formatMinutes(total)} / ${formatMinutes(goal.target)}` : `${total} / ${goal.target} ${goal.unit}`}</p>
    {goal.met ? <p className="met">✓ met</p> : null}
    <div className="progress" role="progressbar" aria-label={`${goal.name} progress`} aria-valuemin={0} aria-valuemax={goal.target}
      aria-valuenow={Math.min(total, goal.target)} aria-valuetext={`${withUnit(total, goal)} of ${withUnit(goal.target, goal)}`}>
      <span style={{ width: `${pct}%` }} />
    </div>
    {goal.entries.length > 0 ? <p className="entries">{goal.entries.map(entry => amount(entry.value, goal)).join(' · ')}</p> : null}
    {full && !draft ? <p ref={fullText} tabIndex={-1}>{when} is full ({goal.maxValue} {goal.unit}).</p> : null}
    {!full && !draft ? <button type="button" ref={openButton} onClick={open}>+ Check in {goal.name}</button> : null}
    {draft ? <CheckIn goal={goal} draft={draft} setDraft={setDraft} fits={fits} busy={busy} save={save} fail={setMessage} firstControl={firstControl}
      cancel={() => { setMessage(''); refocus.current = true; setDraft(null); }} /> : null}
    {message && <p role="alert" className="error">{message}</p>}
  </li>;
}

function CheckIn({ goal, draft, setDraft, fits, busy, save, fail, firstControl, cancel }) {
  const set = change => setDraft({ ...draft, ...change });
  const typed = goal.kind === 'TIME'
    ? <form className="typed" noValidate onSubmit={event => {
      event.preventDefault();
      const empty = draft.hours.trim() === '' && draft.minutes.trim() === '';
      const minutes = draft.minutes.trim();
      // Section 4: minutes are a whole number from 0 to 59; anything else is not sent.
      if (minutes !== '' && !(Number.isInteger(Number(minutes)) && Number(minutes) >= 0 && Number(minutes) <= 59)) { fail('Minutes must be 0 to 59.'); return; }
      save(empty ? undefined : (Number(draft.hours) || 0) * 60 + (Number(draft.minutes) || 0));
    }}>
      <fieldset><legend>Exact</legend>
        <label>Hours<input type="number" min="0" step="1" inputMode="numeric" value={draft.hours} onChange={event => set({ hours: event.target.value })} /></label>
        <label>Minutes<input type="number" min="0" max="59" step="1" inputMode="numeric" value={draft.minutes} onChange={event => set({ minutes: event.target.value })} /></label>
        <button type="submit" disabled={busy}>Save</button>
      </fieldset>
    </form>
    : <form className="typed" noValidate onSubmit={event => { event.preventDefault(); save(draft.other.trim() === '' ? undefined : Number(draft.other)); }}>
      <label>Other amount<input type="number" step="any" inputMode="decimal" value={draft.other} onChange={event => set({ other: event.target.value })} /></label>
      <button type="submit" disabled={busy}>Save</button>
    </form>;
  if (goal.kind === 'TIME') return <div className="check-in">
    <TimeBar goal={goal} value={draft.amount} fits={fits} onChange={value => set({ amount: value })} barRef={firstControl} />
    <p className="adding"><output aria-live="polite">+{formatMinutes(draft.amount)}</output> <span>total {formatMinutes(goal.total + draft.amount)}</span></p>
    <div className="check-actions">
      <button type="button" onClick={cancel}>Cancel</button>
      <button type="button" disabled={draft.amount <= 0 || busy} onClick={() => save(draft.amount)}>Check in</button>
    </div>
    {typed}
  </div>;
  return <div className="check-in">
    <div className="counter">
      <button type="button" aria-label="One less" disabled={draft.amount <= 0} onClick={() => set({ amount: draft.amount - 1 })}>−</button>
      <output aria-live="polite">+{draft.amount}</output>
      <button type="button" ref={firstControl} aria-label="One more" disabled={cents(draft.amount + 1) > cents(fits)} onClick={() => set({ amount: draft.amount + 1 })}>+</button>
      <span>total {add(goal.total, draft.amount)} / {goal.target}</span>
      <button type="button" disabled={draft.amount <= 0 || busy} onClick={() => save(draft.amount)}>Done</button>
    </div>
    {typed}
  </div>;
}

// The light-up bar (ADR 0063, ADR 0064): 0 to the template maximum in 15-minute segments.
function TimeBar({ goal, value, fits, onChange, barRef }) {
  const segments = Math.ceil(goal.maxValue / STEP);
  const clamp = minutes => Math.max(0, Math.min(fits, minutes));
  function key(event) {
    const moves = { ArrowRight: value + STEP, ArrowUp: value + STEP, ArrowLeft: value - STEP, ArrowDown: value - STEP, Home: 0, End: fits };
    if (!(event.key in moves)) return;
    event.preventDefault();
    onChange(clamp(moves[event.key]));
  }
  function click(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const index = Math.min(segments - 1, Math.max(0, Math.floor(((event.clientX - rect.left) / rect.width) * segments)));
    onChange(clamp((index + 1) * STEP - goal.total));
  }
  return <div className="time-bar" role="slider" tabIndex={0} ref={barRef} aria-label={`${goal.name} time to add`}
    aria-valuemin={0} aria-valuemax={fits} aria-valuenow={value} aria-valuetext={`+${formatMinutes(value)}`}
    onKeyDown={key} onClick={click}>
    {Array.from({ length: segments }, (_, i) => {
      const start = i * STEP;
      const kind = start < goal.total ? 'logged' : start < goal.total + value ? 'adding' : '';
      return <span key={i} className={`segment ${kind}`} />;
    })}
    <span className="target-mark" style={{ left: `${Math.min(100, (goal.target / goal.maxValue) * 100)}%` }} />
  </div>;
}
