import type { Entry } from '../i18n'

// Generative art & maths: names, authors, tags, captions and sounds.

export const GENERATIVE = {
  life: {
    name: { en: 'Game of Life', fr: 'jeu de la vie' },
    authors: ['@conway.life', '@cell.rules', '@glider.gun'],
    tags: ['#gameoflife #math #simulation', '#cellularautomata #coding', '#generativeart #fyp'],
    captions: {
      en: ['four rules, infinite chaos', 'spot the glider', 'life finds a way (then stops)', 'math that looks alive'],
      fr: ['quatre règles, un chaos infini', 'trouve le planeur', 'la vie trouve un chemin (puis s’arrête)', 'des maths qui ont l’air vivantes'],
    },
    sounds: {
      en: ['ambient synth (original sound)', 'original sound - conway.life', 'Philip Glass vibes'],
      fr: ['synthé ambient (son original)', 'son original - conway.life', 'ambiance Philip Glass'],
    },
  },
  langton: {
    name: { en: 'Langton’s ant', fr: 'fourmi de Langton' },
    authors: ['@langton.ant', '@turmite', '@emergent.order'],
    tags: ['#langtonsant #math #emergence', '#chaos #coding', '#generativeart #fyp'],
    captions: {
      en: ['one ant, two rules', 'chaos... then suddenly a highway', 'nobody knows why it does that', 'new rule, new pattern'],
      fr: ['une fourmi, deux règles', 'le chaos... puis d’un coup une autoroute', 'personne ne sait pourquoi elle fait ça', 'nouvelle règle, nouveau motif'],
    },
    sounds: {
      en: ['ticking (original sound)', 'original sound - langton.ant', 'minimal electronica'],
      fr: ['tic tac (son original)', 'son original - langton.ant', 'électronique minimale'],
    },
  },
  boids: {
    name: { en: 'boids', fr: 'nuée d’oiseaux' },
    authors: ['@murmuration', '@flock.sim', '@starling.code'],
    tags: ['#murmuration #birds #nature', '#boids #simulation', '#satisfying #fyp'],
    captions: {
      en: ['three rules make a flock', 'watch them dodge the hawk', 'no leader, just neighbours', 'sunset murmuration'],
      fr: ['trois règles font une nuée', 'regarde-les esquiver le faucon', 'pas de chef, juste des voisins', 'nuée au coucher du soleil'],
    },
    sounds: {
      en: ['wings (original sound)', 'original sound - murmuration', 'cinematic strings'],
      fr: ['ailes (son original)', 'son original - murmuration', 'cordes cinématiques'],
    },
  },
  spirograph: {
    name: { en: 'spirograph', fr: 'spirographe' },
    authors: ['@spiro.graph', '@gear.art', '@pen.loops'],
    tags: ['#spirograph #art #satisfying', '#geometry #drawing', '#nostalgia #fyp'],
    captions: {
      en: ['the toy we all had', 'wait for the loop to close', 'gears + pen = art', 'every one is different'],
      fr: ['le jouet qu’on avait tous', 'attends que la boucle se referme', 'engrenages + stylo = art', 'chacun est différent'],
    },
    sounds: {
      en: ['pen scratch (ASMR)', 'original sound - spiro.graph', 'music box'],
      fr: ['stylo qui gratte (ASMR)', 'son original - spiro.graph', 'boîte à musique'],
    },
  },
  fractaltree: {
    name: { en: 'fractal tree', fr: 'arbre fractal' },
    authors: ['@fractal.tree', '@branch.code', '@recursive.nature'],
    tags: ['#fractal #tree #generativeart', '#recursion #nature', '#satisfying #fyp'],
    captions: {
      en: ['a tree that draws itself', 'branch, split, repeat', 'then the leaves fall', 'recursion is beautiful'],
      fr: ['un arbre qui se dessine tout seul', 'branche, divise, recommence', 'puis les feuilles tombent', 'la récursion c’est beau'],
    },
    sounds: {
      en: ['wind in leaves (original sound)', 'original sound - fractal.tree', 'acoustic guitar'],
      fr: ['vent dans les feuilles (son original)', 'son original - fractal.tree', 'guitare acoustique'],
    },
  },
  mazesolve: {
    name: { en: 'maze solver', fr: 'labyrinthe résolu' },
    authors: ['@maze.gen', '@path.finder', '@backtracker'],
    tags: ['#maze #algorithm #coding', '#satisfying #pathfinding', '#programming #fyp'],
    captions: {
      en: ['carved, flooded, solved', 'the rainbow is the distance', 'the path at the end >>>', 'algorithms are art'],
      fr: ['creusé, inondé, résolu', 'l’arc-en-ciel, c’est la distance', 'le chemin à la fin >>>', 'les algorithmes sont de l’art'],
    },
    sounds: {
      en: ['digging (original sound)', 'original sound - maze.gen', 'focus music'],
      fr: ['ça creuse (son original)', 'son original - maze.gen', 'musique de concentration'],
    },
  },
  astar: {
    name: { en: 'A* pathfinding', fr: 'recherche A*' },
    authors: ['@a.star', '@shortest.path', '@game.ai'],
    tags: ['#pathfinding #algorithm #gamedev', '#astar #coding', '#programming #fyp'],
    captions: {
      en: ['how game characters find their way', 'green = to check, blue = checked', 'it always finds the shortest', 'CS class, visualised'],
      fr: ['comment les persos de jeux trouvent leur chemin', 'vert = à voir, bleu = vu', 'il trouve toujours le plus court', 'le cours d’info, en images'],
    },
    sounds: {
      en: ['search beeps (original sound)', 'original sound - a.star', 'synthwave study'],
      fr: ['bips de recherche (son original)', 'son original - a.star', 'synthwave pour réviser'],
    },
  },
  voronoi: {
    name: { en: 'Voronoi growth', fr: 'croissance de Voronoï' },
    authors: ['@voronoi.cells', '@seed.grow', '@geometry.art'],
    tags: ['#voronoi #generativeart #math', '#geometry #satisfying', '#art #fyp'],
    captions: {
      en: ['every seed claims its space', 'like cells under a microscope', 'the borders are the best part', 'giraffe pattern, explained'],
      fr: ['chaque graine prend sa place', 'comme des cellules au microscope', 'les frontières, c’est le meilleur', 'le motif de la girafe, expliqué'],
    },
    sounds: {
      en: ['soft bloom (original sound)', 'original sound - voronoi.cells', 'ambient piano'],
      fr: ['floraison douce (son original)', 'son original - voronoi.cells', 'piano ambient'],
    },
  },
  dragon: {
    name: { en: 'dragon curve', fr: 'courbe du dragon' },
    authors: ['@dragon.curve', '@paper.fold', '@fractal.daily'],
    tags: ['#dragoncurve #fractal #math', '#folding #satisfying', '#generativeart #fyp'],
    captions: {
      en: ['fold a strip of paper in half, again and again', 'watch the dragon appear', 'each fold doubles it', 'math, but make it a dragon'],
      fr: ['plie une bande de papier en deux, encore et encore', 'regarde le dragon apparaître', 'chaque pli double la longueur', 'des maths, mais version dragon'],
    },
    sounds: {
      en: ['paper fold (ASMR)', 'original sound - dragon.curve', 'epic ambience'],
      fr: ['papier plié (ASMR)', 'son original - dragon.curve', 'ambiance épique'],
    },
  },
  hilbert: {
    name: { en: 'Hilbert curve', fr: 'courbe de Hilbert' },
    authors: ['@hilbert.curve', '@space.filling', '@one.line'],
    tags: ['#hilbertcurve #fractal #math', '#onelinedrawing #satisfying', '#generativeart #fyp'],
    captions: {
      en: ['one line fills the whole square', 'each level, more detail', 'never crosses itself', 'math that tiles'],
      fr: ['une seule ligne remplit tout le carré', 'à chaque niveau, plus de détails', 'elle ne se croise jamais', 'des maths qui pavent'],
    },
    sounds: {
      en: ['pen drawing (ASMR)', 'original sound - hilbert.curve', 'glitch lofi'],
      fr: ['stylo qui dessine (ASMR)', 'son original - hilbert.curve', 'lofi glitch'],
    },
  },
  cube: {
    name: { en: 'spinning cube', fr: 'cube qui tourne' },
    authors: ['@wire.frame', '@demo.scene', '@3d.basics'],
    tags: ['#3d #wireframe #retro', '#demoscene #coding', '#vaporwave #fyp'],
    captions: {
      en: ['3D in 32 pixels', 'cube, then octahedron, then...', 'your first 3D program', 'vaporwave but math'],
      fr: ['de la 3D en 32 pixels', 'cube, puis octaèdre, puis...', 'ton premier programme 3D', 'vaporwave mais en maths'],
    },
    sounds: {
      en: ['synth arp (original sound)', 'original sound - wire.frame', 'vaporwave mix'],
      fr: ['arpège de synthé (son original)', 'son original - wire.frame', 'mix vaporwave'],
    },
  },
  donut: {
    name: { en: 'spinning donut', fr: 'donut qui tourne' },
    authors: ['@donut.c', '@spin.donut', '@sprinkle.math'],
    tags: ['#donut #coding #3d', '#programming #math', '#satisfying #fyp'],
    captions: {
      en: ['the famous spinning donut, now with icing', 'every programmer knows this one', 'rendered with trigonometry', 'hungry yet?'],
      fr: ['le fameux donut qui tourne, avec glaçage', 'tous les développeurs connaissent celui-là', 'rendu à la trigonométrie', 't’as faim ?'],
    },
    sounds: {
      en: ['keyboard clicks (ASMR)', 'original sound - donut.c', 'coding lofi'],
      fr: ['clics de clavier (ASMR)', 'son original - donut.c', 'lofi pour coder'],
    },
  },
  wfc: {
    name: { en: 'wave function collapse', fr: 'effondrement de fonction d’onde' },
    authors: ['@wave.collapse', '@tile.gen', '@proc.town'],
    tags: ['#wavefunctioncollapse #procedural #gamedev', '#generativeart #tiles', '#coding #fyp'],
    captions: {
      en: ['a town builds itself, tile by tile', 'roads always connect', 'procedural generation, explained', 'every town is new'],
      fr: ['une ville se construit toute seule, tuile par tuile', 'les routes se raccordent toujours', 'la génération procédurale, expliquée', 'chaque ville est nouvelle'],
    },
    sounds: {
      en: ['tile clicks (original sound)', 'original sound - wave.collapse', 'city builder music'],
      fr: ['clics de tuiles (son original)', 'son original - wave.collapse', 'musique de city builder'],
    },
  },
  pythagoras: {
    name: { en: 'water Pythagoras', fr: 'Pythagore à l’eau' },
    authors: ['@a.squared.plus.b', '@proof.by.water', '@hypotenuse.tank'],
    tags: ['#pythagoras #maths #satisfying', '#geometry #proof', '#fyp #foryou'],
    captions: {
      en: ['the two small squares fill the big one. exactly.', 'a² + b² = c², with water', 'the proof you can watch', 'my maths teacher never showed us this'],
      fr: ['les deux petits carrés remplissent le grand. exactement.', 'a² + b² = c², avec de l’eau', 'la démonstration qu’on peut regarder', 'mon prof de maths ne nous a jamais montré ça'],
    },
    sounds: {
      en: ['water sloshing', 'original sound - a.squared.plus.b', 'classroom piano'],
      fr: ['clapotis d’eau', 'son original - a.squared.plus.b', 'piano de salle de classe'],
    },
  },
  pendulumwave: {
    name: { en: 'pendulum wave', fr: 'onde de pendules' },
    authors: ['@fifteen.pendulums', '@in.and.out.of.sync', '@physics.dance'],
    tags: ['#pendulumwave #physics #satisfying', '#science #hypnotic', '#fyp #foryou'],
    captions: {
      en: ['fifteen pendulums, each a little slower', 'snakes, then chaos, then back in line', 'wait for them to line up again', 'physics doing choreography'],
      fr: ['quinze pendules, chacun un peu plus lent', 'des serpents, puis le chaos, puis de nouveau alignés', 'attends qu’ils se réalignent', 'la physique qui fait de la chorégraphie'],
    },
    sounds: {
      en: ['soft clicks in rhythm', 'original sound - fifteen.pendulums', 'minimal piano loop'],
      fr: ['petits clics en rythme', 'son original - fifteen.pendulums', 'boucle de piano minimaliste'],
    },
  },
  salesman: {
    name: { en: 'travelling salesman', fr: 'voyageur de commerce' },
    authors: ['@two.opt.untangle', '@shortest.route', '@np.hard.and.chill'],
    tags: ['#algorithm #travellingsalesman #satisfying', '#computerscience #optimization', '#fyp #foryou'],
    captions: {
      en: ['every crossing it undoes makes the trip shorter', 'the number is the total distance', 'green means no more crossings', 'my delivery driver’s route, probably'],
      fr: ['chaque croisement défait raccourcit le trajet', 'le nombre, c’est la distance totale', 'vert veut dire plus aucun croisement', 'le trajet de mon livreur, sûrement'],
    },
    sounds: {
      en: ['map pins clicking', 'original sound - two.opt.untangle', 'road trip lo-fi'],
      fr: ['clics de punaises sur la carte', 'son original - two.opt.untangle', 'lo-fi de road trip'],
    },
  },
} satisfies Record<string, Entry>
