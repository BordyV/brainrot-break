import type { Entry } from '../i18n'

// Puzzles & logic: names, authors, tags, captions and sounds.

export const PUZZLES = {
  hanoi: {
    name: { en: 'Tower of Hanoi', fr: 'tours de Hanoï' },
    authors: ['@hanoi.tower', '@three.pegs', '@optimal.moves'],
    tags: ['#towerofhanoi #puzzle #satisfying', '#recursion #maths', '#fyp #foryou'],
    captions: {
      en: ['31 moves. not one more.', 'never a big disc on a small one', 'the recursion you can watch', 'and now back the other way'],
      fr: ['31 coups. pas un de plus.', 'jamais un grand disque sur un petit', 'la récursion qu’on peut regarder', 'et maintenant dans l’autre sens'],
    },
    sounds: {
      en: ['wooden clicks (ASMR)', 'original sound - hanoi.tower', 'calm puzzle music'],
      fr: ['clics de bois (ASMR)', 'son original - hanoi.tower', 'musique de puzzle calme'],
    },
  },
} satisfies Record<string, Entry>
