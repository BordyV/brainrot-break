import type { Entry } from '../i18n'

// Satisfying & ASMR: names, authors, tags, captions and sounds.

export const SATISFYING = {
  sable: {
    name: { en: 'hourglass', fr: 'sablier' },
    authors: ['@hourglass.zen', '@sand.flow', '@kinetic_sand'],
    tags: ['#sand #satisfying #zen', '#oddlysatisfying #calm', '#asmr #fyp'],
    captions: {
      en: ['time passing, in color', 'it flips itself at the end', 'breathe in... breathe out...', 'every grain counts'],
      fr: ['le temps qui passe, en couleurs', 'il se retourne tout seul à la fin', 'respire... inspire...', 'chaque grain compte'],
    },
    sounds: {
      en: ['soft rain', 'original sound - hourglass.zen', 'lofi piano'],
      fr: ['pluie douce', 'son original - hourglass.zen', 'piano lofi'],
    },
  },
  bulles: {
    name: { en: 'bubbles', fr: 'bulles' },
    authors: ['@aquarium.zen', '@bubbles.asmr', '@deep.blue'],
    tags: ['#aquarium #bubbles #calm', '#asmr #satisfying', '#zen #fyp'],
    captions: {
      en: ['listen to the bubbles', 'my aquarium at 3am', 'the big one is about to pop', 'breathing break'],
      fr: ['écoute les bulles', 'mon aquarium à 3h du mat', 'la grosse bulle va éclater', 'pause respiration'],
    },
    sounds: {
      en: ['blub blub (original sound)', 'underwater ambience', 'aquatic lofi'],
      fr: ['glouglou (son original)', 'ambiance sous-marine', 'lofi aquatique'],
    },
  },
  peinture: {
    name: { en: 'paint mixing', fr: 'peinture' },
    authors: ['@paint.pour', '@fluid.art', '@marbling.asmr'],
    tags: ['#paintpour #fluidart #satisfying', '#asmr #art', '#oddlysatisfying #fyp'],
    captions: {
      en: ['the colors blend on their own', 'paint pouring therapy', 'every swirl is unique', 'which color wins?'],
      fr: ['les couleurs se mélangent toutes seules', 'thérapie par la peinture', 'chaque tourbillon est unique', 'quelle couleur gagne ?'],
    },
    sounds: {
      en: ['paint pour ASMR', 'original sound - paint.pour', 'calm piano'],
      fr: ['ASMR de peinture', 'son original - paint.pour', 'piano calme'],
    },
  },
  dominos: {
    name: { en: 'dominoes', fr: 'dominos' },
    authors: ['@domino.chain', '@topple.world', '@clack.clack'],
    tags: ['#dominoes #satisfying', '#chainreaction #asmr', '#oddlysatisfying #fyp'],
    captions: {
      en: ['wait for the last one', 'and then it rewinds', 'clack clack clack', '3 hours to set up'],
      fr: ['attends le dernier', 'et après ça rembobine', 'clac clac clac', '3 heures pour les installer'],
    },
    sounds: {
      en: ['domino clacks (ASMR)', 'original sound - domino.chain', 'suspense strings'],
      fr: ['clacs de dominos (ASMR)', 'son original - domino.chain', 'cordes de suspense'],
    },
  },
  kinetic: {
    name: { en: 'kinetic sand', fr: 'sable cinétique' },
    authors: ['@kinetic.cuts', '@sand.asmr', '@slice.therapy'],
    tags: ['#kineticsand #asmr #satisfying', '#oddlysatisfying #sand', '#asmrsounds #fyp'],
    captions: {
      en: ['the crunch you can almost hear', 'watch the layers crumble', 'one more slice... ok one more', 'cheaper than therapy'],
      fr: ['le crunch que tu entends presque', 'regarde les couches s’effondrer', 'encore une tranche... ok encore une', 'moins cher qu’un psy'],
    },
    sounds: {
      en: ['sand crunch (ASMR)', 'original sound - kinetic.cuts', 'soft piano for slicing'],
      fr: ['crunch de sable (ASMR)', 'son original - kinetic.cuts', 'piano doux pour découper'],
    },
  },
  soap: {
    name: { en: 'soap cubes', fr: 'cubes de savon' },
    authors: ['@soap.cutter', '@cube.asmr', '@lather.lab'],
    tags: ['#soapcutting #asmr', '#satisfying #soap', '#oddlysatisfying #fyp'],
    captions: {
      en: ['scored, then the cube rain', 'wait for the drop...', 'every cube lands perfectly', 'the sound of soap cubes >>>'],
      fr: ['on trace, puis la pluie de cubes', 'attends la chute...', 'chaque cube tombe pile', 'le bruit des cubes de savon >>>'],
    },
    sounds: {
      en: ['soap cutting (ASMR)', 'original sound - soap.cutter', 'lofi bubbles'],
      fr: ['découpe de savon (ASMR)', 'son original - soap.cutter', 'lofi bulles'],
    },
  },
  slime: {
    name: { en: 'slime stretch', fr: 'slime qui s’étire' },
    authors: ['@slime.shop', '@stretchy.goo', '@glitter.slime'],
    tags: ['#slime #asmr #satisfying', '#slimeasmr #stretch', '#oddlysatisfying #fyp'],
    captions: {
      en: ['how far can it go?', 'the snap at the end...', 'new colour every stretch', 'pov: your brain right now'],
      fr: ['jusqu’où ça va s’étirer ?', 'le claquement à la fin...', 'nouvelle couleur à chaque étirement', 'pov : ton cerveau là maintenant'],
    },
    sounds: {
      en: ['slime crackles (ASMR)', 'original sound - slime.shop', 'squishy beat'],
      fr: ['crépitements de slime (ASMR)', 'son original - slime.shop', 'beat tout mou'],
    },
  },
  pressure: {
    name: { en: 'pressure washing', fr: 'nettoyeur haute pression' },
    authors: ['@pressure.pro', '@clean.patio', '@jetwash.daily'],
    tags: ['#pressurewashing #satisfying', '#cleantok #beforeandafter', '#oddlysatisfying #fyp'],
    captions: {
      en: ['the line between dirty and clean', 'he missed nothing', 'this patio was GREEN', 'wait till it dries...'],
      fr: ['la ligne entre sale et propre', 'il n’a rien raté', 'cette terrasse était VERTE', 'attends que ça sèche...'],
    },
    sounds: {
      en: ['jet wash hiss (ASMR)', 'original sound - pressure.pro', 'clean beats'],
      fr: ['sifflement du jet (ASMR)', 'son original - pressure.pro', 'clean beats'],
    },
  },
  carpet: {
    name: { en: 'carpet cleaning', fr: 'nettoyage de tapis' },
    authors: ['@rug.rescue', '@carpet.asmr', '@deep.clean'],
    tags: ['#carpetcleaning #satisfying', '#rugwash #cleantok', '#oddlysatisfying #fyp'],
    captions: {
      en: ['the colours were there all along', 'one stroke at a time', 'grandma’s rug, saved', 'that first stripe though'],
      fr: ['les couleurs étaient là depuis le début', 'un passage à la fois', 'le tapis de mamie, sauvé', 'cette première bande quand même'],
    },
    sounds: {
      en: ['wet vac (ASMR)', 'original sound - rug.rescue', 'satisfying lofi'],
      fr: ['aspirateur à eau (ASMR)', 'son original - rug.rescue', 'lofi satisfaisant'],
    },
  },
  perfect: {
    name: { en: 'perfect fit', fr: 'pile à la bonne taille' },
    authors: ['@perfect.fit', '@shape.sorter', '@it.fits'],
    tags: ['#perfectfit #satisfying', '#oddlysatisfying #shapes', '#itfits #fyp'],
    captions: {
      en: ['the click when it fits', 'wrong hole... wait for it', 'every shape has a home', 'toddler toy, adult satisfaction'],
      fr: ['le clic quand ça rentre', 'mauvais trou... attends', 'chaque forme a sa place', 'jouet de bébé, plaisir d’adulte'],
    },
    sounds: {
      en: ['click (original sound)', 'original sound - perfect.fit', 'tiny xylophone'],
      fr: ['clic (son original)', 'son original - perfect.fit', 'petit xylophone'],
    },
  },
  laser: {
    name: { en: 'laser rust removal', fr: 'laser anti-rouille' },
    authors: ['@laser.clean', '@rust.gone', '@metal.restore'],
    tags: ['#laserclean #rust #satisfying', '#restoration #asmr', '#oddlysatisfying #fyp'],
    captions: {
      en: ['rust? never heard of her', 'the shine underneath...', 'satisfying level: illegal', 'watch the sparks'],
      fr: ['la rouille ? connais pas', 'la brillance en dessous...', 'niveau satisfaction : illégal', 'regarde les étincelles'],
    },
    sounds: {
      en: ['laser buzz (ASMR)', 'original sound - laser.clean', 'industrial lofi'],
      fr: ['grésillement laser (ASMR)', 'son original - laser.clean', 'lofi industriel'],
    },
  },
  ballsort: {
    name: { en: 'ball sort', fr: 'tri de billes' },
    authors: ['@ball.sort', '@tube.puzzle', '@sorted.asmr'],
    tags: ['#ballsort #puzzle #satisfying', '#mobilegame #brain', '#sorting #fyp'],
    captions: {
      en: ['solved in how many moves?', 'the bot does not miss', 'organised brain = happy brain', 'that last tube...'],
      fr: ['résolu en combien de coups ?', 'le bot ne rate jamais', 'cerveau rangé = cerveau heureux', 'ce dernier tube...'],
    },
    sounds: {
      en: ['glass clinks (ASMR)', 'original sound - ball.sort', 'puzzle music'],
      fr: ['tintements de verre (ASMR)', 'son original - ball.sort', 'musique de puzzle'],
    },
  },
  bucket: {
    name: { en: 'paint bucket', fr: 'pot de peinture' },
    authors: ['@fill.tool', '@colour.in', '@paint.bucket'],
    tags: ['#coloring #satisfying #art', '#paintbucket #digitalart', '#relax #fyp'],
    captions: {
      en: ['click... fill... perfection', 'colouring book for adults', 'guess the picture', 'MS Paint core'],
      fr: ['clic... remplir... perfection', 'coloriage pour adultes', 'devine le dessin', 'ambiance MS Paint'],
    },
    sounds: {
      en: ['pop (original sound)', 'original sound - fill.tool', 'calm marimba'],
      fr: ['pop (son original)', 'son original - fill.tool', 'marimba calme'],
    },
  },
  film: {
    name: { en: 'screen film peel', fr: 'film de protection' },
    authors: ['@unbox.daily', '@peel.asmr', '@new.phone'],
    tags: ['#peel #satisfying #unboxing', '#newphone #asmr', '#oddlysatisfying #fyp'],
    captions: {
      en: ['the peel nobody can resist', 'brand new phone feeling', 'slowly... slowly...', 'best part of unboxing'],
      fr: ['le décollage auquel personne ne résiste', 'la sensation du téléphone neuf', 'doucement... doucement...', 'le meilleur moment du déballage'],
    },
    sounds: {
      en: ['peel (ASMR)', 'original sound - unbox.daily', 'tech unboxing beat'],
      fr: ['décollage (ASMR)', 'son original - unbox.daily', 'beat unboxing'],
    },
  },
  planer: {
    name: { en: 'wood planer', fr: 'rabot' },
    authors: ['@wood.shop', '@hand.plane', '@shavings.asmr'],
    tags: ['#woodworking #asmr', '#handplane #satisfying', '#woodtok #fyp'],
    captions: {
      en: ['the curl that comes out...', 'old grey board, new wood', 'three passes, no shortcuts', 'woodworkers know this feeling'],
      fr: ['le copeau qui sort...', 'vieille planche grise, bois neuf', 'trois passes, pas de raccourci', 'les menuisiers connaissent ce plaisir'],
    },
    sounds: {
      en: ['plane swoosh (ASMR)', 'original sound - wood.shop', 'workshop radio'],
      fr: ['glissé de rabot (ASMR)', 'son original - wood.shop', 'radio d’atelier'],
    },
  },
  bubblewrap: {
    name: { en: 'bubble wrap', fr: 'papier bulle' },
    authors: ['@pop.pop', '@bubble.wrap', '@stress.relief'],
    tags: ['#bubblewrap #asmr #satisfying', '#popping #stressrelief', '#oddlysatisfying #fyp'],
    captions: {
      en: ['don’t pretend you wouldn’t', 'count the pops', 'it speeds up...', 'the whole sheet, no skipping'],
      fr: ['fais pas genre tu le ferais pas', 'compte les pops', 'ça accélère...', 'toute la feuille, sans en sauter'],
    },
    sounds: {
      en: ['pop pop pop (ASMR)', 'original sound - pop.pop', 'popping beat'],
      fr: ['pop pop pop (ASMR)', 'son original - pop.pop', 'beat qui pop'],
    },
  },
  restock: {
    name: { en: 'fridge restock', fr: 'frigo rempli' },
    authors: ['@restock.queen', '@fridge.goals', '@organised.home'],
    tags: ['#restock #asmr #organization', '#fridgegoals #satisfying', '#cleantok #fyp'],
    captions: {
      en: ['restock with me', 'colour sorted, obviously', 'the fridge of my dreams', 'wait for the door...'],
      fr: ['restock avec moi', 'trié par couleur, évidemment', 'le frigo de mes rêves', 'attends la porte...'],
    },
    sounds: {
      en: ['cans clinking (ASMR)', 'original sound - restock.queen', 'aesthetic morning'],
      fr: ['canettes qui tintent (ASMR)', 'son original - restock.queen', 'matin aesthetic'],
    },
  },
  lawn: {
    name: { en: 'lawn stripes', fr: 'pelouse rayée' },
    authors: ['@lawn.stripes', '@mow.therapy', '@grass.asmr'],
    tags: ['#lawncare #satisfying', '#mowing #stripes', '#oddlysatisfying #fyp'],
    captions: {
      en: ['those stripes though', 'from jungle to golf course', 'he mows in straight lines only', 'sunday morning therapy'],
      fr: ['ces rayures quand même', 'de la jungle au golf', 'il tond en ligne droite et c’est tout', 'thérapie du dimanche matin'],
    },
    sounds: {
      en: ['mower hum (ASMR)', 'original sound - lawn.stripes', 'summer lofi'],
      fr: ['ronron de tondeuse (ASMR)', 'son original - lawn.stripes', 'lofi d’été'],
    },
  },
  plough: {
    name: { en: 'snow plough', fr: 'chasse-neige' },
    authors: ['@plow.cam', '@snow.day', '@winter.roads'],
    tags: ['#snowplow #winter #satisfying', '#snow #roads', '#oddlysatisfying #fyp'],
    captions: {
      en: ['the road was under there', 'both lanes, then it snows again', 'night shift hero', 'cosy just watching this'],
      fr: ['la route était là-dessous', 'les deux voies, puis il reneige', 'héros de l’équipe de nuit', 'cosy rien qu’à regarder'],
    },
    sounds: {
      en: ['plough scrape (ASMR)', 'original sound - plow.cam', 'winter lofi'],
      fr: ['raclement du chasse-neige (ASMR)', 'son original - plow.cam', 'lofi d’hiver'],
    },
  },
  squeegee: {
    name: { en: 'window squeegee', fr: 'raclette à vitres' },
    authors: ['@window.pro', '@squeegee.king', '@clear.view'],
    tags: ['#windowcleaning #satisfying', '#squeegee #cleantok', '#oddlysatisfying #fyp'],
    captions: {
      en: ['not a single streak', 'the view comes back', 'day shift, night shift', 'he’s done this 10000 times'],
      fr: ['pas une seule trace', 'la vue revient', 'service de jour, service de nuit', 'il l’a fait 10000 fois'],
    },
    sounds: {
      en: ['squeegee squeak (ASMR)', 'original sound - window.pro', 'city lofi'],
      fr: ['grincement de raclette (ASMR)', 'son original - window.pro', 'lofi urbain'],
    },
  },
  tiling: {
    name: { en: 'floor tiling', fr: 'pose de carrelage' },
    authors: ['@tile.setter', '@floor.goals', '@reno.daily'],
    tags: ['#tiling #renovation #satisfying', '#diy #floor', '#oddlysatisfying #fyp'],
    captions: {
      en: ['which pattern is your favourite?', 'perfectly level, every one', 'renovation satisfaction', 'the last tile...'],
      fr: ['quel motif tu préfères ?', 'parfaitement de niveau, tous', 'la satisfaction des travaux', 'le dernier carreau...'],
    },
    sounds: {
      en: ['tile tap (ASMR)', 'original sound - tile.setter', 'renovation playlist'],
      fr: ['tapotement de carreau (ASMR)', 'son original - tile.setter', 'playlist travaux'],
    },
  },
  zen: {
    name: { en: 'zen garden', fr: 'jardin zen' },
    authors: ['@zen.garden', '@karesansui', '@calm.lines'],
    tags: ['#zengarden #calm #satisfying', '#meditation #asmr', '#relax #fyp'],
    captions: {
      en: ['breathe with the rake', 'the circles around the stones...', 'your sign to slow down', 'smooth it, start again'],
      fr: ['respire avec le râteau', 'les cercles autour des pierres...', 'ton signe pour ralentir', 'on lisse, on recommence'],
    },
    sounds: {
      en: ['sand raking (ASMR)', 'original sound - zen.garden', 'bamboo flute'],
      fr: ['râteau dans le sable (ASMR)', 'son original - zen.garden', 'flûte en bambou'],
    },
  },
  laundry: {
    name: { en: 'folding laundry', fr: 'plier le linge' },
    authors: ['@fold.it.right', '@laundry.day', '@konmari.mode'],
    tags: ['#laundry #folding #satisfying', '#cleantok #organizing', '#fyp #foryou'],
    captions: {
      en: ['left, right, up. perfect.', 'the stack grows, the stress goes', 'if only my laundry did this itself', 'watch the sleeves tuck in'],
      fr: ['gauche, droite, en haut. parfait.', 'la pile grandit, le stress s’en va', 'si seulement mon linge faisait ça tout seul', 'regarde les manches qui se rentrent'],
    },
    sounds: {
      en: ['fabric swishes (ASMR)', 'original sound - fold.it.right', 'sunday cleaning playlist'],
      fr: ['froissements de tissu (ASMR)', 'son original - fold.it.right', 'playlist de ménage du dimanche'],
    },
  },
  dishwasher: {
    name: { en: 'dishwasher Tetris', fr: 'Tetris du lave-vaisselle' },
    authors: ['@load.it.properly', '@plates.at.the.back', '@rinse.cycle'],
    tags: ['#dishwasher #satisfying #cleantok', '#organizing #tetris', '#fyp #foryou'],
    captions: {
      en: ['plates at the back, cups on top. no debate.', 'every slot used', 'the sparkle when it opens', 'my partner loads it differently and it hurts'],
      fr: ['les assiettes au fond, les tasses en haut. pas de débat.', 'chaque place utilisée', 'les étincelles quand ça s’ouvre', 'mon coloc le remplit autrement et ça me fait mal'],
    },
    sounds: {
      en: ['clinks and a hum', 'original sound - load.it.properly', 'kitchen radio'],
      fr: ['tintements et ronron', 'son original - load.it.properly', 'radio de cuisine'],
    },
  },
} satisfies Record<string, Entry>
