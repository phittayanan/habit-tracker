// F-15 List view (Issue #156; contract docs/sprints/sprint-2/F-15-calendar-list.md, ADR 0071, ADR 0104).
// It shows the month the calendar shows, from the same GET /api/calendar read (ADR 0072).
import React, { useId } from 'react';
import { DAY_STATES } from './day-states.js';
import { formatMinutes } from './time-format.js';

// "Thu 27 Nov"
const shortDate = text => {
  const part = options => new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...options }).format(new Date(`${text}T00:00:00Z`));
  return `${part({ weekday: 'short' })} ${Number(text.slice(8))} ${part({ month: 'short' })}`;
};

// "Water 5 / 8 glasses (2 · 3)"; entries arrive newest saved first.
function goalLine(goal) {
  const time = goal.kind === 'TIME';
  const amount = value => (time ? formatMinutes(value) : String(value));
  const total = time ? `${formatMinutes(goal.total)} / ${formatMinutes(goal.target)}` : `${goal.total} / ${goal.target} ${goal.unit}`;
  const entries = goal.entries.length ? ` (${goal.entries.map(entry => amount(entry.value)).join(' · ')})` : '';
  return `${goal.name} ${total}${goal.met ? ' ✓' : ''}${entries}`;
}

// A List day is text only, not clickable (OP-15.3).
function Day({ item }) {
  const id = useId();
  const state = DAY_STATES[item.state];
  return <section data-date={item.date} aria-labelledby={id}>
    <h3 id={id}>{`${shortDate(item.date)} · ${state.sign} ${state.short}`}</h3>
    {item.goals.every(goal => goal.entries.length === 0) ? <p>No entries</p>
      : <ul>{item.goals.map(goal => <li key={goal.goalId}>{goalLine(goal)}</li>)}</ul>}
  </section>;
}

export function DayList({ month, today, days }) {
  // Days up to today with at least one active goal, newest first (ADR 0071).
  const listed = days.filter(item => item.date <= today && item.goals.length > 0).reverse();
  return <div className="day-list" data-month={month}>
    {listed.length === 0 ? <p>No goals in this month.</p> : listed.map(item => <Day key={item.date} item={item} />)}
  </div>;
}
