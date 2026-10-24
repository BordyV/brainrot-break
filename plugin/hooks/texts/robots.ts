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
  laserheist: {
    name: { en: 'laser grid heist', fr: 'casse aux lasers' },
    authors: ['@vault.ghost', '@through.the.lasers', '@diamond.or.nothing'],
    tags: ['#heist #lasers #stealth', '#mission #spy', '#fyp #foryou'],
    captions: {
      en: ['wait for it… now', 'the gap moves, so does the thief', 'one beam too early and…', 'the diamond is RIGHT THERE'],
      fr: ['attends… maintenant', 'le trou bouge, le voleur aussi', 'un faisceau trop tôt et…', 'le diamant est JUSTE LÀ'],
    },
    sounds: {
      en: ['laser hum and footsteps', 'original sound - vault.ghost', 'spy movie theme'],
      fr: ['bourdonnement de laser et pas feutrés', 'son original - vault.ghost', 'thème de film d’espion'],
    },
  },
  robowalk: {
    name: { en: 'robot learns to walk', fr: 'robot qui apprend à marcher' },
    authors: ['@first.steps.bot', '@try.again.unit', '@reinforcement.learner'],
    tags: ['#robot #ai #reinforcementlearning', '#robotics #babysteps', '#fyp #foryou'],
    captions: {
      en: ['attempt 1: confidence. attempt 1: floor.', 'he gets back up every time', 'the red dots are the falls', 'and then… he walks'],
      fr: ['essai 1 : confiance. essai 1 : par terre.', 'il se relève à chaque fois', 'les points rouges, ce sont les chutes', 'et puis… il marche'],
    },
    sounds: {
      en: ['servo whirs and a clunk', 'original sound - first.steps.bot', 'inspirational piano'],
      fr: ['ronronnements de servos et un bong', 'son original - first.steps.bot', 'piano inspirant'],
    },
  },
} satisfies Record<string, Entry>
