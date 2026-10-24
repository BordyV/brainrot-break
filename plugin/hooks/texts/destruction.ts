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
  voxeltower: {
    name: { en: 'voxel tower collapse', fr: 'tour de voxels qui s’effondre' },
    authors: ['@one.block.too.many', '@voxel.demolition', '@structural.integrity'],
    tags: ['#voxel #destruction #satisfying', '#collapse #pixelart', '#fyp #foryou'],
    captions: {
      en: ['it only needed that one block', 'structural engineers hate this', 'built in 3 seconds, gone in 2', 'count the blocks on the ground'],
      fr: ['il n’avait besoin que de ce bloc-là', 'les ingénieurs en structure détestent ça', 'construite en 3 secondes, disparue en 2', 'compte les blocs par terre'],
    },
    sounds: {
      en: ['crumbling blocks (ASMR)', 'original sound - one.block.too.many', '8-bit collapse'],
      fr: ['blocs qui s’écroulent (ASMR)', 'son original - one.block.too.many', 'effondrement 8 bits'],
    },
  },
  bullettime: {
    name: { en: 'slow-motion bullet', fr: 'balle au ralenti' },
    authors: ['@ten.thousand.fps', '@slowmo.lab', '@frame.by.frame'],
    tags: ['#slowmotion #slowmo #satisfying', '#highspeedcamera #science', '#fyp #foryou'],
    captions: {
      en: ['the water balloon keeps its shape for a moment', 'an apple, a can, a balloon', '10,000 frames a second', 'the can doesn’t even know yet'],
      fr: ['le ballon d’eau garde sa forme un instant', 'une pomme, une canette, un ballon', '10 000 images par seconde', 'la canette ne le sait pas encore'],
    },
    sounds: {
      en: ['slowed-down whoosh', 'original sound - ten.thousand.fps', 'epic slow-mo strings'],
      fr: ['whoosh ralenti', 'son original - ten.thousand.fps', 'cordes épiques au ralenti'],
    },
  },
  woodsplit: {
    name: { en: 'wood splitting', fr: 'fendre du bois' },
    authors: ['@axe.and.stump', '@winter.woodpile', '@one.clean.split'],
    tags: ['#woodsplitting #axe #satisfying', '#firewood #cabinlife', '#fyp #foryou'],
    captions: {
      en: ['the clean split. every. time. (almost)', 'this one had a knot', 'the woodpile is my progress bar', 'winter is coming, the pile is ready'],
      fr: ['la fente nette. à chaque. fois. (presque)', 'celle-là avait un nœud', 'le tas de bois, c’est ma barre de progression', 'l’hiver arrive, le tas est prêt'],
    },
    sounds: {
      en: ['thock (ASMR)', 'original sound - axe.and.stump', 'folk guitar'],
      fr: ['tchok (ASMR)', 'son original - axe.and.stump', 'guitare folk'],
    },
  },
  barrelchain: {
    name: { en: 'barrel chain', fr: 'barils en chaîne' },
    authors: ['@red.barrel.rule', '@chain.reaction.club', '@kaboom.corridor'],
    tags: ['#explosion #chainreaction #satisfying', '#gaming #redbarrel', '#fyp #foryou'],
    captions: {
      en: ['every game has one rule: red barrels explode', 'one goes, they all go', 'save the big yellow one for last', 'the corridor will need a repaint'],
      fr: ['chaque jeu a une règle : les barils rouges explosent', 'un part, ils partent tous', 'le gros jaune, on le garde pour la fin', 'le couloir aura besoin d’un coup de peinture'],
    },
    sounds: {
      en: ['boom boom boom BOOM', 'original sound - red.barrel.rule', 'action movie drums'],
      fr: ['boum boum boum BOUM', 'son original - red.barrel.rule', 'tambours de film d’action'],
    },
  },
} satisfies Record<string, Entry>
