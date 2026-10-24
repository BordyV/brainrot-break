import type { Entry } from '../i18n'

// Crafts & makers: names, authors, tags, captions and sounds.

export const CRAFTS = {
  brickbuild: {
    name: { en: 'brick build', fr: 'construction en briques' },
    authors: ['@brick.builds', '@moc.builder', '@stud.life'],
    tags: ['#bricks #building #timelapse', '#toys #satisfying', '#fyp #foryou'],
    captions: {
      en: ['brick by brick', 'the windows go in on layer 3', 'roof time!', 'speed build'],
      fr: ['brique par brique', 'les fenêtres arrivent au 3e rang', 'l’heure du toit !', 'construction express'],
    },
    sounds: {
      en: ['brick clicks (ASMR)', 'original sound - brick.builds', 'everything is awesome (lofi)'],
      fr: ['clics de briques (ASMR)', 'son original - brick.by.brick', 'tout est super génial (lofi)'],
    },
  },
  pixeldraw: {
    name: { en: 'pixel art drawing', fr: 'dessin pixel art' },
    authors: ['@pixel.by.pixel', '@sprite.artist', '@8bit.art'],
    tags: ['#pixelart #art #drawing', '#8bit #satisfying', '#gamedev #fyp'],
    captions: {
      en: ['guess it before it’s done', 'one pixel at a time', 'heart, mushroom, cat...', 'this feed is made of these'],
      fr: ['devine avant la fin', 'un pixel à la fois', 'cœur, champignon, chat...', 'ce feed est fait de ça'],
    },
    sounds: {
      en: ['pencil clicks (original sound)', 'original sound - pixel.by.pixel', 'chiptune lofi'],
      fr: ['clics de crayon (son original)', 'son original - pixel.by.pixel', 'lofi chiptune'],
    },
  },
  pottery: {
    name: { en: 'pottery wheel', fr: 'tour de potier' },
    authors: ['@clay.wheel', '@throw.a.pot', '@studio.mud'],
    tags: ['#pottery #ceramics #satisfying', '#wheelthrowing #clay', '#fyp #foryou'],
    captions: {
      en: ['a lump becomes a vase', 'centre the clay...', 'ghost vibes (you know the scene)', 'clay therapy'],
      fr: ['une motte devient un vase', 'centre l’argile...', 'ambiance Ghost (tu vois la scène)', 'thérapie par l’argile'],
    },
    sounds: {
      en: ['wheel spinning (ASMR)', 'original sound - clay.wheel', 'Unchained Melody (lofi)'],
      fr: ['tour qui tourne (ASMR)', 'son original - clay.wheel', 'Unchained Melody (lofi)'],
    },
  },
  crossstitch: {
    name: { en: 'cross-stitch', fr: 'point de croix' },
    authors: ['@stitch.by.stitch', '@cozy.needle', '@thread.art'],
    tags: ['#crossstitch #embroidery #crafts', '#cozy #satisfying', '#handmade #fyp'],
    captions: {
      en: ['X by X', 'the pattern appears slowly', 'grandma would be proud', 'one more row before bed'],
      fr: ['croix après croix', 'le motif apparaît doucement', 'mamie serait fière', 'encore un rang avant de dormir'],
    },
    sounds: {
      en: ['needle through fabric (ASMR)', 'original sound - stitch.by.stitch', 'cosy folk'],
      fr: ['aiguille dans le tissu (ASMR)', 'son original - stitch.by.stitch', 'folk tout doux'],
    },
  },
  fusebeads: {
    name: { en: 'fuse beads', fr: 'perles à repasser' },
    authors: ['@bead.board', '@iron.it', '@perler.pixel'],
    tags: ['#perlerbeads #crafts #nostalgia', '#pixelart #satisfying', '#fyp #foryou'],
    captions: {
      en: ['place them all... then iron', 'the iron reveal', 'childhood craft unlocked', 'they melt together!'],
      fr: ['place-les toutes... puis repasse', 'le moment du fer à repasser', 'souvenir d’enfance débloqué', 'elles fondent ensemble !'],
    },
    sounds: {
      en: ['beads clicking (ASMR)', 'original sound - bead.board', 'kids TV theme'],
      fr: ['perles qui cliquettent (ASMR)', 'son original - bead.board', 'générique de dessin animé'],
    },
  },
  mosaic: {
    name: { en: 'mosaic', fr: 'mosaïque' },
    authors: ['@tile.art', '@mosaic.maker', '@tessera'],
    tags: ['#mosaic #art #satisfying', '#tiles #handmade', '#fyp #foryou'],
    captions: {
      en: ['tile by tile, a picture appears', 'guess the image', 'Roman vibes', 'so many tiny pieces'],
      fr: ['carreau après carreau, une image apparaît', 'devine l’image', 'ambiance romaine', 'tellement de petits morceaux'],
    },
    sounds: {
      en: ['tile tapping (ASMR)', 'original sound - tile.art', 'Mediterranean guitar'],
      fr: ['carreaux qui tapotent (ASMR)', 'son original - tile.art', 'guitare méditerranéenne'],
    },
  },
  loom: {
    name: { en: 'weaving loom', fr: 'métier à tisser' },
    authors: ['@weave.daily', '@shuttle.run', '@textile.art'],
    tags: ['#weaving #loom #textile', '#handmade #satisfying', '#fyp #foryou'],
    captions: {
      en: ['over, under, over, under', 'the pattern builds row by row', 'ancient tech, still beautiful', 'shuttle goes brrr'],
      fr: ['dessus, dessous, dessus, dessous', 'le motif se construit rang par rang', 'une technique ancienne, toujours belle', 'la navette fait brrr'],
    },
    sounds: {
      en: ['loom clack (ASMR)', 'original sound - weave.daily', 'folk strings'],
      fr: ['claquement du métier (ASMR)', 'son original - weave.daily', 'cordes folk'],
    },
  },
  mural: {
    name: { en: 'mural', fr: 'fresque murale' },
    authors: ['@wall.art', '@mural.lapse', '@paint.the.wall'],
    tags: ['#mural #painting #timelapse', '#streetart #art', '#fyp #foryou'],
    captions: {
      en: ['sky, sun, mountains, tree', 'layer by layer', 'a whole wall in 30 seconds', 'blank wall → art'],
      fr: ['ciel, soleil, montagnes, arbre', 'couche par couche', 'un mur entier en 30 secondes', 'mur blanc → œuvre d’art'],
    },
    sounds: {
      en: ['roller sound (ASMR)', 'original sound - wall.art', 'chill hip hop'],
      fr: ['bruit de rouleau (ASMR)', 'son original - wall.art', 'hip hop chill'],
    },
  },
  sandcastle: {
    name: { en: 'sandcastle', fr: 'château de sable' },
    authors: ['@sand.castle', '@beach.build', '@tide.wins'],
    tags: ['#sandcastle #beach #summer', '#tide #nostalgia', '#fyp #foryou'],
    captions: {
      en: ['build, build, build... tide', 'it was beautiful while it lasted', 'summer holidays core', 'the flag on top!'],
      fr: ['construire, construire... la marée', 'c’était beau tant que ça a duré', 'ambiance grandes vacances', 'le drapeau en haut !'],
    },
    sounds: {
      en: ['waves and seagulls (original sound)', 'original sound - sand.castle', 'summer pop'],
      fr: ['vagues et mouettes (son original)', 'son original - sand.castle', 'pop d’été'],
    },
  },
  blockhouse: {
    name: { en: 'block house', fr: 'maison en blocs' },
    authors: ['@block.builder', '@survival.house', '@first.night'],
    tags: ['#blockgame #building #gaming', '#survival #cozy', '#fyp #foryou'],
    captions: {
      en: ['first house before night falls', 'cobble corners, plank walls', 'the roof is the hardest part', 'starter house speedrun'],
      fr: ['la première maison avant la nuit', 'coins en pierre, murs en planches', 'le toit, c’est le plus dur', 'speedrun de maison de départ'],
    },
    sounds: {
      en: ['block place (original sound)', 'original sound - block.builder', 'calm piano (C418 vibes)'],
      fr: ['bloc posé (son original)', 'son original - block.builder', 'piano calme (ambiance C418)'],
    },
  },
  cardtower: {
    name: { en: 'card tower', fr: 'château de cartes' },
    authors: ['@card.tower', '@steady.hands', '@dont.breathe'],
    tags: ['#cardtower #satisfying #patience', '#cards #steadyhands', '#fyp #foryou'],
    captions: {
      en: ['don’t breathe...', 'the last card...', 'and then the wind', 'patience level 100'],
      fr: ['ne respire pas...', 'la dernière carte...', 'et puis le vent', 'niveau de patience 100'],
    },
    sounds: {
      en: ['card shuffle (ASMR)', 'original sound - card.tower', 'tension music'],
      fr: ['cartes battues (ASMR)', 'son original - card.tower', 'musique de tension'],
    },
  },
  jenga: {
    name: { en: 'Jenga collapse', fr: 'tour Jenga' },
    authors: ['@jenga.pull', '@tower.wobble', '@game.night'],
    tags: ['#jenga #gamenight #fail', '#tower #suspense', '#fyp #foryou'],
    captions: {
      en: ['which block will be the last?', 'it wobbles...', 'TIMBER', 'game night chaos'],
      fr: ['quel bloc sera le dernier ?', 'elle vacille...', 'ÇA TOMBE', 'chaos de soirée jeux'],
    },
    sounds: {
      en: ['wood blocks (ASMR)', 'original sound - jenga.pull', 'suspense drums'],
      fr: ['blocs de bois (ASMR)', 'son original - jenga.pull', 'tambours de suspense'],
    },
  },
  flipbook: {
    name: { en: 'flip-book', fr: 'folioscope' },
    authors: ['@margin.doodles', '@flip.it.fast', '@one.page.at.a.time'],
    tags: ['#flipbook #animation #art', '#drawing #satisfying', '#fyp #foryou'],
    captions: {
      en: ['one drawing per page, then flip', 'the ball is coming back down…', 'all the margins of my maths book', '48 pages for 3 seconds of glory'],
      fr: ['un dessin par page, puis on feuillette', 'le ballon redescend…', 'toutes les marges de mon cahier de maths', '48 pages pour 3 secondes de gloire'],
    },
    sounds: {
      en: ['prrrrrt of pages', 'original sound - margin.doodles', 'cartoon slapstick music'],
      fr: ['frrrrrt des pages', 'son original - margin.doodles', 'musique de dessin animé burlesque'],
    },
  },
} satisfies Record<string, Entry>
