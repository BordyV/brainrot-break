import type { Entry } from '../i18n'

// Food & cooking: names, authors, tags, captions and sounds.

export const FOOD = {
  pancakes: {
    name: { en: 'pancake flip', fr: 'crêpes qui sautent' },
    authors: ['@pancake.flip', '@sunday.stack', '@brunch.club'],
    tags: ['#pancakes #breakfast #foodtok', '#flip #satisfying', '#brunch #fyp'],
    captions: {
      en: ['the flip is everything', 'stack goals', 'wait for the syrup', 'sunday morning ritual'],
      fr: ['tout est dans le saut', 'objectif pile parfaite', 'attends le sirop', 'le rituel du dimanche matin'],
    },
    sounds: {
      en: ['sizzle (ASMR)', 'original sound - pancake.flip', 'jazzy brunch'],
      fr: ['grésillement (ASMR)', 'son original - pancake.flip', 'brunch jazzy'],
    },
  },
  ramen: {
    name: { en: 'ramen pull', fr: 'ramen' },
    authors: ['@ramen.lift', '@noodle.pull', '@broth.boss'],
    tags: ['#ramen #noodles #foodtok', '#japanesefood #asmr', '#foodie #fyp'],
    captions: {
      en: ['the noodle lift', 'steam, egg, broth, perfection', 'slurp it like you mean it', 'midnight ramen hits different'],
      fr: ['la levée de nouilles', 'vapeur, œuf, bouillon, perfection', 'aspire comme tu le penses', 'les ramen de minuit, ça a un truc'],
    },
    sounds: {
      en: ['slurp (ASMR)', 'original sound - ramen.lift', 'lofi Tokyo'],
      fr: ['slurp (ASMR)', 'son original - ramen.lift', 'lofi Tokyo'],
    },
  },
  pizza: {
    name: { en: 'pizza toppings', fr: 'garniture de pizza' },
    authors: ['@pizza.spin', '@topping.rain', '@slice.life'],
    tags: ['#pizza #foodtok #satisfying', '#homemade #cheese', '#foodie #fyp'],
    captions: {
      en: ['sauce, cheese, pepperoni, repeat', 'the cheese pull at the end', 'pineapple? no.', 'Friday night pizza'],
      fr: ['sauce, fromage, pepperoni, on recommence', 'le fromage qui file à la fin', 'de l’ananas ? non.', 'pizza du vendredi soir'],
    },
    sounds: {
      en: ['That’s Amore (8-bit)', 'original sound - pizza.spin', 'Italian kitchen'],
      fr: ['That’s Amore (8 bits)', 'son original - pizza.spin', 'cuisine italienne'],
    },
  },
  popcorn: {
    name: { en: 'popcorn', fr: 'pop-corn' },
    authors: ['@pop.pop.pop', '@movie.night', '@kernel.chaos'],
    tags: ['#popcorn #movienight #satisfying', '#asmr #snack', '#foodtok #fyp'],
    captions: {
      en: ['wait for the lid', 'pop... pop... POPOPOPOP', 'it overflowed again', 'movie night prep'],
      fr: ['attends le couvercle', 'pop... pop... POPOPOPOP', 'ça a encore débordé', 'préparation soirée film'],
    },
    sounds: {
      en: ['popping (ASMR)', 'original sound - pop.pop.pop', 'cinema intro'],
      fr: ['ça pop (ASMR)', 'son original - pop.pop.pop', 'intro de cinéma'],
    },
  },
  sushi: {
    name: { en: 'sushi conveyor', fr: 'sushi sur tapis' },
    authors: ['@kaiten.sushi', '@plate.stack', '@salmon.lover'],
    tags: ['#sushi #japan #foodtok', '#conveyor #kaitensushi', '#foodie #fyp'],
    captions: {
      en: ['count the plates', 'always the salmon one', 'the stack keeps growing', 'conveyor belt therapy'],
      fr: ['compte les assiettes', 'toujours celle au saumon', 'la pile continue de monter', 'thérapie par tapis roulant'],
    },
    sounds: {
      en: ['restaurant ambience (original sound)', 'original sound - kaiten.sushi', 'city pop'],
      fr: ['ambiance resto (son original)', 'son original - kaiten.sushi', 'city pop'],
    },
  },
  burger: {
    name: { en: 'burger stack', fr: 'burger géant' },
    authors: ['@burger.tower', '@stack.it', '@too.tall'],
    tags: ['#burger #foodtok #challenge', '#stack #cheese', '#foodie #fyp'],
    captions: {
      en: ['how tall can it go?', 'the wobble...', 'top bun = it falls', 'nobody can eat this'],
      fr: ['jusqu’où ça peut monter ?', 'ça vacille...', 'pain du dessus = ça tombe', 'personne ne peut manger ça'],
    },
    sounds: {
      en: ['plop plop (original sound)', 'original sound - burger.tower', 'suspense drums'],
      fr: ['plop plop (son original)', 'son original - burger.tower', 'tambours de suspense'],
    },
  },
  cake: {
    name: { en: 'cake frosting', fr: 'glaçage de gâteau' },
    authors: ['@cake.spin', '@smooth.frost', '@baker.daily'],
    tags: ['#cakedecorating #satisfying #baking', '#frosting #smooth', '#cake #fyp'],
    captions: {
      en: ['rough → smooth', 'the turntable is the secret', 'sprinkles at the end', 'baker’s favourite part'],
      fr: ['rugueux → lisse', 'le secret c’est le plateau tournant', 'les vermicelles à la fin', 'le moment préféré du pâtissier'],
    },
    sounds: {
      en: ['spatula scrape (ASMR)', 'original sound - cake.spin', 'sweet piano'],
      fr: ['spatule qui lisse (ASMR)', 'son original - cake.spin', 'piano tout doux'],
    },
  },
  egg: {
    name: { en: 'frying an egg', fr: 'œuf au plat' },
    authors: ['@sunny.side', '@crispy.edges', '@egg.daily'],
    tags: ['#egg #breakfast #asmr', '#cooking #crispy', '#foodtok #fyp'],
    captions: {
      en: ['crispy edges are non-negotiable', 'crack, sizzle, perfect', 'the yolk wobble', 'breakfast in 20 seconds'],
      fr: ['les bords croustillants, non négociable', 'on casse, ça grésille, parfait', 'le jaune qui tremblote', 'petit-déj en 20 secondes'],
    },
    sounds: {
      en: ['sizzle (ASMR)', 'original sound - sunny.side', 'morning radio'],
      fr: ['grésillement (ASMR)', 'son original - sunny.side', 'radio du matin'],
    },
  },
  boba: {
    name: { en: 'bubble tea', fr: 'bubble tea' },
    authors: ['@boba.time', '@pearl.drop', '@milk.tea'],
    tags: ['#bubbletea #boba #drinks', '#milktea #asmr', '#foodtok #fyp'],
    captions: {
      en: ['pearls first, always', 'the straw stab', 'watch the pearls get sucked up', 'boba run?'],
      fr: ['les perles d’abord, toujours', 'le coup de paille', 'regarde les perles remonter', 'on va chercher un boba ?'],
    },
    sounds: {
      en: ['straw slurp (ASMR)', 'original sound - boba.time', 'kawaii pop'],
      fr: ['paille qui aspire (ASMR)', 'son original - boba.time', 'pop kawaii'],
    },
  },
  fruitboard: {
    name: { en: 'fruit slices', fr: 'fruits en tranches' },
    authors: ['@knife.skills', '@fruit.prep', '@chop.chop'],
    tags: ['#knifeskills #fruit #asmr', '#mealprep #satisfying', '#foodtok #fyp'],
    captions: {
      en: ['strawberry, kiwi, orange, lemon', 'perfect slices every time', 'chop chop chop', 'meal prep but make it pretty'],
      fr: ['fraise, kiwi, orange, citron', 'des tranches parfaites à chaque fois', 'tchac tchac tchac', 'meal prep mais joli'],
    },
    sounds: {
      en: ['chopping (ASMR)', 'original sound - knife.skills', 'kitchen beats'],
      fr: ['ça coupe (ASMR)', 'son original - knife.skills', 'beats de cuisine'],
    },
  },
  glaze: {
    name: { en: 'donut glazing', fr: 'donuts glacés' },
    authors: ['@glaze.waterfall', '@donut.factory', '@sweet.line'],
    tags: ['#donuts #factory #satisfying', '#glaze #howitsmade', '#foodtok #fyp'],
    captions: {
      en: ['the glaze waterfall', 'factory donuts hit different', 'sprinkles on the way out', 'I could watch this forever'],
      fr: ['la cascade de glaçage', 'les donuts d’usine, ça a un truc', 'les vermicelles à la sortie', 'je pourrais regarder ça toute la journée'],
    },
    sounds: {
      en: ['factory hum (original sound)', 'original sound - glaze.waterfall', 'sweet synth'],
      fr: ['bourdonnement d’usine (son original)', 'son original - glaze.waterfall', 'synthé sucré'],
    },
  },
  smashburger: {
    name: { en: 'smash burger', fr: 'smash burger' },
    authors: ['@smash.it', '@griddle.king', '@crust.club'],
    tags: ['#smashburger #griddle #foodtok', '#burger #asmr', '#bbq #fyp'],
    captions: {
      en: ['SMASH', 'that crust though', 'cheese melt at the end', 'griddle season'],
      fr: ['SMASH', 'cette croûte quand même', 'le fromage qui fond à la fin', 'saison de la plancha'],
    },
    sounds: {
      en: ['loud sizzle (ASMR)', 'original sound - smash.it', 'rock guitar riff'],
      fr: ['gros grésillement (ASMR)', 'son original - smash.it', 'riff de guitare rock'],
    },
  },
  cottoncandy: {
    name: { en: 'cotton candy', fr: 'barbe à papa' },
    authors: ['@cotton.cloud', '@fair.sweets', '@sugar.spin'],
    tags: ['#cottoncandy #fair #satisfying', '#sweets #pink', '#foodtok #fyp'],
    captions: {
      en: ['sugar turns into a cloud', 'funfair memories', 'pink or blue?', 'it keeps growing'],
      fr: ['le sucre devient un nuage', 'souvenirs de fête foraine', 'rose ou bleue ?', 'elle grossit encore et encore'],
    },
    sounds: {
      en: ['machine whirr (original sound)', 'original sound - cotton.cloud', 'carnival organ'],
      fr: ['machine qui tourne (son original)', 'son original - cotton.cloud', 'orgue de fête foraine'],
    },
  },
  icecream: {
    name: { en: 'ice cream tower', fr: 'tour de glace' },
    authors: ['@scoop.tower', '@gelato.stack', '@brain.freeze'],
    tags: ['#icecream #challenge #summer', '#scoops #funny', '#foodtok #fyp'],
    captions: {
      en: ['one more scoop...', 'the lean is real', 'how many before it falls?', 'summer in one picture'],
      fr: ['encore une boule...', 'ça penche vraiment', 'combien avant que ça tombe ?', 'l’été en une image'],
    },
    sounds: {
      en: ['ice cream truck (original sound)', 'original sound - scoop.tower', 'summer pop'],
      fr: ['camion de glaces (son original)', 'son original - scoop.tower', 'pop d’été'],
    },
  },
  watermelon: {
    name: { en: 'watermelon bands', fr: 'pastèque aux élastiques' },
    authors: ['@band.pop', '@melon.burst', '@slowmo.guys'],
    tags: ['#watermelon #challenge #explosion', '#rubberbands #satisfying', '#fyp #foryou'],
    captions: {
      en: ['how many bands to burst it?', 'comment your guess', 'it’s shaking...', 'the burst!!!'],
      fr: ['combien d’élastiques pour la faire exploser ?', 'mets ton pronostic en commentaire', 'elle tremble...', 'l’explosion !!!'],
    },
    sounds: {
      en: ['tension (original sound)', 'original sound - band.pop', 'slow-mo boom'],
      fr: ['tension (son original)', 'son original - band.pop', 'boum au ralenti'],
    },
  },
  mochi: {
    name: { en: 'mochi pounding', fr: 'pilage de mochi' },
    authors: ['@mochi.pounding', '@rice.and.mallet', '@fast.hands.mochi'],
    tags: ['#mochi #japan #streetfood', '#mochipounding #satisfying', '#fyp #foryou'],
    captions: {
      en: ['his hand is in there between every hit', 'it keeps getting faster', 'the rhythm is hypnotic', 'trust level: mochi maker'],
      fr: ['sa main passe entre chaque coup', 'ça va de plus en plus vite', 'ce rythme est hypnotique', 'niveau de confiance : fabricant de mochi'],
    },
    sounds: {
      en: ['thud. thud. thud. (original sound)', 'original sound - mochi.pounding', 'taiko drums'],
      fr: ['boum. boum. boum. (son original)', 'son original - mochi.pounding', 'tambours taiko'],
    },
  },
  tanghulu: {
    name: { en: 'tanghulu', fr: 'tanghulu' },
    authors: ['@glass.candy.fruit', '@sugar.shell', '@tanghulu.crunch'],
    tags: ['#tanghulu #asmr #streetfood', '#candiedfruit #crunch', '#fyp #foryou'],
    captions: {
      en: ['wait for the crunch', 'the sugar turns to glass', 'strawberry or grape?', 'this sound lives in my head'],
      fr: ['attends le croquant', 'le sucre devient du verre', 'fraise ou raisin ?', 'ce bruit vit dans ma tête'],
    },
    sounds: {
      en: ['glass sugar crunch asmr', 'original sound - glass.candy.fruit', 'night market ambience'],
      fr: ['croquant de sucre asmr', 'son original - glass.candy.fruit', 'ambiance de marché de nuit'],
    },
  },
} satisfies Record<string, Entry>
