import type { Entry } from '../i18n'

// Science experiments: names, authors, tags, captions and sounds.

export const SCIENCE = {
  toothpaste: {
    name: { en: 'elephant toothpaste', fr: 'dentifrice d’éléphant' },
    authors: ['@foam.lab', '@mad.chemist', '@science.fair'],
    tags: ['#science #chemistry #experiment', '#elephanttoothpaste #satisfying', '#stem #fyp'],
    captions: {
      en: ['add the catalyst and...', 'the foam keeps coming', 'chemistry class but fun', 'do not try this without goggles'],
      fr: ['on ajoute le catalyseur et...', 'la mousse n’arrête pas de sortir', 'le cours de chimie mais fun', 'ne pas essayer sans lunettes'],
    },
    sounds: {
      en: ['foam whoosh (original sound)', 'original sound - foam.lab', 'mad scientist music'],
      fr: ['whoosh de mousse (son original)', 'son original - foam.lab', 'musique de savant fou'],
    },
  },
  mentos: {
    name: { en: 'Mentos and cola', fr: 'Mentos et cola' },
    authors: ['@geyser.test', '@cola.blast', '@backyard.science'],
    tags: ['#mentos #cola #experiment', '#science #geyser', '#fyp #foryou'],
    captions: {
      en: ['drop them in and RUN', 'how high will it go?', 'the classic', 'science, but sticky'],
      fr: ['on les lâche et on COURT', 'jusqu’où ça va monter ?', 'le grand classique', 'la science, mais collante'],
    },
    sounds: {
      en: ['fizz blast (original sound)', 'original sound - geyser.test', 'countdown'],
      fr: ['explosion de bulles (son original)', 'son original - geyser.test', 'compte à rebours'],
    },
  },
  cradle: {
    name: { en: 'Newton’s cradle', fr: 'pendule de Newton' },
    authors: ['@click.clack', '@desk.physics', '@momentum'],
    tags: ['#newtonscradle #physics #satisfying', '#desktoy #asmr', '#science #fyp'],
    captions: {
      en: ['click... clack... click...', 'momentum goes straight through', 'every office had one', 'two in, two out'],
      fr: ['clic... clac... clic...', 'l’élan traverse tout droit', 'tous les bureaux en avaient un', 'deux entrent, deux sortent'],
    },
    sounds: {
      en: ['click clack (ASMR)', 'original sound - click.clack', 'focus ambience'],
      fr: ['clic clac (ASMR)', 'son original - click.clack', 'ambiance de concentration'],
    },
  },
  tesla: {
    name: { en: 'Tesla coil', fr: 'bobine Tesla' },
    authors: ['@tesla.arcs', '@high.voltage', '@lightning.lab'],
    tags: ['#teslacoil #electricity #science', '#lightning #physics', '#fyp #foryou'],
    captions: {
      en: ['indoor lightning', 'do not touch', 'the arcs reach for everything', 'it can play music too'],
      fr: ['des éclairs à l’intérieur', 'ne pas toucher', 'les arcs attrapent tout', 'elle peut même jouer de la musique'],
    },
    sounds: {
      en: ['crackling arcs (original sound)', 'original sound - tesla.arcs', 'singing Tesla coil'],
      fr: ['arcs qui crépitent (son original)', 'son original - tesla.arcs', 'bobine Tesla qui chante'],
    },
  },
  mousetrap: {
    name: { en: 'mousetrap chain reaction', fr: 'réaction en chaîne de tapettes' },
    authors: ['@trap.reaction', '@one.ball', '@trap.room'],
    tags: ['#chainreaction #physics #satisfying', '#mousetrap #slowmo', '#fyp #foryou'],
    captions: {
      en: ['one ball starts it all', 'nuclear fission, explained', 'count the traps', 'pure chaos'],
      fr: ['une seule balle lance tout', 'la fission nucléaire, expliquée', 'compte les tapettes', 'du chaos pur'],
    },
    sounds: {
      en: ['snap snap snap (original sound)', 'original sound - trap.reaction', 'popcorn music'],
      fr: ['clac clac clac (son original)', 'son original - chain.reaction', 'musique popcorn'],
    },
  },
  sodavolcano: {
    name: { en: 'baking soda volcano', fr: 'volcan au bicarbonate' },
    authors: ['@fair.volcano', '@fizzy.volcano', '@kitchen.lab'],
    tags: ['#sciencefair #volcano #experiment', '#kids #chemistry', '#fyp #foryou'],
    captions: {
      en: ['every science fair ever', 'vinegar in, lava out', 'grade 4 core memory', 'it never gets old'],
      fr: ['toutes les fêtes de la science', 'du vinaigre dedans, de la lave dehors', 'souvenir de CM1', 'on ne s’en lasse jamais'],
    },
    sounds: {
      en: ['fizzing (ASMR)', 'original sound - fair.volcano', 'kids show theme'],
      fr: ['ça pétille (ASMR)', 'son original - science.fair', 'générique d’émission jeunesse'],
    },
  },
  crystals: {
    name: { en: 'crystal growth', fr: 'croissance de cristaux' },
    authors: ['@crystal.lapse', '@grow.crystals', '@geode.lab'],
    tags: ['#crystals #timelapse #science', '#chemistry #satisfying', '#fyp #foryou'],
    captions: {
      en: ['a week of growing in seconds', 'they build on each other', 'which colour is your favourite?', 'nature’s 3D printer'],
      fr: ['une semaine de croissance en quelques secondes', 'ils se construisent les uns sur les autres', 'quelle couleur tu préfères ?', 'l’imprimante 3D de la nature'],
    },
    sounds: {
      en: ['crystal chimes (original sound)', 'original sound - crystal.lapse', 'ambient bells'],
      fr: ['carillons de cristal (son original)', 'son original - crystal.lapse', 'cloches ambient'],
    },
  },
  balloonpop: {
    name: { en: 'water balloon slow-mo', fr: 'ballon d’eau au ralenti' },
    authors: ['@slow.mo.lab', '@1000fps', '@pop.science'],
    tags: ['#slowmotion #waterballoon #science', '#satisfying #physics', '#fyp #foryou'],
    captions: {
      en: ['the water keeps its shape for a moment', '1000 frames per second', 'the rubber peels away...', 'physics is weird'],
      fr: ['l’eau garde sa forme un instant', '1000 images par seconde', 'le caoutchouc se retire...', 'la physique, c’est bizarre'],
    },
    sounds: {
      en: ['slow-mo pop (original sound)', 'original sound - slow.mo.lab', 'dramatic choir'],
      fr: ['pop au ralenti (son original)', 'son original - slow.mo.lab', 'chœur dramatique'],
    },
  },
  chladni: {
    name: { en: 'Chladni plate', fr: 'plaque de Chladni' },
    authors: ['@sound.patterns', '@cymatics', '@sand.sings'],
    tags: ['#cymatics #chladni #physics', '#sound #satisfying', '#science #fyp'],
    captions: {
      en: ['sound you can see', 'the sand finds the quiet lines', 'new frequency, new pattern', 'turn it up (you can’t)'],
      fr: ['du son qu’on peut voir', 'le sable trouve les lignes calmes', 'nouvelle fréquence, nouveau motif', 'monte le son (tu peux pas)'],
    },
    sounds: {
      en: ['sine tone sweep (original sound)', 'original sound - sound.patterns', 'frequency hum'],
      fr: ['balayage de fréquence (son original)', 'son original - sound.patterns', 'bourdonnement de fréquence'],
    },
  },
  gasbox: {
    name: { en: 'gas in a box', fr: 'gaz dans une boîte' },
    authors: ['@thermo.dynamics', '@kinetic.gas', '@heat.it'],
    tags: ['#physics #thermodynamics #science', '#gas #simulation', '#fyp #foryou'],
    captions: {
      en: ['heat it up, watch the piston', 'hot = fast', 'pressure, visualised', 'physics class finally made sense'],
      fr: ['on chauffe, regarde le piston', 'chaud = rapide', 'la pression, en images', 'enfin compris le cours de physique'],
    },
    sounds: {
      en: ['bunsen burner (original sound)', 'original sound - thermo.dynamics', 'lab ambience'],
      fr: ['bec Bunsen (son original)', 'son original - thermo.dynamics', 'ambiance de labo'],
    },
  },
  waterrocket: {
    name: { en: 'water rocket', fr: 'fusée à eau' },
    authors: ['@bottle.rocket', '@pump.it', '@backyard.launch'],
    tags: ['#waterrocket #science #diy', '#launch #summer', '#fyp #foryou'],
    captions: {
      en: ['pump... pump... pump... LAUNCH', 'the parachute worked!', 'summer science', 'one bottle, one pump'],
      fr: ['pompe... pompe... pompe... DÉCOLLAGE', 'le parachute a marché !', 'science d’été', 'une bouteille, une pompe'],
    },
    sounds: {
      en: ['whoosh (original sound)', 'original sound - bottle.rocket', 'space launch music'],
      fr: ['whoosh (son original)', 'son original - bottle.rocket', 'musique de lancement spatial'],
    },
  },
  eggdrop: {
    name: { en: 'egg drop', fr: 'chute d’œuf' },
    authors: ['@egg.drop', '@save.the.egg', '@stem.class'],
    tags: ['#eggdrop #challenge #science', '#engineering #stem', '#fyp #foryou'],
    captions: {
      en: ['parachute, box or balloons?', 'did it survive?', 'RIP egg', 'engineering class memories'],
      fr: ['parachute, boîte ou ballons ?', 'il a survécu ?', 'RIP l’œuf', 'souvenirs du cours de techno'],
    },
    sounds: {
      en: ['splat (original sound)', 'original sound - egg.drop', 'suspense build'],
      fr: ['splatch (son original)', 'son original - egg.drop', 'montée de suspense'],
    },
  },
  coiltrain: {
    name: { en: 'coil train', fr: 'train électromagnétique' },
    authors: ['@coil.train', '@magnet.magic', '@simplest.train'],
    tags: ['#physics #magnets #experiment', '#electromagnetism #satisfying', '#science #fyp'],
    captions: {
      en: ['a battery, two magnets, a coil', 'it pushes itself along', 'the simplest train in the world', 'physics or magic?'],
      fr: ['une pile, deux aimants, une bobine', 'il se pousse tout seul', 'le train le plus simple du monde', 'physique ou magie ?'],
    },
    sounds: {
      en: ['buzzing coil (original sound)', 'original sound - coil.train', 'curious music'],
      fr: ['bobine qui bourdonne (son original)', 'son original - coil.train', 'musique curieuse'],
    },
  },
  antfarm: {
    name: { en: 'ant farm', fr: 'fourmilière' },
    authors: ['@ant.farm', '@tunnel.diggers', '@tiny.engineers'],
    tags: ['#antfarm #ants #nature', '#tunnels #timelapse', '#fyp #foryou'],
    captions: {
      en: ['they dig and carry the sand up', 'the heap grows on top', 'tiny engineers', 'days of digging in seconds'],
      fr: ['elles creusent et remontent le sable', 'le tas grandit en haut', 'de minuscules ingénieures', 'des jours de creusement en quelques secondes'],
    },
    sounds: {
      en: ['digging (ASMR)', 'original sound - ant.farm', 'documentary strings'],
      fr: ['ça creuse (ASMR)', 'son original - ant.farm', 'cordes de documentaire'],
    },
  },
} satisfies Record<string, Entry>
