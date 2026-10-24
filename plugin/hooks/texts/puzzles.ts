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
  sudoku: {
    name: { en: 'sudoku solver', fr: 'sudoku qui se résout' },
    authors: ['@backtrack.queen', '@nine.colours', '@sudoku.bot'],
    tags: ['#sudoku #puzzle #satisfying', '#backtracking #algorithm', '#fyp #foryou'],
    captions: {
      en: ['every colour once per row, column and box', 'watch it backtrack when it’s stuck', 'the red flash means “nope, go back”', 'solved before my coffee cooled'],
      fr: ['chaque couleur une fois par ligne, colonne et carré', 'regarde-le revenir en arrière quand il bloque', 'le flash rouge veut dire « non, on recule »', 'résolu avant que mon café refroidisse'],
    },
    sounds: {
      en: ['pencil scratching (ASMR)', 'original sound - backtrack.queen', 'focus beats'],
      fr: ['crayon qui gratte (ASMR)', 'son original - backtrack.queen', 'musique de concentration'],
    },
  },
  slide15: {
    name: { en: 'sliding 15-puzzle', fr: 'taquin' },
    authors: ['@fifteen.tiles', '@slide.it.back', '@one.missing'],
    tags: ['#15puzzle #slidingpuzzle #satisfying', '#puzzle #brainteaser', '#fyp #foryou'],
    captions: {
      en: ['shuffled in 2 seconds, solved in 34 moves', 'the last tile clicking in…', 'wait for the picture', 'I could never do this by hand'],
      fr: ['mélangé en 2 secondes, résolu en 34 coups', 'la dernière pièce qui se remet…', 'attends l’image', 'je n’y arriverais jamais à la main'],
    },
    sounds: {
      en: ['plastic tiles sliding (ASMR)', 'original sound - fifteen.tiles', 'retro puzzle jingle'],
      fr: ['tuiles en plastique qui glissent (ASMR)', 'son original - fifteen.tiles', 'jingle de puzzle rétro'],
    },
  },
  flow: {
    name: { en: 'flow connect', fr: 'relie les couleurs' },
    authors: ['@flow.lines', '@pair.the.dots', '@no.empty.cells'],
    tags: ['#flow #puzzle #satisfying', '#connectthedots #mobilegame', '#fyp #foryou'],
    captions: {
      en: ['every pair joined, every cell filled', 'no pipe crosses another', '100% or it doesn’t count', 'level 2847 and still chill'],
      fr: ['chaque paire reliée, chaque case remplie', 'aucun tuyau n’en croise un autre', '100 % ou ça ne compte pas', 'niveau 2847 et toujours zen'],
    },
    sounds: {
      en: ['soft pop on each link', 'original sound - flow.lines', 'chill puzzle beats'],
      fr: ['petit pop à chaque lien', 'son original - flow.lines', 'beats de puzzle chill'],
    },
  },
  pipeturn: {
    name: { en: 'pipe rotation puzzle', fr: 'tuyaux à tourner' },
    authors: ['@turn.the.pipes', '@tap.to.drain', '@plumber.brain'],
    tags: ['#pipepuzzle #satisfying #puzzle', '#plumbing #mobilegame', '#fyp #foryou'],
    captions: {
      en: ['turn, turn, turn… water!', 'only one way through', 'the water running at the end', 'plumber brain activated'],
      fr: ['tourne, tourne, tourne… de l’eau !', 'un seul chemin possible', 'l’eau qui coule à la fin', 'cerveau de plombier activé'],
    },
    sounds: {
      en: ['metal clicks and running water', 'original sound - turn.the.pipes', 'puzzle game music'],
      fr: ['clics de métal et eau qui coule', 'son original - turn.the.pipes', 'musique de jeu de réflexion'],
    },
  },
  jigsaw: {
    name: { en: 'jigsaw', fr: 'puzzle' },
    authors: ['@edges.first', '@corner.piece', '@jigsaw.sunday'],
    tags: ['#jigsaw #puzzle #satisfying', '#cozy #puzzletime', '#fyp #foryou'],
    captions: {
      en: ['edges first, like a civilised person', 'the last piece hits different', 'sixteen pieces of calm', 'no pieces lost under the sofa'],
      fr: ['les bords d’abord, comme quelqu’un de civilisé', 'la dernière pièce, quel moment', 'seize pièces de calme', 'aucune pièce perdue sous le canapé'],
    },
    sounds: {
      en: ['cardboard clicks (ASMR)', 'original sound - edges.first', 'sunday afternoon jazz'],
      fr: ['clics de carton (ASMR)', 'son original - edges.first', 'jazz du dimanche après-midi'],
    },
  },
  icepuzzle: {
    name: { en: 'ice sliding puzzle', fr: 'glisse sur la glace' },
    authors: ['@slippy.penguin', '@ice.rink.maze', '@stop.at.the.rock'],
    tags: ['#icepuzzle #penguin #puzzle', '#retrogaming #brainteaser', '#fyp #foryou'],
    captions: {
      en: ['he can only stop at a rock', 'no brakes, only rocks', 'the igloo is RIGHT THERE', 'the shortest way home'],
      fr: ['il ne peut s’arrêter que contre un rocher', 'pas de freins, que des rochers', 'l’igloo est JUSTE LÀ', 'le chemin le plus court jusqu’à la maison'],
    },
    sounds: {
      en: ['ice skating swoosh', 'original sound - slippy.penguin', 'cave level chiptune'],
      fr: ['glissade sur la glace', 'son original - slippy.penguin', 'chiptune de niveau de glace'],
    },
  },
  mirrors: {
    name: { en: 'laser mirrors', fr: 'miroirs laser' },
    authors: ['@laser.bounce', '@mirror.mirror', '@light.the.crystals'],
    tags: ['#laserpuzzle #puzzle #satisfying', '#lasers #optics', '#fyp #foryou'],
    captions: {
      en: ['flip the mirror, follow the beam', 'light every crystal, then the exit', 'physics teacher approved', 'the click when it lands'],
      fr: ['tourne le miroir, suis le faisceau', 'allume chaque cristal, puis la sortie', 'validé par le prof de physique', 'le clic quand il arrive'],
    },
    sounds: {
      en: ['laser hum', 'original sound - laser.bounce', 'sci-fi puzzle ambience'],
      fr: ['bourdonnement de laser', 'son original - laser.bounce', 'ambiance de puzzle sci-fi'],
    },
  },
  arrows: {
    name: { en: 'unblock the arrows', fr: 'débloque les flèches' },
    authors: ['@arrow.out', '@tap.the.free.one', '@unblock.me'],
    tags: ['#arrowpuzzle #puzzle #satisfying', '#mobilegame #brainteaser', '#fyp #foryou'],
    captions: {
      en: ['only the free ones can leave', 'the red one was NOT free', 'clearing the board one tap at a time', 'it’s an order puzzle in disguise'],
      fr: ['seules les flèches libres peuvent partir', 'la rouge n’était PAS libre', 'on vide le plateau une flèche à la fois', 'un puzzle d’ordre déguisé'],
    },
    sounds: {
      en: ['swoosh swoosh swoosh', 'original sound - arrow.out', 'mobile puzzle music'],
      fr: ['whoosh whoosh whoosh', 'son original - arrow.out', 'musique de jeu mobile'],
    },
  },
  triplematch: {
    name: { en: 'triple tile match', fr: 'trois tuiles pareilles' },
    authors: ['@triple.tiles', '@seven.slots', '@match.three.calm'],
    tags: ['#tilematch #puzzle #satisfying', '#mobilegame #match3', '#fyp #foryou'],
    captions: {
      en: ['three of a kind, poof', 'don’t fill the tray…', 'the top layer first', 'the tray is a ticking clock'],
      fr: ['trois pareilles, pouf', 'ne remplis pas le plateau…', 'la couche du dessus d’abord', 'le plateau est un compte à rebours'],
    },
    sounds: {
      en: ['tile clacks (ASMR)', 'original sound - triple.tiles', 'cosy game music'],
      fr: ['clacs de tuiles (ASMR)', 'son original - triple.tiles', 'musique de jeu cosy'],
    },
  },
} satisfies Record<string, Entry>
