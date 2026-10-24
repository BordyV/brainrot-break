import type { Entry } from '../i18n'

// Idle, strategy & tycoon games: names, authors, tags, captions and sounds.

export const IDLE = {
  factory: {
    name: { en: 'factory automation', fr: 'usine automatisée' },
    authors: ['@the.factory.must.grow', '@belt.lines', '@ore.to.plates'],
    tags: ['#factory #automation #satisfying', '#gaming #idlegame', '#fyp #foryou'],
    captions: {
      en: ['the factory must grow', 'miner, belt, furnace, chest. repeat.', 'the number at the top only goes up', 'one more line and I’ll sleep'],
      fr: ['l’usine doit grandir', 'foreuse, tapis, four, coffre. on recommence.', 'le nombre en haut ne fait que monter', 'encore une ligne et je vais dormir'],
    },
    sounds: {
      en: ['conveyor belt hum', 'original sound - the.factory.must.grow', 'factory game soundtrack'],
      fr: ['ronron de tapis roulant', 'son original - the.factory.must.grow', 'bande-son de jeu d’usine'],
    },
  },
  idlemine: {
    name: { en: 'idle mine', fr: 'mine idle' },
    authors: ['@deeper.and.deeper', '@idle.tycoon', '@lift.goes.brrr'],
    tags: ['#idlegame #mining #tycoon', '#mobilegame #satisfying', '#fyp #foryou'],
    captions: {
      en: ['each level deeper pays more', 'the lift does all the work', 'the next level is already paid for', 'number go up'],
      fr: ['chaque niveau plus profond rapporte plus', 'l’ascenseur fait tout le travail', 'le prochain niveau est déjà payé', 'le nombre monte'],
    },
    sounds: {
      en: ['pickaxe clinks', 'original sound - deeper.and.deeper', 'idle game jingle'],
      fr: ['tintements de pioche', 'son original - deeper.and.deeper', 'jingle de jeu idle'],
    },
  },
  autobattler: {
    name: { en: 'auto battler', fr: 'auto-battler' },
    authors: ['@auto.chess.brain', '@round.after.round', '@blue.side.only'],
    tags: ['#autobattler #strategy #gaming', '#autochess #teamfight', '#fyp #foryou'],
    captions: {
      en: ['the round circles are archers', 'blue or red? pick a side', 'best of five', 'no input needed, just vibes'],
      fr: ['les ronds, ce sont les archers', 'bleu ou rouge ? choisis ton camp', 'en cinq manches', 'pas besoin de jouer, juste regarder'],
    },
    sounds: {
      en: ['swords clashing', 'original sound - auto.chess.brain', 'strategy game battle theme'],
      fr: ['épées qui s’entrechoquent', 'son original - auto.chess.brain', 'thème de bataille de jeu de stratégie'],
    },
  },
  mergearmy: {
    name: { en: 'merge army', fr: 'armée à fusionner' },
    authors: ['@merge.master', '@two.make.one', '@level.up.army'],
    tags: ['#merge #mobilegame #strategy', '#mergegame #satisfying', '#fyp #foryou'],
    captions: {
      en: ['two level 1s make a level 2', 'merge, merge, merge… FIGHT', 'the boss gets bigger every stage', 'this ad is better than the game'],
      fr: ['deux niveau 1 font un niveau 2', 'fusionne, fusionne, fusionne… COMBAT', 'le boss grossit à chaque étape', 'cette pub est mieux que le jeu'],
    },
    sounds: {
      en: ['merge pop', 'original sound - merge.master', 'mobile game victory fanfare'],
      fr: ['pop de fusion', 'son original - merge.master', 'fanfare de victoire de jeu mobile'],
    },
  },
  horde: {
    name: { en: 'horde survivor', fr: 'survivre à la horde' },
    authors: ['@one.more.run', '@orbit.blades', '@gem.collector'],
    tags: ['#survivor #roguelike #gaming', '#bullethell #indiegame', '#fyp #foryou'],
    captions: {
      en: ['the hero doesn’t attack. the blades do.', 'collect the blue gems, get another blade', 'they come from everywhere', 'one more run. just one.'],
      fr: ['le héros n’attaque pas. les lames, si.', 'ramasse les gemmes bleues, gagne une lame', 'ils arrivent de partout', 'encore une partie. juste une.'],
    },
    sounds: {
      en: ['gem pickup chimes', 'original sound - one.more.run', 'gothic chiptune'],
      fr: ['tintements de gemmes', 'son original - one.more.run', 'chiptune gothique'],
    },
  },
} satisfies Record<string, Entry>
