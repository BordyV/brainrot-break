import type { Locale } from '../../i18n'
import { ANIMALS } from './animals'
import { ARCADE } from './arcade'
import { CITY } from './city'
import { COZY } from './cozy'
import { CRAFTS } from './crafts'
import { DESTRUCTION } from './destruction'
import { DEV } from './dev'
import { FOOD } from './food'
import { GENERATIVE } from './generative'
import { MACHINES } from './machines'
import { MEMES } from './memes'
import { MOBILE } from './mobile'
import { MUSIC } from './music'
import { NATURE } from './nature'
import { PHYSICS } from './physics'
import { PUZZLES } from './puzzles'
import { ROBOTS } from './robots'
import { SATISFYING } from './satisfying'
import { SCIENCE } from './science'
import { SEASONS } from './seasons'
import { SIMULATIONS } from './simulations'
import { SPACE } from './space'
import { SPORTS } from './sports'
import { VERSUS } from './versus'

// Every video's texts in this language, gathered from one file per theme.

export const VIDEOS: Locale['videos'] = {
  ...ANIMALS,
  ...ARCADE,
  ...CITY,
  ...COZY,
  ...CRAFTS,
  ...DESTRUCTION,
  ...DEV,
  ...FOOD,
  ...GENERATIVE,
  ...MACHINES,
  ...MEMES,
  ...MOBILE,
  ...MUSIC,
  ...NATURE,
  ...PHYSICS,
  ...PUZZLES,
  ...ROBOTS,
  ...SATISFYING,
  ...SCIENCE,
  ...SEASONS,
  ...SIMULATIONS,
  ...SPACE,
  ...SPORTS,
  ...VERSUS,
}
