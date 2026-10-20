import type { Entry } from '../i18n'

// Space & sci-fi: names, authors, tags, captions and sounds.

export const SPACE = {
  rocket: {
    name: { en: 'rocket landing', fr: 'atterrissage de fusée' },
    authors: ['@launch.pad', '@booster.back', '@liftoff.daily'],
    tags: ['#rocket #space #launch', '#spacex #engineering', '#science #fyp'],
    captions: {
      en: ['3... 2... 1... liftoff', 'and then the booster comes BACK', 'the landing never gets old', 'science fiction is now'],
      fr: ['3... 2... 1... décollage', 'et ensuite le booster REVIENT', 'l’atterrissage, on ne s’en lasse pas', 'la science-fiction, c’est maintenant'],
    },
    sounds: {
      en: ['rocket roar (original sound)', 'original sound - launch.pad', 'Interstellar theme (organ)'],
      fr: ['rugissement de fusée (son original)', 'son original - launch.pad', 'thème d’Interstellar (orgue)'],
    },
  },
  solarsystem: {
    name: { en: 'solar system', fr: 'système solaire' },
    authors: ['@orbit.lapse', '@planet.parade', '@space.class'],
    tags: ['#solarsystem #space #planets', '#astronomy #education', '#science #fyp'],
    captions: {
      en: ['inner planets are SO fast', 'find the Earth (and its moon)', 'a year on Saturn takes forever', 'space class but chill'],
      fr: ['les planètes du centre vont TROP vite', 'trouve la Terre (et sa Lune)', 'une année sur Saturne, c’est interminable', 'le cours d’astronomie mais chill'],
    },
    sounds: {
      en: ['cosmic ambience (original sound)', 'original sound - orbit.lapse', 'Holst - The Planets (lofi)'],
      fr: ['ambiance cosmique (son original)', 'son original - orbit.lapse', 'Holst - Les Planètes (lofi)'],
    },
  },
  blackhole: {
    name: { en: 'black hole', fr: 'trou noir' },
    authors: ['@event.horizon', '@spaghettified', '@gravity.well'],
    tags: ['#blackhole #space #astrophysics', '#universe #science', '#mindblown #fyp'],
    captions: {
      en: ['nothing escapes', 'the glowing disk is matter falling in', 'imagine being that star', 'scary and beautiful'],
      fr: ['rien ne s’échappe', 'le disque brillant, c’est de la matière qui tombe', 'imagine être cette étoile', 'effrayant et magnifique'],
    },
    sounds: {
      en: ['deep space hum (original sound)', 'original sound - event.horizon', 'Interstellar - No Time for Caution'],
      fr: ['bourdonnement spatial (son original)', 'son original - event.horizon', 'Interstellar - No Time for Caution'],
    },
  },
  warp: {
    name: { en: 'warp speed', fr: 'vitesse lumière' },
    authors: ['@warp.drive', '@light.speed', '@bridge.view'],
    tags: ['#warpspeed #space #scifi', '#starwars #startrek', '#fyp #foryou'],
    captions: {
      en: ['punch it', 'jumping to lightspeed', 'pov: you’re the captain', 'the stretch is everything'],
      fr: ['vas-y fonce', 'passage en vitesse lumière', 'pov : tu es le capitaine', 'l’étirement des étoiles, c’est tout'],
    },
    sounds: {
      en: ['hyperdrive (original sound)', 'original sound - warp.drive', 'epic space opera'],
      fr: ['hyperpropulsion (son original)', 'son original - warp.drive', 'space opera épique'],
    },
  },
  ufo: {
    name: { en: 'UFO abduction', fr: 'enlèvement par OVNI' },
    authors: ['@area.51', '@cow.beam', '@abducted'],
    tags: ['#ufo #aliens #funny', '#cows #area51', '#fyp #foryou'],
    captions: {
      en: ['they only want the cows', 'farmer is going to be so confused', 'count the cows', 'the beam is so smooth'],
      fr: ['ils ne veulent que les vaches', 'le fermier va être tellement perdu', 'compte les vaches', 'le rayon est tellement fluide'],
    },
    sounds: {
      en: ['X-Files theme (8-bit)', 'original sound - area.51', 'moo (original sound)'],
      fr: ['thème X-Files (8 bits)', 'son original - area.51', 'meuh (son original)'],
    },
  },
  planetform: {
    name: { en: 'planet formation', fr: 'formation d’une planète' },
    authors: ['@proto.planet', '@dust.to.world', '@cosmic.origin'],
    tags: ['#space #planets #astronomy', '#origin #science', '#universe #fyp'],
    captions: {
      en: ['dust clumps into a world', 'watch it clear its orbit', 'this is how Earth started', '4.5 billion years in 40 seconds'],
      fr: ['la poussière devient un monde', 'regarde-la nettoyer son orbite', 'c’est comme ça qu’a commencé la Terre', '4,5 milliards d’années en 40 secondes'],
    },
    sounds: {
      en: ['cosmic drone (original sound)', 'original sound - proto.planet', 'ambient space'],
      fr: ['drone cosmique (son original)', 'son original - proto.planet', 'ambient spatial'],
    },
  },
  rover: {
    name: { en: 'Mars rover', fr: 'rover sur Mars' },
    authors: ['@red.rover', '@mars.daily', '@six.wheels'],
    tags: ['#mars #rover #nasa', '#space #exploration', '#science #fyp'],
    captions: {
      en: ['a regular Tuesday on Mars', 'the helicopter cameo!', 'two moons in the sky', 'slowest road trip ever'],
      fr: ['un mardi normal sur Mars', 'l’apparition de l’hélico !', 'deux lunes dans le ciel', 'le road trip le plus lent du monde'],
    },
    sounds: {
      en: ['martian wind (original sound)', 'original sound - red.rover', 'lonely synth'],
      fr: ['vent martien (son original)', 'son original - red.rover', 'synthé solitaire'],
    },
  },
  docking: {
    name: { en: 'space docking', fr: 'amarrage spatial' },
    authors: ['@dock.cam', '@soft.capture', '@orbit.station'],
    tags: ['#iss #space #docking', '#astronaut #precision', '#satisfying #fyp'],
    captions: {
      en: ['millimetre precision at 28,000 km/h', 'tiny thruster puffs', 'soft capture confirmed', 'the most satisfying parking'],
      fr: ['précision au millimètre à 28 000 km/h', 'les petites bouffées des propulseurs', 'capture douce confirmée', 'le créneau le plus satisfaisant'],
    },
    sounds: {
      en: ['mission control (original sound)', 'original sound - dock.cam', 'Blue Danube waltz'],
      fr: ['centre de contrôle (son original)', 'son original - dock.cam', 'valse du Beau Danube bleu'],
    },
  },
  meteors: {
    name: { en: 'meteor shower', fr: 'pluie d’étoiles filantes' },
    authors: ['@star.gazer', '@wish.counter', '@camp.night'],
    tags: ['#meteorshower #stars #night', '#camping #wish', '#nature #fyp'],
    captions: {
      en: ['make a wish (we counted them)', 'camping under the Perseids', 'no city lights = this', 'every streak is a wish'],
      fr: ['fais un vœu (on les a comptés)', 'camping sous les Perséides', 'sans lumière de ville = ça', 'chaque traînée est un vœu'],
    },
    sounds: {
      en: ['crickets (original sound)', 'original sound - star.gazer', 'acoustic campfire'],
      fr: ['grillons (son original)', 'son original - star.gazer', 'guitare au coin du feu'],
    },
  },
  rud: {
    name: { en: 'test flight', fr: 'vol d’essai' },
    authors: ['@test.flight', '@rud.happens', '@learn.fast'],
    tags: ['#rocket #testflight #engineering', '#explosion #space', '#fyp #foryou'],
    captions: {
      en: ['rapid unscheduled disassembly', 'it wobbled... then', 'still a successful test', 'the crowd still cheered'],
      fr: ['désassemblage rapide non planifié', 'elle a vacillé... puis', 'un test réussi quand même', 'le public a quand même applaudi'],
    },
    sounds: {
      en: ['boom (original sound)', 'original sound - test.flight', 'ok I pull up (sad)'],
      fr: ['boum (son original)', 'son original - test.flight', 'ok I pull up (triste)'],
    },
  },
  kessler: {
    name: { en: 'Kessler cascade', fr: 'syndrome de Kessler' },
    authors: ['@space.junk', '@orbit.debris', '@chain.collision'],
    tags: ['#spacejunk #kessler #science', '#satellites #orbit', '#space #fyp'],
    captions: {
      en: ['one crash makes more crashes', 'count the debris', 'this is why space junk matters', 'Gravity (the movie) was real'],
      fr: ['un choc en provoque d’autres', 'compte les débris', 'voilà pourquoi les débris spatiaux, c’est grave', 'Gravity (le film) était réaliste'],
    },
    sounds: {
      en: ['silent space (original sound)', 'original sound - space.junk', 'tense ambient'],
      fr: ['l’espace silencieux (son original)', 'son original - space.junk', 'ambient tendu'],
    },
  },
  terraform: {
    name: { en: 'terraforming', fr: 'terraformation' },
    authors: ['@terra.form', '@red.to.blue', '@new.home'],
    tags: ['#terraforming #mars #scifi', '#space #future', '#planet #fyp'],
    captions: {
      en: ['red planet → blue planet', 'oceans, then clouds, then green', 'Mars in 1000 years?', 'watch the percentage'],
      fr: ['planète rouge → planète bleue', 'océans, puis nuages, puis verdure', 'Mars dans 1000 ans ?', 'regarde le pourcentage'],
    },
    sounds: {
      en: ['hopeful synth (original sound)', 'original sound - terra.form', 'cinematic rise'],
      fr: ['synthé plein d’espoir (son original)', 'son original - terra.form', 'montée cinématique'],
    },
  },
  wormhole: {
    name: { en: 'wormhole', fr: 'trou de ver' },
    authors: ['@worm.hole', '@tunnel.vision', '@other.side'],
    tags: ['#wormhole #scifi #trippy', '#space #hypnotic', '#visuals #fyp'],
    captions: {
      en: ['see you on the other side', 'don’t blink', 'hypnotic, right?', 'pov: Interstellar'],
      fr: ['on se voit de l’autre côté', 'ne cligne pas des yeux', 'hypnotisant non ?', 'pov : Interstellar'],
    },
    sounds: {
      en: ['whoosh (original sound)', 'original sound - worm.hole', 'psychedelic synth'],
      fr: ['whoosh (son original)', 'son original - worm.hole', 'synthé psychédélique'],
    },
  },
  threebody: {
    name: { en: 'three-body problem', fr: 'problème à trois corps' },
    authors: ['@three.body', '@chaos.orbits', '@trisolaris'],
    tags: ['#threebodyproblem #physics #chaos', '#space #simulation', '#science #fyp'],
    captions: {
      en: ['three suns, zero stability', 'until one gets flung out', 'no formula can predict this', 'chaos theory in motion'],
      fr: ['trois soleils, zéro stabilité', 'jusqu’à ce qu’un soit éjecté', 'aucune formule ne peut prévoir ça', 'la théorie du chaos en mouvement'],
    },
    sounds: {
      en: ['cosmic tension (original sound)', 'original sound - three.body', 'eerie strings'],
      fr: ['tension cosmique (son original)', 'son original - three.body', 'cordes inquiétantes'],
    },
  },
} satisfies Record<string, Entry>
