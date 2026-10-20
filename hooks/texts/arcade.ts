import type { Entry } from '../i18n'

// Retro arcade: names, authors, tags, captions and sounds.

export const ARCADE = {
  runner: {
    name: { en: 'runner', fr: 'runner' },
    authors: ['@subway.pixel', '@metro_surfer', '@runner8bit'],
    tags: ['#subway #runner #pixelart', '#satisfying #8bit', '#gaming #fyp'],
    captions: {
      en: ['he dodges EVERYTHING', 'wait for the 3rd train...', 'personal best, zero breaks', 'pov: running from your emails'],
      fr: ['il esquive TOUT', 'attends le 3e train...', 'record perso, zéro pause', 'pov : tu fuis tes mails'],
    },
    sounds: {
      en: ['original sound - subway.pixel', 'chiptune remix (sped up)', 'Metro Boomin but 8-bit'],
      fr: ['son original - subway.pixel', 'chiptune remix (sped up)', 'Metro Boomin mais en 8 bits'],
    },
  },
  tetris: {
    name: { en: 'Tetris', fr: 'Tetris' },
    authors: ['@tetris.bot', '@perfect.blocks', '@line.clear'],
    tags: ['#tetris #satisfying #retro', '#gaming #8bit', '#puzzle #fyp'],
    captions: {
      en: ['he\'s waiting for the long bar...', 'zero mistakes, watch', 'the TETRIS is coming', 'line clear satisfaction'],
      fr: ['il attend la barre...', 'aucune erreur, regarde', 'le TETRIS arrive', 'satisfaction des lignes'],
    },
    sounds: {
      en: ['Korobeiniki 8-bit', 'original sound - tetris.bot', 'Tetris theme (slowed)'],
      fr: ['Korobeiniki 8 bits', 'son original - tetris.bot', 'Tetris theme (slowed)'],
    },
  },
  briques: {
    name: { en: 'brick breaker', fr: 'casse-briques' },
    authors: ['@brick.breaker', '@arkanoid.fan', '@brick.by.brick'],
    tags: ['#breakout #retro #satisfying', '#arcade #8bit', '#gaming #fyp'],
    captions: {
      en: ['the last brick...', 'he never misses', 'rainbow combo', 'watch till the end'],
      fr: ['la dernière brique...', 'il ne rate jamais', 'combo arc-en-ciel', 'regarde jusqu’au bout'],
    },
    sounds: {
      en: ['beep beep beep (original sound)', 'arcade 1986', 'energetic chiptune'],
      fr: ['bip bip bip (son original)', 'arcade 1986', 'chiptune énergique'],
    },
  },
  course: {
    name: { en: 'racing', fr: 'course' },
    authors: ['@pixel.racer', '@grand.prix8bit', '@retro.driver'],
    tags: ['#racing #retro #pixelart', '#race #gaming', '#vroom #fyp'],
    captions: {
      en: ['he overtakes EVERYONE', 'the turn of death', 'no brakes, just talent', 'track record'],
      fr: ['il les double TOUS', 'le virage de la mort', 'pas de frein, que du talent', 'record du circuit'],
    },
    sounds: {
      en: ['V8 engine (original sound)', 'OutRun but worse', 'racing synthwave'],
      fr: ['moteur V8 (son original)', 'OutRun mais en pire', 'synthwave de course'],
    },
  },
  snake: {
    name: { en: 'Snake', fr: 'Snake' },
    authors: ['@snake.bot', '@nokia3310', '@longest.snake'],
    tags: ['#snake #retro #nokia', '#satisfying #gaming', '#8bit #fyp'],
    captions: {
      en: ['it never bites itself', 'watch it fill the whole screen', 'Nokia 3310 vibes', 'the perfect route'],
      fr: ['il ne se mord jamais', 'regarde-le remplir tout l’écran', 'vibes Nokia 3310', 'le trajet parfait'],
    },
    sounds: {
      en: ['Nokia beep (original sound)', 'snake chiptune', 'retro phone ringtone'],
      fr: ['bip Nokia (son original)', 'chiptune snake', 'sonnerie rétro'],
    },
  },
  dino: {
    name: { en: 'Chrome dino', fr: 'dino de Chrome' },
    authors: ['@no.internet', '@trex.runner', '@offline.again'],
    tags: ['#chromedino #nointernet', '#trex #retro', '#gaming #fyp'],
    captions: {
      en: ['when the wifi is down', 'wait for night mode', 'he dodges the pterodactyl', 'offline but happy'],
      fr: ['quand le wifi lâche', 'attends le mode nuit', 'il esquive le ptérodactyle', 'hors ligne mais heureux'],
    },
    sounds: {
      en: ['jump sound (original)', 'offline lofi', 'Chrome dino remix'],
      fr: ['bruit de saut (original)', 'lofi hors ligne', 'Chrome dino remix'],
    },
  },
  pacman: {
    name: { en: 'Pac-Man', fr: 'Pac-Man' },
    authors: ['@waka.waka', '@pacman.pro', '@arcade.1980'],
    tags: ['#pacman #arcade #retro', '#gaming #8bit', '#nostalgia #fyp'],
    captions: {
      en: ['waka waka waka', 'the power pellet comeback', 'he eats every ghost', 'clean sweep'],
      fr: ['waka waka waka', 'le retour avec la super pac-gomme', 'il mange tous les fantômes', 'grand ménage'],
    },
    sounds: {
      en: ['waka waka (original sound)', 'arcade 1980', 'ghost siren'],
      fr: ['waka waka (son original)', 'arcade 1980', 'sirène des fantômes'],
    },
  },
  geodash: {
    name: { en: 'Geometry Dash', fr: 'Geometry Dash' },
    authors: ['@geometry.dash', '@cube.jumper', '@attempt.999'],
    tags: ['#geometrydash #rage #gaming', '#rhythm #satisfying', '#gaming #fyp'],
    captions: {
      en: ['look at the attempt counter', 'one more try...', 'perfectly on the beat', 'the triple spike'],
      fr: ['regarde le compteur d’essais', 'encore un essai...', 'pile dans le rythme', 'le triple pic'],
    },
    sounds: {
      en: ['Stereo Madness', 'original sound - geometry.dash', 'electro drop'],
      fr: ['Stereo Madness', 'son original - geometry.dash', 'drop électro'],
    },
  },
  invaders: {
    name: { en: 'space invaders', fr: 'envahisseurs de l’espace' },
    authors: ['@arcade.1978', '@invader.bot', '@pixel.defense'],
    tags: ['#arcade #retrogaming #80s', '#spaceinvaders #8bit', '#gaming #fyp'],
    captions: {
      en: ['they speed up when there are fewer...', 'the UFO bonus!', 'bot never misses a shot', 'arcade bar, 1978 vibes'],
      fr: ['ils accélèrent quand il en reste moins...', 'le bonus de la soucoupe !', 'le bot ne rate jamais', 'ambiance bar d’arcade 1978'],
    },
    sounds: {
      en: ['dum dum dum dum (original sound)', 'original sound - arcade.1978', 'synth march'],
      fr: ['dum dum dum dum (son original)', 'son original - arcade.1978', 'marche au synthé'],
    },
  },
  asteroids: {
    name: { en: 'asteroids', fr: 'astéroïdes' },
    authors: ['@vector.ship', '@rock.splitter', '@arcade.1979'],
    tags: ['#asteroids #arcade #retro', '#vectorgraphics #80s', '#gaming #fyp'],
    captions: {
      en: ['big rock, two rocks, four rocks', 'the dodge at the last second', 'vector graphics hit different', 'how long can it survive?'],
      fr: ['gros caillou, deux cailloux, quatre cailloux', 'l’esquive à la dernière seconde', 'les graphismes vectoriels, ça a un truc', 'combien de temps il tient ?'],
    },
    sounds: {
      en: ['pew pew (original sound)', 'original sound - vector.ship', 'deep space hum'],
      fr: ['piou piou (son original)', 'son original - vector.ship', 'bourdonnement spatial'],
    },
  },
  frogger: {
    name: { en: 'frog crossing', fr: 'grenouille qui traverse' },
    authors: ['@hop.hop', '@frog.road', '@log.rider'],
    tags: ['#frogger #arcade #retro', '#frog #8bit', '#gaming #fyp'],
    captions: {
      en: ['the timing on that log...', 'road first, then the river', 'one frog, so many trucks', 'bro waited for the perfect gap'],
      fr: ['le timing sur ce tronc...', 'la route d’abord, puis la rivière', 'une grenouille, tellement de camions', 'il a attendu le trou parfait'],
    },
    sounds: {
      en: ['hop hop (original sound)', 'original sound - hop.hop', 'arcade tune'],
      fr: ['hop hop (son original)', 'son original - hop.hop', 'musique d’arcade'],
    },
  },
  pong: {
    name: { en: 'pong', fr: 'pong' },
    authors: ['@pong.bots', '@first.game', '@paddle.wars'],
    tags: ['#pong #retro #arcade', '#ai #bots', '#70s #fyp'],
    captions: {
      en: ['bot vs bot, nobody blinks', 'the first video game ever (almost)', 'the rally keeps getting faster', 'who wins to 10?'],
      fr: ['bot contre bot, personne ne cligne', 'le premier jeu vidéo (presque)', 'l’échange va de plus en plus vite', 'qui gagne en 10 ?'],
    },
    sounds: {
      en: ['bip... boop (original sound)', 'original sound - pong.bots', 'minimal techno'],
      fr: ['bip... boup (son original)', 'son original - pong.bots', 'techno minimale'],
    },
  },
  galaga: {
    name: { en: 'galaxy dive', fr: 'plongée galactique' },
    authors: ['@galaxy.dive', '@star.fighter', '@arcade.1981'],
    tags: ['#galaga #arcade #retro', '#shmup #80s', '#gaming #fyp'],
    captions: {
      en: ['they dive, it dodges', 'the formation dance', 'best arcade shooter? discuss', 'dodge... dodge... boom'],
      fr: ['ils plongent, il esquive', 'la danse de la formation', 'meilleur shoot d’arcade ? débattez', 'esquive... esquive... boum'],
    },
    sounds: {
      en: ['start jingle (original sound)', 'original sound - galaxy.dive', 'space shooter OST'],
      fr: ['jingle de départ (son original)', 'son original - galaxy.dive', 'BO de shoot spatial'],
    },
  },
  missile: {
    name: { en: 'missile defence', fr: 'défense antimissile' },
    authors: ['@missile.cmd', '@city.defense', '@intercept.bot'],
    tags: ['#missilecommand #arcade #retro', '#defense #8bit', '#gaming #fyp'],
    captions: {
      en: ['protect the cities', 'the interception math is perfect', 'chain explosions >>>', 'wave after wave'],
      fr: ['protège les villes', 'les calculs d’interception sont parfaits', 'les explosions en chaîne >>>', 'vague après vague'],
    },
    sounds: {
      en: ['alarm (original sound)', 'original sound - missile.cmd', 'tense synth'],
      fr: ['alarme (son original)', 'son original - missile.cmd', 'synthé tendu'],
    },
  },
  barrels: {
    name: { en: 'barrel climber', fr: 'grimpeur de tonneaux' },
    authors: ['@barrel.jump', '@girder.climb', '@ladder.hero'],
    tags: ['#arcade #retro #platformer', '#barrels #8bit', '#gaming #fyp'],
    captions: {
      en: ['jump the barrel, climb the ladder', 'that barrel took the ladder...', 'save her at the top', 'the jump timing is perfect'],
      fr: ['saute le tonneau, monte l’échelle', 'ce tonneau a pris l’échelle...', 'sauve-la tout en haut', 'le timing du saut est parfait'],
    },
    sounds: {
      en: ['jump boing (original sound)', 'original sound - barrel.jump', 'arcade march'],
      fr: ['boing de saut (son original)', 'son original - barrel.jump', 'marche d’arcade'],
    },
  },
  lander: {
    name: { en: 'lunar lander', fr: 'alunisseur' },
    authors: ['@moon.lander', '@soft.landing', '@apollo.pixel'],
    tags: ['#lunarlander #space #retro', '#moon #arcade', '#gaming #fyp'],
    captions: {
      en: ['gentle... gentle...', 'land on the yellow pad', 'sometimes it does not go well', 'one small step for a bot'],
      fr: ['doucement... doucement...', 'pose-toi sur la zone jaune', 'parfois ça se passe mal', 'un petit pas pour un bot'],
    },
    sounds: {
      en: ['thruster hiss (original sound)', 'original sound - moon.lander', 'mission control'],
      fr: ['souffle des moteurs (son original)', 'son original - moon.lander', 'centre de contrôle'],
    },
  },
  centipede: {
    name: { en: 'centipede', fr: 'mille-pattes' },
    authors: ['@bug.blaster', '@mushroom.field', '@segment.hunter'],
    tags: ['#centipede #arcade #retro', '#80s #8bit', '#gaming #fyp'],
    captions: {
      en: ['shoot one segment, get two centipedes', 'the mushrooms are everywhere', 'it keeps coming down', 'colours change every wave'],
      fr: ['tire sur un segment, ça fait deux mille-pattes', 'les champignons sont partout', 'il continue de descendre', 'les couleurs changent à chaque vague'],
    },
    sounds: {
      en: ['zap zap (original sound)', 'original sound - bug.blaster', 'arcade loop'],
      fr: ['zap zap (son original)', 'son original - bug.blaster', 'boucle d’arcade'],
    },
  },
  bomber: {
    name: { en: 'bomber maze', fr: 'labyrinthe à bombes' },
    authors: ['@bomb.maze', '@blast.radius', '@party.bomber'],
    tags: ['#bomberman #retro #gaming', '#maze #8bit', '#nostalgia #fyp'],
    captions: {
      en: ['place, run, boom', 'it always finds a safe spot', 'the balloons never learn', 'childhood multiplayer memories'],
      fr: ['pose, cours, boum', 'il trouve toujours un coin sûr', 'les ballons n’apprennent jamais', 'souvenirs de multi entre potes'],
    },
    sounds: {
      en: ['fuse + boom (original sound)', 'original sound - bomb.maze', 'battle theme 16-bit'],
      fr: ['mèche + boum (son original)', 'son original - bomb.maze', 'thème de bataille 16 bits'],
    },
  },
  minesweeper: {
    name: { en: 'minesweeper', fr: 'démineur' },
    authors: ['@mine.sweeper', '@windows.98', '@logic.only'],
    tags: ['#minesweeper #windows #nostalgia', '#logic #puzzle', '#retro #fyp'],
    captions: {
      en: ['pure logic... until the guess', 'office computer, 1998', 'the face says it all', 'it solved it. or did it?'],
      fr: ['de la logique pure... jusqu’au pari', 'ordi du bureau, 1998', 'le smiley dit tout', 'il l’a résolu. ou pas ?'],
    },
    sounds: {
      en: ['mouse clicks (ASMR)', 'original sound - mine.sweeper', 'Windows startup but slowed'],
      fr: ['clics de souris (ASMR)', 'son original - mine.sweeper', 'démarrage Windows mais en slowed'],
    },
  },
  lightcycles: {
    name: { en: 'light cycles', fr: 'motos de lumière' },
    authors: ['@grid.racer', '@neon.cycles', '@trail.wars'],
    tags: ['#tron #neon #retro', '#lightcycle #synthwave', '#gaming #fyp'],
    captions: {
      en: ['last one alive wins', 'pick a colour', 'boxed in. game over.', 'the grid is a dangerous place'],
      fr: ['le dernier en vie gagne', 'choisis une couleur', 'enfermé. game over.', 'la grille, c’est dangereux'],
    },
    sounds: {
      en: ['engine hum (original sound)', 'original sound - grid.racer', 'synthwave drive'],
      fr: ['vrombissement (son original)', 'son original - grid.racer', 'synthwave en voiture'],
    },
  },
  lemmings: {
    name: { en: 'lemmings', fr: 'lemmings' },
    authors: ['@little.walkers', '@dig.build', '@save.them.all'],
    tags: ['#lemmings #retro #puzzle', '#90s #nostalgia', '#gaming #fyp'],
    captions: {
      en: ['dig, build, block, save', 'they just keep walking', 'how many make it home?', 'the builder is the real hero'],
      fr: ['creuser, construire, bloquer, sauver', 'ils marchent, c’est tout', 'combien rentrent à la maison ?', 'le bâtisseur est le vrai héros'],
    },
    sounds: {
      en: ['oh no! (original sound)', 'original sound - little.walkers', 'cancan 8-bit'],
      fr: ['oh no ! (son original)', 'son original - little.walkers', 'french cancan 8 bits'],
    },
  },
  platformer: {
    name: { en: 'platformer', fr: 'jeu de plateforme' },
    authors: ['@plumber.run', '@coin.block', '@level.1.1'],
    tags: ['#platformer #retrogaming #8bit', '#speedrun #nostalgia', '#gaming #fyp'],
    captions: {
      en: ['jump, stomp, coin', 'world 1-1 energy', 'the bot found every block', 'one pit too many...'],
      fr: ['saute, écrase, pièce', 'énergie monde 1-1', 'le bot a trouvé chaque bloc', 'un trou de trop...'],
    },
    sounds: {
      en: ['coin ding (original sound)', 'original sound - plumber.run', 'overworld theme 8-bit'],
      fr: ['ding de pièce (son original)', 'son original - plumber.run', 'thème du monde 8 bits'],
    },
  },
  bubbleshooter: {
    name: { en: 'bubble shooter', fr: 'tir de bulles' },
    authors: ['@bubble.pop', '@aim.bounce', '@puzzle.arcade'],
    tags: ['#bubbleshooter #puzzle #satisfying', '#mobilegame #retro', '#gaming #fyp'],
    captions: {
      en: ['bank shot off the wall', 'the drop is the best part', 'match three, watch them fall', 'it calculated that'],
      fr: ['un rebond sur le mur', 'la chute, c’est le meilleur', 'trois pareilles, et ça tombe', 'il a calculé ça'],
    },
    sounds: {
      en: ['pop pop (original sound)', 'original sound - bubble.pop', 'arcade bossa'],
      fr: ['pop pop (son original)', 'son original - bubble.pop', 'bossa d’arcade'],
    },
  },
  jewels: {
    name: { en: 'falling jewels', fr: 'joyaux qui tombent' },
    authors: ['@jewel.drop', '@three.in.a.row', '@column.master'],
    tags: ['#puzzle #retrogaming #jewels', '#16bit #nostalgia', '#gaming #fyp'],
    captions: {
      en: ['line up three, any direction', 'chain reaction incoming', 'diagonals count too', 'it plans every drop'],
      fr: ['aligne-en trois, dans tous les sens', 'réaction en chaîne en approche', 'les diagonales comptent aussi', 'il prévoit chaque chute'],
    },
    sounds: {
      en: ['gem chime (original sound)', 'original sound - jewel.drop', '16-bit puzzle theme'],
      fr: ['carillon de gemme (son original)', 'son original - jewel.drop', 'thème de puzzle 16 bits'],
    },
  },
  sokoban: {
    name: { en: 'sokoban', fr: 'sokoban' },
    authors: ['@box.pusher', '@warehouse.keeper', '@puzzle.solved'],
    tags: ['#sokoban #puzzle #brain', '#retrogaming #logic', '#satisfying #fyp'],
    captions: {
      en: ['solved in the fewest moves', 'every box on its spot', 'think before you push', 'level complete, next one'],
      fr: ['résolu en un minimum de coups', 'chaque caisse à sa place', 'réfléchis avant de pousser', 'niveau terminé, au suivant'],
    },
    sounds: {
      en: ['box scrape (original sound)', 'original sound - box.pusher', 'puzzle lofi'],
      fr: ['caisse qui frotte (son original)', 'son original - box.pusher', 'lofi de puzzle'],
    },
  },
  solitaire: {
    name: { en: 'solitaire win', fr: 'solitaire gagné' },
    authors: ['@solitaire.win', '@windows.95', '@card.cascade'],
    tags: ['#solitaire #windows #nostalgia', '#90s #satisfying', '#retro #fyp'],
    captions: {
      en: ['the best animation of the 90s', 'you never forget this screen', 'every card bounces', 'school computer room memories'],
      fr: ['la meilleure animation des années 90', 'on n’oublie jamais cet écran', 'chaque carte rebondit', 'souvenirs de la salle info du collège'],
    },
    sounds: {
      en: ['card flutter (original sound)', 'original sound - solitaire.win', 'Windows 95 nostalgia'],
      fr: ['cartes qui volent (son original)', 'son original - solitaire.win', 'nostalgie Windows 95'],
    },
  },
} satisfies Record<string, Entry>
