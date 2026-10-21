import type { Entry } from '../i18n'

// Machines & how it's made: names, authors, tags, captions and sounds.

export const MACHINES = {
  claw: {
    name: { en: 'claw machine', fr: 'machine à pince' },
    authors: ['@claw.queen', '@one.more.coin', '@plushie.hunter'],
    tags: ['#clawmachine #arcade #win', '#plushies #satisfying', '#fyp #foryou'],
    captions: {
      en: ['it’s rigged... or is it?', 'the grip held!!', 'it slipped, of course', 'one more try'],
      fr: ['c’est truqué... ou pas ?', 'la pince a tenu !!', 'elle a glissé, évidemment', 'encore un essai'],
    },
    sounds: {
      en: ['arcade jingle (original sound)', 'original sound - claw.queen', 'kawaii pop'],
      fr: ['jingle d’arcade (son original)', 'son original - claw.queen', 'pop kawaii'],
    },
  },
  vending: {
    name: { en: 'vending machine', fr: 'distributeur' },
    authors: ['@snack.drop', '@stuck.again', '@vending.life'],
    tags: ['#vendingmachine #snacks #fail', '#satisfying #stuck', '#fyp #foryou'],
    captions: {
      en: ['will it drop or get stuck?', 'the shake technique', 'it got stuck. classic.', 'snack o’clock'],
      fr: ['ça tombe ou ça reste coincé ?', 'la technique de la secousse', 'coincé. classique.', 'l’heure du goûter'],
    },
    sounds: {
      en: ['spiral whirr (original sound)', 'original sound - snack.drop', 'elevator music'],
      fr: ['spirale qui tourne (son original)', 'son original - snack.drop', 'musique d’ascenseur'],
    },
  },
  assembly: {
    name: { en: 'assembly line', fr: 'chaîne de montage' },
    authors: ['@how.its.made', '@robot.factory', '@line.cam'],
    tags: ['#howitsmade #factory #robots', '#cars #satisfying', '#fyp #foryou'],
    captions: {
      en: ['wheels, body, paint, done', 'the robots never stop', 'every car a new colour', 'factory tour'],
      fr: ['roues, carrosserie, peinture, fini', 'les robots ne s’arrêtent jamais', 'chaque voiture une nouvelle couleur', 'visite d’usine'],
    },
    sounds: {
      en: ['factory clanks (original sound)', 'original sound - how.its.made', 'industrial beat'],
      fr: ['bruits d’usine (son original)', 'son original - how.its.made', 'beat industriel'],
    },
  },
  bottling: {
    name: { en: 'bottling line', fr: 'chaîne de mise en bouteille' },
    authors: ['@bottle.line', '@fill.cap.label', '@bottle.asmr'],
    tags: ['#factory #satisfying #howitsmade', '#bottles #asmr', '#fyp #foryou'],
    captions: {
      en: ['fill, cap, label', 'perfectly filled every time', 'the clink of bottles', 'factory ASMR'],
      fr: ['remplir, boucher, étiqueter', 'parfaitement rempli à chaque fois', 'le tintement des bouteilles', 'ASMR d’usine'],
    },
    sounds: {
      en: ['bottle clinks (ASMR)', 'original sound - bottle.line', 'conveyor rhythm'],
      fr: ['tintements de bouteilles (ASMR)', 'son original - bottle.line', 'rythme de tapis roulant'],
    },
  },
  rube: {
    name: { en: 'Rube Goldberg machine', fr: 'machine de Rube Goldberg' },
    authors: ['@chain.reaction', '@overengineered', '@pop.the.balloon'],
    tags: ['#rubegoldberg #chainreaction #satisfying', '#engineering #domino', '#fyp #foryou'],
    captions: {
      en: ['all this to pop a balloon', 'ball, dominoes, seesaw, POP', 'it worked first try (it didn’t)', 'over-engineering at its finest'],
      fr: ['tout ça pour éclater un ballon', 'bille, dominos, bascule, POP', 'ça a marché du premier coup (non)', 'la sur-ingénierie à son meilleur'],
    },
    sounds: {
      en: ['clack clack pop (original sound)', 'original sound - chain.reaction', 'Mission Impossible theme'],
      fr: ['clac clac pop (son original)', 'son original - chain.reaction', 'thème de Mission Impossible'],
    },
  },
  coinpusher: {
    name: { en: 'coin pusher', fr: 'pousse-pièces' },
    authors: ['@coin.edge', '@arcade.pusher', '@so.close'],
    tags: ['#coinpusher #arcade #satisfying', '#coins #jackpot', '#fyp #foryou'],
    captions: {
      en: ['the edge is SO close', 'then it all falls', 'one more coin...', 'peak arcade suspense'],
      fr: ['le bord est TELLEMENT près', 'puis tout tombe', 'encore une pièce...', 'le suspense ultime des salles d’arcade'],
    },
    sounds: {
      en: ['coins cascading (ASMR)', 'original sound - coin.edge', 'arcade ambience'],
      fr: ['cascade de pièces (ASMR)', 'son original - coin.edge', 'ambiance de salle d’arcade'],
    },
  },
  gumball: {
    name: { en: 'gumball machine', fr: 'distributeur de chewing-gums' },
    authors: ['@gumball.spin', '@candy.crank', '@sweet.drop'],
    tags: ['#gumball #candy #nostalgia', '#satisfying #sweets', '#fyp #foryou'],
    captions: {
      en: ['which colour will it be?', 'the spiral is everything', 'childhood in one turn', 'crank, roll, drop'],
      fr: ['ce sera quelle couleur ?', 'la spirale, c’est tout', 'l’enfance en un tour de manivelle', 'tourne, roule, tombe'],
    },
    sounds: {
      en: ['crank and roll (ASMR)', 'original sound - gumball.spin', 'candy shop tune'],
      fr: ['manivelle et roulement (ASMR)', 'son original - gumball.spin', 'air de confiserie'],
    },
  },
  lasercut: {
    name: { en: 'laser cutter', fr: 'découpe laser' },
    authors: ['@laser.maker', '@cut.and.pop', '@fab.lab'],
    tags: ['#lasercutting #maker #satisfying', '#diy #woodworking', '#fyp #foryou'],
    captions: {
      en: ['star, heart, gear', 'the pop out at the end', 'precision you can see', 'fab lab Friday'],
      fr: ['étoile, cœur, engrenage', 'la pièce qui sort à la fin', 'une précision qui se voit', 'vendredi au fab lab'],
    },
    sounds: {
      en: ['laser hum (original sound)', 'original sound - laser.maker', 'maker beats'],
      fr: ['bourdonnement laser (son original)', 'son original - laser.maker', 'beats de maker'],
    },
  },
  printer3d: {
    name: { en: '3D printer', fr: 'imprimante 3D' },
    authors: ['@layer.by.layer', '@print.lapse', '@benchy.fan'],
    tags: ['#3dprinting #timelapse #maker', '#satisfying #layers', '#fyp #foryou'],
    captions: {
      en: ['layer by layer', 'watch the percentage', 'hours of printing in seconds', 'it actually worked'],
      fr: ['couche par couche', 'regarde le pourcentage', 'des heures d’impression en quelques secondes', 'ça a vraiment marché'],
    },
    sounds: {
      en: ['stepper motors (ASMR)', 'original sound - layer.by.layer', 'synth arpeggio'],
      fr: ['moteurs pas à pas (ASMR)', 'son original - layer.by.layer', 'arpège de synthé'],
    },
  },
  colorsorter: {
    name: { en: 'colour sorter', fr: 'trieuse de couleurs' },
    authors: ['@sort.bot', '@kick.sort', '@colour.line'],
    tags: ['#sorting #satisfying #machine', '#automation #colors', '#fyp #foryou'],
    captions: {
      en: ['red, blue, yellow, kick!', 'the timing is perfect', 'automation is beautiful', 'which bin fills first?'],
      fr: ['rouge, bleu, jaune, hop !', 'le timing est parfait', 'l’automatisation, c’est beau', 'quel bac se remplit en premier ?'],
    },
    sounds: {
      en: ['pneumatic kicks (original sound)', 'original sound - sort.bot', 'factory techno'],
      fr: ['pistons (son original)', 'son original - sort.bot', 'techno d’usine'],
    },
  },
  crayons: {
    name: { en: 'crayon factory', fr: 'usine de crayons' },
    authors: ['@crayon.factory', '@wax.pour', '@colour.batch'],
    tags: ['#howitsmade #crayons #factory', '#satisfying #colors', '#fyp #foryou'],
    captions: {
      en: ['pour, cool, eject, wrap', 'a new colour every batch', 'how crayons are made', 'the eject moment'],
      fr: ['verser, refroidir, éjecter, emballer', 'une nouvelle couleur à chaque fournée', 'comment on fabrique les crayons', 'le moment de l’éjection'],
    },
    sounds: {
      en: ['factory hum (original sound)', 'original sound - crayon.factory', 'documentary narrator'],
      fr: ['bourdonnement d’usine (son original)', 'son original - crayon.factory', 'narrateur de documentaire'],
    },
  },
  chipper: {
    name: { en: 'wood chipper', fr: 'broyeur à bois' },
    authors: ['@chip.it', '@yard.work', '@branch.muncher'],
    tags: ['#woodchipper #satisfying #yardwork', '#mulch #asmr', '#fyp #foryou'],
    captions: {
      en: ['branches in, chips out', 'the pile keeps growing', 'yard work therapy', 'it eats everything'],
      fr: ['des branches entrent, des copeaux sortent', 'le tas continue de grandir', 'thérapie du jardinage', 'il mange tout'],
    },
    sounds: {
      en: ['chipper roar (original sound)', 'original sound - chip.it', 'heavy machinery'],
      fr: ['rugissement du broyeur (son original)', 'son original - chip.it', 'machines lourdes'],
    },
  },
  shredder: {
    name: { en: 'paper shredder', fr: 'déchiqueteuse' },
    authors: ['@shred.it', '@office.asmr', '@paper.strips'],
    tags: ['#shredder #office #satisfying', '#asmr #paper', '#fyp #foryou'],
    captions: {
      en: ['shredding my to-do list', 'evidence? what evidence', 'the strips falling...', 'office ASMR'],
      fr: ['je déchiquette ma to-do list', 'des preuves ? quelles preuves', 'les lamelles qui tombent...', 'ASMR de bureau'],
    },
    sounds: {
      en: ['shredder (ASMR)', 'original sound - shred.it', 'office lofi'],
      fr: ['déchiqueteuse (ASMR)', 'son original - shred.it', 'lofi de bureau'],
    },
  },
  gacha: {
    name: { en: 'gacha machine', fr: 'machine gacha' },
    authors: ['@gacha.pull', '@capsule.toy', '@rare.drop'],
    tags: ['#gacha #capsuletoy #japan', '#unboxing #rare', '#fyp #foryou'],
    captions: {
      en: ['what’s inside?', 'RARE!!!', 'one more pull', 'capsule toy addiction'],
      fr: ['qu’est-ce qu’il y a dedans ?', 'RARE !!!', 'encore un tirage', 'accro aux capsules'],
    },
    sounds: {
      en: ['knob turn and pop (original sound)', 'original sound - gacha.pull', 'J-pop jingle'],
      fr: ['molette et pop (son original)', 'son original - gacha.pull', 'jingle J-pop'],
    },
  },
  robotarm: {
    name: { en: 'robot arm', fr: 'bras robot' },
    authors: ['@robot.arm', '@pick.and.place', '@pallet.stack'],
    tags: ['#robotics #automation #satisfying', '#robotarm #factory', '#fyp #foryou'],
    captions: {
      en: ['pick, swing, stack', 'never tired, never late', 'the stack is perfect', 'automation goes brrr'],
      fr: ['attrape, pivote, empile', 'jamais fatigué, jamais en retard', 'la pile est parfaite', 'l’automatisation fait brrr'],
    },
    sounds: {
      en: ['servo whirr (original sound)', 'original sound - robot.arm', 'robotic beat'],
      fr: ['servomoteurs (son original)', 'son original - robot.arm', 'beat robotique'],
    },
  },
  pinart: {
    name: { en: 'pin art', fr: 'écran d’épingles' },
    authors: ['@pin.press', '@pin.art', '@desk.toy'],
    tags: ['#pinart #desktoy #satisfying', '#nostalgia #asmr', '#fyp #foryou'],
    captions: {
      en: ['hand, heart, face', 'the desk toy everyone had', 'push through, pull back', 'oddly satisfying'],
      fr: ['main, cœur, visage', 'le jouet de bureau que tout le monde avait', 'on enfonce, on retire', 'étrangement satisfaisant'],
    },
    sounds: {
      en: ['pins sliding (ASMR)', 'original sound - pin.press', 'calm lofi'],
      fr: ['épingles qui glissent (ASMR)', 'son original - pin.press', 'lofi calme'],
    },
  },
  warehouse: {
    name: { en: 'warehouse robots', fr: 'robots d’entrepôt' },
    authors: ['@warehouse.bots', '@shelf.movers', '@order.picked'],
    tags: ['#warehouse #robots #automation', '#logistics #satisfying', '#fyp #foryou'],
    captions: {
      en: ['the shelves come to you', 'your order, picked by robots', 'they never crash (almost)', 'logistics are mesmerising'],
      fr: ['ce sont les étagères qui viennent à toi', 'ta commande, préparée par des robots', 'ils ne se rentrent jamais dedans (presque)', 'la logistique, c’est hypnotique'],
    },
    sounds: {
      en: ['robot beeps (original sound)', 'original sound - warehouse.bots', 'minimal techno'],
      fr: ['bips de robots (son original)', 'son original - warehouse.bots', 'techno minimale'],
    },
  },
} satisfies Record<string, Entry>
