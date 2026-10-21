import type { Entry } from '../i18n'

// Simulations & emergence: names, authors, tags, captions and sounds.

export const SIMULATIONS = {
  powder: {
    name: { en: 'falling sand world', fr: 'monde de sable' },
    authors: ['@powder.world', '@pixel.physics', '@sand.box'],
    tags: ['#fallingsand #simulation #satisfying', '#pixelart #physics', '#fyp #foryou'],
    captions: {
      en: ['sand, water... and then fire', 'every pixel follows the rules', 'wait for the spark', 'remember the powder games?'],
      fr: ['du sable, de l’eau... et puis le feu', 'chaque pixel suit les règles', 'attends l’étincelle', 'tu te souviens des powder games ?'],
    },
    sounds: {
      en: ['sand pouring (ASMR)', 'original sound - powder.world', 'chiptune ambience'],
      fr: ['sable qui coule (ASMR)', 'son original - powder.world', 'ambiance chiptune'],
    },
  },
  phantomjam: {
    name: { en: 'phantom traffic jam', fr: 'bouchon fantôme' },
    authors: ['@phantom.jam', '@ring.road', '@traffic.waves'],
    tags: ['#traffic #science #simulation', '#physics #driving', '#fyp #foryou'],
    captions: {
      en: ['one car brakes. watch the wave.', 'no accident, still a jam', 'the jam moves backwards', 'this is why you should not tailgate'],
      fr: ['une voiture freine. regarde la vague.', 'aucun accident, et pourtant un bouchon', 'le bouchon recule', 'voilà pourquoi il faut garder ses distances'],
    },
    sounds: {
      en: ['motorway hum (original sound)', 'original sound - phantom.jam', 'documentary synth'],
      fr: ['bourdonnement d’autoroute (son original)', 'son original - phantom.jam', 'synthé de documentaire'],
    },
  },
} satisfies Record<string, Entry>
