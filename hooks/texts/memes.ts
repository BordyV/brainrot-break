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
} satisfies Record<string, Entry>
