import type { Entry } from '../i18n'

// Sci-fi, robots & mecha: names, authors, tags, captions and sounds.

export const ROBOTS = {
  robovac: {
    name: { en: 'robot vacuum', fr: 'robot aspirateur' },
    authors: ['@robo.vac', '@floor.lanes', '@missed.a.spot'],
    tags: ['#robotvacuum #cleaning #satisfying', '#cleantok #robot', '#fyp #foryou'],
    captions: {
      en: ['lanes first, then the crumbs', 'it missed one spot. every time.', 'my most hardworking roommate', 'back to the dock, job done(ish)'],
      fr: ['les allers-retours d’abord, les miettes ensuite', 'il rate un coin. à chaque fois.', 'mon coloc le plus travailleur', 'retour à la base, mission (presque) accomplie'],
    },
    sounds: {
      en: ['vacuum hum (ASMR)', 'original sound - robo.vac', 'cleaning montage music'],
      fr: ['ronronnement d’aspirateur (ASMR)', 'son original - robo.vac', 'musique de ménage en accéléré'],
    },
  },
} satisfies Record<string, Entry>
