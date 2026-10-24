import type { Entry } from '../i18n'

// Ball & marble physics: names, authors, tags, captions and sounds.

export const PHYSICS = {
  billes: {
    name: { en: 'marbles', fr: 'billes' },
    authors: ['@galton.board', '@marbles.asmr', '@plinko_queen'],
    tags: ['#marbles #satisfying #math', '#asmr #oddlysatisfying', '#plinko #fyp'],
    captions: {
      en: ['the bell curve builds itself', 'watch where the pink marble lands', 'math, but satisfying', 'can\'t look away'],
      fr: ['la courbe en cloche se forme toute seule', 'regarde où finit la bille rose', 'les maths mais satisfaisantes', 'impossible de décrocher'],
    },
    sounds: {
      en: ['marble clicks (ASMR)', 'original sound - galton.board', 'lofi beats to wait for Claude to'],
      fr: ['clics de billes (ASMR)', 'son original - galton.board', 'lofi beats to wait for Claude to'],
    },
  },
  pendule: {
    name: { en: 'double pendulum', fr: 'pendule double' },
    authors: ['@chaos.theory', '@double.pendulum', '@physics.art'],
    tags: ['#physics #chaos #satisfying', '#science #art', '#math #fyp'],
    captions: {
      en: ['never the same path twice', 'chaos theory, live', 'physics is art', 'try to guess where it goes'],
      fr: ['jamais deux fois le même trajet', 'la théorie du chaos en direct', 'la physique c’est de l’art', 'devine où il va'],
    },
    sounds: {
      en: ['ambient physics', 'original sound - chaos.theory', 'interstellar organ'],
      fr: ['ambient physique', 'son original - chaos.theory', 'orgue interstellaire'],
    },
  },
  grow: {
    name: { en: 'growing ball', fr: 'balle qui grossit' },
    authors: ['@bounce.sim', '@ball.grows', '@physics.loop'],
    tags: ['#physics #satisfying #simulation', '#bouncingball #fyp', '#oddlysatisfying #foryou'],
    captions: {
      en: ['it grows on every bounce', 'wait for the last bounce...', 'how many bounces to fill it?', 'the ending is so satisfying'],
      fr: ['elle grossit à chaque rebond', 'attends le dernier rebond...', 'combien de rebonds pour remplir ?', 'la fin est trop satisfaisante'],
    },
    sounds: {
      en: ['boing boing (sped up)', 'original sound - bounce.sim', 'piano notes on every hit'],
      fr: ['boing boing (sped up)', 'son original - bounce.sim', 'une note de piano par rebond'],
    },
  },
  rings: {
    name: { en: 'escape the rings', fr: 'échappe aux anneaux' },
    authors: ['@ring.escape', '@gap.finder', '@circle.sim'],
    tags: ['#rings #escape #physics', '#satisfying #simulation', '#fyp #waitforit'],
    captions: {
      en: ['will it find every gap?', 'ring 1... ring 2... ring 3...', 'the last ring is the hardest', 'freedom at the end'],
      fr: ['va-t-elle trouver chaque trou ?', 'anneau 1... anneau 2... anneau 3...', 'le dernier anneau est le pire', 'la liberté à la fin'],
    },
    sounds: {
      en: ['glass shatter (original sound)', 'original sound - ring.escape', 'escape room theme 8-bit'],
      fr: ['verre brisé (son original)', 'son original - ring.escape', 'thème escape game 8 bits'],
    },
  },
  marblerace: {
    name: { en: 'marble race', fr: 'course de billes' },
    authors: ['@marble.league', '@race.marbles', '@pick.a.colour'],
    tags: ['#marblerace #race #fyp', '#marbles #satisfying', '#pickacolor #foryou'],
    captions: {
      en: ['pick a colour before it starts', 'last place is out every lap', 'comment your colour', 'the comeback was crazy'],
      fr: ['choisis ta couleur avant le départ', 'le dernier est éliminé à chaque tour', 'mets ta couleur en commentaire', 'la remontée était folle'],
    },
    sounds: {
      en: ['race commentary (original sound)', 'original sound - marble.league', 'olympic fanfare 8-bit'],
      fr: ['commentaire de course (son original)', 'son original - marble.league', 'fanfare olympique 8 bits'],
    },
  },
  split: {
    name: { en: 'ball splits', fr: 'balle qui se divise' },
    authors: ['@split.sim', '@exponential', '@ball.chaos'],
    tags: ['#physics #chaos #simulation', '#satisfying #bouncingball', '#fyp #foryou'],
    captions: {
      en: ['one ball... then chaos', 'every bounce makes another', 'how many before it breaks?', 'exponential growth, visualised'],
      fr: ['une balle... puis le chaos', 'chaque rebond en crée une autre', 'combien avant que ça casse ?', 'la croissance exponentielle en vrai'],
    },
    sounds: {
      en: ['chaos (original sound)', 'original sound - split.sim', 'pop pop pop remix'],
      fr: ['chaos (son original)', 'son original - split.sim', 'pop pop pop remix'],
    },
  },
  stringart: {
    name: { en: 'string art bounce', fr: 'rebonds en fils' },
    authors: ['@string.art', '@bounce.lines', '@geometry.daily'],
    tags: ['#stringart #physics #art', '#satisfying #geometry', '#fyp #foryou'],
    captions: {
      en: ['every bounce adds a string', 'it draws by itself', 'wait for the pattern', 'math is art'],
      fr: ['chaque rebond ajoute un fil', 'ça se dessine tout seul', 'attends le motif', 'les maths c’est de l’art'],
    },
    sounds: {
      en: ['harp plucks (original sound)', 'original sound - string.art', 'ambient strings'],
      fr: ['harpe pincée (son original)', 'son original - string.art', 'cordes ambient'],
    },
  },
  whichwins: {
    name: { en: 'which colour wins', fr: 'quelle couleur gagne' },
    authors: ['@colour.wars', '@paint.battle', '@pick.a.side'],
    tags: ['#whichcolorwins #battle #fyp', '#satisfying #paint', '#pickacolor #foryou'],
    captions: {
      en: ['which colour wins? comment now', 'every ball paints its path', 'the last seconds change everything', 'I was so sure about blue'],
      fr: ['quelle couleur gagne ? commente', 'chaque balle peint son chemin', 'les dernières secondes changent tout', 'j’étais sûr du bleu'],
    },
    sounds: {
      en: ['countdown (original sound)', 'original sound - colour.wars', 'battle theme 8-bit'],
      fr: ['compte à rebours (son original)', 'son original - colour.wars', 'thème de combat 8 bits'],
    },
  },
  hexagon: {
    name: { en: 'spinning hexagon', fr: 'hexagone qui tourne' },
    authors: ['@hexagon.test', '@ai.benchmark', '@physics.check'],
    tags: ['#hexagon #physics #ai', '#simulation #coding', '#satisfying #fyp'],
    captions: {
      en: ['the famous AI coding test', 'gravity, friction, spin', 'it never stops spinning', 'which ball bounces highest?'],
      fr: ['le fameux test de code des IA', 'gravité, frottement, rotation', 'ça ne s’arrête jamais de tourner', 'quelle balle rebondit le plus haut ?'],
    },
    sounds: {
      en: ['spinning hum (original sound)', 'original sound - hexagon.test', 'synth loop'],
      fr: ['ronronnement (son original)', 'son original - hexagon.test', 'boucle de synthé'],
    },
  },
  funnel: {
    name: { en: 'marble funnel', fr: 'entonnoir à billes' },
    authors: ['@coin.funnel', '@spiral.well', '@marble.vortex'],
    tags: ['#funnel #marbles #satisfying', '#spiral #physics', '#oddlysatisfying #fyp'],
    captions: {
      en: ['faster and faster...', 'the museum coin funnel', 'round and round and gone', 'that final drop'],
      fr: ['de plus en plus vite...', 'l’entonnoir à pièces du musée', 'ça tourne, ça tourne, disparu', 'cette chute finale'],
    },
    sounds: {
      en: ['rolling marble (ASMR)', 'original sound - coin.funnel', 'hypnotic loop'],
      fr: ['bille qui roule (ASMR)', 'son original - coin.funnel', 'boucle hypnotique'],
    },
  },
  saws: {
    name: { en: 'balls vs saws', fr: 'balles contre scies' },
    authors: ['@saw.survival', '@last.ball', '@danger.zone'],
    tags: ['#survival #physics #fyp', '#battle #balls', '#whichcolorwins #foryou'],
    captions: {
      en: ['pick a ball, pray', 'who survives the saws?', 'the last two were INTENSE', 'my colour lasted 2 seconds'],
      fr: ['choisis une balle et prie', 'qui survit aux scies ?', 'les deux derniers c’était TENDU', 'ma couleur a tenu 2 secondes'],
    },
    sounds: {
      en: ['saw whirr (original sound)', 'original sound - saw.survival', 'suspense drums'],
      fr: ['scie qui tourne (son original)', 'son original - saw.survival', 'tambours de suspense'],
    },
  },
  flashes: {
    name: { en: 'bounce flashes', fr: 'rebonds lumineux' },
    authors: ['@bounce.beats', '@light.walls', '@visual.music'],
    tags: ['#music #visualizer #satisfying', '#bounce #lights', '#fyp #foryou'],
    captions: {
      en: ['every bounce is a note', 'turn the sound on (there is none)', 'it’s a song if you squint', 'the walls light up'],
      fr: ['chaque rebond est une note', 'monte le son (il n’y en a pas)', 'c’est une chanson si tu plisses les yeux', 'les murs s’allument'],
    },
    sounds: {
      en: ['MIDI bounce (original sound)', 'original sound - bounce.beats', 'piano on every hit'],
      fr: ['rebonds MIDI (son original)', 'son original - bounce.beats', 'piano à chaque rebond'],
    },
  },
  elevator: {
    name: { en: 'marble machine', fr: 'machine à billes' },
    authors: ['@marble.machine', '@kinetic.art', '@loop.forever'],
    tags: ['#marblemachine #kinetic #satisfying', '#perpetual #marbles', '#oddlysatisfying #fyp'],
    captions: {
      en: ['up, down, up, down, forever', 'the queue at the lift...', 'built it in my garage (I didn’t)', 'watch one marble do a full loop'],
      fr: ['monte, descend, monte, descend, pour toujours', 'la file d’attente devant l’ascenseur...', 'fait dans mon garage (non)', 'suis une bille sur un tour complet'],
    },
    sounds: {
      en: ['marble clatter (ASMR)', 'original sound - marble.machine', 'music box loop'],
      fr: ['cliquetis de billes (ASMR)', 'son original - marble.machine', 'boucle de boîte à musique'],
    },
  },
  gravmaze: {
    name: { en: 'gravity maze', fr: 'labyrinthe à gravité' },
    authors: ['@tilt.maze', '@gravity.puzzle', '@maze.solver'],
    tags: ['#maze #puzzle #gravity', '#brain #satisfying', '#fyp #foryou'],
    captions: {
      en: ['tilt, roll, repeat', 'the solver found it in how many moves?', 'follow the arrow', 'one wrong tilt and it’s over'],
      fr: ['on penche, ça roule, on recommence', 'le solveur a trouvé en combien de coups ?', 'suis la flèche', 'un mauvais coup et c’est fini'],
    },
    sounds: {
      en: ['rolling (original sound)', 'original sound - tilt.maze', 'puzzle game music'],
      fr: ['ça roule (son original)', 'son original - tilt.maze', 'musique de jeu de réflexion'],
    },
  },
  hole: {
    name: { en: '100 balls one hole', fr: '100 balles un trou' },
    authors: ['@one.hole', '@traffic.jam', '@ball.pit'],
    tags: ['#physics #satisfying #balls', '#oddlysatisfying #simulation', '#fyp #foryou'],
    captions: {
      en: ['100 balls, 1 exit', 'pov: leaving a concert', 'the jam at the hole...', 'count down with me'],
      fr: ['100 balles, 1 sortie', 'pov : la sortie d’un concert', 'le bouchon devant le trou...', 'compte à rebours avec moi'],
    },
    sounds: {
      en: ['rattling balls (ASMR)', 'original sound - one.hole', 'crowd noise'],
      fr: ['balles qui s’entrechoquent (ASMR)', 'son original - one.hole', 'bruit de foule'],
    },
  },
  snooker: {
    name: { en: 'snooker', fr: 'snooker' },
    authors: ['@snooker.bot', '@pot.master', '@cue.vision'],
    tags: ['#snooker #pool #trickshot', '#billiards #satisfying', '#sports #fyp'],
    captions: {
      en: ['the break, then the clearance', 'watch the cue ball control', 'this bot plays better than me', 'satisfying pots only'],
      fr: ['la casse, puis tout le reste', 'regarde le contrôle de la blanche', 'ce bot joue mieux que moi', 'que des empochages satisfaisants'],
    },
    sounds: {
      en: ['ball clicks (ASMR)', 'original sound - snooker.bot', 'quiet commentary'],
      fr: ['clics de billes (ASMR)', 'son original - snooker.bot', 'commentaire à voix basse'],
    },
  },
  pinball: {
    name: { en: 'pinball', fr: 'flipper' },
    authors: ['@pinball.wizard', '@tilt.tilt', '@arcade.night'],
    tags: ['#pinball #arcade #retro', '#gaming #satisfying', '#fyp #foryou'],
    captions: {
      en: ['the bumpers go crazy', 'bot plays pinball, can’t drain', 'high score incoming', 'arcade nostalgia'],
      fr: ['les bumpers deviennent fous', 'un bot au flipper, impossible à battre', 'high score en approche', 'nostalgie des salles d’arcade'],
    },
    sounds: {
      en: ['pinball dings (original sound)', 'original sound - pinball.wizard', 'arcade ambience'],
      fr: ['dings de flipper (son original)', 'son original - pinball.wizard', 'ambiance de salle d’arcade'],
    },
  },
  pegs: {
    name: { en: 'peg breaker', fr: 'casse-plots' },
    authors: ['@peg.master', '@orange.pegs', '@fever.mode'],
    tags: ['#peggle #puzzle #gaming', '#satisfying #retro', '#fyp #foryou'],
    captions: {
      en: ['clear every orange peg', 'the bucket save!', 'wait for fever mode', 'that bounce path was insane'],
      fr: ['efface tous les plots orange', 'sauvé par le seau !', 'attends le mode fièvre', 'ce trajet de rebonds était fou'],
    },
    sounds: {
      en: ['Ode to Joy (8-bit)', 'original sound - peg.master', 'harp glissando'],
      fr: ['Hymne à la joie (8 bits)', 'son original - peg.master', 'glissando de harpe'],
    },
  },
  gates: {
    name: { en: 'colour gates', fr: 'tri par couleur' },
    authors: ['@sort.machine', '@colour.gates', '@factory.asmr'],
    tags: ['#sorting #satisfying #machine', '#colors #oddlysatisfying', '#fyp #foryou'],
    captions: {
      en: ['every ball finds its tube', 'the trapdoor timing...', 'sorting machine goes brrr', 'which tube fills first?'],
      fr: ['chaque balle trouve son tube', 'le timing des trappes...', 'la machine à trier fait brrr', 'quel tube se remplit en premier ?'],
    },
    sounds: {
      en: ['clack clack (ASMR)', 'original sound - sort.machine', 'factory beat'],
      fr: ['clac clac (ASMR)', 'son original - sort.machine', 'beat d’usine'],
    },
  },
  skytrack: {
    name: { en: 'sky track', fr: 'piste dans le ciel' },
    authors: ['@rolling.sky', '@ball.run', '@sky.track'],
    tags: ['#rollingsky #mobilegame #gaming', '#runner #satisfying', '#fyp #foryou'],
    captions: {
      en: ['one wrong lane and it’s over', 'how far will it roll?', 'the gaps get meaner', 'mobile game nostalgia'],
      fr: ['une mauvaise voie et c’est fini', 'jusqu’où elle va rouler ?', 'les trous deviennent méchants', 'nostalgie jeu mobile'],
    },
    sounds: {
      en: ['EDM drop (original sound)', 'original sound - rolling.sky', 'synthwave run'],
      fr: ['drop EDM (son original)', 'son original - rolling.sky', 'course synthwave'],
    },
  },
  willit: {
    name: { en: 'will it make it', fr: 'ça va rentrer ?' },
    authors: ['@will.it.go', '@trick.shot', '@nothing.but.cup'],
    tags: ['#willitgoin #trickshot #fyp', '#waitforit #satisfying', '#physics #foryou'],
    captions: {
      en: ['will it make it? comment before the end', 'freeze... now guess', 'nothing but cup', 'I said no and I was wrong'],
      fr: ['ça rentre ? commente avant la fin', 'pause... devine', 'que du gobelet', 'j’ai dit non et j’avais tort'],
    },
    sounds: {
      en: ['suspense (original sound)', 'original sound - will.it.go', 'record scratch'],
      fr: ['suspense (son original)', 'son original - will.it.go', 'disque rayé'],
    },
  },
  rainbow: {
    name: { en: 'rainbow ball', fr: 'balle arc-en-ciel' },
    authors: ['@rainbow.trail', '@speed.ball', '@colour.bounce'],
    tags: ['#rainbow #satisfying #physics', '#bouncingball #speed', '#fyp #foryou'],
    captions: {
      en: ['faster on every bounce', 'wait until it goes crazy', 'the trail at the end...', 'speed run of a square'],
      fr: ['plus rapide à chaque rebond', 'attends que ça parte en vrille', 'la traînée à la fin...', 'speedrun d’un carré'],
    },
    sounds: {
      en: ['speeding up (original sound)', 'original sound - rainbow.trail', 'nightcore remix'],
      fr: ['ça accélère (son original)', 'son original - rainbow.trail', 'remix nightcore'],
    },
  },
  linesled: {
    name: { en: 'sled on a drawn line', fr: 'luge sur ligne tracée' },
    authors: ['@draw.the.track', '@sled.rider', '@one.line.run'],
    tags: ['#linerider #physics #satisfying', '#drawing #sled', '#fyp #foryou'],
    captions: {
      en: ['the pen is always one step ahead', 'that jump was too big…', 'how far does it get this time?', 'physics did not agree'],
      fr: ['le stylo a toujours un coup d’avance', 'ce saut était trop grand…', 'jusqu’où il va cette fois ?', 'la physique n’était pas d’accord'],
    },
    sounds: {
      en: ['pencil scratching paper', 'original sound - draw.the.track', 'classical music, sped up'],
      fr: ['crayon qui gratte le papier', 'son original - draw.the.track', 'musique classique accélérée'],
    },
  },
} satisfies Record<string, Entry>
