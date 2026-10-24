import type { Entry } from '../i18n'

// Birds, sky & flight: names, authors, tags, captions and sounds.

export const SKY = {
  paperplane: {
    name: { en: 'paper plane', fr: 'avion en papier' },
    authors: ['@fold.and.throw', '@bin.shot', '@classroom.pilot'],
    tags: ['#paperplane #trickshot #satisfying', '#school #aviation', '#fyp #foryou'],
    captions: {
      en: ['into the bin from across the room', 'it dives, it climbs, it dives again', 'the score is in the corner. be honest.', 'the teacher is not watching'],
      fr: ['dans la poubelle depuis l’autre bout de la salle', 'il plonge, il remonte, il replonge', 'le score est dans le coin. soyons honnêtes.', 'le prof ne regarde pas'],
    },
    sounds: {
      en: ['paper whoosh', 'original sound - fold.and.throw', 'school bell and chatter'],
      fr: ['froissement de papier', 'son original - fold.and.throw', 'sonnerie et brouhaha de classe'],
    },
  },
  droneshow: {
    name: { en: 'drone light show', fr: 'spectacle de drones' },
    authors: ['@forty.drones', '@night.sky.pixels', '@swarm.shapes'],
    tags: ['#droneshow #lights #satisfying', '#fireworks #night', '#fyp #foryou'],
    captions: {
      en: ['forty drones, five shapes', 'a heart, a star, a smiley… a rocket', 'the new fireworks', 'the crowd’s phones at the bottom'],
      fr: ['quarante drones, cinq formes', 'un cœur, une étoile, un smiley… une fusée', 'les nouveaux feux d’artifice', 'les téléphones du public en bas'],
    },
    sounds: {
      en: ['soft drone hum', 'original sound - forty.drones', 'epic festival synths'],
      fr: ['doux bourdonnement de drones', 'son original - forty.drones', 'synthés de festival épiques'],
    },
  },
  seagull: {
    name: { en: 'seagull heist', fr: 'le casse de la mouette' },
    authors: ['@chip.thief', '@beach.bandit', '@guard.your.snacks'],
    tags: ['#seagull #beach #funny', '#summer #snacks', '#fyp #foryou'],
    captions: {
      en: ['it circles. it waits. it strikes.', 'the chips never stood a chance', 'watch the arms go up', 'guard your snacks'],
      fr: ['elle tourne. elle attend. elle frappe.', 'les frites n’avaient aucune chance', 'regarde les bras qui se lèvent', 'surveille ton goûter'],
    },
    sounds: {
      en: ['seagull scream', 'original sound - chip.thief', 'heist movie bass'],
      fr: ['cri de mouette', 'son original - chip.thief', 'basse de film de casse'],
    },
  },
} satisfies Record<string, Entry>
