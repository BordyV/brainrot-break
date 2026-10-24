import type { Entry } from '../i18n'

// Toys & desk toys: names, authors, tags, captions and sounds.

export const TOYS = {
  slinky: {
    name: { en: 'slinky on the stairs', fr: 'slinky dans l’escalier' },
    authors: ['@step.by.slinky', '@coil.walk', '@rainbow.spring'],
    tags: ['#slinky #toys #satisfying', '#stairs #nostalgia', '#fyp #foryou'],
    captions: {
      en: ['it walks down by itself', 'the flip never gets old', 'how many steps can it go?', 'childhood unlocked'],
      fr: ['il descend tout seul', 'la bascule, on ne s’en lasse pas', 'combien de marches il peut faire ?', 'souvenir d’enfance débloqué'],
    },
    sounds: {
      en: ['slinky shhk shhk', 'original sound - step.by.slinky', 'toy box music'],
      fr: ['chhk chhk du slinky', 'son original - step.by.slinky', 'musique de coffre à jouets'],
    },
  },
  drinkingbird: {
    name: { en: 'drinking bird', fr: 'oiseau buveur' },
    authors: ['@dip.and.sip', '@heat.engine.bird', '@desk.toy.loop'],
    tags: ['#drinkingbird #desktoy #physics', '#perpetualmotion #satisfying', '#fyp #foryou'],
    captions: {
      en: ['it drinks. it rises. it drinks.', 'the pink climbs the neck, then it tips', 'not perpetual motion. close, though.', 'me and my water bottle at work'],
      fr: ['il boit. il se relève. il boit.', 'le rose monte dans le cou, puis il bascule', 'pas un mouvement perpétuel. presque.', 'moi et ma gourde au boulot'],
    },
    sounds: {
      en: ['tiny tick of glass', 'original sound - dip.and.sip', 'lazy jazz loop'],
      fr: ['petit tic de verre', 'son original - dip.and.sip', 'boucle de jazz tranquille'],
    },
  },
  ringtoss: {
    name: { en: 'water ring toss', fr: 'jeu d’anneaux à eau' },
    authors: ['@press.the.button', '@ring.on.peg', '@90s.toy.box'],
    tags: ['#nostalgia #90s #toys', '#ringtoss #satisfying', '#fyp #foryou'],
    captions: {
      en: ['press, press, press… it landed!', 'the hardest game of the 90s', 'the last ring takes forever', 'the score is rings on pegs'],
      fr: ['appuie, appuie, appuie… il est tombé dedans !', 'le jeu le plus dur des années 90', 'le dernier anneau prend une éternité', 'le score, c’est les anneaux sur les tiges'],
    },
    sounds: {
      en: ['bloop bloop bubbles', 'original sound - press.the.button', '90s cartoon intro'],
      fr: ['bulles bloup bloup', 'son original - press.the.button', 'générique de dessin animé des années 90'],
    },
  },
  battletops: {
    name: { en: 'battling tops', fr: 'toupies de combat' },
    authors: ['@let.it.rip.arena', '@spin.till.the.end', '@last.top.spinning'],
    tags: ['#spinningtop #battle #toys', '#arena #clash', '#fyp #foryou'],
    captions: {
      en: ['red or blue? pick now', 'the wobble means it’s over', 'that clash was loud', 'the last one spinning wins'],
      fr: ['rouge ou bleue ? choisis maintenant', 'quand elle vacille, c’est fini', 'ce choc était violent', 'la dernière qui tourne gagne'],
    },
    sounds: {
      en: ['metal on metal clash', 'original sound - let.it.rip.arena', 'anime battle theme'],
      fr: ['choc de métal contre métal', 'son original - let.it.rip.arena', 'thème de combat d’anime'],
    },
  },
} satisfies Record<string, Entry>
