import type { Entry } from '../i18n'

// Music & dance: names, authors, tags, captions and sounds.

export const MUSIC = {
  visualiser: {
    name: { en: 'audio visualiser', fr: 'visualiseur audio' },
    authors: ['@eq.bars', '@bass.boosted', '@visual.beats'],
    tags: ['#visualizer #music #edm', '#bassboosted #aesthetic', '#fyp #foryou'],
    captions: {
      en: ['you can almost hear it', 'watch the low end on the kick', 'turn it up (in your head)', 'winamp nostalgia'],
      fr: ['tu peux presque l’entendre', 'regarde les basses sur le kick', 'monte le son (dans ta tête)', 'nostalgie Winamp'],
    },
    sounds: {
      en: ['bass boosted (original sound)', 'original sound - eq.bars', 'EDM festival mix'],
      fr: ['bass boosted (son original)', 'son original - eq.bars', 'mix de festival EDM'],
    },
  },
  pianotiles: {
    name: { en: 'piano tiles', fr: 'piano tiles' },
    authors: ['@piano.tiles', '@dont.tap.white', '@fast.fingers'],
    tags: ['#pianotiles #mobilegame #piano', '#rhythm #music', '#fyp #foryou'],
    captions: {
      en: ['don’t tap the white tiles', 'it keeps getting faster', 'Für Elise speedrun', 'the long tile...'],
      fr: ['ne touche pas les tuiles blanches', 'ça va de plus en plus vite', 'speedrun de la Lettre à Élise', 'la tuile longue...'],
    },
    sounds: {
      en: ['Für Elise (sped up)', 'original sound - piano.tiles', 'Canon in D (fast)'],
      fr: ['Lettre à Élise (sped up)', 'son original - piano.tiles', 'Canon de Pachelbel (rapide)'],
    },
  },
  trenddance: {
    name: { en: 'trend dance', fr: 'danse tendance' },
    authors: ['@dance.trend', '@learn.this', '@eight.counts'],
    tags: ['#dancechallenge #dance #trend', '#tutorial #viral', '#fyp #foryou'],
    captions: {
      en: ['learn it in 8 counts', 'the arms on beat 3', 'tag someone who can’t do this', 'new trend just dropped'],
      fr: ['apprends-la en 8 temps', 'les bras sur le temps 3', 'tague quelqu’un qui n’y arrive pas', 'nouvelle trend dispo'],
    },
    sounds: {
      en: ['trending sound (sped up)', 'original sound - dance.trend', 'viral pop remix'],
      fr: ['son tendance (sped up)', 'son original - dance.trend', 'remix pop viral'],
    },
  },
  guitar: {
    name: { en: 'guitar highway', fr: 'autoroute de guitare' },
    authors: ['@note.streak', '@fret.master', '@expert.mode'],
    tags: ['#guitarhero #rhythmgame #gaming', '#music #nostalgia', '#fyp #foryou'],
    captions: {
      en: ['expert mode, no misses', 'watch the streak', 'green red yellow blue orange', '2007 called'],
      fr: ['mode expert, zéro raté', 'regarde la série', 'vert rouge jaune bleu orange', '2007 a appelé'],
    },
    sounds: {
      en: ['Through the Fire and Flames (8-bit)', 'original sound - note.streak', 'rock anthem'],
      fr: ['Through the Fire and Flames (8 bits)', 'son original - note.streak', 'hymne rock'],
    },
  },
  bassdrop: {
    name: { en: 'bass drop', fr: 'drop de basse' },
    authors: ['@wait.for.drop', '@bass.face', '@sub.woofer'],
    tags: ['#bassdrop #edm #waitforit', '#festival #rave', '#fyp #foryou'],
    captions: {
      en: ['wait for the drop...', 'the build-up is unbearable', 'DROP', 'speakers not included'],
      fr: ['attends le drop...', 'la montée est insupportable', 'DROP', 'enceintes non fournies'],
    },
    sounds: {
      en: ['build-up and drop (original sound)', 'original sound - wait.for.drop', 'dubstep classic'],
      fr: ['montée et drop (son original)', 'son original - wait.for.drop', 'classique du dubstep'],
    },
  },
  djdecks: {
    name: { en: 'DJ decks', fr: 'platines de DJ' },
    authors: ['@dj.booth', '@spin.mix', '@club.night'],
    tags: ['#dj #club #mixing', '#techno #party', '#fyp #foryou'],
    captions: {
      en: ['pov: you’re behind the booth', 'the crossfade...', 'hands up!', 'friday night energy'],
      fr: ['pov : tu es derrière les platines', 'le fondu enchaîné...', 'les mains en l’air !', 'énergie du vendredi soir'],
    },
    sounds: {
      en: ['house mix (original sound)', 'original sound - dj.booth', 'techno set'],
      fr: ['mix house (son original)', 'son original - dj.booth', 'set techno'],
    },
  },
  rhythm: {
    name: { en: 'rhythm circles', fr: 'cercles de rythme' },
    authors: ['@circle.clicker', '@perfect.300', '@aim.flow'],
    tags: ['#osu #rhythmgame #gaming', '#aim #flow', '#fyp #foryou'],
    captions: {
      en: ['300 every time', 'click the circles', 'full combo?', 'the cursor flow is clean'],
      fr: ['300 à chaque fois', 'clique sur les cercles', 'full combo ?', 'le mouvement du curseur est propre'],
    },
    sounds: {
      en: ['hit sounds (original sound)', 'original sound - circle.clicker', 'anime opening (nightcore)'],
      fr: ['sons de frappe (son original)', 'son original - circle.clicker', 'opening d’anime (nightcore)'],
    },
  },
  disco: {
    name: { en: 'disco floor', fr: 'piste de disco' },
    authors: ['@disco.floor', '@saturday.fever', '@mirror.ball'],
    tags: ['#disco #70s #dance', '#dancefloor #lights', '#fyp #foryou'],
    captions: {
      en: ['the floor knows the beat', 'disco is never dead', 'pattern change!', 'Saturday night fever'],
      fr: ['la piste connaît le rythme', 'le disco n’est jamais mort', 'changement de motif !', 'la fièvre du samedi soir'],
    },
    sounds: {
      en: ['disco groove (original sound)', 'original sound - disco.floor', 'Stayin’ Alive (8-bit)'],
      fr: ['groove disco (son original)', 'son original - disco.floor', 'Stayin’ Alive (8 bits)'],
    },
  },
  stadiumwave: {
    name: { en: 'stadium wave', fr: 'ola' },
    authors: ['@the.wave', '@stadium.cam', '@crowd.goals'],
    tags: ['#stadium #crowd #wave', '#football #fans', '#fyp #foryou'],
    captions: {
      en: ['the wave goes all the way around', 'one section always misses it', 'crowd energy', 'stand up at the right time'],
      fr: ['l’ola fait tout le tour', 'il y a toujours une tribune qui la rate', 'énergie de la foule', 'lève-toi au bon moment'],
    },
    sounds: {
      en: ['crowd roar (original sound)', 'original sound - the.wave', 'stadium anthem'],
      fr: ['clameur de la foule (son original)', 'son original - the.wave', 'hymne de stade'],
    },
  },
  conga: {
    name: { en: 'conga line', fr: 'chenille' },
    authors: ['@conga.line', '@party.train', '@join.us'],
    tags: ['#conga #party #wedding', '#dance #fun', '#fyp #foryou'],
    captions: {
      en: ['everyone joins eventually', 'wedding at 1am', 'the line keeps growing', 'nobody leads, everybody follows'],
      fr: ['tout le monde finit par rejoindre', 'mariage à 1h du matin', 'la chenille grandit', 'personne ne mène, tout le monde suit'],
    },
    sounds: {
      en: ['conga rhythm (original sound)', 'original sound - conga.line', 'party classic'],
      fr: ['rythme de conga (son original)', 'son original - conga.line', 'classique de soirée'],
    },
  },
  fountain: {
    name: { en: 'dancing fountain', fr: 'fontaine dansante' },
    authors: ['@water.show', '@fountain.night', '@jets.and.lights'],
    tags: ['#fountain #watershow #night', '#lights #satisfying', '#fyp #foryou'],
    captions: {
      en: ['the water dances to the music', 'wait for the finale', 'Las Vegas at home', 'colour change on every beat'],
      fr: ['l’eau danse sur la musique', 'attends le final', 'Las Vegas à la maison', 'nouvelle couleur à chaque temps'],
    },
    sounds: {
      en: ['Con te partirò (orchestral)', 'original sound - water.show', 'water splash'],
      fr: ['Con te partirò (orchestre)', 'son original - water.show', 'éclaboussures'],
    },
  },
  xylophone: {
    name: { en: 'marble xylophone', fr: 'xylophone à billes' },
    authors: ['@marble.melody', '@ding.ding', '@kinetic.music'],
    tags: ['#marbles #xylophone #satisfying', '#music #kinetic', '#fyp #foryou'],
    captions: {
      en: ['every bar is a note', 'a song played by gravity', 'ding... ding... ding...', 'wait for the full melody'],
      fr: ['chaque lame est une note', 'une chanson jouée par la gravité', 'ding... ding... ding...', 'attends la mélodie complète'],
    },
    sounds: {
      en: ['xylophone notes (original sound)', 'original sound - marble.melody', 'music box'],
      fr: ['notes de xylophone (son original)', 'son original - marble.melody', 'boîte à musique'],
    },
  },
  robot: {
    name: { en: 'dancing robot', fr: 'robot danseur' },
    authors: ['@robo.dance', '@pop.and.lock', '@servo.moves'],
    tags: ['#robot #dance #popping', '#robotdance #funny', '#fyp #foryou'],
    captions: {
      en: ['doing the robot (literally)', 'pop and lock', 'he’s got moves', 'beep boop on beat'],
      fr: ['il fait le robot (littéralement)', 'pop and lock', 'il a du mouvement', 'bip boup en rythme'],
    },
    sounds: {
      en: ['robot beat (original sound)', 'original sound - robo.dance', 'electro funk'],
      fr: ['beat de robot (son original)', 'son original - robo.dance', 'électro funk'],
    },
  },
} satisfies Record<string, Entry>
