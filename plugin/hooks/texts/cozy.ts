import type { Entry } from '../i18n'

// Cozy & lo-fi: names, authors, tags, captions and sounds.

export const COZY = {
  lava: {
    name: { en: 'lava lamp', fr: 'lampe à lave' },
    authors: ['@lava.lamp', '@groovy70s', '@blob.vibes'],
    tags: ['#lavalamp #retro #vibes', '#satisfying #chill', '#aesthetic #fyp'],
    captions: {
      en: ['70s vibes', 'the blobs are dancing', 'my IRL wallpaper', 'hypnotic, right?'],
      fr: ['vibes années 70', 'les blobs font la danse', 'mon fond d\'écran IRL', 'hypnotisant non ?'],
    },
    sounds: {
      en: ['funk 1974 (slowed)', 'original sound - lava.lamp', 'night synthwave'],
      fr: ['funk 1974 (slowed)', 'son original - lava.lamp', 'synthwave nocturne'],
    },
  },
  feux: {
    name: { en: 'fireworks', fr: 'feux d\'artifice' },
    authors: ['@fireworks.night', '@pyro.pixel', '@starry.night'],
    tags: ['#fireworks #pixelart', '#night #satisfying', '#fyp #foryou'],
    captions: {
      en: ['the grand finale is coming', 'count the rockets', 'better than the 4th of July', 'wait for the golden one'],
      fr: ['le bouquet final arrive', 'compte les fusées', 'mieux qu\'au 14 juillet', 'attends la dorée'],
    },
    sounds: {
      en: ['boom boom (original sound)', 'anthem but 8-bit', 'crowd ambience'],
      fr: ['boom boom (son original)', 'Marseillaise 8 bits', 'ambiance foule'],
    },
  },
  feu: {
    name: { en: 'campfire', fr: 'feu de camp' },
    authors: ['@campfire.cozy', '@night.in.the.woods', '@embers.chill'],
    tags: ['#campfire #cozy #night', '#chill #asmr', '#cozy #fyp'],
    captions: {
      en: ['crackle crackle...', 'anyone got marshmallows?', 'watch the embers rise', 'camping night'],
      fr: ['ça crépite...', 'quelqu’un a des chamallows ?', 'regarde les braises monter', 'soirée camping'],
    },
    sounds: {
      en: ['crackling fire (ASMR)', 'campfire guitar', 'crickets at night'],
      fr: ['crépitements (ASMR)', 'guitare au coin du feu', 'grillons la nuit'],
    },
  },
  neige: {
    name: { en: 'snowy cabin', fr: 'chalet sous la neige' },
    authors: ['@cozy.cabin', '@winter.pixel', '@mountain.zen'],
    tags: ['#snow #cozy #winter', '#cabin #chill', '#cozy #fyp'],
    captions: {
      en: ['the snow slowly covers everything', 'my dream cabin', 'it\'s 10°F outside', 'hot chocolate time'],
      fr: ['la neige recouvre tout doucement', 'le chalet de mes rêves', 'il fait -12 dehors', 'chocolat chaud time'],
    },
    sounds: {
      en: ['winter wind', 'christmas lofi piano', 'original sound - cozy.cabin'],
      fr: ['vent d’hiver', 'piano de noël lofi', 'son original - cozy.cabin'],
    },
  },
  vitre: {
    name: { en: 'rainy window', fr: 'pluie sur la vitre' },
    authors: ['@rainy.window', '@cozy.rain', '@city.lights'],
    tags: ['#rain #cozy #window', '#asmr #chill', '#rainyday #fyp'],
    captions: {
      en: ['watch the drops race', 'rainy night in the city', 'perfect weather to stay in', 'which drop wins?'],
      fr: ['regarde les gouttes faire la course', 'nuit de pluie en ville', 'parfait pour rester au chaud', 'quelle goutte gagne ?'],
    },
    sounds: {
      en: ['rain on glass (ASMR)', 'lofi for rainy days', 'distant thunder'],
      fr: ['pluie sur la vitre (ASMR)', 'lofi pour jours de pluie', 'tonnerre au loin'],
    },
  },
  lofi: {
    name: { en: 'lo-fi study desk', fr: 'bureau lo-fi' },
    authors: ['@lofi.desk', '@study.with.me', '@rainy.study'],
    tags: ['#lofi #studywithme #cozy', '#rain #aesthetic', '#chill #fyp'],
    captions: {
      en: ['beats to wait for Claude to', 'study with me (the cat helps)', 'rainy night, warm lamp', 'you deserve a break too'],
      fr: ['beats pour attendre Claude', 'révise avec moi (le chat aide)', 'nuit de pluie, lampe chaude', 'toi aussi tu mérites une pause'],
    },
    sounds: {
      en: ['lofi hip hop radio', 'original sound - lofi.desk', 'rain on the window'],
      fr: ['radio lofi hip hop', 'son original - lofi.desk', 'pluie sur la fenêtre'],
    },
  },
  aquarium: {
    name: { en: 'aquarium', fr: 'aquarium' },
    authors: ['@tiny.tank', '@fish.room', '@aquascape'],
    tags: ['#aquarium #fish #relaxing', '#aquascape #calm', '#cozy #fyp'],
    captions: {
      en: ['screensaver of my dreams', 'watch the orange one', 'bubbles forever', 'instant calm'],
      fr: ['l’écran de veille de mes rêves', 'regarde l’orange', 'des bulles pour toujours', 'calme instantané'],
    },
    sounds: {
      en: ['aquarium bubbles (ASMR)', 'original sound - tiny.tank', 'underwater lofi'],
      fr: ['bulles d’aquarium (ASMR)', 'son original - tiny.tank', 'lofi sous-marin'],
    },
  },
  plant: {
    name: { en: 'windowsill plant', fr: 'plante sur le rebord' },
    authors: ['@plant.parent', '@leaf.by.leaf', '@sill.garden'],
    tags: ['#plants #plantparent #timelapse', '#cozy #growth', '#houseplants #fyp'],
    captions: {
      en: ['one leaf at a time', 'day and night, it keeps growing', 'water it, love it', 'growth takes time (and that’s ok)'],
      fr: ['une feuille à la fois', 'jour et nuit, elle continue de pousser', 'arrose-la, aime-la', 'grandir prend du temps (et c’est ok)'],
    },
    sounds: {
      en: ['gentle guitar (original sound)', 'original sound - plant.parent', 'morning birds'],
      fr: ['guitare douce (son original)', 'son original - plant.parent', 'oiseaux du matin'],
    },
  },
  cafe: {
    name: { en: 'café window', fr: 'vitrine de café' },
    authors: ['@corner.cafe', '@people.watch', '@latte.window'],
    tags: ['#cafe #cozy #aesthetic', '#coffee #peoplewatching', '#chill #fyp'],
    captions: {
      en: ['people-watching with a latte', 'then it started raining', 'my favourite seat', 'third coffee, no regrets'],
      fr: ['regarder les gens passer avec un latte', 'puis il s’est mis à pleuvoir', 'ma place préférée', 'troisième café, aucun regret'],
    },
    sounds: {
      en: ['café ambience (original sound)', 'original sound - corner.cafe', 'jazz café'],
      fr: ['ambiance de café (son original)', 'son original - corner.cafe', 'café jazz'],
    },
  },
  trainwindow: {
    name: { en: 'train window', fr: 'fenêtre de train' },
    authors: ['@window.seat', '@slow.train', '@scenic.route'],
    tags: ['#train #travel #aesthetic', '#windowseat #cozy', '#chill #fyp'],
    captions: {
      en: ['window seat, headphones on', 'main character on a train', 'watch the layers slide by', 'nowhere to be'],
      fr: ['place côté fenêtre, casque sur les oreilles', 'personnage principal dans un train', 'regarde les plans défiler', 'nulle part où aller'],
    },
    sounds: {
      en: ['train rhythm (ASMR)', 'original sound - window.seat', 'indie road trip'],
      fr: ['rythme du train (ASMR)', 'son original - window.seat', 'road trip indie'],
    },
  },
  bookshelf: {
    name: { en: 'bookshelf tidy', fr: 'bibliothèque rangée' },
    authors: ['@shelf.goals', '@rainbow.books', '@book.nook'],
    tags: ['#bookshelf #booktok #organization', '#rainbow #satisfying', '#cozy #fyp'],
    captions: {
      en: ['sorting by colour, obviously', 'rainbow shelf in progress', 'one swap at a time', 'booktok approved'],
      fr: ['trié par couleur, évidemment', 'étagère arc-en-ciel en cours', 'un échange à la fois', 'validé par booktok'],
    },
    sounds: {
      en: ['book slide (ASMR)', 'original sound - shelf.goals', 'library lofi'],
      fr: ['livres qui glissent (ASMR)', 'son original - shelf.goals', 'lofi de bibliothèque'],
    },
  },
  citywindows: {
    name: { en: 'night city windows', fr: 'fenêtres de nuit' },
    authors: ['@tower.lights', '@night.owl', '@window.stories'],
    tags: ['#citylights #night #aesthetic', '#cozy #nightowl', '#chill #fyp'],
    captions: {
      en: ['every window is a story', 'who else is awake?', 'lights on, lights off', '2am in the city'],
      fr: ['chaque fenêtre est une histoire', 'qui d’autre est réveillé ?', 'lumière allumée, lumière éteinte', '2h du mat en ville'],
    },
    sounds: {
      en: ['night city hum (original sound)', 'original sound - tower.lights', 'late night jazz'],
      fr: ['bourdonnement de la ville la nuit (son original)', 'son original - city.lights', 'jazz de fin de soirée'],
    },
  },
  knitting: {
    name: { en: 'knitting', fr: 'tricot' },
    authors: ['@knit.happens', '@cozy.scarf', '@yarn.ball'],
    tags: ['#knitting #cozy #crafts', '#handmade #scarf', '#winter #fyp'],
    captions: {
      en: ['row by row', 'the yarn ball keeps shrinking', 'new stripe incoming', 'scarf season'],
      fr: ['rang par rang', 'la pelote continue de rétrécir', 'nouvelle rayure en approche', 'saison des écharpes'],
    },
    sounds: {
      en: ['needles clicking (ASMR)', 'original sound - knit.happens', 'fireplace crackle'],
      fr: ['aiguilles qui cliquettent (ASMR)', 'son original - knit.happens', 'crépitement de cheminée'],
    },
  },
  balloons: {
    name: { en: 'hot air balloons', fr: 'montgolfières' },
    authors: ['@balloon.dawn', '@sky.drift', '@cappadocia.vibes'],
    tags: ['#hotairballoon #sunrise #travel', '#aesthetic #sky', '#dreamy #fyp'],
    captions: {
      en: ['sunrise float', 'bucket list unlocked', 'they just drift', 'peaceful morning'],
      fr: ['flotter au lever du soleil', 'bucket list débloquée', 'elles dérivent, c’est tout', 'matin paisible'],
    },
    sounds: {
      en: ['burner whoosh (original sound)', 'original sound - balloon.dawn', 'dreamy strings'],
      fr: ['souffle du brûleur (son original)', 'son original - balloon.dawn', 'cordes rêveuses'],
    },
  },
  lanterns: {
    name: { en: 'lantern festival', fr: 'fête des lanternes' },
    authors: ['@lantern.night', '@wish.lights', '@floating.glow'],
    tags: ['#lanterns #festival #night', '#aesthetic #wishes', '#magic #fyp'],
    captions: {
      en: ['make a wish', 'I see the light (you know the song)', 'reflections on the water', 'the sky is full of wishes'],
      fr: ['fais un vœu', 'Je vois la lumière (tu connais la chanson)', 'des reflets sur l’eau', 'le ciel est plein de vœux'],
    },
    sounds: {
      en: ['I See the Light (music box)', 'original sound - lantern.night', 'soft crowd'],
      fr: ['Je vois la lumière (boîte à musique)', 'son original - lantern.night', 'foule douce'],
    },
  },
  fishing: {
    name: { en: 'fishing dock', fr: 'pêche au ponton' },
    authors: ['@dock.fishing', '@float.watch', '@sunset.catch'],
    tags: ['#fishing #sunset #chill', '#lake #cozy', '#nature #fyp'],
    captions: {
      en: ['wait for the float to dip...', 'BITE!', 'sunset fishing hits different', 'patience is the whole game'],
      fr: ['attends que le flotteur plonge...', 'ÇA MORD !', 'la pêche au coucher du soleil, ça a un truc', 'la patience, c’est tout le jeu'],
    },
    sounds: {
      en: ['lake ambience (original sound)', 'original sound - dock.fishing', 'country guitar'],
      fr: ['ambiance de lac (son original)', 'son original - dock.fishing', 'guitare country'],
    },
  },
  farm: {
    name: { en: 'farm crops', fr: 'cultures de la ferme' },
    authors: ['@pixel.farm', '@harvest.moon', '@crop.cycle'],
    tags: ['#farming #stardew #cozygames', '#harvest #pixelart', '#cozy #fyp'],
    captions: {
      en: ['till, plant, wait, harvest', 'cozy game energy', 'the farmer never stops', 'wheat, carrots, pumpkins'],
      fr: ['labourer, planter, attendre, récolter', 'énergie jeu cozy', 'le fermier ne s’arrête jamais', 'blé, carottes, citrouilles'],
    },
    sounds: {
      en: ['spring on the farm (original sound)', 'original sound - pixel.farm', 'cozy game OST'],
      fr: ['printemps à la ferme (son original)', 'son original - pixel.farm', 'BO de jeu cozy'],
    },
  },
  marshmallow: {
    name: { en: 'toasting marshmallows', fr: 'chamallows grillés' },
    authors: ['@golden.mallow', '@campfire.snacks', '@smore.time'],
    tags: ['#marshmallow #campfire #camping', '#smores #cozy', '#outdoors #fyp'],
    captions: {
      en: ['golden... golden... ON FIRE', 'team golden or team burnt?', 'it always catches fire', 'campfire therapy'],
      fr: ['doré... doré... EN FEU', 'team doré ou team cramé ?', 'il prend toujours feu', 'thérapie au coin du feu'],
    },
    sounds: {
      en: ['fire crackle (ASMR)', 'original sound - golden.mallow', 'acoustic campfire'],
      fr: ['crépitement du feu (ASMR)', 'son original - golden.mallow', 'guitare au coin du feu'],
    },
  },
  jellyfish: {
    name: { en: 'jellyfish', fr: 'méduses' },
    authors: ['@jelly.glow', '@deep.drift', '@aquarium.dark'],
    tags: ['#jellyfish #ocean #calm', '#aquarium #glow', '#relaxing #fyp'],
    captions: {
      en: ['pulse... drift... pulse...', 'the most relaxing animal', 'no brain, no stress', 'glowing in the dark'],
      fr: ['pulsation... dérive... pulsation...', 'l’animal le plus relaxant', 'pas de cerveau, pas de stress', 'qui brillent dans le noir'],
    },
    sounds: {
      en: ['deep water (original sound)', 'original sound - jelly.glow', 'ambient drone'],
      fr: ['eaux profondes (son original)', 'son original - jelly.glow', 'drone ambient'],
    },
  },
  ferris: {
    name: { en: 'ferris wheel', fr: 'grande roue' },
    authors: ['@dusk.wheel', '@fair.lights', '@carnival.night'],
    tags: ['#ferriswheel #carnival #night', '#aesthetic #lights', '#nostalgia #fyp'],
    captions: {
      en: ['dusk at the fair', 'the lights chase each other', 'top of the wheel, top of the world', 'summer nights'],
      fr: ['crépuscule à la fête foraine', 'les lumières se courent après', 'en haut de la roue, en haut du monde', 'nuits d’été'],
    },
    sounds: {
      en: ['carnival music (original sound)', 'original sound - dusk.wheel', 'nostalgic synth'],
      fr: ['musique de fête foraine (son original)', 'son original - dusk.wheel', 'synthé nostalgique'],
    },
  },
  sailing: {
    name: { en: 'sailing', fr: 'voilier' },
    authors: ['@sail.away', '@sea.breeze', '@open.water'],
    tags: ['#sailing #ocean #summer', '#boat #calm', '#travel #fyp'],
    captions: {
      en: ['let the wind decide', 'gulls, sun, waves', 'out of office', 'slow sailing'],
      fr: ['laisse le vent décider', 'mouettes, soleil, vagues', 'absent du bureau', 'navigation tranquille'],
    },
    sounds: {
      en: ['sea breeze (original sound)', 'original sound - sail.away', 'yacht rock'],
      fr: ['brise marine (son original)', 'son original - sail.away', 'yacht rock'],
    },
  },
  lighthouse: {
    name: { en: 'lighthouse', fr: 'phare' },
    authors: ['@light.keeper', '@stormy.coast', '@beam.sweep'],
    tags: ['#lighthouse #storm #ocean', '#cozy #moody', '#aesthetic #fyp'],
    captions: {
      en: ['the keeper never sleeps', 'stormy night, steady light', 'watch the beam sweep', 'cozy from far away'],
      fr: ['le gardien ne dort jamais', 'nuit de tempête, lumière constante', 'regarde le faisceau balayer', 'cosy, vu de loin'],
    },
    sounds: {
      en: ['storm and waves (ASMR)', 'original sound - light.keeper', 'sea shanty (slow)'],
      fr: ['tempête et vagues (ASMR)', 'son original - light.keeper', 'chant de marins (lent)'],
    },
  },
  laundromat: {
    name: { en: 'laundromat at night', fr: 'laverie de nuit' },
    authors: ['@laundromat.at.2am', '@spin.cycle.calm', '@neon.and.dryers'],
    tags: ['#laundromat #cozy #lofi', '#nightvibes #aesthetic', '#fyp #foryou'],
    captions: {
      en: ['the most relaxing place at 2am', 'wait for the spin cycle', 'pick a machine and watch it', 'romanticise your laundry'],
      fr: ['l’endroit le plus apaisant à 2 h du matin', 'attends l’essorage', 'choisis une machine et regarde-la', 'romantise ta lessive'],
    },
    sounds: {
      en: ['washing machine hum', 'original sound - laundromat.at.2am', 'lo-fi night beats'],
      fr: ['ronron de machine à laver', 'son original - laundromat.at.2am', 'beats lo-fi de nuit'],
    },
  },
} satisfies Record<string, Entry>
