import type { Kind } from '../../types'
import type { Maker } from '../draw'
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
import { FLUIDS } from './fluids'
import { IDLE } from './idle'
import { OCEAN } from './ocean'
import { INSECTS } from './insects'
import { SKY } from './sky'
import { FARM } from './farm'
import { TOYS } from './toys'
import { FANTASY } from './fantasy'
import { PARTY } from './party'

// The videos added by theme, one file per theme. Their texts live in
// hooks/texts/, under the same theme and kind names.

export const THEMES = {
  satisfying: SATISFYING,
  physics: PHYSICS,
  arcade: ARCADE,
  mobile: MOBILE,
  versus: VERSUS,
  generative: GENERATIVE,
  animals: ANIMALS,
  food: FOOD,
  nature: NATURE,
  space: SPACE,
  cozy: COZY,
  sports: SPORTS,
  city: CITY,
  music: MUSIC,
  machines: MACHINES,
  crafts: CRAFTS,
  science: SCIENCE,
  dev: DEV,
  memes: MEMES,
  seasons: SEASONS,
  puzzles: PUZZLES,
  simulations: SIMULATIONS,
  destruction: DESTRUCTION,
  robots: ROBOTS,
  fluids: FLUIDS,
  idle: IDLE,
  ocean: OCEAN,
  insects: INSECTS,
  sky: SKY,
  farm: FARM,
  toys: TOYS,
  fantasy: FANTASY,
  party: PARTY,
}

export const THEME_MAKERS = {
  ...SATISFYING,
  ...PHYSICS,
  ...ARCADE,
  ...MOBILE,
  ...VERSUS,
  ...GENERATIVE,
  ...ANIMALS,
  ...FOOD,
  ...NATURE,
  ...SPACE,
  ...COZY,
  ...SPORTS,
  ...CITY,
  ...MUSIC,
  ...MACHINES,
  ...CRAFTS,
  ...SCIENCE,
  ...DEV,
  ...MEMES,
  ...SEASONS,
  ...PUZZLES,
  ...SIMULATIONS,
  ...DESTRUCTION,
  ...ROBOTS,
  ...FLUIDS,
  ...IDLE,
  ...OCEAN,
  ...INSECTS,
  ...SKY,
  ...FARM,
  ...TOYS,
  ...FANTASY,
  ...PARTY,
}

/** Every video of the feed, by kind. */
export const MAKERS: Record<Kind, Maker> = THEME_MAKERS

export type Theme = keyof typeof THEMES

/** Every video's theme: what the theme menu switches off. */
export const THEME_OF: Record<string, Theme> = {
  ...Object.fromEntries(Object.entries(THEMES).flatMap(([theme, makers]) => Object.keys(makers).map(kind => [kind, theme as Theme]))),
}

// Videos that belong to more than one theme: their home theme (THEME_OF,
// where their code and texts live) and these. Hiding any of a video's themes
// hides it; a hashtag focus on any of them shows it.
export const EXTRA_THEMES: Record<string, Theme[]> = {
  catkeys: ['dev', 'animals'],
  touchgrass: ['dev'],
  sokoban: ['puzzles'],
  minesweeper: ['puzzles'],
  game2048: ['puzzles'],
  watersort: ['puzzles'],
  ballsort: ['puzzles'],
  robotarm: ['robots'],
  warehouse: ['robots'],
  robotcoder: ['robots'],
  sumo: ['robots'],
  robot: ['robots'],
  life: ['simulations'],
  langton: ['simulations'],
  boids: ['simulations'],
  foxrabbit: ['simulations'],
  zombies: ['simulations'],
  demolition: ['destruction'],
  jenga: ['destruction'],
  cardtower: ['destruction'],
  chipper: ['destruction'],
  runner: ['mobile'],
  skytrack: ['mobile'],
  dragrace: ['sports'],
  monstertruck: ['sports'],
  snooker: ['sports'],
  pinball: ['sports'],
  stadiumwave: ['sports'],
  surfer: ['sports', 'ocean'],
  // the themes of the second list, and the older videos that belong in them too
  sable: ['fluids'],
  kinetic: ['fluids'],
  powder: ['fluids'],
  lava: ['fluids'],
  toothpaste: ['fluids'],
  citybuilder: ['idle'],
  towerdef: ['idle'],
  jellyfish: ['ocean'],
  reef: ['ocean'],
  octopus: ['ocean'],
  aquarium: ['ocean'],
  sailing: ['ocean'],
  bees: ['insects'],
  leafcutter: ['insects'],
  antfarm: ['insects'],
  antwar: ['insects'],
  spiderweb: ['insects'],
  balloons: ['sky'],
  feeder: ['sky'],
  bats: ['sky'],
  lanterns: ['sky'],
  farm: ['farm'],
  pumpkins: ['farm'],
  cradle: ['toys'],
  coiltrain: ['toys'],
  cauldron: ['fantasy'],
  claw: ['party'],
  coinpusher: ['party'],
  gumball: ['party'],
  gacha: ['party'],
  pinata: ['party'],
  factory: ['machines'],
  combine: ['machines'],
  canallock: ['machines'],
  flow: ['mobile'],
  arrows: ['mobile'],
  triplematch: ['mobile'],
  mergearmy: ['mobile'],
  horde: ['arcade'],
  airhockey: ['arcade'],
  hoops: ['arcade', 'sports'],
  plinko: ['physics'],
  pendulumwave: ['physics', 'science'],
  pythagoras: ['science'],
  drinkingbird: ['science'],
  whale: ['animals'],
  hatchlings: ['animals'],
  shellswap: ['animals'],
  sheepdog: ['animals'],
  seagull: ['animals'],
  butterfly: ['nature'],
  snowglobe: ['cozy', 'seasons'],
  dambreak: ['destruction'],
  droneshow: ['robots'],
  speedrun: ['memes'],
  // the third list
  battletops: ['versus'],
  screwjam: ['puzzles'],
  hexasort: ['puzzles'],
  blockjam: ['puzzles'],
  salmon: ['nature'],
}

/** A video's themes: its home theme first, then any others. */
export const themesOf = (kind: string): Theme[] => [THEME_OF[kind] as Theme, ...(EXTRA_THEMES[kind] ?? [])]
