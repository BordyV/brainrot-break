import type { Entry } from '../i18n'

// Vehicles & city: names, authors, tags, captions and sounds.

export const CITY = {
  cyber: {
    name: { en: 'cyberpunk city', fr: 'ville cyberpunk' },
    authors: ['@neon.city', '@night.city', '@blade.rain'],
    tags: ['#cyberpunk #neon #rain', '#synthwave #aesthetic', '#nightcity #fyp'],
    captions: {
      en: ['night city in the rain', 'the flying cars never stop', 'neon reflections', 'it’s 2077 somewhere'],
      fr: ['night city sous la pluie', 'les voitures volantes ne s’arrêtent jamais', 'reflets de néons', 'on est en 2077 quelque part'],
    },
    sounds: {
      en: ['rain + synthwave', 'original sound - neon.city', 'blade runner ambience'],
      fr: ['pluie + synthwave', 'son original - neon.city', 'ambiance blade runner'],
    },
  },
  traffic: {
    name: { en: 'traffic lights', fr: 'feux tricolores' },
    authors: ['@crossroads.cam', '@green.wave', '@rush.hour'],
    tags: ['#traffic #city #satisfying', '#cars #citylife', '#fyp #foryou'],
    captions: {
      en: ['red... green... go', 'rush hour from above', 'the queue clears so nicely', 'city simulator irl'],
      fr: ['rouge... vert... on y va', 'l’heure de pointe vue d’en haut', 'la file se vide si bien', 'city simulator en vrai'],
    },
    sounds: {
      en: ['city traffic (original sound)', 'original sound - crossroads.cam', 'city pop'],
      fr: ['circulation en ville (son original)', 'son original - crossroads.cam', 'city pop'],
    },
  },
  roundabout: {
    name: { en: 'roundabout', fr: 'rond-point' },
    authors: ['@roundabout.pov', '@yield.left', '@circle.flow'],
    tags: ['#roundabout #traffic #driving', '#cars #satisfying', '#fyp #foryou'],
    captions: {
      en: ['nobody knows who has priority', 'the flow is weirdly perfect', 'third exit please', 'France in one video'],
      fr: ['personne ne sait qui a la priorité', 'le flux est bizarrement parfait', 'troisième sortie s’il vous plaît', 'la France en une vidéo'],
    },
    sounds: {
      en: ['indicator ticking (original sound)', 'original sound - roundabout.pov', 'driving playlist'],
      fr: ['clignotant (son original)', 'son original - roundabout.pov', 'playlist de route'],
    },
  },
  parallel: {
    name: { en: 'parallel parking', fr: 'créneau' },
    authors: ['@parallel.park', '@one.more.try', '@driving.test'],
    tags: ['#parallelparking #driving #fail', '#cars #funny', '#fyp #foryou'],
    captions: {
      en: ['attempt number...', 'the bump lol', 'finally perfect', 'driving test flashbacks'],
      fr: ['tentative numéro...', 'le petit choc mdr', 'enfin parfait', 'flashbacks du permis'],
    },
    sounds: {
      en: ['parking sensor beeps (original sound)', 'original sound - parallel.park', 'tense music'],
      fr: ['radar de recul (son original)', 'son original - parallel.park', 'musique de tension'],
    },
  },
  levelcross: {
    name: { en: 'level crossing', fr: 'passage à niveau' },
    authors: ['@train.spotter', '@barrier.down', '@rail.cam'],
    tags: ['#train #railway #trainspotting', '#levelcrossing #satisfying', '#fyp #foryou'],
    captions: {
      en: ['ding ding ding ding', 'count the wagons', 'everyone waits', 'train spotters, this one’s for you'],
      fr: ['ding ding ding ding', 'compte les wagons', 'tout le monde attend', 'pour les fans de trains'],
    },
    sounds: {
      en: ['crossing bells (original sound)', 'original sound - train.spotter', 'train horn'],
      fr: ['sonnerie du passage (son original)', 'son original - train.spotter', 'klaxon de train'],
    },
  },
  runway: {
    name: { en: 'runway', fr: 'piste d’atterrissage' },
    authors: ['@plane.spotter', '@runway.cam', '@touchdown'],
    tags: ['#aviation #planes #airport', '#landing #takeoff', '#fyp #foryou'],
    captions: {
      en: ['landing, then takeoff', 'watch the shadow meet the plane', 'butter landing', 'airport from above'],
      fr: ['un atterrissage, puis un décollage', 'regarde l’ombre rejoindre l’avion', 'atterrissage tout en douceur', 'l’aéroport vu d’en haut'],
    },
    sounds: {
      en: ['jet engines (original sound)', 'original sound - plane.spotter', 'cabin announcement'],
      fr: ['réacteurs (son original)', 'son original - plane.spotter', 'annonce en cabine'],
    },
  },
  carwash: {
    name: { en: 'car wash', fr: 'lavage auto' },
    authors: ['@car.wash', '@foam.tunnel', '@shine.time'],
    tags: ['#carwash #satisfying #cars', '#clean #asmr', '#fyp #foryou'],
    captions: {
      en: ['muddy in, shiny out', 'the foam!!', 'childhood favourite', 'the spinning brushes'],
      fr: ['entre sale, ressort brillante', 'la mousse !!', 'mon moment préféré quand j’étais petit', 'les rouleaux qui tournent'],
    },
    sounds: {
      en: ['car wash (ASMR)', 'original sound - car.wash', 'bubbly synth'],
      fr: ['lavage auto (ASMR)', 'son original - car.wash', 'synthé pétillant'],
    },
  },
  crane: {
    name: { en: 'tower crane', fr: 'grue' },
    authors: ['@crane.op', '@floor.by.floor', '@site.cam'],
    tags: ['#construction #crane #satisfying', '#building #timelapse', '#fyp #foryou'],
    captions: {
      en: ['one floor at a time', 'crane operators are built different', 'construction time-lapse', 'how high this time?'],
      fr: ['un étage à la fois', 'les grutiers, c’est autre chose', 'time-lapse de chantier', 'jusqu’où cette fois ?'],
    },
    sounds: {
      en: ['construction site (original sound)', 'original sound - crane.op', 'work playlist'],
      fr: ['chantier (son original)', 'son original - crane.op', 'playlist de travail'],
    },
  },
  citybuilder: {
    name: { en: 'city builder', fr: 'ville qui grandit' },
    authors: ['@city.sim', '@sim.mayor', '@grid.city'],
    tags: ['#citybuilder #simcity #gaming', '#citiesskylines #timelapse', '#fyp #foryou'],
    captions: {
      en: ['from one road to a city', 'roads first, then houses, then towers', 'watch the population', 'mayor mode on'],
      fr: ['d’une route à une ville', 'les routes, puis les maisons, puis les tours', 'regarde la population', 'mode maire activé'],
    },
    sounds: {
      en: ['city builder OST', 'original sound - city.sim', 'calm strategy music'],
      fr: ['BO de city builder', 'son original - city.sim', 'musique de stratégie calme'],
    },
  },
  metro: {
    name: { en: 'metro map', fr: 'plan de métro' },
    authors: ['@mini.metro', '@line.planner', '@transit.nerd'],
    tags: ['#minimetro #transit #design', '#subway #strategy', '#fyp #foryou'],
    captions: {
      en: ['passengers want their shape', 'new station, new line', 'transit nerds unite', 'it gets busy fast'],
      fr: ['les passagers veulent leur forme', 'nouvelle station, nouvelle ligne', 'les fans de transports, réunissez-vous', 'ça devient vite chargé'],
    },
    sounds: {
      en: ['metro chime (original sound)', 'original sound - mini.metro', 'minimal piano'],
      fr: ['carillon du métro (son original)', 'son original - mini.metro', 'piano minimal'],
    },
  },
  dragrace: {
    name: { en: 'drag race', fr: 'course de dragsters' },
    authors: ['@quarter.mile', '@launch.control', '@tree.lights'],
    tags: ['#dragrace #cars #racing', '#launch #speed', '#fyp #foryou'],
    captions: {
      en: ['watch the lights', 'reaction time is everything', 'red or blue?', 'the wheelie launch'],
      fr: ['regarde les feux', 'tout se joue au temps de réaction', 'rouge ou bleu ?', 'le départ en wheeling'],
    },
    sounds: {
      en: ['engine roar (original sound)', 'original sound - quarter.mile', 'fast and furious remix'],
      fr: ['rugissement moteur (son original)', 'son original - quarter.mile', 'remix fast and furious'],
    },
  },
  monstertruck: {
    name: { en: 'monster truck', fr: 'monster truck' },
    authors: ['@monster.jam', '@car.crusher', '@big.wheels'],
    tags: ['#monstertruck #crush #cars', '#monsterjam #jump', '#fyp #foryou'],
    captions: {
      en: ['the jump... the crush', 'RIP those cars', 'big wheels energy', 'count the crushed cars'],
      fr: ['le saut... l’écrasement', 'RIP ces voitures', 'énergie grosses roues', 'compte les voitures écrasées'],
    },
    sounds: {
      en: ['crowd roar (original sound)', 'original sound - monster.jam', 'heavy metal'],
      fr: ['foule en délire (son original)', 'son original - monster.jam', 'heavy metal'],
    },
  },
  port: {
    name: { en: 'container port', fr: 'port à conteneurs' },
    authors: ['@port.ops', '@container.stack', '@shipping.life'],
    tags: ['#shipping #port #satisfying', '#containers #logistics', '#fyp #foryou'],
    captions: {
      en: ['yard to ship, one by one', 'the crane never stops', 'that’s where your order is', 'logistics are beautiful'],
      fr: ['du quai au bateau, un par un', 'la grue ne s’arrête jamais', 'ta commande est là-dedans', 'la logistique, c’est beau'],
    },
    sounds: {
      en: ['port ambience (original sound)', 'original sound - port.ops', 'ship horn'],
      fr: ['ambiance portuaire (son original)', 'son original - port.ops', 'corne de bateau'],
    },
  },
  drawbridge: {
    name: { en: 'drawbridge', fr: 'pont-levis' },
    authors: ['@bridge.up', '@river.city', '@boat.passing'],
    tags: ['#bridge #boat #city', '#drawbridge #satisfying', '#fyp #foryou'],
    captions: {
      en: ['bridge up, boat through', 'the cars just wait', 'engineering is cool', 'it splits in the middle'],
      fr: ['pont levé, le bateau passe', 'les voitures attendent', 'l’ingénierie c’est cool', 'il s’ouvre au milieu'],
    },
    sounds: {
      en: ['bridge bells (original sound)', 'original sound - bridge.up', 'river ambience'],
      fr: ['cloches du pont (son original)', 'son original - bridge.up', 'ambiance de rivière'],
    },
  },
  nighthighway: {
    name: { en: 'night highway', fr: 'autoroute de nuit' },
    authors: ['@long.exposure', '@night.drive', '@light.trails'],
    tags: ['#nightdrive #longexposure #aesthetic', '#highway #lights', '#fyp #foryou'],
    captions: {
      en: ['white coming, red going', 'long exposure vibes', 'night drive playlist on', '3am highway'],
      fr: ['blanc qui arrive, rouge qui repart', 'ambiance pose longue', 'playlist de conduite de nuit', 'autoroute à 3h du matin'],
    },
    sounds: {
      en: ['Nightcall (synthwave)', 'original sound - long.exposure', 'outrun mix'],
      fr: ['Nightcall (synthwave)', 'son original - long.exposure', 'mix outrun'],
    },
  },
  coaster: {
    name: { en: 'rollercoaster', fr: 'montagnes russes' },
    authors: ['@coaster.pov', '@loop.de.loop', '@theme.park'],
    tags: ['#rollercoaster #themepark #fun', '#loop #thrill', '#fyp #foryou'],
    captions: {
      en: ['click... click... click... DROP', 'hands up for the loop', 'front row only', 'theme park season'],
      fr: ['clic... clic... clic... DESCENTE', 'les mains en l’air pour le looping', 'premier rang uniquement', 'saison des parcs d’attractions'],
    },
    sounds: {
      en: ['screams (original sound)', 'original sound - coaster.pov', 'theme park music'],
      fr: ['cris (son original)', 'son original - coaster.pov', 'musique de parc d’attractions'],
    },
  },
  demolition: {
    name: { en: 'building demolition', fr: 'démolition' },
    authors: ['@implosion.cam', '@demo.day', '@controlled.collapse'],
    tags: ['#demolition #implosion #satisfying', '#building #explosion', '#fyp #foryou'],
    captions: {
      en: ['3... 2... 1...', 'it folds in on itself', 'controlled chaos', 'the dust cloud!'],
      fr: ['3... 2... 1...', 'il s’effondre sur lui-même', 'un chaos contrôlé', 'le nuage de poussière !'],
    },
    sounds: {
      en: ['boom and rumble (original sound)', 'original sound - implosion.cam', 'slow-mo orchestra'],
      fr: ['boum et grondement (son original)', 'son original - implosion.cam', 'orchestre au ralenti'],
    },
  },
  scramble: {
    name: { en: 'scramble crossing', fr: 'passage piéton en diagonale' },
    authors: ['@scramble.crossing', '@every.way.at.once', '@walk.signal.on'],
    tags: ['#tokyo #citylife #timelapse', '#crossing #crowd', '#fyp #foryou'],
    captions: {
      en: ['the moment every light turns red', 'nobody ever bumps into anyone', 'find the umbrella', 'the busiest crossing in the world'],
      fr: ['le moment où tous les feux passent au rouge', 'personne ne se cogne jamais', 'trouve le parapluie', 'le passage piéton le plus fréquenté du monde'],
    },
    sounds: {
      en: ['crossing chime', 'original sound - scramble.crossing', 'city pop'],
      fr: ['carillon du passage piéton', 'son original - scramble.crossing', 'city pop'],
    },
  },
} satisfies Record<string, Entry>
