import type { Entry } from '../i18n'

// Animals & pets: names, authors, tags, captions and sounds.

export const ANIMALS = {
  chat: {
    name: { en: 'sleeping cat', fr: 'chat qui dort' },
    authors: ['@sleepy.cat', '@lazy.kitty', '@purr.official'],
    tags: ['#cat #sleepy #cute', '#catsoftiktok #cozy', '#chill #fyp'],
    captions: {
      en: ['don\'t wake him up', 'he\'s been asleep since 2pm', 'the purr is real', 'mood of the day'],
      fr: ['ne le réveillez pas', 'il dort depuis 14h', 'le ronron est réel', 'mood de la journée'],
    },
    sounds: {
      en: ['purring (original sound)', 'lofi lullaby', 'rain on the window'],
      fr: ['ronronnement (son original)', 'berceuse lofi', 'pluie sur la fenêtre'],
    },
  },
  catglass: {
    name: { en: 'cat vs glass', fr: 'le chat et le verre' },
    authors: ['@chaos.cat', '@gravity.tester', '@not.my.fault'],
    tags: ['#cat #cattok #funny', '#catsoftiktok #chaos', '#fyp #foryou'],
    captions: {
      en: ['she looked me in the eyes and did it', 'gravity check: still works', 'wait for it...', 'every cat owner knows this'],
      fr: ['elle m’a regardé dans les yeux et elle l’a fait', 'test de gravité : ça marche toujours', 'attends...', 'tous les proprios de chats connaissent'],
    },
    sounds: {
      en: ['glass shatter (original sound)', 'original sound - chaos.cat', 'Mission Impossible theme'],
      fr: ['verre brisé (son original)', 'son original - chaos.cat', 'thème de Mission Impossible'],
    },
  },
  zoomies: {
    name: { en: 'dog zoomies', fr: 'chien qui fait des zoomies' },
    authors: ['@zoomies.daily', '@good.boy', '@backyard.laps'],
    tags: ['#zoomies #dog #dogsoftiktok', '#funny #puppy', '#fyp #foryou'],
    captions: {
      en: ['3am zoomies energy', 'lap 47, still going', 'the flop at the end', 'he saw a leaf'],
      fr: ['énergie zoomies de 3h du mat', 'tour 47, il continue', 'l’effondrement à la fin', 'il a vu une feuille'],
    },
    sounds: {
      en: ['Benny Hill theme', 'original sound - zoomies.daily', 'Tokyo drift'],
      fr: ['thème de Benny Hill', 'son original - zoomies.daily', 'Tokyo drift'],
    },
  },
  capybara: {
    name: { en: 'capybara spa', fr: 'capybara au spa' },
    authors: ['@capy.bara', '@onsen.capy', '@chill.rodent'],
    tags: ['#capybara #chill #cute', '#onsen #okipullup', '#fyp #foryou'],
    captions: {
      en: ['ok I pull up', 'orange on head, zero thoughts', 'be like the capybara', 'snow outside, hot spring inside'],
      fr: ['ok I pull up', 'une orange sur la tête, zéro pensée', 'sois comme le capybara', 'neige dehors, source chaude dedans'],
    },
    sounds: {
      en: ['After Party - Don Toliver (sped up)', 'original sound - capy.bara', 'hot spring ambience'],
      fr: ['After Party - Don Toliver (sped up)', 'son original - capy.bara', 'ambiance source chaude'],
    },
  },
  ducklings: {
    name: { en: 'ducklings', fr: 'canetons' },
    authors: ['@duck.parade', '@mama.duck', '@follow.the.leader'],
    tags: ['#ducklings #cute #nature', '#duck #wholesome', '#fyp #foryou'],
    captions: {
      en: ['one of them got distracted', 'the little panic run back', 'mama duck parade', 'count them: all there?'],
      fr: ['un s’est laissé distraire', 'le petit sprint paniqué pour revenir', 'la parade de maman cane', 'compte-les : ils y sont tous ?'],
    },
    sounds: {
      en: ['peep peep (original sound)', 'original sound - duck.parade', 'march of the toys'],
      fr: ['piou piou (son original)', 'son original - duck.parade', 'marche des jouets'],
    },
  },
  frog: {
    name: { en: 'frog and flies', fr: 'grenouille et mouches' },
    authors: ['@frog.pond', '@tongue.speed', '@lily.pad'],
    tags: ['#frog #nature #pond', '#frogtok #cute', '#fyp #foryou'],
    captions: {
      en: ['the tongue is faster than you think', 'count the flies', 'lily pad hop', 'pond life, 24/7'],
      fr: ['la langue est plus rapide que tu crois', 'compte les mouches', 'saut de nénuphar', 'la vie de la mare, 24/7'],
    },
    sounds: {
      en: ['ribbit (original sound)', 'original sound - frog.pond', 'pond ambience at dusk'],
      fr: ['croâ (son original)', 'son original - frog.pond', 'ambiance de mare au crépuscule'],
    },
  },
  hamster: {
    name: { en: 'hamster wheel', fr: 'roue de hamster' },
    authors: ['@hammy.wheel', '@tiny.runner', '@cage.cardio'],
    tags: ['#hamster #funny #pets', '#hamsterwheel #cardio', '#fyp #foryou'],
    captions: {
      en: ['he went too fast', 'full loop!!!', 'the dizzy part at the end', 'gym motivation'],
      fr: ['il est allé trop vite', 'tour complet !!!', 'le moment où il a la tête qui tourne', 'motivation salle de sport'],
    },
    sounds: {
      en: ['squeaky wheel (original sound)', 'original sound - hammy.wheel', 'Eye of the Tiger'],
      fr: ['roue qui grince (son original)', 'son original - hammy.wheel', 'Eye of the Tiger'],
    },
  },
  penguins: {
    name: { en: 'penguin slide', fr: 'glissade de pingouins' },
    authors: ['@penguin.slide', '@ice.waddle', '@belly.sled'],
    tags: ['#penguin #cute #nature', '#penguins #slide', '#fyp #foryou'],
    captions: {
      en: ['waddle, waddle... SLIDE', 'belly sledding is faster', 'one by one into the sea', 'the waddle is the best part'],
      fr: ['dandine, dandine... GLISSADE', 'la luge sur le ventre, c’est plus rapide', 'un par un dans la mer', 'la démarche, c’est le meilleur'],
    },
    sounds: {
      en: ['wheee (original sound)', 'original sound - penguin.slide', 'ice skating waltz'],
      fr: ['wiii (son original)', 'son original - penguin.slide', 'valse de patinage'],
    },
  },
  corgi: {
    name: { en: 'corgi walk', fr: 'balade de corgi' },
    authors: ['@corgi.butt', '@loaf.walk', '@fluffy.trot'],
    tags: ['#corgi #dog #cute', '#corgibutt #dogsoftiktok', '#fyp #foryou'],
    captions: {
      en: ['the walk away is everything', 'heart-shaped, I said what I said', 'he looked back!', 'zero legs, all fluff'],
      fr: ['la démarche de dos, c’est tout', 'en forme de cœur, je l’ai dit', 'il s’est retourné !', 'zéro pattes, que des poils'],
    },
    sounds: {
      en: ['bouncy walk (original sound)', 'original sound - corgi.butt', 'Pink Panther theme'],
      fr: ['démarche rebondissante (son original)', 'son original - corgi.butt', 'thème de la Panthère rose'],
    },
  },
  cucumber: {
    name: { en: 'cat vs cucumber', fr: 'chat contre concombre' },
    authors: ['@cucumber.prank', '@jump.scare', '@cat.reflexes'],
    tags: ['#cat #cucumber #funny', '#catprank #jumpscare', '#fyp #foryou'],
    captions: {
      en: ['the jump is unreal', 'it’s just a cucumber...', 'cat reflexes, slowed down', 'he will never forgive you'],
      fr: ['le saut est irréel', 'c’est juste un concombre...', 'les réflexes du chat, au ralenti', 'il ne te pardonnera jamais'],
    },
    sounds: {
      en: ['vine boom (original sound)', 'original sound - cucumber.prank', 'suspense violin'],
      fr: ['vine boom (son original)', 'son original - cucumber.prank', 'violon de suspense'],
    },
  },
  hippo: {
    name: { en: 'baby hippo', fr: 'bébé hippo' },
    authors: ['@baby.hippo', '@sassy.hippo', '@zoo.diaries'],
    tags: ['#babyhippo #cute #zoo', '#hippo #sassy', '#fyp #foryou'],
    captions: {
      en: ['small but full of opinions', 'the bite attempt lol', 'then she goes for a swim', 'my mood every Monday'],
      fr: ['petite mais pleine d’opinions', 'la tentative de morsure mdr', 'puis elle va nager', 'mon humeur tous les lundis'],
    },
    sounds: {
      en: ['tiny roar (original sound)', 'original sound - baby.hippo', 'cute chaos music'],
      fr: ['petit rugissement (son original)', 'son original - baby.hippo', 'musique de chaos mignon'],
    },
  },
  frisbee: {
    name: { en: 'frisbee dog', fr: 'chien frisbee' },
    authors: ['@frisbee.dog', '@air.border', '@catch.master'],
    tags: ['#dog #frisbee #athlete', '#bordercollie #catch', '#fyp #foryou'],
    captions: {
      en: ['the mid-air catch!', 'he lives for this', 'count the catches', 'better athlete than me'],
      fr: ['l’attrapé en plein vol !', 'il vit pour ça', 'compte les attrapés', 'meilleur athlète que moi'],
    },
    sounds: {
      en: ['good boy! (original sound)', 'original sound - frisbee.dog', 'sports anthem'],
      fr: ['bon chien ! (son original)', 'son original - frisbee.dog', 'hymne sportif'],
    },
  },
  feeder: {
    name: { en: 'bird feeder', fr: 'mangeoire' },
    authors: ['@feeder.cam', '@backyard.birds', '@squirrel.thief'],
    tags: ['#birdfeeder #birds #nature', '#squirrel #backyard', '#fyp #foryou'],
    captions: {
      en: ['live from the feeder cam', 'then the squirrel showed up', 'everyone left lol', 'birdwatching from the couch'],
      fr: ['en direct de la caméra de la mangeoire', 'puis l’écureuil est arrivé', 'tout le monde est parti mdr', 'observer les oiseaux depuis le canapé'],
    },
    sounds: {
      en: ['birdsong (original sound)', 'original sound - feeder.cam', 'morning garden'],
      fr: ['chants d’oiseaux (son original)', 'son original - feeder.cam', 'jardin au matin'],
    },
  },
  otters: {
    name: { en: 'otters', fr: 'loutres' },
    authors: ['@otter.love', '@hold.hands', '@kelp.float'],
    tags: ['#otters #cute #wholesome', '#seaotter #love', '#fyp #foryou'],
    captions: {
      en: ['they hold hands so they don’t drift apart', 'sunset float', 'the shell crack', 'relationship goals'],
      fr: ['ils se tiennent la main pour ne pas dériver', 'flottaison au coucher du soleil', 'le cassage de coquillage', 'objectif couple'],
    },
    sounds: {
      en: ['waves (original sound)', 'original sound - otter.love', 'romantic piano'],
      fr: ['vagues (son original)', 'son original - otter.love', 'piano romantique'],
    },
  },
  raccoon: {
    name: { en: 'raccoon raid', fr: 'raid de raton laveur' },
    authors: ['@trash.panda', '@night.raid', '@alley.bandit'],
    tags: ['#raccoon #trashpanda #funny', '#night #bandit', '#fyp #foryou'],
    captions: {
      en: ['trash panda heist', 'the light came on...', 'he got the pizza though', 'midnight snack run'],
      fr: ['le casse du raton laveur', 'la lumière s’est allumée...', 'mais il a eu la pizza', 'goûter de minuit'],
    },
    sounds: {
      en: ['sneaky music (original sound)', 'original sound - trash.panda', 'Pink Panther theme'],
      fr: ['musique d’espion (son original)', 'son original - trash.panda', 'thème de la Panthère rose'],
    },
  },
  leafcutter: {
    name: { en: 'leafcutter ants', fr: 'fourmis coupe-feuille' },
    authors: ['@leaf.cutter', '@ant.highway', '@tiny.farmers'],
    tags: ['#ants #nature #insects', '#leafcutter #teamwork', '#fyp #foryou'],
    captions: {
      en: ['the original delivery service', 'they carry 50x their weight', 'one dropped his leaf...', 'nature’s highway'],
      fr: ['le service de livraison originel', 'elles portent 50 fois leur poids', 'une a fait tomber sa feuille...', 'l’autoroute de la nature'],
    },
    sounds: {
      en: ['documentary narrator (original sound)', 'original sound - leaf.cutter', 'jungle ambience'],
      fr: ['narrateur de documentaire (son original)', 'son original - leaf.cutter', 'ambiance jungle'],
    },
  },
  octopus: {
    name: { en: 'octopus camouflage', fr: 'pieuvre caméléon' },
    authors: ['@octo.camo', '@reef.master', '@eight.arms'],
    tags: ['#octopus #ocean #nature', '#camouflage #marinelife', '#fyp #foryou'],
    captions: {
      en: ['watch it change colour', 'then the ink escape', 'the smartest animal in the sea?', 'now you see it...'],
      fr: ['regarde-la changer de couleur', 'puis la fuite à l’encre', 'l’animal le plus malin de la mer ?', 'tu la vois... et puis non'],
    },
    sounds: {
      en: ['underwater (original sound)', 'original sound - octo.camo', 'deep sea ambience'],
      fr: ['sous l’eau (son original)', 'son original - octo.camo', 'ambiance des abysses'],
    },
  },
  bees: {
    name: { en: 'bees', fr: 'abeilles' },
    authors: ['@bee.garden', '@pollen.run', '@hive.life'],
    tags: ['#bees #garden #nature', '#savethebees #flowers', '#fyp #foryou'],
    captions: {
      en: ['flower to flower to hive', 'they’re just doing their job', 'summer garden energy', 'bzzzz'],
      fr: ['de fleur en fleur puis la ruche', 'elles font juste leur travail', 'énergie jardin d’été', 'bzzzz'],
    },
    sounds: {
      en: ['buzzing (original sound)', 'original sound - bee.garden', 'Flight of the Bumblebee'],
      fr: ['bourdonnement (son original)', 'son original - bee.garden', 'Le Vol du bourdon'],
    },
  },
  squirrel: {
    name: { en: 'squirrel course', fr: 'parcours d’écureuil' },
    authors: ['@squirrel.ninja', '@backyard.course', '@nut.quest'],
    tags: ['#squirrel #obstaclecourse #funny', '#backyard #ninja', '#fyp #foryou'],
    captions: {
      en: ['squirrel ninja warrior', 'rope, wheel, jump, nut', 'he did it first try', 'built this course for him'],
      fr: ['ninja warrior version écureuil', 'corde, roue, saut, noisette', 'il l’a fait du premier coup', 'j’ai construit ce parcours pour lui'],
    },
    sounds: {
      en: ['Mission Impossible theme', 'original sound - squirrel.ninja', 'sports commentary'],
      fr: ['thème de Mission Impossible', 'son original - squirrel.ninja', 'commentaire sportif'],
    },
  },
} satisfies Record<string, Entry>
