import type { Entry } from '../i18n'

// Mobile & hyper-casual: names, authors, tags, captions and sounds.

export const MOBILE = {
  flappy: {
    name: { en: 'flappy bird', fr: 'flappy bird' },
    authors: ['@flap.flap', '@pipe.dodger', '@tap.to.fly'],
    tags: ['#flappybird #mobilegame #nostalgia', '#2014 #gaming', '#fyp #foryou'],
    captions: {
      en: ['the game that broke 2014', 'how far will the bot get?', 'one pixel too low...', 'my record was 7, be honest'],
      fr: ['le jeu qui a cassé 2014', 'jusqu’où va le bot ?', 'un pixel trop bas...', 'mon record c’était 7, sois honnête'],
    },
    sounds: {
      en: ['wing flap (original sound)', 'original sound - flap.flap', 'point ding'],
      fr: ['battement d’aile (son original)', 'son original - flap.flap', 'ding de point'],
    },
  },
  game2048: {
    name: { en: '2048', fr: '2048' },
    authors: ['@merge.tiles', '@corner.strat', '@slide.puzzle'],
    tags: ['#2048 #puzzle #brain', '#mobilegame #strategy', '#fyp #foryou'],
    captions: {
      en: ['keep the big one in the corner', 'will it reach 2048?', 'the slide... the merge...', 'math class memories'],
      fr: ['garde la grosse tuile dans le coin', 'il va atteindre 2048 ?', 'le glissement... la fusion...', 'souvenirs du cours de maths'],
    },
    sounds: {
      en: ['tile slide (ASMR)', 'original sound - merge.tiles', 'focus beats'],
      fr: ['tuiles qui glissent (ASMR)', 'son original - merge.tiles', 'beats pour se concentrer'],
    },
  },
  stack: {
    name: { en: 'stack tower', fr: 'tour d’empilage' },
    authors: ['@stack.perfect', '@tower.tap', '@block.drop'],
    tags: ['#stack #mobilegame #satisfying', '#perfect #timing', '#fyp #foryou'],
    captions: {
      en: ['perfect... perfect... PERFECT', 'every miss makes it thinner', 'the timing has to be exact', 'how tall before it falls?'],
      fr: ['parfait... parfait... PARFAIT', 'chaque raté l’amincit', 'le timing doit être exact', 'jusqu’où avant la chute ?'],
    },
    sounds: {
      en: ['perfect chime (original sound)', 'original sound - stack.perfect', 'rising piano'],
      fr: ['carillon parfait (son original)', 'son original - stack.perfect', 'piano qui monte'],
    },
  },
  fruitslice: {
    name: { en: 'fruit slicing', fr: 'découpe de fruits' },
    authors: ['@fruit.blade', '@slice.master', '@juicy.cuts'],
    tags: ['#fruitninja #mobilegame #satisfying', '#slice #juicy', '#fyp #foryou'],
    captions: {
      en: ['don’t touch the bomb', 'the juice on the wall >>>', 'combo slice!', '2011 called, it wants its game back'],
      fr: ['touche pas la bombe', 'le jus sur le mur >>>', 'coupe combo !', '2011 a appelé, il veut son jeu'],
    },
    sounds: {
      en: ['swoosh slice (original sound)', 'original sound - fruit.blade', 'dojo drums'],
      fr: ['swoosh (son original)', 'son original - fruit.blade', 'tambours du dojo'],
    },
  },
  crossy: {
    name: { en: 'road crossing', fr: 'traversée de route' },
    authors: ['@crossy.chick', '@hop.forward', '@why.cross'],
    tags: ['#crossyroad #mobilegame #chicken', '#hop #retro', '#fyp #foryou'],
    captions: {
      en: ['why did the chicken cross the road', 'the train came out of nowhere', 'logs, cars, trains, repeat', 'never go back'],
      fr: ['pourquoi le poulet traverse la route', 'le train est sorti de nulle part', 'troncs, voitures, trains, on recommence', 'on ne recule jamais'],
    },
    sounds: {
      en: ['hop hop (original sound)', 'original sound - crossy.chick', 'train horn'],
      fr: ['hop hop (son original)', 'son original - crossy.chick', 'klaxon de train'],
    },
  },
  helix: {
    name: { en: 'helix jump', fr: 'saut en spirale' },
    authors: ['@helix.drop', '@spin.tower', '@ball.fall'],
    tags: ['#helixjump #mobilegame #satisfying', '#spin #fall', '#fyp #foryou'],
    captions: {
      en: ['spin, drop, don’t touch red', 'falling with style', 'level after level', 'the satisfying drop through'],
      fr: ['tourne, tombe, touche pas le rouge', 'tomber avec style', 'niveau après niveau', 'la chute satisfaisante à travers'],
    },
    sounds: {
      en: ['bounce splat (original sound)', 'original sound - helix.drop', 'mobile game EDM'],
      fr: ['rebond splash (son original)', 'son original - helix.drop', 'EDM de jeu mobile'],
    },
  },
  colorswitch: {
    name: { en: 'colour switch', fr: 'change de couleur' },
    authors: ['@colour.switch', '@ring.timing', '@match.colour'],
    tags: ['#colorswitch #mobilegame #timing', '#colors #satisfying', '#fyp #foryou'],
    captions: {
      en: ['only through your own colour', 'the timing on that ring...', 'colour change incoming', 'harder than it looks'],
      fr: ['on passe seulement par sa couleur', 'le timing sur cet anneau...', 'changement de couleur en approche', 'plus dur qu’il n’y paraît'],
    },
    sounds: {
      en: ['tap tap (original sound)', 'original sound - colour.switch', 'electro pop'],
      fr: ['tap tap (son original)', 'son original - colour.switch', 'électro pop'],
    },
  },
  holecity: {
    name: { en: 'hole in the city', fr: 'trou dans la ville' },
    authors: ['@hole.io', '@eat.the.city', '@black.hole.bot'],
    tags: ['#holeio #mobilegame #satisfying', '#blackhole #city', '#fyp #foryou'],
    captions: {
      en: ['starts with cars, ends with buildings', 'it keeps getting bigger', 'how much of the city is left?', 'the buildings were a mistake'],
      fr: ['ça commence par les voitures, ça finit par les immeubles', 'il grossit encore et encore', 'il reste combien de la ville ?', 'les immeubles, c’était une erreur'],
    },
    sounds: {
      en: ['gulp (original sound)', 'original sound - hole.io', 'chaos music'],
      fr: ['gloups (son original)', 'son original - hole.io', 'musique de chaos'],
    },
  },
  territory: {
    name: { en: 'territory', fr: 'territoire' },
    authors: ['@paper.square', '@claim.land', '@loop.and.fill'],
    tags: ['#paperio #mobilegame #strategy', '#territory #satisfying', '#fyp #foryou'],
    captions: {
      en: ['loop out, come home, claim it', 'cut their trail!', 'the fill is so satisfying', 'who owns the map?'],
      fr: ['sors, fais une boucle, rentre, c’est à toi', 'coupe leur traînée !', 'le remplissage est trop satisfaisant', 'à qui la carte ?'],
    },
    sounds: {
      en: ['fill whoosh (original sound)', 'original sound - paper.square', 'arcade pop'],
      fr: ['whoosh de remplissage (son original)', 'son original - paper.square', 'pop d’arcade'],
    },
  },
  cells: {
    name: { en: 'cell eater', fr: 'mangeur de cellules' },
    authors: ['@cell.eater', '@agar.bot', '@big.fish'],
    tags: ['#agario #mobilegame #io', '#cells #eat', '#fyp #foryou'],
    captions: {
      en: ['eat or be eaten', 'the big red one is hunting', 'run, little cell, run', 'school computer room classic'],
      fr: ['manger ou être mangé', 'le gros rouge chasse', 'cours, petite cellule, cours', 'le classique de la salle info'],
    },
    sounds: {
      en: ['blop (original sound)', 'original sound - cell.eater', 'chill io music'],
      fr: ['blop (son original)', 'son original - cell.eater', 'musique io chill'],
    },
  },
  match3: {
    name: { en: 'match-3', fr: 'match-3' },
    authors: ['@sweet.match', '@candy.combo', '@cascade.queen'],
    tags: ['#match3 #puzzle #satisfying', '#candy #combo', '#fyp #foryou'],
    captions: {
      en: ['wait for the cascade', 'sweet combo', 'the bot found the best swap', 'grandma’s favourite game'],
      fr: ['attends la cascade', 'combo sucré', 'le bot a trouvé le meilleur échange', 'le jeu préféré de mamie'],
    },
    sounds: {
      en: ['sweet! (original sound)', 'original sound - sweet.match', 'candy pop music'],
      fr: ['délicieux ! (son original)', 'son original - sweet.match', 'musique candy pop'],
    },
  },
  blockblast: {
    name: { en: 'block blast', fr: 'block blast' },
    authors: ['@block.blast', '@grid.clear', '@puzzle.addict'],
    tags: ['#blockblast #puzzle #mobilegame', '#satisfying #lines', '#fyp #foryou'],
    captions: {
      en: ['clear the lines, keep the board', 'that combo clear!', 'one more round, I swear', 'where does the 3x3 go?'],
      fr: ['efface les lignes, garde la grille', 'ce combo !', 'encore une partie, promis', 'où mettre le 3x3 ?'],
    },
    sounds: {
      en: ['block thud (original sound)', 'original sound - block.blast', 'puzzle beat'],
      fr: ['bloc posé (son original)', 'son original - block.blast', 'beat de puzzle'],
    },
  },
  zigzag: {
    name: { en: 'zigzag', fr: 'zigzag' },
    authors: ['@zig.zag', '@tap.turn', '@iso.path'],
    tags: ['#zigzag #mobilegame #timing', '#isometric #satisfying', '#fyp #foryou'],
    captions: {
      en: ['tap... tap... tap...', 'one late turn and it’s gone', 'hypnotic path', 'the colours keep shifting'],
      fr: ['tap... tap... tap...', 'un virage en retard et c’est fini', 'chemin hypnotique', 'les couleurs changent sans arrêt'],
    },
    sounds: {
      en: ['tick (original sound)', 'original sound - zig.zag', 'minimal piano'],
      fr: ['tic (son original)', 'son original - zig.zag', 'piano minimal'],
    },
  },
  knives: {
    name: { en: 'knife throw', fr: 'lancer de couteaux' },
    authors: ['@knife.hit', '@log.spin', '@throw.timing'],
    tags: ['#knifehit #mobilegame #timing', '#satisfying #throw', '#fyp #foryou'],
    captions: {
      en: ['don’t hit another knife', 'the log breaks at the end', 'wait for the gap...', 'level 5 is evil'],
      fr: ['ne touche pas un autre couteau', 'la bûche explose à la fin', 'attends le trou...', 'le niveau 5 est diabolique'],
    },
    sounds: {
      en: ['thunk (original sound)', 'original sound - knife.hit', 'tension drums'],
      fr: ['tchac (son original)', 'son original - knife.hit', 'tambours de tension'],
    },
  },
  crowdrun: {
    name: { en: 'crowd runner', fr: 'course de foule' },
    authors: ['@crowd.run', '@gate.math', '@mobile.ads'],
    tags: ['#mobilegame #ads #crowd', '#math #satisfying', '#fyp #foryou'],
    captions: {
      en: ['the game from every ad', 'blue gate good, red gate bad', 'x2 or +20? choose wisely', 'will the crowd beat the boss?'],
      fr: ['le jeu de toutes les pubs', 'porte bleue bien, porte rouge pas bien', 'x2 ou +20 ? choisis bien', 'la foule va battre le boss ?'],
    },
    sounds: {
      en: ['crowd cheer (original sound)', 'original sound - crowd.run', 'ad music (you know the one)'],
      fr: ['foule qui crie (son original)', 'son original - crowd.run', 'musique de pub (tu vois laquelle)'],
    },
  },
  pullpin: {
    name: { en: 'pull the pin', fr: 'tire la goupille' },
    authors: ['@pull.pin', '@gold.rush', '@lava.puzzle'],
    tags: ['#pullthepin #mobilegame #ads', '#puzzle #satisfying', '#fyp #foryou'],
    captions: {
      en: ['water first, then lava, then gold', 'wrong order = toasted hero', 'the ad game, but the bot plays it', 'stone saves the day'],
      fr: ['l’eau d’abord, puis la lave, puis l’or', 'mauvais ordre = héros grillé', 'le jeu des pubs, mais joué par un bot', 'la pierre sauve la mise'],
    },
    sounds: {
      en: ['pin slide (original sound)', 'original sound - pull.pin', 'treasure fanfare'],
      fr: ['goupille qui glisse (son original)', 'son original - pull.pin', 'fanfare du trésor'],
    },
  },
  parking: {
    name: { en: 'parking jam', fr: 'embouteillage de parking' },
    authors: ['@parking.jam', '@car.out', '@lot.escape'],
    tags: ['#parkingjam #puzzle #mobilegame', '#cars #satisfying', '#fyp #foryou'],
    captions: {
      en: ['get every car out', 'that one was blocked lol', 'the right order is everything', 'every mall parking lot ever'],
      fr: ['sors toutes les voitures', 'celle-là était bloquée mdr', 'tout est dans l’ordre', 'tous les parkings de centre commercial'],
    },
    sounds: {
      en: ['vroom (original sound)', 'original sound - parking.jam', 'honk honk'],
      fr: ['vroum (son original)', 'son original - parking.jam', 'pouet pouet'],
    },
  },
  watersort: {
    name: { en: 'water sort', fr: 'tri de liquides' },
    authors: ['@water.sort', '@pour.puzzle', '@liquid.asmr'],
    tags: ['#watersort #puzzle #satisfying', '#pour #colors', '#fyp #foryou'],
    captions: {
      en: ['pour until every tube is one colour', 'the pour sound is unreal', 'brain workout, but chill', 'last pour...'],
      fr: ['verse jusqu’à une couleur par tube', 'le bruit du versement est irréel', 'muscu du cerveau, mais tranquille', 'dernier versement...'],
    },
    sounds: {
      en: ['glug glug (ASMR)', 'original sound - water.sort', 'calm puzzle music'],
      fr: ['glou glou (ASMR)', 'son original - water.sort', 'musique de puzzle calme'],
    },
  },
  doodle: {
    name: { en: 'doodle jump', fr: 'doodle jump' },
    authors: ['@doodle.hop', '@graph.paper', '@spring.jump'],
    tags: ['#doodlejump #mobilegame #nostalgia', '#jump #2010', '#fyp #foryou'],
    captions: {
      en: ['higher and higher', 'the spring!', 'don’t step on the brown ones', 'iPod touch memories'],
      fr: ['de plus en plus haut', 'le ressort !', 'marche pas sur les marron', 'souvenirs d’iPod touch'],
    },
    sounds: {
      en: ['boing (original sound)', 'original sound - doodle.hop', 'cheerful tune'],
      fr: ['boing (son original)', 'son original - doodle.hop', 'air joyeux'],
    },
  },
  slingshot: {
    name: { en: 'slingshot birds', fr: 'oiseaux lance-pierre' },
    authors: ['@sling.bird', '@tower.topple', '@pig.popper'],
    tags: ['#slingshot #mobilegame #nostalgia', '#physics #topple', '#fyp #foryou'],
    captions: {
      en: ['three birds, one tower', 'the wobble before the fall...', 'aim for the green ones', '2010 had the best games'],
      fr: ['trois oiseaux, une tour', 'le vacillement avant la chute...', 'vise les verts', '2010 avait les meilleurs jeux'],
    },
    sounds: {
      en: ['wheee (original sound)', 'original sound - sling.bird', 'cartoon crash'],
      fr: ['wiiii (son original)', 'son original - sling.bird', 'crash de dessin animé'],
    },
  },
  suika: {
    name: { en: 'merge watermelon', fr: 'pastèque fusion' },
    authors: ['@suika.merge', '@fruit.drop', '@watermelon.goal'],
    tags: ['#suikagame #mobilegame #satisfying', '#merge #fruit', '#fyp #foryou'],
    captions: {
      en: ['two cherries make a strawberry...', 'chasing the watermelon', 'don’t cross the line!', 'the chain merge was crazy'],
      fr: ['deux cerises font une fraise...', 'à la poursuite de la pastèque', 'ne dépasse pas la ligne !', 'la fusion en chaîne était folle'],
    },
    sounds: {
      en: ['pop merge (original sound)', 'original sound - suika.merge', 'cute game music'],
      fr: ['pop fusion (son original)', 'son original - suika.merge', 'musique de jeu mignonne'],
    },
  },
} satisfies Record<string, Entry>
