// Whole minutes shown as "7 h 10 min", "45 min" or "7 h" (ADR 0065).
export function formatMinutes(total) {
  const minutes = Math.abs(total);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const text = hours === 0 ? `${rest} min` : rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
  return total < 0 ? `-${text}` : text;
}

// The "= 7 h 10 min" text beside a box where minutes are typed. Empty until the box holds whole minutes.
export function minutesHint(typed) {
  const text = typed.trim();
  return text !== '' && Number.isInteger(Number(text)) ? `= ${formatMinutes(Number(text))}` : '';
}

// An amount with its unit; a Time amount in hours and minutes.
export const amountText = (value, template) => (template.kind === 'TIME' ? formatMinutes(value) : `${value} ${template.unit}`);
