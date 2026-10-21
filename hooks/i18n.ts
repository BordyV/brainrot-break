import type { Kind } from '../types'
import { LOCALES } from './locales'
import type { Theme } from './themes'
import { THEME_TEXTS } from './texts'

export type Lang = 'en' | 'fr' | 'es' | 'de' | 'pt' | 'it'

export const LANGS: Lang[] = ['en', 'fr', 'es', 'de', 'pt', 'it']

/** The languages written next to each video, in hooks/texts/ and below. */
export type SourceLang = 'en' | 'fr'

/** The other languages: each one's texts live in hooks/locales/<lang>/. */
export type LocaleLang = Exclude<Lang, SourceLang>

// Each video keeps the index of its caption and sound, so switching the
// language retranslates the clips already in the feed. Every language
// lists the same number of lines, in the same order.
export type Meta<L extends string = Lang> = {
  authors: string[]
  tags: string[]
  captions: Record<L, string[]>
  sounds: Record<L, string[]>
}

/** A video's texts in hooks/texts/: its name in each language, then its META. */
export type Entry = Meta<SourceLang> & { name: Record<SourceLang, string> }

/** One video's texts in a language of hooks/locales/: the same lines as English, in the same order. */
export type VideoText = { name: string; captions: string[]; sounds: string[] }

/** A language of hooks/locales/: the interface, the theme names, the comments, and each video's texts. */
export type Locale = {
  strings: Strings
  themes: Record<Theme, string>
  comments: { generic: string[]; themes: Record<Theme, string[]> }
  videos: Partial<Record<Kind, VideoText>>
}

function metaOf<K extends string>(texts: Record<K, Entry>): Record<K, Meta<SourceLang>> {
  return Object.fromEntries(Object.entries<Entry>(texts).map(([k, { name: _, ...meta }]) => [k, meta])) as Record<K, Meta<SourceLang>>
}

function labelsOf<K extends string>(texts: Record<K, Entry>, lang: SourceLang): Record<K, string> {
  return Object.fromEntries(Object.entries<Entry>(texts).map(([k, e]) => [k, e.name[lang]])) as Record<K, string>
}

const SOURCE_META: Record<Kind, Meta<SourceLang>> = metaOf(THEME_TEXTS)

const SOURCE_LABELS: Record<SourceLang, Record<Kind, string>> = {
  en: labelsOf(THEME_TEXTS, 'en'),
  fr: labelsOf(THEME_TEXTS, 'fr'),
}

// The comments under a video: a few generic ones and one or two of its
// theme's, picked from its seed. Both languages list the same number.
const SOURCE_COMMENTS: { handles: string[]; generic: Record<SourceLang, string[]>; themes: Record<Theme, Record<SourceLang, string[]>> } = {
  handles: ['@byte.size', '@lofi.lena', '@pixel.pete', '@nap.queen', '@sudo.sandwich', '@404.vibes', '@mochi.dev', '@the.real.kev', '@cafe.au.code', '@tiny.hands', '@rubber.duck', '@night.owl.42', '@kernel.kate', '@merge.conflict', '@just.vibing', '@cache.miss'],
  generic: {
    en: ['the way I watched this 9 times', 'why is this so satisfying', 'pov: you were supposed to be working', 'who else is here while their code compiles', 'the ending got me', 'I can hear this video', 'my attention span thanks you', 'this is my roman empire now', 'wait for it… WAIT FOR IT', 'ok but the colours', 'replaying until Claude answers', 'the algorithm knows me too well', 'instructions unclear, watched again', 'this deserves more likes', 'first', 'the pixels are pixeling'],
    fr: ['je l’ai regardé 9 fois', 'pourquoi c’est si satisfaisant', 'pov : t’étais censé bosser', 'qui d’autre est là pendant que son code compile', 'la fin m’a eu', 'j’entends cette vidéo', 'ma capacité d’attention te remercie', 'c’est mon empire romain maintenant', 'attends… ATTENDS', 'ok mais les couleurs', 'je rejoue jusqu’à ce que Claude réponde', 'l’algo me connaît trop bien', 'instructions pas claires, j’ai regardé encore', 'ça mérite plus de likes', 'premier', 'les pixels pixellisent'],
  },
  themes: {
    satisfying: { en: ['the click at the end', 'I could watch this for hours', 'my brain just relaxed'], fr: ['le clic à la fin', 'je pourrais regarder ça des heures', 'mon cerveau vient de se détendre'] },
    physics: { en: ['Newton would be proud', 'the bounce physics are elite', 'this is basically homework'], fr: ['Newton serait fier', 'la physique des rebonds est parfaite', 'c’est mes devoirs en fait'] },
    arcade: { en: ['the bot is better than me', 'insert coin to continue', 'high score or no score'], fr: ['le bot joue mieux que moi', 'insérez une pièce pour continuer', 'high score ou rien'] },
    mobile: { en: ['this ad is better than the game', 'level 9999 energy', 'one more try, I promise'], fr: ['cette pub est mieux que le jeu', 'énergie niveau 9999', 'encore un essai, promis'] },
    versus: { en: ['team blue all the way', 'red was robbed', 'best of three?'], fr: ['team bleu à fond', 'on a volé le rouge', 'en trois manches ?'] },
    generative: { en: ['maths but make it pretty', 'the screensaver of my dreams', 'the pattern never repeats'], fr: ['les maths mais en joli', 'l’économiseur d’écran de mes rêves', 'le motif ne se répète jamais'] },
    animals: { en: ['protect him at all costs', 'the little paws', 'he has a job and he does it'], fr: ['à protéger à tout prix', 'les petites pattes', 'il a un travail et il le fait'] },
    food: { en: ['I’m hungry now, thanks', 'recipe please', 'chef’s kiss'], fr: ['j’ai faim maintenant, merci', 'la recette svp', 'le baiser du chef'] },
    nature: { en: ['I can smell the rain', 'touch grass, pixel edition', 'nature is healing'], fr: ['je sens la pluie', 'touche de l’herbe, version pixel', 'la nature guérit'] },
    space: { en: ['we are so small', 'houston, we have a vibe', 'the stars are aligned'], fr: ['on est tout petits', 'houston, on a une ambiance', 'les étoiles sont alignées'] },
    cozy: { en: ['this is my comfort video', 'blanket and tea time', 'lo-fi beats to wait to'], fr: ['c’est ma vidéo doudou', 'plaid et thé', 'lo-fi pour attendre'] },
    sports: { en: ['what a shot', 'the replay is worth it', 'ref, are you watching?'], fr: ['quel tir', 'le replay en vaut la peine', 'l’arbitre, tu regardes ?'] },
    city: { en: ['city pop is playing in my head', 'I’d live there', 'the traffic is too real'], fr: ['j’ai de la city pop dans la tête', 'j’habiterais là', 'les bouchons sont trop réels'] },
    music: { en: ['the beat drop', 'it’s stuck in my head', 'on repeat'], fr: ['le drop', 'c’est coincé dans ma tête', 'en boucle'] },
    machines: { en: ['how it’s made at 2 a.m.', 'the precision', 'factory ASMR'], fr: ['comment c’est fait à 2 h du mat', 'la précision', 'ASMR d’usine'] },
    crafts: { en: ['the patience', 'I’m buying the kit', 'handmade is better'], fr: ['la patience', 'j’achète le kit', 'le fait main c’est mieux'] },
    science: { en: ['do not try this at home', 'my teacher never showed us this', 'for science'], fr: ['ne faites pas ça chez vous', 'mon prof ne nous a jamais montré ça', 'pour la science'] },
    dev: { en: ['works on my machine', 'this is my code in prod', 'git push --force energy'], fr: ['ça marche sur ma machine', 'c’est mon code en prod', 'énergie git push --force'] },
    memes: { en: ['classic', 'I sent this to everyone', 'the meme lives on'], fr: ['un classique', 'je l’ai envoyé à tout le monde', 'le mème est éternel'] },
    seasons: { en: ['it’s that time of year', 'already feeling festive', 'the seasonal vibes'], fr: ['c’est la saison', 'déjà l’esprit de fête', 'l’ambiance de saison'] },
    puzzles: { en: ['I solved it before the end', 'my brain hurts (good)', 'one more move'], fr: ['je l’ai résolu avant la fin', 'mon cerveau chauffe (en bien)', 'encore un coup'] },
    simulations: { en: ['I could stare at this forever', 'sim city but smaller', 'watching the system work'], fr: ['je pourrais fixer ça pour toujours', 'sim city en petit', 'regarder le système tourner'] },
    destruction: { en: ['so much destruction, so little time', 'it had it coming', 'again but slower'], fr: ['tant de destruction, si peu de temps', 'il l’avait cherché', 'encore mais au ralenti'] },
    robots: { en: ['the robot uprising is cute', 'beep boop', 'he’s trying his best'], fr: ['la révolte des robots est mignonne', 'bip boup', 'il fait de son mieux'] },
  },
}

// Each theme's name in the theme menu.
const SOURCE_THEME_NAMES: Record<SourceLang, Record<Theme, string>> = {
  en: {
    satisfying: 'satisfying',
    physics: 'physics',
    arcade: 'arcade',
    mobile: 'mobile games',
    versus: 'versus',
    generative: 'generative art',
    animals: 'animals',
    food: 'food',
    nature: 'nature',
    space: 'space',
    cozy: 'cozy',
    sports: 'sports',
    city: 'city',
    music: 'music',
    machines: 'machines',
    crafts: 'crafts',
    science: 'science',
    dev: 'dev',
    memes: 'memes',
    seasons: 'seasons',
    puzzles: 'puzzles',
    simulations: 'simulations',
    destruction: 'destruction',
    robots: 'robots',
  },
  fr: {
    satisfying: 'satisfaisant',
    physics: 'physique',
    arcade: 'arcade',
    mobile: 'jeux mobiles',
    versus: 'duels',
    generative: 'art génératif',
    animals: 'animaux',
    food: 'cuisine',
    nature: 'nature',
    space: 'espace',
    cozy: 'cosy',
    sports: 'sport',
    city: 'ville',
    music: 'musique',
    machines: 'machines',
    crafts: 'artisanat',
    science: 'science',
    dev: 'dev',
    memes: 'mèmes',
    seasons: 'saisons',
    puzzles: 'casse-têtes',
    simulations: 'simulations',
    destruction: 'destruction',
    robots: 'robots',
  },
}

const en = {
  paneTitle: 'For you',
  commandDescription: 'Pixel art mini-videos to scroll while Claude answers (on | off | stats | lang en|fr|es|de|pt|it | fps 0-15 | no argument: open)',
  tooSmall: 'Make this a bit bigger to see the feed.',
  loading: 'Loading the feed...',
  terminalOnly: 'The pixel art feed plays in the terminal and the desktop app.',
  hintDesktop: 'wheel or ▲ ▼: scroll · double-click or ♥: like · click: pause · #tags: only that theme · ≡: comments · ⊘: not interested · ···: menu',
  pause: 'Pause',
  play: 'Play',
  toSide: 'Move to the side',
  hint: 'wheel or j/k: scroll · double-click or l: like · click: pause · m: comments · click #tags: only that theme · n: not interested · t: menu · h or ?: shortcuts',
  answered: '✓ Claude has answered',
  waiting: 'your answer is waiting in the transcript',
  thisWait: (views: number, likes: number, time: string) => `This wait: ${views} video${views === 1 ? '' : 's'} · ${likes} ♥ · ${time}`,
  session: 'Session',
  keepScrolling: 'Keep scrolling',
  close: 'Close',
  statsLine: (views: number, likes: number, time: string, fav?: string) =>
    `${views} videos · ${likes} ♥ · ${time}${fav ? ` · favorite: ${fav}` : ''}`,
  lastSession: (line: string) => `Brainrot break, last session: ${line}`,
  off: 'Brainrot break is off. /brainrot on turns it back on.',
  on: 'Brainrot break is on: the feed opens when an answer from Claude takes more than 2 s.',
  opened: 'Feed open. Wheel or j/k to scroll, double-click or l to like, click to pause.',
  statsTitle: 'Brainrot break, this session:',
  top: 'top',
  nothingYet: 'nothing watched yet',
  allTime: 'All time',
  language: 'Language: English.',
  languageUsage: 'Usage: /brainrot lang en|fr|es|de|pt|it',
  answeredToast: 'Claude has answered ✓',
  fps: (n: number) => (n === 0 ? 'Desktop video frozen (/brainrot fps 10 plays it again).' : `Desktop video: ${n} frames a second.`),
  fpsUsage: 'Usage: /brainrot fps 0-15 (desktop app; 0 freezes the video)',
  decimal: '.',
  notInterested: (name: string) => `Fewer “${name}”`,
  undo: 'Undo',
  menuBack: '‹ Back',
  thisVideo: 'This video:',
  nopeAction: 'Not interested',
  hideTheme: (tag: string) => `Hide ${tag}`,
  chooseThemes: 'Choose my themes…',
  themeHidden: (tag: string) => `${tag} hidden. ··· › Choose my themes brings it back.`,
  showAll: 'Show all',
  hideAll: 'Hide all',
  keptTheme: (tag: string) => `${tag} stays on: keep at least one, then pick the ones you want.`,
  forget: "Forget my 'not interested'",
  forgotten: "Your 'not interested' marks are forgotten.",
  lastTheme: 'Keep at least one theme.',
  myLikes: (n: number) => `My likes (${n})`,
  noLikes: 'No likes yet: double-click a video you love.',
  settings: 'Settings…',
  settingLanguage: 'Language: English',
  settingAutoOpen: (on: boolean) => `Opens while Claude works: ${on ? 'on' : 'off'}`,
  settingAutoScroll: (on: boolean) => `Next video by itself: ${on ? 'on' : 'off'}`,
  commentsTitle: (n: string) => `${n} comments`,
  focusOn: (tag: string) => `Only ${tag} videos · ✕`,
  shortcuts: 'Shortcuts',
  helpNext: 'next / previous video',
  helpLike: 'like',
  helpPause: 'pause',
  helpComments: 'comments',
  helpNope: 'not interested',
  helpUndo: 'undo it',
  helpMenu: 'menu',
  helpTags: 'only that theme',
  helpEndCard: 'end card: keep scrolling / close',
  helpHelp: 'this help',
}

const fr: typeof en = {
  paneTitle: 'Pour toi',
  commandDescription: 'Mini-vidéos pixel art à scroller pendant que Claude répond (on | off | stats | lang en|fr|es|de|pt|it | fps 0-15 | sans argument : ouvrir)',
  tooSmall: 'Agrandis un peu pour voir le feed.',
  loading: 'Chargement du feed...',
  terminalOnly: 'Le feed pixel art se regarde dans le terminal et l’app desktop.',
  hintDesktop: 'molette ou ▲ ▼ : scroll · double-clic ou ♥ : like · clic : pause · #tags : que ce thème · ≡ : commentaires · ⊘ : pas intéressé · ··· : menu',
  pause: 'Pause',
  play: 'Lecture',
  toSide: 'Mettre sur le côté',
  hint: 'molette ou j/k : scroll · double-clic ou l : like · clic : pause · m : commentaires · clic #tags : que ce thème · n : pas intéressé · t : menu · h ou ? : raccourcis',
  answered: '✓ Claude a répondu',
  waiting: "la réponse t'attend dans le transcript",
  thisWait: (views, likes, time) => `Cette attente : ${views} vidéo${views > 1 ? 's' : ''} · ${likes} ♥ · ${time}`,
  session: 'Session',
  keepScrolling: 'Continuer à scroller',
  close: 'Fermer',
  statsLine: (views, likes, time, fav) => `${views} vidéos · ${likes} ♥ · ${time}${fav ? ` · préféré : ${fav}` : ''}`,
  lastSession: line => `Brainrot break, session précédente : ${line}`,
  off: 'Brainrot break désactivé. /brainrot on pour le réactiver.',
  on: 'Brainrot break activé : le feed s’ouvre quand une réponse de Claude dure plus de 2 s.',
  opened: 'Feed ouvert. Molette ou j/k pour scroller, double-clic ou l pour liker, clic pour mettre en pause.',
  statsTitle: 'Brainrot break, cette session :',
  top: 'top',
  nothingYet: 'rien regardé pour l’instant',
  allTime: 'Depuis toujours',
  language: 'Langue : français.',
  languageUsage: 'Utilisation : /brainrot lang en|fr|es|de|pt|it',
  answeredToast: 'Claude a répondu ✓',
  fps: n => (n === 0 ? 'Vidéo desktop figée (/brainrot fps 10 pour la relancer).' : `Vidéo desktop : ${n} images par seconde.`),
  fpsUsage: 'Utilisation : /brainrot fps 0-15 (app desktop ; 0 fige la vidéo)',
  decimal: ',',
  notInterested: name => `Moins de « ${name} »`,
  undo: 'Annuler',
  menuBack: '‹ Retour',
  thisVideo: 'Cette vidéo :',
  nopeAction: 'Pas intéressé',
  hideTheme: tag => `Masquer ${tag}`,
  chooseThemes: 'Choisir mes thèmes…',
  themeHidden: tag => `${tag} masqué. ··· › Choisir mes thèmes pour le remettre.`,
  showAll: 'Tout afficher',
  hideAll: 'Tout masquer',
  keptTheme: tag => `${tag} reste affiché : il en faut un, coche ensuite ceux que tu veux.`,
  forget: "Oublier mes « pas intéressé »",
  forgotten: "Tes « pas intéressé » sont oubliés.",
  lastTheme: 'Garde au moins un thème.',
  myLikes: n => `Mes likes (${n})`,
  noLikes: 'Pas encore de like : double-clique une vidéo que tu adores.',
  settings: 'Réglages…',
  settingLanguage: 'Langue : français',
  settingAutoOpen: on => `S’ouvre quand Claude bosse : ${on ? 'oui' : 'non'}`,
  settingAutoScroll: on => `Vidéo suivante toute seule : ${on ? 'oui' : 'non'}`,
  commentsTitle: n => `${n} commentaires`,
  focusOn: tag => `Que des vidéos ${tag} · ✕`,
  shortcuts: 'Raccourcis',
  helpNext: 'vidéo suivante / précédente',
  helpLike: 'liker',
  helpPause: 'pause',
  helpComments: 'commentaires',
  helpNope: 'pas intéressé',
  helpUndo: 'annuler',
  helpMenu: 'menu',
  helpTags: 'que ce thème',
  helpEndCard: 'écran de fin : continuer / fermer',
  helpHelp: 'cette aide',
}

export type Strings = typeof en

const LOCALE_LANGS = Object.keys(LOCALES) as LocaleLang[]
const KINDS = Object.keys(SOURCE_META) as Kind[]
const fromLocales = <T>(pick: (l: Locale) => T) => Object.fromEntries(LOCALE_LANGS.map(l => [l, pick(LOCALES[l])])) as Record<LocaleLang, T>

export const STRINGS: Record<Lang, Strings> = { en, fr, ...fromLocales(l => l.strings) }

export const THEME_NAMES: Record<Lang, Record<Theme, string>> = { ...SOURCE_THEME_NAMES, ...fromLocales(l => l.themes) }

export const COMMENTS: { handles: string[]; generic: Record<Lang, string[]>; themes: Record<Theme, Record<Lang, string[]>> } = {
  handles: SOURCE_COMMENTS.handles,
  generic: { ...SOURCE_COMMENTS.generic, ...fromLocales(l => l.comments.generic) },
  themes: Object.fromEntries(
    (Object.keys(SOURCE_COMMENTS.themes) as Theme[]).map(t => [t, { ...SOURCE_COMMENTS.themes[t], ...fromLocales(l => l.comments.themes[t]) }]),
  ) as Record<Theme, Record<Lang, string[]>>,
}

// A video not yet translated in a language falls back to English there; a test
// makes sure none is left.
export const META: Record<Kind, Meta> = Object.fromEntries(
  KINDS.map(k => {
    const m = SOURCE_META[k]
    return [
      k,
      {
        ...m,
        captions: { ...m.captions, ...fromLocales(l => l.videos[k]?.captions ?? m.captions.en) },
        sounds: { ...m.sounds, ...fromLocales(l => l.videos[k]?.sounds ?? m.sounds.en) },
      },
    ]
  }),
) as Record<Kind, Meta>

export const LABELS: Record<Lang, Record<Kind, string>> = {
  ...SOURCE_LABELS,
  ...fromLocales(l => Object.fromEntries(KINDS.map(k => [k, l.videos[k]?.name ?? SOURCE_LABELS.en[k]])) as Record<Kind, string>),
}

/** Each language's untranslated videos, for the tests. */
export const MISSING: Record<LocaleLang, Kind[]> = fromLocales(l => KINDS.filter(k => !l.videos[k]))
