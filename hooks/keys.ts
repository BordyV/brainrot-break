// The keys the feed's Client modules (controls.tsx, tap.tsx) turn into an
// action posted to the hooks module, once a click has given them the focus.
// Both take the same keys, so the keyboard keeps working whichever was clicked.

export const KEYS: Record<string, string> = {
  l: 'like',
  j: 'next',
  down: 'next',
  k: 'prev',
  up: 'prev',
  ' ': 'pause',
  m: 'comments',
  n: 'nope',
  t: 'menu',
  u: 'undo',
  h: 'help',
  '?': 'help',
  c: 'continue',
  x: 'close',
}
