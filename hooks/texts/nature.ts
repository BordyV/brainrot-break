import type { Entry } from '../i18n'

// Nature & weather: names, authors, tags, captions and sounds.

export const NATURE = {
  aurore: {
    name: { en: 'northern lights', fr: 'aurore boréale' },
    authors: ['@aurora.norway', '@northern.sky', '@lapland.pixel'],
    tags: ['#aurora #northernlights', '#nature #satisfying', '#sky #fyp'],
    captions: {
      en: ['the lights are dancing tonight', 'Lapland, 2am', 'the reflection on the lake...', 'worth the trip'],
      fr: ['les aurores dansent ce soir', 'en Laponie, 2h du matin', 'le reflet sur le lac...', 'ça vaut le voyage'],
    },
    sounds: {
      en: ['nordic ambient', 'original sound - aurora.norway', 'synth pad'],
      fr: ['ambient nordique', 'son original - aurora.norway', 'nappe de synthé'],
    },
  },
  sunset: {
    name: { en: 'sunset at sea', fr: 'coucher de soleil' },
    authors: ['@golden.hour', '@sea.sunset', '@beach.chill'],
    tags: ['#sunset #sea #goldenhour', '#chill #aesthetic', '#summer #fyp'],
    captions: {
      en: ['wait for the stars', 'golden hour on the sea', 'the last ray of sun', 'summer is never over'],
      fr: ['attends les étoiles', 'golden hour sur la mer', 'le dernier rayon de soleil', 'l’été n’est jamais fini'],
    },
    sounds: {
      en: ['waves (original sound)', 'summer lofi', 'seagulls and guitar'],
      fr: ['vagues (son original)', 'lofi d’été', 'mouettes et guitare'],
    },
  },
  thunderstorm: {
    name: { en: 'thunderstorm', fr: 'orage' },
    authors: ['@storm.chaser', '@thunder.night', '@lightning.cam'],
    tags: ['#thunderstorm #lightning #weather', '#rain #asmr', '#nature #fyp'],
    captions: {
      en: ['wait for the flash', 'perfect sleep weather', 'count the seconds after the flash', 'nature’s light show'],
      fr: ['attends l’éclair', 'le temps parfait pour dormir', 'compte les secondes après l’éclair', 'le spectacle de lumière de la nature'],
    },
    sounds: {
      en: ['thunder and rain (ASMR)', 'original sound - storm.chaser', 'rain for sleeping'],
      fr: ['tonnerre et pluie (ASMR)', 'son original - storm.chaser', 'pluie pour dormir'],
    },
  },
  tornado: {
    name: { en: 'tornado', fr: 'tornade' },
    authors: ['@twister.cam', '@storm.alley', '@funnel.watch'],
    tags: ['#tornado #weather #storm', '#stormchasing #nature', '#fyp #foryou'],
    captions: {
      en: ['it’s heading for the barn...', 'the fence did not survive', 'storm chasers be like', 'nature at full power'],
      fr: ['elle fonce vers la grange...', 'la clôture n’a pas survécu', 'les chasseurs de tempêtes', 'la nature à pleine puissance'],
    },
    sounds: {
      en: ['siren and wind (original sound)', 'original sound - twister.cam', 'dramatic strings'],
      fr: ['sirène et vent (son original)', 'son original - twister.cam', 'cordes dramatiques'],
    },
  },
  surfer: {
    name: { en: 'surfer', fr: 'surfeur' },
    authors: ['@golden.wave', '@surf.daily', '@barrel.hunter'],
    tags: ['#surfing #waves #ocean', '#sunset #surf', '#summer #fyp'],
    captions: {
      en: ['riding the golden hour', 'up and down the face', 'wipeout watch', 'beach therapy'],
      fr: ['surfer la golden hour', 'monter et descendre la vague', 'en attente de la chute', 'thérapie à la plage'],
    },
    sounds: {
      en: ['waves (original sound)', 'original sound - golden.wave', 'surf rock'],
      fr: ['vagues (son original)', 'son original - golden.wave', 'surf rock'],
    },
  },
  volcano: {
    name: { en: 'volcano', fr: 'volcan' },
    authors: ['@lava.flow', '@volcano.watch', '@magma.cam'],
    tags: ['#volcano #lava #nature', '#eruption #earth', '#fyp #foryou'],
    captions: {
      en: ['it rumbles first...', 'then the lava rivers', 'from a safe distance please', 'the earth is alive'],
      fr: ['ça gronde d’abord...', 'puis les rivières de lave', 'de loin s’il te plaît', 'la Terre est vivante'],
    },
    sounds: {
      en: ['deep rumble (original sound)', 'original sound - lava.flow', 'epic drums'],
      fr: ['grondement sourd (son original)', 'son original - lava.flow', 'tambours épiques'],
    },
  },
  waterfall: {
    name: { en: 'waterfall', fr: 'cascade' },
    authors: ['@falls.daily', '@mist.rainbow', '@hidden.falls'],
    tags: ['#waterfall #nature #relax', '#asmr #rainbow', '#travel #fyp'],
    captions: {
      en: ['spot the rainbow in the mist', 'white noise, but real', 'hidden waterfall energy', 'stay here a minute'],
      fr: ['trouve l’arc-en-ciel dans la brume', 'du bruit blanc, mais en vrai', 'énergie cascade cachée', 'reste ici une minute'],
    },
    sounds: {
      en: ['waterfall (ASMR)', 'original sound - falls.daily', 'forest birds'],
      fr: ['cascade (ASMR)', 'son original - falls.daily', 'oiseaux de la forêt'],
    },
  },
  seasons: {
    name: { en: 'four seasons tree', fr: 'arbre des quatre saisons' },
    authors: ['@one.tree', '@year.in.30s', '@seasons.cam'],
    tags: ['#seasons #timelapse #nature', '#tree #cozy', '#aesthetic #fyp'],
    captions: {
      en: ['a whole year in 40 seconds', 'which season are you?', 'blossom, green, gold, snow', 'time flies'],
      fr: ['une année entière en 40 secondes', 'tu es quelle saison ?', 'fleurs, vert, or, neige', 'le temps file'],
    },
    sounds: {
      en: ['Vivaldi - Four Seasons (lofi)', 'original sound - one.tree', 'piano through the year'],
      fr: ['Vivaldi - Les Quatre Saisons (lofi)', 'son original - one.tree', 'piano au fil de l’année'],
    },
  },
  bloom: {
    name: { en: 'flower bloom', fr: 'floraison' },
    authors: ['@bloom.lapse', '@garden.time', '@petal.open'],
    tags: ['#timelapse #flowers #nature', '#bloom #satisfying', '#garden #fyp'],
    captions: {
      en: ['a week of growing in 20 seconds', 'watch them open', 'day, night, bloom', 'spring is loading'],
      fr: ['une semaine de pousse en 20 secondes', 'regarde-les s’ouvrir', 'jour, nuit, floraison', 'chargement du printemps'],
    },
    sounds: {
      en: ['gentle harp (original sound)', 'original sound - bloom.lapse', 'spring morning'],
      fr: ['harpe douce (son original)', 'son original - bloom.lapse', 'matin de printemps'],
    },
  },
  forestfire: {
    name: { en: 'forest fire', fr: 'feu de forêt' },
    authors: ['@forest.cycle', '@regrowth', '@after.the.fire'],
    tags: ['#forest #nature #regrowth', '#fire #rain', '#simulation #fyp'],
    captions: {
      en: ['fire, then rain, then green again', 'watch the sprouts come back', 'nature always rebuilds', 'the cycle of the forest'],
      fr: ['le feu, puis la pluie, puis le vert revient', 'regarde les pousses revenir', 'la nature reconstruit toujours', 'le cycle de la forêt'],
    },
    sounds: {
      en: ['crackle then rain (original sound)', 'original sound - forest.cycle', 'hopeful piano'],
      fr: ['crépitements puis pluie (son original)', 'son original - forest.cycle', 'piano plein d’espoir'],
    },
  },
  geyser: {
    name: { en: 'geyser', fr: 'geyser' },
    authors: ['@old.faithful', '@geyser.watch', '@steam.blast'],
    tags: ['#geyser #nature #travel', '#nationalpark #eruption', '#fyp #foryou'],
    captions: {
      en: ['the tourists waited 90 minutes for this', 'bubbling... bubbling...', 'BOOM', 'right on schedule'],
      fr: ['les touristes ont attendu 90 minutes pour ça', 'ça bouillonne... ça bouillonne...', 'BOUM', 'pile à l’heure'],
    },
    sounds: {
      en: ['whoosh (original sound)', 'original sound - old.faithful', 'crowd gasp'],
      fr: ['whoosh (son original)', 'son original - old.faithful', 'la foule fait waouh'],
    },
  },
  leaves: {
    name: { en: 'falling leaves', fr: 'feuilles qui tombent' },
    authors: ['@autumn.vibes', '@leaf.pile', '@cozy.fall'],
    tags: ['#autumn #fall #cozy', '#leaves #aesthetic', '#fallvibes #fyp'],
    captions: {
      en: ['autumn has entered the chat', 'the pile grows...', 'then the wind', 'sweater weather'],
      fr: ['l’automne est arrivé', 'le tas grossit...', 'puis le vent', 'temps à pull'],
    },
    sounds: {
      en: ['rustling leaves (ASMR)', 'original sound - autumn.vibes', 'autumn jazz'],
      fr: ['bruissement de feuilles (ASMR)', 'son original - autumn.vibes', 'jazz d’automne'],
    },
  },
  mushrooms: {
    name: { en: 'mushrooms after rain', fr: 'champignons après la pluie' },
    authors: ['@forest.floor', '@shroom.lapse', '@mossy.cottage'],
    tags: ['#mushrooms #cottagecore #nature', '#forest #rain', '#timelapse #fyp'],
    captions: {
      en: ['rain, then mushrooms everywhere', 'cottagecore time-lapse', 'the snail is just vibing', 'forest floor magic'],
      fr: ['la pluie, puis des champignons partout', 'time-lapse cottagecore', 'l’escargot profite juste', 'la magie du sol de la forêt'],
    },
    sounds: {
      en: ['forest rain (ASMR)', 'original sound - forest.floor', 'fairy flute'],
      fr: ['pluie en forêt (ASMR)', 'son original - forest.floor', 'flûte de fée'],
    },
  },
  reef: {
    name: { en: 'coral reef', fr: 'récif de corail' },
    authors: ['@reef.life', '@clownfish.home', '@reef.dive'],
    tags: ['#coralreef #ocean #fish', '#underwater #nature', '#scuba #fyp'],
    captions: {
      en: ['spot the clownfish', 'the school passing by', 'a whole city underwater', 'save the reefs'],
      fr: ['trouve le poisson-clown', 'le banc qui passe', 'une ville entière sous l’eau', 'sauvez les récifs'],
    },
    sounds: {
      en: ['underwater calm (original sound)', 'original sound - reef.life', 'ocean ambient'],
      fr: ['calme sous-marin (son original)', 'son original - reef.life', 'ambient océan'],
    },
  },
} satisfies Record<string, Entry>
