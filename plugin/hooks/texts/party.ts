import type { Entry } from '../i18n'

// Party, board & fair games: names, authors, tags, captions and sounds.

export const PARTY = {
  plinko: {
    name: { en: 'Plinko', fr: 'Plinko' },
    authors: ['@middle.slot.please', '@peg.bounce', '@drop.the.chip'],
    tags: ['#plinko #gameshow #satisfying', '#luck #bounce', '#fyp #foryou'],
    captions: {
      en: ['come on, the middle one…', 'every peg is a coin flip', 'the 9 is right there', 'I could watch chips fall all day'],
      fr: ['allez, celle du milieu…', 'chaque clou, c’est pile ou face', 'le 9 est juste là', 'je regarderais tomber des jetons toute la journée'],
    },
    sounds: {
      en: ['plink plink plink', 'original sound - middle.slot.please', 'game show music'],
      fr: ['plink plink plink', 'son original - middle.slot.please', 'musique de jeu télé'],
    },
  },
  prizewheel: {
    name: { en: 'wheel of prizes', fr: 'roue des cadeaux' },
    authors: ['@spin.to.win', '@tick.tick.tick', '@lucky.segment'],
    tags: ['#wheel #spin #satisfying', '#luck #gameshow', '#fyp #foryou'],
    captions: {
      en: ['tick… tick… tick… tick.', 'it always slows down right before yours', 'pick a colour before it stops', 'spin it again'],
      fr: ['tic… tic… tic… tic.', 'elle ralentit toujours juste avant la tienne', 'choisis une couleur avant qu’elle s’arrête', 'relance-la'],
    },
    sounds: {
      en: ['the clicker on the pegs', 'original sound - spin.to.win', 'drumroll and fanfare'],
      fr: ['le cliquet sur les clous', 'son original - spin.to.win', 'roulement de tambour et fanfare'],
    },
  },
  connect4: {
    name: { en: 'four in a row', fr: 'puissance 4' },
    authors: ['@four.in.a.row', '@red.vs.yellow', '@block.the.diagonal'],
    tags: ['#connectfour #boardgame #strategy', '#games #satisfying', '#fyp #foryou'],
    captions: {
      en: ['red or yellow? the score is in the corners', 'nobody ever sees the diagonal', 'block! block! too late.', 'the clack when it lands'],
      fr: ['rouge ou jaune ? le score est dans les coins', 'personne ne voit jamais la diagonale', 'bloque ! bloque ! trop tard.', 'le clac quand il tombe'],
    },
    sounds: {
      en: ['plastic disc clacks', 'original sound - four.in.a.row', 'board game night playlist'],
      fr: ['clacs de pions en plastique', 'son original - four.in.a.row', 'playlist de soirée jeux'],
    },
  },
  airhockey: {
    name: { en: 'air hockey', fr: 'air hockey' },
    authors: ['@puck.slammer', '@arcade.rally', '@goal.horn'],
    tags: ['#airhockey #arcade #satisfying', '#games #rally', '#fyp #foryou'],
    captions: {
      en: ['the rally that never ends', 'two bots, one puck, no mercy', 'the bank shot off the wall', 'loser pays for the next round'],
      fr: ['l’échange qui ne finit jamais', 'deux bots, un palet, aucune pitié', 'le tir en bande', 'le perdant paie la prochaine'],
    },
    sounds: {
      en: ['clack clack whoosh', 'original sound - puck.slammer', 'arcade ambience'],
      fr: ['clac clac whoosh', 'son original - puck.slammer', 'ambiance de salle d’arcade'],
    },
  },
  hoops: {
    name: { en: 'arcade hoops', fr: 'basket d’arcade' },
    authors: ['@swish.machine', '@beat.the.buzzer', '@three.pointer.arcade'],
    tags: ['#basketball #arcade #satisfying', '#swish #highscore', '#fyp #foryou'],
    captions: {
      en: ['swish. swish. swish.', 'under twenty seconds the hoop starts moving', 'worth three points when it moves', 'beat the buzzer'],
      fr: ['swish. swish. swish.', 'sous vingt secondes, le panier se met à bouger', 'trois points quand il bouge', 'bats la sirène'],
    },
    sounds: {
      en: ['swish and the buzzer', 'original sound - swish.machine', 'hype arcade beat'],
      fr: ['swish et la sirène', 'son original - swish.machine', 'beat d’arcade survolté'],
    },
  },
  cupshuffle: {
    name: { en: 'cup shuffle', fr: 'bonneteau' },
    authors: ['@follow.the.ball', '@three.cups.one.ball', '@shell.game.pro'],
    tags: ['#cupshuffle #shellgame #followtheball', '#eyetest #guess', '#fyp #foryou'],
    captions: {
      en: ['which cup? comment before the reveal', 'i lost it at swap 4', 'only 1% follow the ball', 'the bot is never wrong… right?'],
      fr: ['quel gobelet ? commente avant la révélation', 'je l’ai perdue au 4e échange', 'seuls 1 % suivent la balle', 'le bot ne se trompe jamais… si ?'],
    },
    sounds: {
      en: ['cups sliding on felt', 'original sound - follow.the.ball', 'suspense drumroll'],
      fr: ['gobelets qui glissent sur le tapis', 'son original - follow.the.ball', 'roulement de tambour'],
    },
  },
  bottleflip: {
    name: { en: 'bottle flip', fr: 'bottle flip' },
    authors: ['@flip.and.stick', '@half.full.bottle', '@landed.it'],
    tags: ['#bottleflip #trickshot #satisfying', '#landed #challenge', '#fyp #foryou'],
    captions: {
      en: ['it’s all in the wrist', 'wait for the cap landing', 'count the landings', 'flip it like it’s 2016'],
      fr: ['tout est dans le poignet', 'attends l’atterrissage sur le bouchon', 'compte les réussites', 'flippe comme en 2016'],
    },
    sounds: {
      en: ['bottle thud (original sound)', 'original sound - flip.and.stick', 'classroom cheers'],
      fr: ['bruit sourd de bouteille (son original)', 'son original - flip.and.stick', 'cris de la classe'],
    },
  },
} satisfies Record<string, Entry>
