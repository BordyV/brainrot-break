import type { Entry } from '../i18n'

// Ocean & underwater: names, authors, tags, captions and sounds.

export const OCEAN = {
  baitball: {
    name: { en: 'bait ball', fr: 'boule de sardines' },
    authors: ['@bait.ball.swirl', '@shark.o.clock', '@silver.school'],
    tags: ['#ocean #fish #shark', '#marinelife #nature', '#fyp #foryou'],
    captions: {
      en: ['seventy fish, one swirl', 'here comes the shark…', 'the hole it leaves closes in a second', 'safety in numbers'],
      fr: ['soixante-dix poissons, un seul tourbillon', 'voilà le requin…', 'le trou qu’il laisse se referme en une seconde', 'l’union fait la force'],
    },
    sounds: {
      en: ['underwater rumble', 'original sound - bait.ball.swirl', 'nature documentary score'],
      fr: ['grondement sous-marin', 'son original - bait.ball.swirl', 'musique de documentaire animalier'],
    },
  },
  whale: {
    name: { en: 'whale breach', fr: 'saut de baleine' },
    authors: ['@breach.watch', '@humpback.hello', '@splash.zone'],
    tags: ['#whale #ocean #wildlife', '#whalewatching #nature', '#fyp #foryou'],
    captions: {
      en: ['the boat on the left saw everything', 'forty tonnes, fully airborne', 'wait for the splash', 'she does it again and again'],
      fr: ['le bateau à gauche a tout vu', 'quarante tonnes, en plein vol', 'attends l’éclaboussure', 'elle recommence encore et encore'],
    },
    sounds: {
      en: ['whale song', 'original sound - breach.watch', 'epic ocean strings'],
      fr: ['chant de baleine', 'son original - breach.watch', 'cordes épiques océaniques'],
    },
  },
  deepsea: {
    name: { en: 'deep-sea dive', fr: 'plongée en grande profondeur' },
    authors: ['@how.deep.is.it', '@abyss.cam', '@sub.lights.on'],
    tags: ['#deepsea #ocean #creepy', '#submarine #abyss', '#fyp #foryou'],
    captions: {
      en: ['the number is the depth in metres', 'it gets weirder the deeper you go', 'what is that light? don’t follow it.', 'the bottom has chimneys'],
      fr: ['le nombre, c’est la profondeur en mètres', 'plus on descend, plus c’est bizarre', 'c’est quoi cette lumière ? ne la suis pas.', 'le fond a des cheminées'],
    },
    sounds: {
      en: ['sonar pings', 'original sound - how.deep.is.it', 'abyss ambience'],
      fr: ['bips de sonar', 'son original - how.deep.is.it', 'ambiance des abysses'],
    },
  },
  hatchlings: {
    name: { en: 'turtle hatchlings', fr: 'bébés tortues' },
    authors: ['@run.little.turtle', '@nest.to.sea', '@gull.watch'],
    tags: ['#seaturtle #babyanimals #wildlife', '#nature #beach', '#fyp #foryou'],
    captions: {
      en: ['RUN LITTLE ONE', 'the gull misses. mostly.', 'the count in the corner made it to the sea', 'the cutest race on earth'],
      fr: ['COURS PETITE', 'la mouette rate. la plupart du temps.', 'le compteur, c’est celles qui ont atteint la mer', 'la course la plus mignonne du monde'],
    },
    sounds: {
      en: ['waves and tiny flippers', 'original sound - run.little.turtle', 'uplifting nature music'],
      fr: ['vagues et petites nageoires', 'son original - run.little.turtle', 'musique de nature pleine d’espoir'],
    },
  },
  shellswap: {
    name: { en: 'shell swap', fr: 'échange de coquilles' },
    authors: ['@hermit.crab.queue', '@size.up.shell', '@vacancy.chain'],
    tags: ['#hermitcrab #ocean #wholesome', '#nature #crabs', '#fyp #foryou'],
    captions: {
      en: ['a new shell arrives and everyone moves up', 'they wait in line by size. polite.', 'the pink moment: no shell, hurry', 'the smallest gets the leftovers'],
      fr: ['une nouvelle coquille arrive et tout le monde monte d’un cran', 'ils font la queue par taille. polis.', 'le moment rose : plus de coquille, vite', 'le plus petit récupère ce qui reste'],
    },
    sounds: {
      en: ['tiny clicking legs', 'original sound - hermit.crab.queue', 'cheerful ukulele'],
      fr: ['petites pattes qui cliquettent', 'son original - hermit.crab.queue', 'ukulélé joyeux'],
    },
  },
} satisfies Record<string, Entry>
