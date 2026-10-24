import type { Entry } from '../i18n'

// Fantasy & RPG: names, authors, tags, captions and sounds.

export const FANTASY = {
  slimemerge: {
    name: { en: 'slime merge', fr: 'fusion de slimes' },
    authors: ['@king.slime.when', '@boing.merge', '@dungeon.jelly'],
    tags: ['#slime #rpg #satisfying', '#merge #pixelart', '#fyp #foryou'],
    captions: {
      en: ['two of a size make a bigger one', 'green, blue, purple… KING', 'the crown fits perfectly', 'every dungeon starts like this'],
      fr: ['deux de la même taille en font un plus gros', 'vert, bleu, violet… ROI', 'la couronne lui va parfaitement', 'tous les donjons commencent comme ça'],
    },
    sounds: {
      en: ['squishy boings', 'original sound - king.slime.when', '8-bit dungeon theme'],
      fr: ['boings gélatineux', 'son original - king.slime.when', 'thème de donjon 8 bits'],
    },
  },
  bossfight: {
    name: { en: 'boss fight', fr: 'combat de boss' },
    authors: ['@chip.damage', '@jump.the.wave', '@final.boss.energy'],
    tags: ['#bossfight #rpg #gaming', '#pixelart #soulslike', '#fyp #foryou'],
    captions: {
      en: ['chip, chip, chip… jump!', 'the health bar only goes one way', 'jump the shockwave, every time', 'tiny hero, giant problem'],
      fr: ['tic, tic, tic… saute !', 'la barre de vie ne va que dans un sens', 'saute l’onde de choc, à chaque fois', 'petit héros, énorme problème'],
    },
    sounds: {
      en: ['sword clinks and a rumble', 'original sound - chip.damage', 'epic boss theme'],
      fr: ['cliquetis d’épée et grondement', 'son original - chip.damage', 'thème de boss épique'],
    },
  },
  forge: {
    name: { en: 'forging a sword', fr: 'forger une épée' },
    authors: ['@hammer.and.anvil', '@glowing.steel', '@quench.time'],
    tags: ['#blacksmith #forging #satisfying', '#sword #asmr', '#fyp #foryou'],
    captions: {
      en: ['yellow means hot, red means hit faster', 'back in the fire, again', 'the quench is the best part', 'it will pass the test'],
      fr: ['jaune c’est chaud, rouge c’est tape plus vite', 'retour au feu, encore', 'la trempe, c’est le meilleur moment', 'elle passera le test'],
    },
    sounds: {
      en: ['ting… ting… tsssss', 'original sound - hammer.and.anvil', 'viking drums'],
      fr: ['ting… ting… tsssss', 'son original - hammer.and.anvil', 'tambours vikings'],
    },
  },
  inventory: {
    name: { en: 'inventory packing', fr: 'ranger l’inventaire' },
    authors: ['@inventory.tetris', '@loot.goblin', '@every.slot.counts'],
    tags: ['#inventory #rpg #satisfying', '#tetris #organizing', '#fyp #foryou'],
    captions: {
      en: ['inventory tetris is the real endgame', 'the sword always goes in first', '48 slots, zero wasted', 'now I can’t pick anything else up'],
      fr: ['le tetris d’inventaire, c’est le vrai endgame', 'l’épée rentre toujours en premier', '48 cases, zéro perdue', 'maintenant je ne peux plus rien ramasser'],
    },
    sounds: {
      en: ['leather and clinks', 'original sound - inventory.tetris', 'tavern lute'],
      fr: ['cuir et cliquetis', 'son original - inventory.tetris', 'luth de taverne'],
    },
  },
} satisfies Record<string, Entry>
