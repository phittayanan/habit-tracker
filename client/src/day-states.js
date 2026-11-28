// The F-12 signs and words (ADR 0070), shared by the calendar, the day box chip and the List.
export const DAY_STATES = {
  ALL_MET: { sign: '✓', words: 'all goals met', short: 'all met' },
  SOME_MET: { sign: '½', words: 'some goals met', short: 'some met' },
  NONE_MET: { sign: '✗', words: 'no goal met', short: 'none met' },
  NOTHING: { sign: '–', words: 'nothing recorded', short: 'nothing' },
};
export const LEGEND = '✓ all met, ½ some, ✗ none, – nothing';
export const chipText = state => {
  const { sign, words } = DAY_STATES[state];
  return `${sign} ${words[0].toUpperCase()}${words.slice(1)}`;
};
