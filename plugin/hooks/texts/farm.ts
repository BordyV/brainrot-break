import type { Entry } from '../i18n'

// Farm, garden & plants: names, authors, tags, captions and sounds.

export const FARM = {
  combine: {
    name: { en: 'combine harvester', fr: 'moissonneuse-batteuse' },
    authors: ['@harvest.stripes', '@golden.field', '@farm.asmr'],
    tags: ['#harvest #farming #satisfying', '#tractor #farmlife', '#fyp #foryou'],
    captions: {
      en: ['the stripes it leaves behind', 'golden field to stubble, row by row', 'the percentage is the harvest', 'farming simulator but real'],
      fr: ['les bandes qu’elle laisse derrière elle', 'du blé doré au chaume, rang par rang', 'le pourcentage, c’est la moisson', 'farming simulator mais en vrai'],
    },
    sounds: {
      en: ['diesel engine rumble', 'original sound - harvest.stripes', 'country guitar'],
      fr: ['grondement de moteur diesel', 'son original - harvest.stripes', 'guitare country'],
    },
  },
  sheepdog: {
    name: { en: 'sheepdog', fr: 'chien de berger' },
    authors: ['@good.boy.herding', '@nine.sheep', '@into.the.pen'],
    tags: ['#sheepdog #dogs #farm', '#herding #goodboy', '#fyp #foryou'],
    captions: {
      en: ['he goes round the back, they go in', 'nine sheep, one very good boy', 'the gate shuts when the last one is in', 'the best employee on the farm'],
      fr: ['il passe derrière, elles rentrent', 'neuf moutons, un très bon chien', 'la barrière se ferme quand le dernier est rentré', 'le meilleur employé de la ferme'],
    },
    sounds: {
      en: ['whistles and baas', 'original sound - good.boy.herding', 'pastoral folk'],
      fr: ['sifflets et bêlements', 'son original - good.boy.herding', 'folk pastoral'],
    },
  },
  flytrap: {
    name: { en: 'Venus flytrap', fr: 'dionée attrape-mouche' },
    authors: ['@snap.trap', '@hungry.plant', '@feed.me.flies'],
    tags: ['#venusflytrap #plants #nature', '#carnivorousplant #snap', '#fyp #foryou'],
    captions: {
      en: ['the fly lands. the plant waits. SNAP.', 'my houseplant has a kill count', 'it needs two touches of the hairs', 'digesting… do not disturb'],
      fr: ['la mouche se pose. la plante attend. CLAC.', 'ma plante d’intérieur a un tableau de chasse', 'il lui faut deux contacts avec les poils', 'digestion en cours… ne pas déranger'],
    },
    sounds: {
      en: ['buzz… snap', 'original sound - snap.trap', 'suspense plucks'],
      fr: ['bzz… clac', 'son original - snap.trap', 'pizzicatos de suspense'],
    },
  },
} satisfies Record<string, Entry>
