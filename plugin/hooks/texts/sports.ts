import type { Entry } from '../i18n'

// Sports: names, authors, tags, captions and sounds.

export const SPORTS = {
  trickshots: {
    name: { en: 'trick shots', fr: 'tirs impossibles' },
    authors: ['@nothing.but.net', '@bank.shot', '@hoop.dreams'],
    tags: ['#basketball #trickshot #nba', '#swish #sports', '#fyp #foryou'],
    captions: {
      en: ['nothing but net', 'off the backboard!', 'he can’t miss', 'count the swishes'],
      fr: ['que du filet', 'par la planche !', 'il ne peut pas rater', 'compte les paniers'],
    },
    sounds: {
      en: ['swish (original sound)', 'original sound - nothing.but.net', 'hype beat'],
      fr: ['swish (son original)', 'son original - nothing.but.net', 'beat hype'],
    },
  },
  penalty: {
    name: { en: 'penalty shootout', fr: 'tirs au but' },
    authors: ['@penalty.king', '@top.bins', '@keeper.wall'],
    tags: ['#football #penalty #goal', '#soccer #keeper', '#fyp #foryou'],
    captions: {
      en: ['top bins or saved?', 'the keeper guessed right...', 'pressure moment', 'goals vs saves, keep count'],
      fr: ['lucarne ou arrêt ?', 'le gardien a deviné...', 'moment de pression', 'buts contre arrêts, compte'],
    },
    sounds: {
      en: ['stadium roar (original sound)', 'original sound - penalty.king', 'champions anthem'],
      fr: ['clameur du stade (son original)', 'son original - penalty.king', 'hymne des champions'],
    },
  },
  bowling: {
    name: { en: 'bowling strike', fr: 'strike au bowling' },
    authors: ['@strike.zone', '@hook.ball', '@ten.pins'],
    tags: ['#bowling #strike #satisfying', '#sports #pins', '#fyp #foryou'],
    captions: {
      en: ['watch the hook', 'all ten?', 'the pin chain reaction', 'Friday bowling night'],
      fr: ['regarde l’effet', 'les dix ?', 'la réaction en chaîne des quilles', 'bowling du vendredi soir'],
    },
    sounds: {
      en: ['pin crash (original sound)', 'original sound - strike.zone', 'retro bowling alley'],
      fr: ['fracas de quilles (son original)', 'son original - strike.zone', 'bowling rétro'],
    },
  },
  holeinone: {
    name: { en: 'hole in one', fr: 'trou en un' },
    authors: ['@golf.green', '@one.putt', '@birdie.dreams'],
    tags: ['#golf #holeinone #sports', '#putt #satisfying', '#fyp #foryou'],
    captions: {
      en: ['read the slope...', 'it’s curving... it’s curving...', 'in the cup!', 'lipped out, pain'],
      fr: ['lis la pente...', 'ça tourne... ça tourne...', 'dans le trou !', 'ressorti du trou, la douleur'],
    },
    sounds: {
      en: ['quiet please (original sound)', 'original sound - golf.green', 'golf commentary'],
      fr: ['silence s’il vous plaît (son original)', 'son original - golf.green', 'commentaire de golf'],
    },
  },
  slalom: {
    name: { en: 'ski slalom', fr: 'slalom' },
    authors: ['@slalom.gate', '@powder.day', '@carve.life'],
    tags: ['#skiing #slalom #winter', '#ski #sports', '#fyp #foryou'],
    captions: {
      en: ['red, blue, red, blue', 'those carves though', 'fresh powder', 'winter sports szn'],
      fr: ['rouge, bleu, rouge, bleu', 'ces virages quand même', 'neige fraîche', 'saison des sports d’hiver'],
    },
    sounds: {
      en: ['snow carving (ASMR)', 'original sound - slalom.gate', 'winter games theme'],
      fr: ['ski qui carve (ASMR)', 'son original - slalom.gate', 'thème des jeux d’hiver'],
    },
  },
  halfpipe: {
    name: { en: 'skate halfpipe', fr: 'skate en rampe' },
    authors: ['@halfpipe.daily', '@kickflip', '@ramp.life'],
    tags: ['#skateboarding #halfpipe #skate', '#tricks #sports', '#fyp #foryou'],
    captions: {
      en: ['pumping for height', 'the spin at the top', 'he bailed lol', 'skate or die'],
      fr: ['il pompe pour prendre de la hauteur', 'la rotation en haut', 'il a chuté mdr', 'skate or die'],
    },
    sounds: {
      en: ['wheels on wood (original sound)', 'original sound - halfpipe.daily', 'punk rock'],
      fr: ['roues sur le bois (son original)', 'son original - halfpipe.daily', 'punk rock'],
    },
  },
  pitstop: {
    name: { en: 'pit stop', fr: 'arrêt au stand' },
    authors: ['@pit.crew', '@two.seconds', '@box.box'],
    tags: ['#f1 #pitstop #formula1', '#racing #teamwork', '#fyp #foryou'],
    captions: {
      en: ['four tyres in two seconds', 'box box box', 'the crew is insane', 'watch the clock'],
      fr: ['quatre pneus en deux secondes', 'box box box', 'l’équipe est folle', 'regarde le chrono'],
    },
    sounds: {
      en: ['wheel guns (original sound)', 'original sound - pit.crew', 'F1 theme'],
      fr: ['pistolets de roue (son original)', 'son original - pit.crew', 'thème F1'],
    },
  },
  tabletennis: {
    name: { en: 'table tennis', fr: 'ping-pong' },
    authors: ['@ping.pong', '@spin.serve', '@rally.king'],
    tags: ['#tabletennis #pingpong #sports', '#rally #satisfying', '#fyp #foryou'],
    captions: {
      en: ['the rally keeps going', 'ping... pong... ping...', 'who drops it first?', 'office break champion'],
      fr: ['l’échange continue', 'ping... pong... ping...', 'qui lâche en premier ?', 'champion de la pause au bureau'],
    },
    sounds: {
      en: ['ping pong (ASMR)', 'original sound - ping.pong', 'focus beat'],
      fr: ['ping pong (ASMR)', 'son original - ping.pong', 'beat de concentration'],
    },
  },
  curling: {
    name: { en: 'curling', fr: 'curling' },
    authors: ['@curl.stone', '@sweep.sweep', '@the.house'],
    tags: ['#curling #olympics #winter', '#sweeping #sports', '#fyp #foryou'],
    captions: {
      en: ['SWEEP! SWEEP!', 'watch it curl', 'into the house', 'the most underrated sport'],
      fr: ['BALAIE ! BALAIE !', 'regarde-la tourner', 'dans la maison', 'le sport le plus sous-coté'],
    },
    sounds: {
      en: ['stone slide (ASMR)', 'original sound - curl.stone', 'olympic commentary'],
      fr: ['pierre qui glisse (ASMR)', 'son original - curl.stone', 'commentaire olympique'],
    },
  },
  archery: {
    name: { en: 'archery', fr: 'tir à l’arc' },
    authors: ['@bullseye.club', '@arrow.flight', '@robin.hood'],
    tags: ['#archery #bullseye #sports', '#arrow #focus', '#fyp #foryou'],
    captions: {
      en: ['mind the wind', 'bullseye?', 'the arrow flight is so smooth', 'focus mode'],
      fr: ['attention au vent', 'en plein dans le mille ?', 'le vol de la flèche est si fluide', 'mode concentration'],
    },
    sounds: {
      en: ['twang thunk (original sound)', 'original sound - bullseye.club', 'medieval flute'],
      fr: ['twang tchac (son original)', 'son original - bullseye.club', 'flûte médiévale'],
    },
  },
  volleyball: {
    name: { en: 'beach volleyball', fr: 'beach-volley' },
    authors: ['@beach.volley', '@spike.it', '@sand.court'],
    tags: ['#volleyball #beach #summer', '#spike #sports', '#fyp #foryou'],
    captions: {
      en: ['bump, set, SPIKE', 'the dig!', 'summer beach games', 'red or blue?'],
      fr: ['manchette, passe, SMASH', 'le sauvetage !', 'jeux de plage d’été', 'rouge ou bleu ?'],
    },
    sounds: {
      en: ['beach crowd (original sound)', 'original sound - beach.volley', 'summer anthem'],
      fr: ['foule à la plage (son original)', 'son original - beach.volley', 'hymne de l’été'],
    },
  },
  skijump: {
    name: { en: 'ski jump', fr: 'saut à ski' },
    authors: ['@ski.jump', '@v.style', '@fly.far'],
    tags: ['#skijumping #winter #olympics', '#flying #sports', '#fyp #foryou'],
    captions: {
      en: ['they basically fly', 'how far this time?', 'the V-style', 'stick the landing'],
      fr: ['ils volent quasiment', 'jusqu’où cette fois ?', 'le style en V', 'réussir la réception'],
    },
    sounds: {
      en: ['wind rush (original sound)', 'original sound - ski.jump', 'winter games fanfare'],
      fr: ['souffle du vent (son original)', 'son original - ski.jump', 'fanfare des jeux d’hiver'],
    },
  },
  horserace: {
    name: { en: 'horse race', fr: 'course de chevaux' },
    authors: ['@derby.day', '@photo.finish', '@pick.a.horse'],
    tags: ['#horseracing #race #derby', '#pickacolor #sports', '#fyp #foryou'],
    captions: {
      en: ['pick a jockey colour', 'photo finish?', 'the comeback on the outside', 'and they’re off!'],
      fr: ['choisis la couleur d’un jockey', 'photo-finish ?', 'la remontée par l’extérieur', 'et ils sont partis !'],
    },
    sounds: {
      en: ['race call (original sound)', 'original sound - derby.day', 'William Tell overture'],
      fr: ['commentaire de course (son original)', 'son original - derby.day', 'ouverture de Guillaume Tell'],
    },
  },
  cupstack: {
    name: { en: 'cup stacking', fr: 'empilage de gobelets' },
    authors: ['@cup.stack', '@speed.stack', '@fast.hands'],
    tags: ['#cupstacking #speedstacking #satisfying', '#fasthands #challenge', '#fyp #foryou'],
    captions: {
      en: ['up, down, done', 'faster than your eyes', 'beat the record?', 'school gym memories'],
      fr: ['monte, descend, fini', 'plus rapide que tes yeux', 'battre le record ?', 'souvenirs du gymnase'],
    },
    sounds: {
      en: ['cup clatter (ASMR)', 'original sound - cup.stack', 'speedy beat'],
      fr: ['gobelets qui claquent (ASMR)', 'son original - cup.stack', 'beat rapide'],
    },
  },
  speedcube: {
    name: { en: 'speed cube', fr: 'speedcube' },
    authors: ['@cube.solve', '@sub10', '@twisty.puzzle'],
    tags: ['#rubikscube #speedcubing #puzzle', '#cubing #satisfying', '#fyp #foryou'],
    captions: {
      en: ['scramble... then solve', 'watch the timer', 'how do they DO that', 'I can only do one face'],
      fr: ['mélange... puis résolution', 'regarde le chrono', 'mais comment ils FONT', 'moi je sais faire qu’une face'],
    },
    sounds: {
      en: ['cube clicks (ASMR)', 'original sound - cube.solve', 'focus music'],
      fr: ['clics de cube (ASMR)', 'son original - cube.solve', 'musique de concentration'],
    },
  },
  keepyuppy: {
    name: { en: 'keepy-uppy', fr: 'jongles' },
    authors: ['@keepy.uppy', '@touch.master', '@freestyle.ball'],
    tags: ['#football #freestyle #skills', '#juggling #soccer', '#fyp #foryou'],
    captions: {
      en: ['foot, knee, head, repeat', 'new record?', 'he dropped it at...', 'park skills'],
      fr: ['pied, genou, tête, on recommence', 'nouveau record ?', 'il l’a fait tomber à...', 'skills de parc'],
    },
    sounds: {
      en: ['ball taps (original sound)', 'original sound - keepy.uppy', 'street football beat'],
      fr: ['touches de balle (son original)', 'son original - keepy.uppy', 'beat de foot de rue'],
    },
  },
  parkour: {
    name: { en: 'parkour', fr: 'parkour' },
    authors: ['@rooftop.run', '@free.runner', '@gap.jump'],
    tags: ['#parkour #freerunning #rooftop', '#jump #extreme', '#fyp #foryou'],
    captions: {
      en: ['rooftop to rooftop', 'the roll on landing', 'don’t look down', 'count the gaps'],
      fr: ['de toit en toit', 'la roulade à la réception', 'ne regarde pas en bas', 'compte les sauts'],
    },
    sounds: {
      en: ['wind and footsteps (original sound)', 'original sound - rooftop.run', 'drum and bass'],
      fr: ['vent et pas (son original)', 'son original - rooftop.run', 'drum and bass'],
    },
  },
  bungee: {
    name: { en: 'bungee jump', fr: 'saut à l’élastique' },
    authors: ['@three.two.one.jump', '@cord.stretch', '@gorge.drop'],
    tags: ['#bungee #extreme #adrenaline', '#stunt #travel', '#fyp #foryou'],
    captions: {
      en: ['3… 2… 1…', 'the number is how far down', 'and bounces, and bounces', 'I’d scream the whole way'],
      fr: ['3… 2… 1…', 'le nombre, c’est la profondeur', 'et ça rebondit, et ça rebondit', 'je hurlerais tout le long'],
    },
    sounds: {
      en: ['wind rush and a scream', 'original sound - three.two.one.jump', 'action cam rock'],
      fr: ['souffle du vent et un cri', 'son original - three.two.one.jump', 'rock de caméra embarquée'],
    },
  },
  juggling: {
    name: { en: 'juggling', fr: 'jonglage' },
    authors: ['@three.ball.cascade', '@keep.them.up', '@five.ball.dream'],
    tags: ['#juggling #skill #satisfying', '#circus #talent', '#fyp #foryou'],
    captions: {
      en: ['the cascade never stops', 'three balls, then five', 'the number is how many in the air', 'it took me a week to do two'],
      fr: ['la cascade ne s’arrête jamais', 'trois balles, puis cinq', 'le nombre, c’est combien en l’air', 'il m’a fallu une semaine pour en faire deux'],
    },
    sounds: {
      en: ['soft catches in rhythm', 'original sound - three.ball.cascade', 'circus waltz'],
      fr: ['réceptions douces en rythme', 'son original - three.ball.cascade', 'valse de cirque'],
    },
  },
  wallofdeath: {
    name: { en: 'wall of death', fr: 'mur de la mort' },
    authors: ['@round.the.wall', '@motordrome.nights', '@fair.stunt.rider'],
    tags: ['#wallofdeath #motorbike #stunt', '#funfair #adrenaline', '#fyp #foryou'],
    captions: {
      en: ['the faster it goes, the higher it climbs', 'the crowd leans over the rim', 'the number is the speed', 'how is this legal'],
      fr: ['plus elle va vite, plus elle monte', 'le public se penche par-dessus le bord', 'le nombre, c’est la vitesse', 'comment c’est légal ça'],
    },
    sounds: {
      en: ['two-stroke engine roar', 'original sound - round.the.wall', 'funfair organ'],
      fr: ['rugissement de moteur deux-temps', 'son original - round.the.wall', 'orgue de fête foraine'],
    },
  },
  speedbag: {
    name: { en: 'speed bag', fr: 'poire de frappe' },
    authors: ['@speed.bag.rhythm', '@ratatat.gloves', '@boxing.gym.asmr'],
    tags: ['#boxing #speedbag #training', '#rhythm #asmr', '#fyp #foryou'],
    captions: {
      en: ['three bounces a punch, count them', 'it turns into a drumroll', 'the rhythm is the whole skill', 'try this before your coffee'],
      fr: ['trois rebonds par coup, compte-les', 'ça devient un roulement de tambour', 'tout le talent est dans le rythme', 'essaie ça avant ton café'],
    },
    sounds: {
      en: ['ratatat-ratatat (original sound)', 'original sound - speed.bag.rhythm', 'training montage music'],
      fr: ['ratatat-ratatat (son original)', 'son original - speed.bag.rhythm', 'musique de montage d’entraînement'],
    },
  },
} satisfies Record<string, Entry>
