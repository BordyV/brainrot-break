import type { Entry } from '../i18n'

// Seasons, holidays & spooky: names, authors, tags, captions and sounds.

export const SEASONS = {
  pumpkins: {
    name: { en: 'pumpkin patch', fr: 'champ de citrouilles' },
    authors: ['@pumpkin.patch', '@jack.o.glow', '@spooky.season'],
    tags: ['#halloween #pumpkins #spookyseason', '#autumn #cozy', '#fyp #foryou'],
    captions: {
      en: ['they light up one by one...', 'spooky season is here', 'which face is your favourite?', 'carving night done right'],
      fr: ['elles s’allument une par une...', 'la saison qui fait peur est là', 'quelle tête tu préfères ?', 'soirée sculpture réussie'],
    },
    sounds: {
      en: ['crickets at night (original sound)', 'original sound - pumpkin.patch', 'spooky music box'],
      fr: ['grillons la nuit (son original)', 'son original - pumpkin.patch', 'boîte à musique qui fait peur'],
    },
  },
  haunted: {
    name: { en: 'haunted house', fr: 'maison hantée' },
    authors: ['@haunted.manor', '@ghost.windows', '@boo.crew'],
    tags: ['#haunted #ghost #halloween', '#spooky #cute', '#fyp #foryou'],
    captions: {
      en: ['did you see that window?', 'someone is home...', 'count the ghosts', 'would you spend a night here?'],
      fr: ['t’as vu cette fenêtre ?', 'il y a quelqu’un...', 'compte les fantômes', 'tu passerais une nuit ici ?'],
    },
    sounds: {
      en: ['creaky door (original sound)', 'original sound - haunted.manor', 'theremin ghost song'],
      fr: ['porte qui grince (son original)', 'son original - haunted.manor', 'chanson de fantôme au thérémine'],
    },
  },
  xmaslights: {
    name: { en: 'Christmas lights', fr: 'guirlande de Noël' },
    authors: ['@xmas.tree.lights', '@deck.the.halls', '@twinkle.mode'],
    tags: ['#christmas #lights #cozy', '#christmastree #holidays', '#fyp #foryou'],
    captions: {
      en: ['which mode is the best?', 'the twinkle mode hits different', 'it’s beginning to look a lot like...', 'lights on, heating on'],
      fr: ['quel mode est le meilleur ?', 'le mode scintillant, c’est autre chose', 'ça commence à sentir Noël', 'guirlande allumée, chauffage allumé'],
    },
    sounds: {
      en: ['sleigh bells (original sound)', 'original sound - xmas.tree.lights', 'lofi Christmas'],
      fr: ['grelots (son original)', 'son original - xmas.tree.lights', 'Noël en lofi'],
    },
  },
  sleigh: {
    name: { en: 'sleigh across the moon', fr: 'traîneau devant la lune' },
    authors: ['@night.sleigh', '@north.pole.radar', '@moon.crossing'],
    tags: ['#christmas #sleigh #magic', '#christmaseve #cozy', '#fyp #foryou'],
    captions: {
      en: ['caught on camera on Christmas Eve', 'look up!', 'right on schedule', 'the red nose leads the way'],
      fr: ['filmé le soir de Noël', 'regarde en l’air !', 'pile à l’heure', 'le nez rouge montre le chemin'],
    },
    sounds: {
      en: ['jingle bells far away (original sound)', 'original sound - night.sleigh', 'magical orchestra'],
      fr: ['grelots au loin (son original)', 'son original - night.sleigh', 'orchestre magique'],
    },
  },
  unwrap: {
    name: { en: 'unwrapping', fr: 'déballage' },
    authors: ['@gift.reveal', '@unboxing.joy', '@whats.inside'],
    tags: ['#unboxing #gift #surprise', '#christmas #birthday', '#fyp #foryou'],
    captions: {
      en: ['guess what’s inside', 'shake shake shake... POP', 'exactly what I wanted', 'the reveal!'],
      fr: ['devine ce qu’il y a dedans', 'secoue secoue secoue... POP', 'exactement ce que je voulais', 'la révélation !'],
    },
    sounds: {
      en: ['paper rustle (ASMR)', 'original sound - gift.reveal', 'surprise fanfare'],
      fr: ['papier froissé (ASMR)', 'son original - gift.reveal', 'fanfare surprise'],
    },
  },
  balldrop: {
    name: { en: 'New Year’s ball drop', fr: 'compte à rebours du Nouvel An' },
    authors: ['@countdown.night', '@ball.drop', '@happy.new.year'],
    tags: ['#newyear #countdown #fireworks', '#nye #party', '#fyp #foryou'],
    captions: {
      en: ['10... 9... 8...', 'make a wish!', 'new year, same feed', 'who are you kissing at midnight?'],
      fr: ['10... 9... 8...', 'fais un vœu !', 'nouvelle année, même feed', 'tu fais la bise à qui à minuit ?'],
    },
    sounds: {
      en: ['crowd countdown (original sound)', 'original sound - countdown.night', 'Auld Lang Syne'],
      fr: ['compte à rebours de la foule (son original)', 'son original - countdown.night', 'Ce n’est qu’un au revoir'],
    },
  },
  dragondance: {
    name: { en: 'dragon dance', fr: 'danse du dragon' },
    authors: ['@dragon.dance', '@lunar.parade', '@lantern.street'],
    tags: ['#lunarnewyear #dragondance #festival', '#parade #culture', '#fyp #foryou'],
    captions: {
      en: ['the dragon weaves down the street', 'firecrackers everywhere!', 'lunar new year parade', 'count the dancers'],
      fr: ['le dragon serpente dans la rue', 'des pétards partout !', 'défilé du Nouvel An lunaire', 'compte les danseurs'],
    },
    sounds: {
      en: ['drums and cymbals (original sound)', 'original sound - dragon.dance', 'firecracker pops'],
      fr: ['tambours et cymbales (son original)', 'son original - dragon.dance', 'pétards qui claquent'],
    },
  },
  snowman: {
    name: { en: 'snowman', fr: 'bonhomme de neige' },
    authors: ['@snowman.day', '@frosty.build', '@roll.the.snow'],
    tags: ['#snowman #winter #snowday', '#cozy #kids', '#fyp #foryou'],
    captions: {
      en: ['roll, roll, stack', 'the hat makes it', 'he waved at me!', 'and then spring came'],
      fr: ['on roule, on roule, on empile', 'c’est le chapeau qui fait tout', 'il m’a fait coucou !', 'et puis le printemps est arrivé'],
    },
    sounds: {
      en: ['crunchy snow (ASMR)', 'original sound - snowman.day', 'winter wonderland (lofi)'],
      fr: ['neige qui craque (ASMR)', 'son original - snowman.day', 'paysage d’hiver (lofi)'],
    },
  },
  blossoms: {
    name: { en: 'cherry blossoms', fr: 'cerisiers en fleurs' },
    authors: ['@sakura.lane', '@petal.rain', '@spring.walk'],
    tags: ['#sakura #cherryblossom #spring', '#aesthetic #calm', '#fyp #foryou'],
    captions: {
      en: ['wait for the gust of wind', 'petal rain', 'spring in one clip', 'the path turns pink'],
      fr: ['attends le coup de vent', 'une pluie de pétales', 'le printemps en une vidéo', 'le chemin devient rose'],
    },
    sounds: {
      en: ['soft breeze (original sound)', 'original sound - sakura.lane', 'koto and piano'],
      fr: ['brise légère (son original)', 'son original - sakura.lane', 'koto et piano'],
    },
  },
  cauldron: {
    name: { en: 'witch’s cauldron', fr: 'chaudron de sorcière' },
    authors: ['@bubble.brew', '@witchy.vibes', '@potion.class'],
    tags: ['#witch #halloween #potion', '#witchy #cozy', '#fyp #foryou'],
    captions: {
      en: ['what is she brewing?', 'the colour keeps changing', 'look at the moon...', 'double, double, bubble'],
      fr: ['qu’est-ce qu’elle prépare ?', 'la couleur n’arrête pas de changer', 'regarde la lune...', 'ça bout, ça bout, ça bulle'],
    },
    sounds: {
      en: ['bubbling brew (ASMR)', 'original sound - bubble.brew', 'witchy waltz'],
      fr: ['potion qui bout (ASMR)', 'son original - bubble.brew', 'valse de sorcière'],
    },
  },
  bats: {
    name: { en: 'bats at dusk', fr: 'chauves-souris au crépuscule' },
    authors: ['@bat.cave', '@dusk.flight', '@night.shift'],
    tags: ['#bats #nature #dusk', '#wildlife #spooky', '#fyp #foryou'],
    captions: {
      en: ['thousands leave the cave at sunset', 'a river of bats', 'night shift starts now', 'they eat the mosquitoes, be nice'],
      fr: ['des milliers sortent de la grotte au coucher du soleil', 'une rivière de chauves-souris', 'l’équipe de nuit commence', 'elles mangent les moustiques, sois sympa'],
    },
    sounds: {
      en: ['flapping wings (original sound)', 'original sound - bat.cave', 'documentary strings'],
      fr: ['battements d’ailes (son original)', 'son original - bat.cave', 'cordes de documentaire'],
    },
  },
  spiderweb: {
    name: { en: 'spider web', fr: 'toile d’araignée' },
    authors: ['@web.weaver', '@orb.spider', '@silk.engineer'],
    tags: ['#spider #nature #satisfying', '#web #engineering', '#fyp #foryou'],
    captions: {
      en: ['spokes first, then the spiral', 'nature’s engineer', 'one night of work', 'the dew at the end!'],
      fr: ['les rayons d’abord, puis la spirale', 'l’ingénieure de la nature', 'une nuit de travail', 'la rosée à la fin !'],
    },
    sounds: {
      en: ['garden at night (original sound)', 'original sound - web.weaver', 'calm documentary'],
      fr: ['jardin la nuit (son original)', 'son original - web.weaver', 'documentaire calme'],
    },
  },
  pinata: {
    name: { en: 'piñata', fr: 'piñata' },
    authors: ['@pinata.party', '@candy.rain', '@one.more.hit'],
    tags: ['#pinata #party #birthday', '#candy #satisfying', '#fyp #foryou'],
    captions: {
      en: ['one more hit...', 'CANDY RAIN', 'blindfolded and determined', 'how many hits will it take?'],
      fr: ['encore un coup...', 'PLUIE DE BONBONS', 'les yeux bandés mais déterminé', 'combien de coups il faudra ?'],
    },
    sounds: {
      en: ['party crowd (original sound)', 'original sound - pinata.party', 'birthday cumbia'],
      fr: ['foule en fête (son original)', 'son original - pinata.party', 'cumbia d’anniversaire'],
    },
  },
  leafpile: {
    name: { en: 'leaf pile', fr: 'tas de feuilles' },
    authors: ['@leaf.jump', '@autumn.kid', '@rake.it.again'],
    tags: ['#autumn #leaves #fall', '#childhood #cozy', '#fyp #foryou'],
    captions: {
      en: ['an hour of raking, gone in a second', 'worth it', 'autumn core memory', 'jump in!'],
      fr: ['une heure de ratissage, envolée en une seconde', 'ça valait le coup', 'souvenir d’automne', 'saute dedans !'],
    },
    sounds: {
      en: ['crunchy leaves (ASMR)', 'original sound - leaf.jump', 'autumn acoustic'],
      fr: ['feuilles qui craquent (ASMR)', 'son original - leaf.jump', 'acoustique d’automne'],
    },
  },
} satisfies Record<string, Entry>
