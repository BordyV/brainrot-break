import type { Entry } from '../i18n'

// Versus & battles: names, authors, tags, captions and sounds.

export const VERSUS = {
  rps: {
    name: { en: 'rock paper scissors', fr: 'pierre feuille ciseaux' },
    authors: ['@rps.sim', '@rock.wins', '@scissors.gang'],
    tags: ['#rockpaperscissors #simulation #fyp', '#whowins #battle', '#satisfying #foryou'],
    captions: {
      en: ['pick a side before it ends', 'rock was winning... was', 'the comeback nobody expected', 'comment: rock, paper or scissors?'],
      fr: ['choisis ton camp avant la fin', 'la pierre gagnait... gagnait', 'la remontée que personne n’attendait', 'commente : pierre, feuille ou ciseaux ?'],
    },
    sounds: {
      en: ['battle drums (original sound)', 'original sound - rps.sim', 'epic orchestra'],
      fr: ['tambours de guerre (son original)', 'son original - rps.sim', 'orchestre épique'],
    },
  },
  flagballs: {
    name: { en: 'flag battle royale', fr: 'battle royale de drapeaux' },
    authors: ['@flag.royale', '@country.balls', '@last.flag'],
    tags: ['#flags #battleroyale #countries', '#whowins #simulation', '#fyp #foryou'],
    captions: {
      en: ['the circle keeps shrinking', 'which flag survives?', 'my country went out first', 'comment your flag'],
      fr: ['le cercle rétrécit sans arrêt', 'quel drapeau survit ?', 'mon pays est sorti en premier', 'mets ton drapeau en commentaire'],
    },
    sounds: {
      en: ['anthem mashup (original sound)', 'original sound - flag.royale', 'tension strings'],
      fr: ['mashup d’hymnes (son original)', 'son original - flag.royale', 'cordes de tension'],
    },
  },
  pongwars: {
    name: { en: 'pong wars', fr: 'pong wars' },
    authors: ['@pong.wars', '@day.vs.night', '@endless.battle'],
    tags: ['#pongwars #simulation #satisfying', '#dayvsnight #pixelart', '#fyp #foryou'],
    captions: {
      en: ['day vs night, forever', 'it never actually ends', 'team day or team night?', 'strangely calming war'],
      fr: ['le jour contre la nuit, pour toujours', 'ça ne finit jamais vraiment', 'team jour ou team nuit ?', 'une guerre étrangement apaisante'],
    },
    sounds: {
      en: ['soft blips (original sound)', 'original sound - pong.wars', 'ambient loop'],
      fr: ['petits blips (son original)', 'son original - pong.wars', 'boucle ambient'],
    },
  },
  antwar: {
    name: { en: 'ant colony war', fr: 'guerre de fourmis' },
    authors: ['@ant.colony', '@nest.wars', '@tiny.armies'],
    tags: ['#ants #antcolony #nature', '#simulation #war', '#fyp #foryou'],
    captions: {
      en: ['red ants vs black ants', 'more food, more ants', 'the battle for the green pile', 'nature documentary energy'],
      fr: ['fourmis rouges contre fourmis noires', 'plus de nourriture, plus de fourmis', 'la bataille pour le tas vert', 'ambiance documentaire animalier'],
    },
    sounds: {
      en: ['narrator voice (original sound)', 'original sound - ant.colony', 'documentary strings'],
      fr: ['voix de narrateur (son original)', 'son original - ant.colony', 'cordes de documentaire'],
    },
  },
  armies: {
    name: { en: 'red vs blue armies', fr: 'armées rouge contre bleue' },
    authors: ['@tiny.battles', '@red.vs.blue', '@war.sim'],
    tags: ['#battle #simulation #strategy', '#redvsblue #armies', '#fyp #foryou'],
    captions: {
      en: ['archers in the back, swords in front', 'the charge!', 'who wins this one?', 'medieval warfare in 32 pixels'],
      fr: ['archers derrière, épées devant', 'la charge !', 'qui gagne celle-là ?', 'guerre médiévale en 32 pixels'],
    },
    sounds: {
      en: ['war horn (original sound)', 'original sound - tiny.battles', 'epic choir'],
      fr: ['cor de guerre (son original)', 'son original - tiny.battles', 'chœur épique'],
    },
  },
  automata: {
    name: { en: 'colour spirals', fr: 'spirales de couleurs' },
    authors: ['@cyclic.ca', '@spiral.code', '@three.colours'],
    tags: ['#cellularautomata #generativeart #math', '#spirals #satisfying', '#fyp #foryou'],
    captions: {
      en: ['chaos turns into spirals', 'one tiny rule does all this', 'each colour eats the next', 'hypnotic, right?'],
      fr: ['le chaos devient des spirales', 'une toute petite règle fait tout ça', 'chaque couleur mange la suivante', 'hypnotisant non ?'],
    },
    sounds: {
      en: ['ambient pad (original sound)', 'original sound - cyclic.ca', 'deep focus'],
      fr: ['nappe ambient (son original)', 'son original - cyclic.ca', 'concentration profonde'],
    },
  },
  snakevs: {
    name: { en: 'snake vs snake', fr: 'serpent contre serpent' },
    authors: ['@snake.duel', '@two.snakes', '@apple.race'],
    tags: ['#snake #ai #battle', '#retrogaming #duel', '#fyp #foryou'],
    captions: {
      en: ['two bots, three apples', 'green or orange?', 'the head-on crash...', 'it trapped itself lol'],
      fr: ['deux bots, trois pommes', 'vert ou orange ?', 'le choc frontal...', 'il s’est piégé tout seul mdr'],
    },
    sounds: {
      en: ['8-bit chomp (original sound)', 'original sound - snake.duel', 'chiptune battle'],
      fr: ['croc 8 bits (son original)', 'son original - snake.duel', 'bataille chiptune'],
    },
  },
  stickduel: {
    name: { en: 'stick duel', fr: 'duel de bâtons' },
    authors: ['@stick.duel', '@sunset.fencing', '@en.garde'],
    tags: ['#stickman #duel #animation', '#fencing #sunset', '#fyp #foryou'],
    captions: {
      en: ['parry... riposte... OUT', 'first to fall off loses', 'the sunset makes it cinematic', 'stickman fights hit different'],
      fr: ['parade... riposte... DEHORS', 'le premier qui tombe a perdu', 'le coucher de soleil rend ça cinématique', 'les combats de bonhommes bâtons, ça a un truc'],
    },
    sounds: {
      en: ['sword clash (original sound)', 'original sound - stick.duel', 'samurai flute'],
      fr: ['choc d’épées (son original)', 'son original - stick.duel', 'flûte de samouraï'],
    },
  },
  bigfish: {
    name: { en: 'big fish', fr: 'gros poisson' },
    authors: ['@feeding.frenzy', '@small.fish', '@ocean.chain'],
    tags: ['#fish #ocean #game', '#feedingfrenzy #nostalgia', '#fyp #foryou'],
    captions: {
      en: ['eat smaller, avoid bigger', 'from snack to shark', 'it got too confident', 'the food chain in 30 seconds'],
      fr: ['mange plus petit, évite plus gros', 'de l’apéro au requin', 'il a pris trop confiance', 'la chaîne alimentaire en 30 secondes'],
    },
    sounds: {
      en: ['bubbles (original sound)', 'original sound - feeding.frenzy', 'underwater lofi'],
      fr: ['bulles (son original)', 'son original - feeding.frenzy', 'lofi sous-marin'],
    },
  },
  zombies: {
    name: { en: 'zombie outbreak', fr: 'épidémie de zombies' },
    authors: ['@outbreak.sim', '@patient.zero', '@last.human'],
    tags: ['#zombies #simulation #outbreak', '#survival #whowins', '#fyp #foryou'],
    captions: {
      en: ['it starts with one', 'who is the last human?', 'the runners almost made it', 'patient zero did this'],
      fr: ['tout commence avec un seul', 'qui est le dernier humain ?', 'les coureurs y étaient presque', 'c’est la faute du patient zéro'],
    },
    sounds: {
      en: ['groans (original sound)', 'original sound - outbreak.sim', 'horror synth'],
      fr: ['grognements (son original)', 'son original - outbreak.sim', 'synthé d’horreur'],
    },
  },
  tankduel: {
    name: { en: 'tank duel', fr: 'duel de tanks' },
    authors: ['@tank.duel', '@artillery.bot', '@angle.power'],
    tags: ['#tanks #artillery #retro', '#worms #strategy', '#fyp #foryou'],
    captions: {
      en: ['adjusting the power...', 'mind the wind', 'the crater at the end', 'pocket tanks nostalgia'],
      fr: ['on ajuste la puissance...', 'attention au vent', 'le cratère à la fin', 'nostalgie des jeux de tanks'],
    },
    sounds: {
      en: ['boom (original sound)', 'original sound - tank.duel', 'military march 8-bit'],
      fr: ['boum (son original)', 'son original - tank.duel', 'marche militaire 8 bits'],
    },
  },
  dogfight: {
    name: { en: 'space dogfight', fr: 'combat spatial' },
    authors: ['@dogfight.ace', '@star.duel', '@space.ace'],
    tags: ['#dogfight #space #retro', '#arcade #duel', '#fyp #foryou'],
    captions: {
      en: ['orange vs blue, no mercy', 'get on its tail', 'the barrel roll...', 'top gun in space'],
      fr: ['orange contre bleu, sans pitié', 'colle-lui aux fesses', 'le tonneau...', 'top gun dans l’espace'],
    },
    sounds: {
      en: ['laser pew (original sound)', 'original sound - dogfight.ace', 'danger zone (8-bit)'],
      fr: ['laser piou (son original)', 'son original - dogfight.ace', 'danger zone (8 bits)'],
    },
  },
  viruses: {
    name: { en: 'immune system', fr: 'système immunitaire' },
    authors: ['@immune.cells', '@white.blood', '@micro.war'],
    tags: ['#biology #science #cells', '#immunesystem #educational', '#fyp #foryou'],
    captions: {
      en: ['your body right now', 'white cells on patrol', 'they multiply so fast...', 'biology class but fun'],
      fr: ['ton corps en ce moment', 'globules blancs en patrouille', 'ils se multiplient si vite...', 'cours de bio mais fun'],
    },
    sounds: {
      en: ['heartbeat (original sound)', 'original sound - immune.cells', 'microscopic ambience'],
      fr: ['battements de cœur (son original)', 'son original - immune.cells', 'ambiance microscopique'],
    },
  },
  towerdef: {
    name: { en: 'tower defence', fr: 'tower defense' },
    authors: ['@tower.def', '@wave.clear', '@build.towers'],
    tags: ['#towerdefense #strategy #gaming', '#waves #satisfying', '#fyp #foryou'],
    captions: {
      en: ['wave after wave', 'towers in the corners, always', 'one leaked through...', 'how many waves can it hold?'],
      fr: ['vague après vague', 'les tours dans les virages, toujours', 'un est passé...', 'combien de vagues ça tient ?'],
    },
    sounds: {
      en: ['zap zap (original sound)', 'original sound - tower.def', 'strategy game theme'],
      fr: ['zap zap (son original)', 'son original - tower.def', 'thème de jeu de stratégie'],
    },
  },
  tournament: {
    name: { en: 'colour tournament', fr: 'tournoi des couleurs' },
    authors: ['@colour.cup', '@bracket.bot', '@final.four'],
    tags: ['#tournament #whowins #colors', '#bracket #battle', '#fyp #foryou'],
    captions: {
      en: ['8 colours, 1 champion', 'quarter-finals → final', 'pick your champion now', 'the final was SO close'],
      fr: ['8 couleurs, 1 champion', 'quarts → finale', 'choisis ton champion maintenant', 'la finale était SERRÉE'],
    },
    sounds: {
      en: ['stadium crowd (original sound)', 'original sound - colour.cup', 'champions anthem 8-bit'],
      fr: ['foule de stade (son original)', 'son original - colour.cup', 'hymne des champions 8 bits'],
    },
  },
  sumo: {
    name: { en: 'sumo bots', fr: 'robots sumo' },
    authors: ['@robot.sumo', '@push.out', '@dohyo.bots'],
    tags: ['#robotsumo #robots #battle', '#engineering #sumo', '#fyp #foryou'],
    captions: {
      en: ['push or be pushed', 'robot sumo is real and it’s intense', 'red or blue?', 'that edge save!'],
      fr: ['pousse ou fais-toi pousser', 'le sumo de robots existe et c’est intense', 'rouge ou bleu ?', 'ce sauvetage au bord !'],
    },
    sounds: {
      en: ['motor whine (original sound)', 'original sound - robot.sumo', 'taiko drums'],
      fr: ['moteurs qui hurlent (son original)', 'son original - robot.sumo', 'tambours taiko'],
    },
  },
  firewater: {
    name: { en: 'fire vs water', fr: 'feu contre eau' },
    authors: ['@fire.water', '@element.war', '@steam.border'],
    tags: ['#fire #water #simulation', '#elements #whowins', '#fyp #foryou'],
    captions: {
      en: ['fire spreads, water floods', 'watch the border steam', 'which element wins?', 'avatar but pixels'],
      fr: ['le feu se propage, l’eau inonde', 'regarde la frontière fumer', 'quel élément gagne ?', 'avatar mais en pixels'],
    },
    sounds: {
      en: ['crackle and splash (original sound)', 'original sound - fire.water', 'elemental drums'],
      fr: ['crépitements et éclaboussures (son original)', 'son original - fire.water', 'tambours élémentaires'],
    },
  },
  foxrabbit: {
    name: { en: 'foxes and rabbits', fr: 'renards et lapins' },
    authors: ['@eco.sim', '@predator.prey', '@balance.nature'],
    tags: ['#ecosystem #simulation #nature', '#math #biology', '#fyp #foryou'],
    captions: {
      en: ['watch the graph at the top', 'more rabbits → more foxes → fewer rabbits', 'nature balances itself', 'the math of the forest'],
      fr: ['regarde le graphique en haut', 'plus de lapins → plus de renards → moins de lapins', 'la nature s’équilibre toute seule', 'les maths de la forêt'],
    },
    sounds: {
      en: ['forest ambience (original sound)', 'original sound - eco.sim', 'documentary piano'],
      fr: ['ambiance forêt (son original)', 'son original - eco.sim', 'piano de documentaire'],
    },
  },
  lastball: {
    name: { en: 'last ball standing', fr: 'dernière balle debout' },
    authors: ['@hp.balls', '@last.standing', '@ball.battle'],
    tags: ['#battle #whowins #simulation', '#balls #satisfying', '#fyp #foryou'],
    captions: {
      en: ['every hit costs HP', 'pick a colour, watch it fight', 'the 1 HP comeback', 'comment your winner'],
      fr: ['chaque choc coûte des PV', 'choisis une couleur, regarde-la se battre', 'la remontée à 1 PV', 'mets ton gagnant en commentaire'],
    },
    sounds: {
      en: ['hit sound (original sound)', 'original sound - hp.balls', 'boss battle theme'],
      fr: ['bruit de coup (son original)', 'son original - hp.balls', 'thème de boss'],
    },
  },
  elements: {
    name: { en: 'fire water grass', fr: 'feu eau plante' },
    authors: ['@type.chart', '@element.rps', '@starter.pick'],
    tags: ['#elements #battle #simulation', '#typechart #whowins', '#fyp #foryou'],
    captions: {
      en: ['fire beats grass, grass beats water...', 'which starter wins?', 'the type chart, simulated', 'water was so close'],
      fr: ['le feu bat la plante, la plante bat l’eau...', 'quel starter gagne ?', 'la table des types, simulée', 'l’eau y était presque'],
    },
    sounds: {
      en: ['battle start (original sound)', 'original sound - type.chart', 'route theme 8-bit'],
      fr: ['début de combat (son original)', 'son original - type.chart', 'thème de route 8 bits'],
    },
  },
} satisfies Record<string, Entry>
