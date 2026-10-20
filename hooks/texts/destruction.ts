import type { Entry } from '../i18n'

// Destruction: names, authors, tags, captions and sounds.

export const DESTRUCTION = {
  presse: {
    name: { en: 'hydraulic press', fr: 'presse hydraulique' },
    authors: ['@hydraulic.press', '@crush.it', '@squish.everything'],
    tags: ['#hydraulicpress #satisfying', '#crush #oddlysatisfying', '#asmr #fyp'],
    captions: {
      en: ['what are we crushing today?', 'the watermelon... RIP', 'wait for the splat', 'satisfying or cruel?'],
      fr: ['on écrase quoi aujourd’hui ?', 'la pastèque... RIP', 'attends l\'explosion', 'satisfaisant ou cruel ?'],
    },
    sounds: {
      en: ['crrrrrack (original sound)', 'suspense music', 'hydraulic ASMR'],
      fr: ['crrrrrac (son original)', 'musique de suspense', 'hydraulique ASMR'],
    },
  },
  wreckingball: {
    name: { en: 'wrecking ball', fr: 'boule de démolition' },
    authors: ['@wrecking.crew', '@swing.and.smash', '@wrecking.day'],
    tags: ['#demolition #wreckingball #satisfying', '#construction #destruction', '#fyp #foryou'],
    captions: {
      en: ['swing... SMASH', 'brick by brick, the other way', 'the operator has done this before', 'one more swing'],
      fr: ['ça balance... ÇA CASSE', 'brique par brique, dans l’autre sens', 'le grutier n’en est pas à son premier', 'encore un coup'],
    },
    sounds: {
      en: ['bricks crumbling (original sound)', 'original sound - wrecking.crew', 'heavy drums'],
      fr: ['briques qui s’effondrent (son original)', 'son original - wrecking.crew', 'grosses percussions'],
    },
  },
} satisfies Record<string, Entry>
