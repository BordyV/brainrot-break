import type { Entry } from '../i18n'

// Insects & tiny worlds: names, authors, tags, captions and sounds.

export const INSECTS = {
  butterfly: {
    name: { en: 'caterpillar to butterfly', fr: 'de la chenille au papillon' },
    authors: ['@very.hungry.one', '@chrysalis.cam', '@glow.up.season'],
    tags: ['#butterfly #metamorphosis #nature', '#glowup #timelapse', '#fyp #foryou'],
    captions: {
      en: ['eat, sleep, become a butterfly', 'the leaf did not survive', 'the chrysalis goes clear right before', 'the original glow-up'],
      fr: ['manger, dormir, devenir papillon', 'la feuille n’a pas survécu', 'la chrysalide devient transparente juste avant', 'le glow-up originel'],
    },
    sounds: {
      en: ['tiny munching (ASMR)', 'original sound - very.hungry.one', 'gentle piano'],
      fr: ['petits grignotages (ASMR)', 'son original - very.hungry.one', 'piano doux'],
    },
  },
  dungbeetle: {
    name: { en: 'dung beetle', fr: 'bousier' },
    authors: ['@push.it.uphill', '@ball.is.life', '@beetle.grind'],
    tags: ['#dungbeetle #insects #motivation', '#nature #neverquit', '#fyp #foryou'],
    captions: {
      en: ['pushing it uphill. backwards. head down.', 'it slipped. he went again.', 'the percentage is to the top', 'monday motivation'],
      fr: ['il la pousse en montée. à reculons. tête en bas.', 'elle a glissé. il est reparti.', 'le pourcentage, c’est jusqu’au sommet', 'motivation du lundi'],
    },
    sounds: {
      en: ['epic training montage', 'original sound - push.it.uphill', 'desert wind'],
      fr: ['montage d’entraînement épique', 'son original - push.it.uphill', 'vent du désert'],
    },
  },
  mosquito: {
    name: { en: 'mosquito vs swatter', fr: 'moustique contre tapette' },
    authors: ['@3am.bzzz', '@swat.miss.repeat', '@mosquito.speedrun'],
    tags: ['#mosquito #relatable #summer', '#3am #funny', '#fyp #foryou'],
    captions: {
      en: ['3 a.m. and the count keeps going up', 'it was RIGHT THERE', 'it dodges like it reads my mind', 'the wall has more hits than the mosquito'],
      fr: ['3 h du mat et le compteur monte encore', 'il était JUSTE LÀ', 'il esquive comme s’il lisait dans mes pensées', 'le mur a pris plus de coups que le moustique'],
    },
    sounds: {
      en: ['bzzzzzz… SLAP', 'original sound - 3am.bzzz', 'horror movie strings'],
      fr: ['bzzzzzz… CLAC', 'son original - 3am.bzzz', 'cordes de film d’horreur'],
    },
  },
  flywindow: {
    name: { en: 'fly at the window', fr: 'mouche contre la vitre' },
    authors: ['@bonk.bonk.glass', '@the.window.is.open', '@fly.logic'],
    tags: ['#fly #relatable #window', '#funny #summer', '#fyp #foryou'],
    captions: {
      en: ['the window is OPEN. right there.', 'bonk. bonk. bonk.', 'the number is how many times it hit the glass', 'me trying the same fix again'],
      fr: ['la fenêtre est OUVERTE. juste là.', 'bonk. bonk. bonk.', 'le nombre, c’est combien de fois elle a tapé la vitre', 'moi qui retente le même correctif'],
    },
    sounds: {
      en: ['buzz and bonk', 'original sound - bonk.bonk.glass', 'lazy summer afternoon'],
      fr: ['bzz et bonk', 'son original - bonk.bonk.glass', 'après-midi d’été paresseux'],
    },
  },
  antmill: {
    name: { en: 'ant mill', fr: 'moulin de fourmis' },
    authors: ['@follow.the.ant', '@round.and.round', '@pheromone.loop'],
    tags: ['#ants #nature #weird', '#infiniteloop #insects', '#fyp #foryou'],
    captions: {
      en: ['each ant follows the one in front. forever.', 'an infinite loop, but alive', 'the leaf in the middle is right there', 'and another one joins'],
      fr: ['chaque fourmi suit celle de devant. pour toujours.', 'une boucle infinie, mais vivante', 'la feuille au milieu est juste là', 'et une de plus qui s’y met'],
    },
    sounds: {
      en: ['tiny footsteps', 'original sound - follow.the.ant', 'hypnotic loop'],
      fr: ['tout petits pas', 'son original - follow.the.ant', 'boucle hypnotique'],
    },
  },
} satisfies Record<string, Entry>
