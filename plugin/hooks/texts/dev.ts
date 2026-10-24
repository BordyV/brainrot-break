import type { Entry } from '../i18n'

// Developer humour: names, authors, tags, captions and sounds.

export const DEV = {
  tri: {
    name: { en: 'sorting', fr: 'tri visualisé' },
    authors: ['@sorting.algos', '@quick.sort', '@bubble.sort'],
    tags: ['#algorithms #coding #satisfying', '#computerscience #dev', '#code #fyp'],
    captions: {
      en: ['which sort is fastest?', 'quicksort goes brrr', 'when the array is finally sorted', 'POV: computer science class'],
      fr: ['quel tri est le plus rapide ?', 'quicksort goes brrr', 'quand le tableau est enfin trié', 'POV : cours d’algo'],
    },
    sounds: {
      en: ['sorting beeps (original)', '15 sorting algorithms', 'chiptune focus'],
      fr: ['bips de tri (original)', '15 algorithmes de tri', 'chiptune focus'],
    },
  },
  matrix: {
    name: { en: 'Matrix rain', fr: 'pluie Matrix' },
    authors: ['@the.matrix', '@red.pill', '@wake.up.neo'],
    tags: ['#matrix #code #hacker', '#aesthetic #green', '#movie #fyp'],
    captions: {
      en: ['wake up, Neo...', 'red pill or blue pill?', 'my screen when I deploy on a Friday', 'follow the white rabbit'],
      fr: ['réveille-toi, Neo...', 'pilule rouge ou bleue ?', 'mon écran quand je déploie un vendredi', 'suis le lapin blanc'],
    },
    sounds: {
      en: ['digital rain (original sound)', 'techno 1999', 'hacker ambience'],
      fr: ['pluie digitale (son original)', 'techno 1999', 'ambiance hacker'],
    },
  },
  stuck99: {
    name: { en: 'stuck at 99%', fr: 'bloqué à 99 %' },
    authors: ['@progress.bar', '@almost.done', '@install.wizard'],
    tags: ['#programming #relatable #devhumor', '#loading #waiting', '#fyp #foryou'],
    captions: {
      en: ['99%... 99%... 99%...', 'the last 1% takes 90% of the time', 'it went BACKWARDS', 'do not turn off your computer'],
      fr: ['99 %... 99 %... 99 %...', 'le dernier 1 % prend 90 % du temps', 'ça a RECULÉ', 'n’éteignez pas votre ordinateur'],
    },
    sounds: {
      en: ['fan noise (original sound)', 'original sound - progress.bar', 'elevator music'],
      fr: ['bruit de ventilo (son original)', 'son original - progress.bar', 'musique d’ascenseur'],
    },
  },
  gittree: {
    name: { en: 'git branches', fr: 'branches git' },
    authors: ['@git.graph', '@branch.out', '@commit.often'],
    tags: ['#git #programming #devhumor', '#branches #coding', '#fyp #foryou'],
    captions: {
      en: ['my git history after one week', 'branch, commit, merge, repeat', 'who made this branch?', 'the tree grows on its own'],
      fr: ['mon historique git après une semaine', 'branche, commit, merge, on recommence', 'qui a créé cette branche ?', 'l’arbre pousse tout seul'],
    },
    sounds: {
      en: ['keyboard clicks (ASMR)', 'original sound - git.graph', 'lofi coding beats'],
      fr: ['clics de clavier (ASMR)', 'son original - git.graph', 'lofi pour coder'],
    },
  },
  mergeconflict: {
    name: { en: 'merge conflict', fr: 'conflit de merge' },
    authors: ['@merge.conflict', '@both.modified', '@accept.theirs'],
    tags: ['#git #mergeconflict #devhumor', '#programming #pain', '#fyp #foryou'],
    captions: {
      en: ['who touched my line?!', 'accept current or incoming?', 'it was a one-line change', 'friday 5pm merge'],
      fr: ['qui a touché à ma ligne ?!', 'garder la mienne ou la leur ?', 'c’était un changement d’une ligne', 'merge du vendredi 17 h'],
    },
    sounds: {
      en: ['dramatic sting (original sound)', 'original sound - merge.conflict', 'boss battle music'],
      fr: ['coup de théâtre (son original)', 'son original - merge.conflict', 'musique de boss'],
    },
  },
  cipipeline: {
    name: { en: 'CI pipeline', fr: 'pipeline de CI' },
    authors: ['@ci.green', '@pipeline.watch', '@build.passing'],
    tags: ['#ci #devops #programming', '#tests #devhumor', '#fyp #foryou'],
    captions: {
      en: ['please be green please be green', 'red on the last step', 'works on my machine', 'retry and pray'],
      fr: ['sois vert sois vert sois vert', 'rouge à la dernière étape', 'ça marche sur ma machine', 'on relance et on prie'],
    },
    sounds: {
      en: ['suspense ticking (original sound)', 'original sound - ci.green', 'victory fanfare'],
      fr: ['tic-tac de suspense (son original)', 'son original - ci.green', 'fanfare de victoire'],
    },
  },
  stackoverflow: {
    name: { en: 'stack overflow', fr: 'débordement de pile' },
    authors: ['@call.stack', '@recursion', '@base.case'],
    tags: ['#recursion #programming #devhumor', '#stack #coding', '#fyp #foryou'],
    captions: {
      en: ['forgot the base case', 'it calls itself... and itself...', 'to understand recursion, see recursion', 'the stack had enough'],
      fr: ['oublié le cas de base', 'elle s’appelle... et s’appelle...', 'pour comprendre la récursion, voir récursion', 'la pile en a eu assez'],
    },
    sounds: {
      en: ['stacking blocks (original sound)', 'original sound - call.stack', 'collapse sound'],
      fr: ['blocs empilés (son original)', 'son original - call.stack', 'bruit d’effondrement'],
    },
  },
  whackabug: {
    name: { en: 'whack-a-bug', fr: 'tape-le-bug' },
    authors: ['@bug.hunter', '@fix.one.two.more', '@whack.a.bug'],
    tags: ['#debugging #programming #devhumor', '#bugs #coding', '#fyp #foryou'],
    captions: {
      en: ['fix one bug, two more appear', 'debugging be like', 'it’s not a bug, it’s a feature', 'production, friday night'],
      fr: ['un bug corrigé, deux de plus', 'le debug, en vrai', 'c’est pas un bug, c’est une fonctionnalité', 'la prod, vendredi soir'],
    },
    sounds: {
      en: ['bonk (original sound)', 'original sound - bug.hunter', 'arcade loop'],
      fr: ['bonk (son original)', 'son original - bug.hunter', 'boucle d’arcade'],
    },
  },
  serverrack: {
    name: { en: 'server rack', fr: 'baie de serveurs' },
    authors: ['@server.room', '@blinken.lights', '@rack.life'],
    tags: ['#servers #datacenter #satisfying', '#homelab #tech', '#fyp #foryou'],
    captions: {
      en: ['the cloud is just this', 'blinky lights = working', 'homelab goals', 'one of them is red...'],
      fr: ['le cloud, c’est juste ça', 'ça clignote = ça marche', 'objectif homelab', 'il y en a un qui est rouge...'],
    },
    sounds: {
      en: ['server hum (ASMR)', 'original sound - server.room', 'datacenter ambience'],
      fr: ['ronronnement de serveurs (ASMR)', 'son original - server.room', 'ambiance de datacenter'],
    },
  },
  spinners: {
    name: { en: 'loading spinners', fr: 'icônes de chargement' },
    authors: ['@loading.icons', '@please.wait', '@spin.forever'],
    tags: ['#loading #ui #nostalgia', '#design #satisfying', '#fyp #foryou'],
    captions: {
      en: ['which one did you stare at most?', 'the hourglass era', 'the rainbow wheel of doom', 'still loading...'],
      fr: ['laquelle tu as le plus fixée ?', 'l’époque du sablier', 'la roue arc-en-ciel maudite', 'toujours en chargement...'],
    },
    sounds: {
      en: ['hard drive clicks (original sound)', 'original sound - loading.icons', 'waiting room music'],
      fr: ['clics de disque dur (son original)', 'son original - loading.icons', 'musique de salle d’attente'],
    },
  },
  packets: {
    name: { en: 'network packets', fr: 'paquets réseau' },
    authors: ['@packet.trace', '@ping.trace', '@hop.by.hop'],
    tags: ['#network #internet #tech', '#packets #satisfying', '#fyp #foryou'],
    captions: {
      en: ['this is how your message travels', 'hop, hop, hop... delivered', 'one got lost', 'the internet, visualised'],
      fr: ['c’est comme ça que ton message voyage', 'saut, saut, saut... livré', 'il y en a un qui s’est perdu', 'internet, en images'],
    },
    sounds: {
      en: ['modem sounds (original sound)', 'original sound - packet.trace', 'synthwave'],
      fr: ['bruits de modem (son original)', 'son original - packet.trace', 'synthwave'],
    },
  },
  gc: {
    name: { en: 'garbage collector', fr: 'ramasse-miettes' },
    authors: ['@garbage.collector', '@heap.cleanup', '@mark.and.sweep'],
    tags: ['#programming #memory #devhumor', '#garbagecollection #coding', '#fyp #foryou'],
    captions: {
      en: ['mark... and sweep', 'nobody points to you anymore', 'cleaning the heap', 'the pause everyone hates'],
      fr: ['marquer... et balayer', 'plus personne ne pointe vers toi', 'on nettoie le tas', 'la pause que tout le monde déteste'],
    },
    sounds: {
      en: ['vacuum cleaner (ASMR)', 'original sound - garbage.collector', 'cleaning montage music'],
      fr: ['aspirateur (ASMR)', 'son original - garbage.collector', 'musique de ménage en accéléré'],
    },
  },
  memleak: {
    name: { en: 'memory leak', fr: 'fuite de mémoire' },
    authors: ['@memory.leak', '@out.of.ram', '@tab.hoarder'],
    tags: ['#memoryleak #programming #devhumor', '#ram #pain', '#fyp #foryou'],
    captions: {
      en: ['RAM usage: yes', 'it just keeps going up', 'who forgot to free()?', 'restart fixes everything'],
      fr: ['utilisation de la RAM : oui', 'ça ne fait que monter', 'qui a oublié le free() ?', 'redémarrer règle tout'],
    },
    sounds: {
      en: ['dripping water (original sound)', 'original sound - memory.leak', 'rising tension'],
      fr: ['goutte à goutte (son original)', 'son original - memory.leak', 'tension qui monte'],
    },
  },
  rubberduck: {
    name: { en: 'rubber duck debugging', fr: 'debug au canard' },
    authors: ['@rubber.duck', '@explain.it', '@duck.debug'],
    tags: ['#rubberduck #debugging #devhumor', '#programming #duck', '#fyp #foryou'],
    captions: {
      en: ['explained it to the duck, found the bug', 'the duck knows everything', 'best senior dev on the team', 'quack'],
      fr: ['expliqué au canard, trouvé le bug', 'le canard sait tout', 'le meilleur senior de l’équipe', 'coin coin'],
    },
    sounds: {
      en: ['squeak (original sound)', 'original sound - rubber.duck', 'eureka chime'],
      fr: ['pouic (son original)', 'son original - rubber.duck', 'carillon eurêka'],
    },
  },
  pipes: {
    name: { en: 'pipes screensaver', fr: 'économiseur de tuyaux' },
    authors: ['@pipes.screensaver', '@retro.pc', '@idle.desktop'],
    tags: ['#screensaver #nostalgia #retro', '#90s #satisfying', '#fyp #foryou'],
    captions: {
      en: ['the school computer at lunch', 'wait for the teapot joint', '90s kids remember', 'it fills the whole screen'],
      fr: ['l’ordi du CDI à midi', 'attends le raccord en théière', 'les enfants des années 90 s’en souviennent', 'ça remplit tout l’écran'],
    },
    sounds: {
      en: ['CRT hum (original sound)', 'original sound - pipes.screensaver', 'vaporwave'],
      fr: ['bourdonnement de CRT (son original)', 'son original - pipes.screensaver', 'vaporwave'],
    },
  },
  toasters: {
    name: { en: 'flying toasters', fr: 'grille-pain volants' },
    authors: ['@flying.toasters', '@toast.flight', '@screen.saver'],
    tags: ['#screensaver #retro #nostalgia', '#toast #90s', '#fyp #foryou'],
    captions: {
      en: ['toasters with wings, why not', 'the toast follows them', 'peak 90s design', 'your monitor is saved'],
      fr: ['des grille-pain avec des ailes, pourquoi pas', 'les tartines les suivent', 'le sommet du design des années 90', 'ton écran est sauvé'],
    },
    sounds: {
      en: ['wing flaps (original sound)', 'original sound - flying.toasters', 'MIDI orchestra'],
      fr: ['battements d’ailes (son original)', 'son original - flying.toasters', 'orchestre MIDI'],
    },
  },
  defrag: {
    name: { en: 'disk defragmenter', fr: 'défragmenteur' },
    authors: ['@defrag.asmr', '@disk.blocks', '@sort.the.disk'],
    tags: ['#defrag #nostalgia #satisfying', '#retro #windows95vibes', '#fyp #foryou'],
    captions: {
      en: ['the original satisfying video', 'blocks sliding into place', 'watched this for hours as a kid', 'estimated time: 3 hours'],
      fr: ['la vidéo satisfaisante originelle', 'les blocs glissent à leur place', 'je regardais ça pendant des heures', 'temps estimé : 3 heures'],
    },
    sounds: {
      en: ['hard drive seeking (ASMR)', 'original sound - defrag.asmr', 'calm synth'],
      fr: ['disque dur qui cherche (ASMR)', 'son original - defrag.asmr', 'synthé calme'],
    },
  },
  tests: {
    name: { en: 'test suite', fr: 'suite de tests' },
    authors: ['@all.green', '@unit.tests', '@test.runner'],
    tags: ['#testing #programming #devhumor', '#tdd #satisfying', '#fyp #foryou'],
    captions: {
      en: ['green, green, green... red', 'one test failed. which one?', '100% coverage (of one file)', 'run it again, it’s flaky'],
      fr: ['vert, vert, vert... rouge', 'un test a échoué. lequel ?', '100 % de couverture (sur un fichier)', 'relance, il est instable'],
    },
    sounds: {
      en: ['test runner ticks (original sound)', 'original sound - all.green', 'tense countdown'],
      fr: ['tics du lanceur de tests (son original)', 'son original - all.green', 'compte à rebours tendu'],
    },
  },
  robotcoder: {
    name: { en: 'robot coder', fr: 'robot codeur' },
    authors: ['@robot.dev', '@ai.pair', '@bot.commits'],
    tags: ['#ai #coding #devhumor', '#robot #programming', '#fyp #foryou'],
    captions: {
      en: ['it writes the code while I take a break', 'my new coworker', 'it never needs coffee', 'it had an idea!'],
      fr: ['il code pendant que je fais une pause', 'mon nouveau collègue', 'il n’a jamais besoin de café', 'il a eu une idée !'],
    },
    sounds: {
      en: ['robot typing (original sound)', 'original sound - robot.dev', 'futuristic lofi'],
      fr: ['robot qui tape (son original)', 'son original - robot.dev', 'lofi futuriste'],
    },
  },
  neuralnet: {
    name: { en: 'neural network', fr: 'réseau de neurones' },
    authors: ['@neural.net', '@weights.biases', '@forward.pass'],
    tags: ['#ai #neuralnetwork #tech', '#machinelearning #satisfying', '#fyp #foryou'],
    captions: {
      en: ['this is what thinking looks like', 'signals flowing forward', 'it’s just matrix maths', 'layers on layers'],
      fr: ['voilà à quoi ressemble la réflexion', 'les signaux avancent', 'c’est juste des maths de matrices', 'des couches et des couches'],
    },
    sounds: {
      en: ['electric hum (original sound)', 'original sound - neural.net', 'ambient electronica'],
      fr: ['bourdonnement électrique (son original)', 'son original - neural.net', 'électro ambient'],
    },
  },
  nodemodules: {
    name: { en: 'node_modules', fr: 'node_modules' },
    authors: ['@node.modules', '@npm.install', '@dependency.hell'],
    tags: ['#javascript #devhumor #programming', '#dependencies #npm', '#fyp #foryou'],
    captions: {
      en: ['I installed one package', 'the heaviest object in the universe', 'it keeps downloading', 'dependency hell'],
      fr: ['j’ai installé un seul paquet', 'l’objet le plus lourd de l’univers', 'ça télécharge encore', 'l’enfer des dépendances'],
    },
    sounds: {
      en: ['download bleeps (original sound)', 'original sound - node.modules', 'black hole ambience'],
      fr: ['bips de téléchargement (son original)', 'son original - node.modules', 'ambiance trou noir'],
    },
  },
  errors: {
    name: { en: 'error cascade', fr: 'cascade d’erreurs' },
    authors: ['@ok.ok.ok.ok', '@win98.nostalgia', '@not.responding'],
    tags: ['#windows98 #nostalgia #error', '#retro #bsod', '#fyp #foryou'],
    captions: {
      en: ['dragging the error window like it’s 1998', 'it leaves a trail. it always did.', 'and then… the blue screen', 'clicking OK fixes nothing'],
      fr: ['déplacer la fenêtre d’erreur comme en 1998', 'elle laisse une traînée. elle l’a toujours fait.', 'et puis… l’écran bleu', 'cliquer sur OK ne répare rien'],
    },
    sounds: {
      en: ['the error chime, again and again', 'original sound - ok.ok.ok.ok', 'dial-up modem'],
      fr: ['le son d’erreur, encore et encore', 'son original - ok.ok.ok.ok', 'modem 56k'],
    },
  },
  calendar: {
    name: { en: 'calendar Tetris', fr: 'Tetris d’agenda' },
    authors: ['@this.could.be.an.email', '@back.to.back.meetings', '@calendar.tetris'],
    tags: ['#meetings #corporate #relatable', '#officelife #tetris', '#fyp #foryou'],
    captions: {
      en: ['when does the actual work happen?', '100% booked, 0% done', 'the red one is today', 'this meeting could have been an email'],
      fr: ['le vrai travail, c’est quand ?', '100 % réservé, 0 % fait', 'le rouge, c’est aujourd’hui', 'cette réunion aurait pu être un mail'],
    },
    sounds: {
      en: ['calendar notification pings', 'original sound - this.could.be.an.email', 'Tetris theme but sad'],
      fr: ['notifications d’agenda', 'son original - this.could.be.an.email', 'thème de Tetris mais triste'],
    },
  },
  barrace: {
    name: { en: 'bar chart race', fr: 'course de barres' },
    authors: ['@data.is.beautiful.ish', '@chart.racer', '@year.over.year'],
    tags: ['#datavisualization #barchartrace #data', '#statistics #satisfying', '#fyp #foryou'],
    captions: {
      en: ['pick a colour and watch it climb', 'the overtake in the middle!', 'the year is top left', 'I have no idea what we’re measuring'],
      fr: ['choisis une couleur et regarde-la grimper', 'le dépassement au milieu !', 'l’année est en haut à gauche', 'je n’ai aucune idée de ce qu’on mesure'],
    },
    sounds: {
      en: ['epic orchestral build-up', 'original sound - data.is.beautiful.ish', 'ticking clock'],
      fr: ['montée orchestrale épique', 'son original - data.is.beautiful.ish', 'horloge qui fait tic-tac'],
    },
  },
} satisfies Record<string, Entry>
