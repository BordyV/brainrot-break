import type { Entry } from '../i18n'

// Internet memes & brainrot: names, authors, tags, captions and sounds.

export const MEMES = {
  dvd: {
    name: { en: 'DVD logo', fr: 'logo DVD' },
    authors: ['@dvd.corner', '@nostalgia2005', '@screensaver.club'],
    tags: ['#dvd #nostalgia #corner', '#2000s #satisfying', '#fyp #waitforit'],
    captions: {
      en: ['it\'s GONNA hit the corner', 'wait for it...', 'POV: 2005, living room, DVD player', 'the corner. the CORNER.'],
      fr: ['il VA toucher le coin', 'attendez la fin...', 'POV : 2005, salon, lecteur DVD', 'le coin. le COIN.'],
    },
    sounds: {
      en: ['CRT hum', 'original sound - dvd.corner', 'DVD menu on loop'],
      fr: ['bourdonnement CRT', 'son original - dvd.corner', 'menu DVD en boucle'],
    },
  },
  nyan: {
    name: { en: 'Nyan Cat', fr: 'Nyan Cat' },
    authors: ['@nyan.official', '@poptart.cat', '@meme.2011'],
    tags: ['#nyancat #meme #nostalgia', '#2011 #internet', '#fyp #foryou'],
    captions: {
      en: ['10 hours of this please', 'who remembers?', 'nyan nyan nyan nyan', 'this meme is immortal'],
      fr: ['10 heures de ça svp', 'qui se souvient ?', 'nyan nyan nyan nyan', 'le meme est immortel'],
    },
    sounds: {
      en: ['Nyan Cat (original)', 'nyan nyan (sped up)', '2011 chiptune'],
      fr: ['Nyan Cat (original)', 'nyan nyan (sped up)', 'chiptune 2011'],
    },
  },
  creatures: {
    name: { en: 'absurd creature parade', fr: 'défilé de créatures absurdes' },
    authors: ['@brainrot.parade', '@cursed.creatures', '@sneaker.shark'],
    tags: ['#brainrot #absurd #creatures', '#memes #cursed', '#fyp #foryou'],
    captions: {
      en: ['a shark in sneakers. obviously.', 'who comes out next?', 'my brain at 3am', 'name this creature in the comments'],
      fr: ['un requin en baskets. évidemment.', 'qui sort ensuite ?', 'mon cerveau à 3 h du matin', 'donne un nom à cette créature en commentaire'],
    },
    sounds: {
      en: ['dramatic narrator (original sound)', 'original sound - brainrot.parade', 'circus march'],
      fr: ['narrateur dramatique (son original)', 'son original - brainrot.parade', 'marche de cirque'],
    },
  },
  splitrunner: {
    name: { en: 'split-screen runner', fr: 'écran partagé' },
    authors: ['@split.screen', '@attention.span', '@roof.runner'],
    tags: ['#splitscreen #brainrot #satisfying', '#kineticsand #parkour', '#fyp #foryou'],
    captions: {
      en: ['one video was not enough', 'sand on top, parkour below', 'my attention span be like', 'watch both. you can’t.'],
      fr: ['une seule vidéo, c’était pas assez', 'du sable en haut, du parkour en bas', 'ma capacité d’attention, en vrai', 'regarde les deux. impossible.'],
    },
    sounds: {
      en: ['sand crunch (ASMR)', 'original sound - split.screen', 'phonk loop'],
      fr: ['sable qui craque (ASMR)', 'son original - split.screen', 'boucle phonk'],
    },
  },
  spincat: {
    name: { en: 'spinning cat', fr: 'chat qui tourne' },
    authors: ['@spin.cat', '@orange.cat.energy', '@turntable.cat'],
    tags: ['#cat #spinning #meme', '#orangecat #brainrot', '#fyp #foryou'],
    captions: {
      en: ['faster... FASTER...', 'he does not stop', 'orange cat behaviour', 'and then he just stared'],
      fr: ['plus vite... PLUS VITE...', 'il ne s’arrête pas', 'comportement de chat roux', 'et puis il a juste fixé la caméra'],
    },
    sounds: {
      en: ['spinning cat song (sped up)', 'original sound - spin.cat', 'turntable whirr'],
      fr: ['chanson du chat qui tourne (accélérée)', 'son original - spin.cat', 'platine qui tourne'],
    },
  },
  ratdance: {
    name: { en: 'rat dance', fr: 'danse du rat' },
    authors: ['@rat.dance', '@dance.rodent', '@disco.rat'],
    tags: ['#ratdance #dance #meme', '#rat #vibes', '#fyp #foryou'],
    captions: {
      en: ['he has the moves', 'the rat is vibing', 'me when the beat drops', 'learn this dance'],
      fr: ['il a le rythme dans la peau', 'le rat est dans son élément', 'moi quand le beat tombe', 'apprends cette danse'],
    },
    sounds: {
      en: ['rat dance beat (sped up)', 'original sound - rat.dance', 'eurodance remix'],
      fr: ['beat de la danse du rat (accéléré)', 'son original - rat.dance', 'remix eurodance'],
    },
  },
  bongocat: {
    name: { en: 'bongo cat', fr: 'chat aux bongos' },
    authors: ['@bongo.paws', '@desk.drummer', '@tap.tap.cat'],
    tags: ['#bongocat #cat #meme', '#drums #cute', '#fyp #foryou'],
    captions: {
      en: ['tap tap tap tap', 'the drum solo nobody asked for', 'me typing during a meeting', 'paws of fury'],
      fr: ['tap tap tap tap', 'le solo de batterie que personne n’a demandé', 'moi qui tape pendant une réunion', 'les pattes de la fureur'],
    },
    sounds: {
      en: ['bongo taps (original sound)', 'original sound - bongo.paws', 'any song, but bongos'],
      fr: ['tapes de bongos (son original)', 'son original - bongo.paws', 'n’importe quelle chanson, en bongos'],
    },
  },
  backrooms: {
    name: { en: 'the backrooms', fr: 'les backrooms' },
    authors: ['@level.zero', '@noclip.walk', '@yellow.halls'],
    tags: ['#backrooms #liminal #creepy', '#liminalspaces #horror', '#fyp #foryou'],
    captions: {
      en: ['you noclipped out of reality', 'the hum never stops', 'it goes on forever', 'did the lights just flicker?'],
      fr: ['tu as traversé la réalité', 'le bourdonnement ne s’arrête jamais', 'ça ne finit jamais', 'les lumières ont clignoté ?'],
    },
    sounds: {
      en: ['fluorescent hum (original sound)', 'original sound - level.zero', 'liminal ambience'],
      fr: ['bourdonnement de néons (son original)', 'son original - level.zero', 'ambiance liminale'],
    },
  },
  crocbomber: {
    name: { en: 'Coccodrillo Bombardiere', fr: 'Coccodrillo Bombardiere' },
    authors: ['@coccodrillo.volante', '@pizza.airdrop', '@brainrot.italiano'],
    tags: ['#italianbrainrot #brainrot #crocodile', '#pizza #airdrop', '#fyp #foryou'],
    captions: {
      en: ['pizza delivery, but make it airborne', 'he does not miss. ever.', 'mamma mia, the rooftops', 'italian brainrot season 2'],
      fr: ['livraison de pizza, mais en avion', 'il ne rate jamais. jamais.', 'mamma mia, les toits', 'brainrot italien saison 2'],
    },
    sounds: {
      en: ['dramatic italian narrator (original sound)', 'original sound - coccodrillo.volante', 'propeller + mandolin'],
      fr: ['narrateur italien dramatique (son original)', 'son original - coccodrillo.volante', 'hélice + mandoline'],
    },
  },
  tumtum: {
    name: { en: 'Tronchetto Tum Tum', fr: 'Tronchetto Tum Tum' },
    authors: ['@tronchetto.tumtum', '@knock.at.4am', '@wooden.wakeup'],
    tags: ['#italianbrainrot #brainrot #log', '#knockknock #3am', '#fyp #foryou'],
    captions: {
      en: ['tum tum tum tum tum tum tum', 'if you hear three knocks... open.', 'the neighbourhood alarm clock', 'he knocks on every door. every one.'],
      fr: ['tum tum tum tum tum tum tum', 'si tu entends trois coups... ouvre.', 'le réveil du quartier', 'il frappe à toutes les portes. toutes.'],
    },
    sounds: {
      en: ['tum tum tum (original sound)', 'original sound - tronchetto.tumtum', 'wooden knocks (bass boosted)'],
      fr: ['tum tum tum (son original)', 'son original - tronchetto.tumtum', 'coups de bois (bass boosted)'],
    },
  },
  tierlist: {
    name: { en: 'tier list', fr: 'tier list' },
    authors: ['@tier.maker', '@ranked.everything', '@s.tier.only'],
    tags: ['#tierlist #ranking #debate', '#hottake #opinion', '#fyp #foryou'],
    captions: {
      en: ['the rock in A tier. explain.', 'ranking things nobody asked for', 'you will disagree with this', 'S tier is reserved for pizza'],
      fr: ['le caillou en tier A. expliquez.', 'je classe des trucs que personne n’a demandés', 'vous allez pas être d’accord', 'le tier S est réservé à la pizza'],
    },
    sounds: {
      en: ['dramatic tier list music', 'original sound - tier.maker', 'ticking clock (deciding)'],
      fr: ['musique de tier list dramatique', 'son original - tier.maker', 'tic-tac (il hésite)'],
    },
  },

  catkeys: {
    name: { en: 'cat on the keyboard', fr: 'le chat sur le clavier' },
    authors: ['@cat.commits', '@keyboard.walker', '@paws.on.prod'],
    tags: ['#cat #coding #keyboard', '#devlife #catsofinstagram', '#fyp #foryou'],
    captions: {
      en: ['he pushed to prod', 'ctrl+z ctrl+z ctrl+z', 'new senior dev just joined', 'it compiled. how?'],
      fr: ['il a push en prod', 'ctrl+z ctrl+z ctrl+z', 'le nouveau senior vient d’arriver', 'ça compile. comment ?'],
    },
    sounds: {
      en: ['keyboard clacks (ASMR)', 'original sound - cat.commits', 'lofi beats to debug to'],
      fr: ['clavier qui claque (ASMR)', 'son original - cat.commits', 'lofi pour débugger'],
    },
  },

  touchgrass: {
    name: { en: 'touch grass', fr: 'touch grass' },
    authors: ['@touch.grass.daily', '@offline.dev', '@sun.exposure'],
    tags: ['#touchgrass #devlife #outside', '#nature #logoff', '#fyp #foryou'],
    captions: {
      en: ['day 1 of touching grass', 'the sun is real??', 'POV: you closed the laptop', 'grass: touched. bugs: still there'],
      fr: ['jour 1 à toucher de l’herbe', 'le soleil existe ??', 'POV : tu as fermé le laptop', 'herbe : touchée. bugs : toujours là'],
    },
    sounds: {
      en: ['birds chirping (original sound)', 'original sound - touch.grass.daily', 'wallpaper meadow ambience'],
      fr: ['oiseaux qui chantent (son original)', 'son original - touch.grass.daily', 'ambiance prairie fond d’écran'],
    },
  },

  feedfeed: {
    name: { en: 'the feed in the feed', fr: 'le feed dans le feed' },
    authors: ['@feed.inception', '@scroll.loop', '@infinite.thumb'],
    tags: ['#scrolling #meta #inception', '#doomscroll #feed', '#fyp #foryou'],
    captions: {
      en: ['you are here', 'scrolling while you scroll', 'one more and I stop. promise.', 'it goes deeper'],
      fr: ['vous êtes ici', 'scroller pendant que tu scrolles', 'encore une et j’arrête. promis.', 'ça va plus loin'],
    },
    sounds: {
      en: ['inception bwaaam', 'original sound - feed.inception', 'thumb swipe (ASMR)'],
      fr: ['bwaaam d’inception', 'son original - feed.inception', 'swipe du pouce (ASMR)'],
    },
  },

  ballerina: {
    name: { en: 'Ballerina Cappuccina', fr: 'Ballerina Cappuccina' },
    authors: ['@ballerina.cappuccina', '@espresso.pirouette', '@la.tazza.danza'],
    tags: ['#italianbrainrot #brainrot #ballerina', '#cappuccino #dance', '#fyp #foryou'],
    captions: {
      en: ['she spins. the foam flies.', 'mi mi mi mi mi', 'extra shot of pirouette', 'bravissima! roses on stage'],
      fr: ['elle tourne. la mousse vole.', 'mi mi mi mi mi', 'un shot de pirouette en plus', 'bravissima ! des roses sur scène'],
    },
    sounds: {
      en: ['music box waltz (sped up)', 'original sound - ballerina.cappuccina', 'espresso machine + violins'],
      fr: ['valse de boîte à musique (accélérée)', 'son original - ballerina.cappuccina', 'machine à espresso + violons'],
    },
  },

  elefantino: {
    name: { en: 'Elefantino Cactusino', fr: 'Elefantino Cactusino' },
    authors: ['@elefantino.cactusino', '@prickly.parade', '@balloon.popper'],
    tags: ['#italianbrainrot #brainrot #cactus', '#elephant #balloons', '#fyp #foryou'],
    captions: {
      en: ['he just wanted a hug', 'balloons: 0. elefantino: undefeated', 'do not pet', 'pop pop pop'],
      fr: ['il voulait juste un câlin', 'ballons : 0. elefantino : invaincu', 'ne pas caresser', 'pop pop pop'],
    },
    sounds: {
      en: ['desert guitar (original sound)', 'original sound - elefantino.cactusino', 'balloon pops (bass boosted)'],
      fr: ['guitare du désert (son original)', 'son original - elefantino.cactusino', 'ballons qui éclatent (bass boosted)'],
    },
  },

} satisfies Record<string, Entry>
