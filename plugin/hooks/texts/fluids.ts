import type { Entry } from '../i18n'

// Fluids, sand & particles: names, authors, tags, captions and sounds.

export const FLUIDS = {
  dambreak: {
    name: { en: 'dam break', fr: 'rupture de barrage' },
    authors: ['@crack.in.the.dam', '@flood.sim', '@valley.below'],
    tags: ['#dambreak #flood #simulation', '#water #physics', '#fyp #foryou'],
    captions: {
      en: ['see the crack? it’s too late', 'the valley had three houses…', 'the wave hits the far wall and comes back', 'water always finds its level'],
      fr: ['tu vois la fissure ? c’est trop tard', 'la vallée avait trois maisons…', 'la vague tape le fond et revient', 'l’eau trouve toujours son niveau'],
    },
    sounds: {
      en: ['rushing water', 'original sound - crack.in.the.dam', 'disaster movie trailer'],
      fr: ['eau qui déferle', 'son original - crack.in.the.dam', 'bande-annonce de film catastrophe'],
    },
  },
  tiltglass: {
    name: { en: 'tilting glass', fr: 'verre qui penche' },
    authors: ['@slosh.physics', '@half.full.glass', '@ice.cubes.ride'],
    tags: ['#water #physics #satisfying', '#slosh #asmr', '#fyp #foryou'],
    captions: {
      en: ['the water stays level. the glass doesn’t.', 'watch the slosh catch up', 'the ice cubes are along for the ride', 'half full, always'],
      fr: ['l’eau reste à plat. le verre, non.', 'regarde la vague rattraper le verre', 'les glaçons font le voyage', 'à moitié plein, toujours'],
    },
    sounds: {
      en: ['water sloshing (ASMR)', 'original sound - slosh.physics', 'calm kitchen ambience'],
      fr: ['clapotis d’eau (ASMR)', 'son original - slosh.physics', 'ambiance de cuisine calme'],
    },
  },
  sandart: {
    name: { en: 'sand art bottle', fr: 'bouteille de sable coloré' },
    authors: ['@sand.layers', '@bottle.artist', '@wavy.sand'],
    tags: ['#sandart #satisfying #asmr', '#colouredsand #crafts', '#fyp #foryou'],
    captions: {
      en: ['the waves come from moving the tube', 'every colour a new layer', 'wait for the cork', 'a souvenir from the beach, made at my desk'],
      fr: ['les vagues viennent du tube qui bouge', 'chaque couleur, une nouvelle couche', 'attends le bouchon', 'un souvenir de plage, fait à mon bureau'],
    },
    sounds: {
      en: ['sand pouring (ASMR)', 'original sound - sand.layers', 'beach shop ukulele'],
      fr: ['sable qui coule (ASMR)', 'son original - sand.layers', 'ukulélé de boutique de plage'],
    },
  },
  cavefill: {
    name: { en: 'water filling a cave', fr: 'grotte qui se remplit' },
    authors: ['@cave.flood', '@chamber.by.chamber', '@drip.drip.drip'],
    tags: ['#cave #water #satisfying', '#simulation #flood', '#fyp #foryou'],
    captions: {
      en: ['the lowest chamber fills first', 'one chamber at a time', 'wait for it to reach the top one', 'then the floor gives way'],
      fr: ['la chambre la plus basse se remplit d’abord', 'une chambre à la fois', 'attends qu’elle atteigne celle du haut', 'et puis le fond lâche'],
    },
    sounds: {
      en: ['cave drips and trickling', 'original sound - cave.flood', 'deep ambient'],
      fr: ['gouttes et ruissellement de grotte', 'son original - cave.flood', 'ambient profond'],
    },
  },
  sandmaze: {
    name: { en: 'sand funnel maze', fr: 'labyrinthe de sable' },
    authors: ['@funnel.maze', '@gate.keeper.sand', '@rainbow.grains'],
    tags: ['#sand #satisfying #asmr', '#marblerun #funnel', '#fyp #foryou'],
    captions: {
      en: ['the red gates hold it, then let go', 'rainbow sand down the zigzag', 'the jar fills… and empties', 'I could watch the gates all day'],
      fr: ['les portes rouges retiennent, puis lâchent', 'du sable arc-en-ciel dans le zigzag', 'le bocal se remplit… et se vide', 'je pourrais regarder les portes toute la journée'],
    },
    sounds: {
      en: ['sand hissing (ASMR)', 'original sound - funnel.maze', 'music box'],
      fr: ['sable qui chuinte (ASMR)', 'son original - funnel.maze', 'boîte à musique'],
    },
  },
  snowglobe: {
    name: { en: 'snow globe', fr: 'boule à neige' },
    authors: ['@shake.and.wait', '@tiny.winter', '@snow.settles'],
    tags: ['#snowglobe #cozy #satisfying', '#winter #asmr', '#fyp #foryou'],
    captions: {
      en: ['shake it, then wait', 'the percentage is how much has settled', 'a tiny winter in a jar', 'the waiting is the best part'],
      fr: ['secoue, puis attends', 'le pourcentage, c’est ce qui est retombé', 'un petit hiver dans un bocal', 'attendre, c’est le meilleur moment'],
    },
    sounds: {
      en: ['glass and soft shaking', 'original sound - shake.and.wait', 'music box lullaby'],
      fr: ['verre et petites secousses', 'son original - shake.and.wait', 'berceuse de boîte à musique'],
    },
  },
  canallock: {
    name: { en: 'canal lock', fr: 'écluse' },
    authors: ['@lock.keeper', '@narrowboat.life', '@up.and.down.canal'],
    tags: ['#canallock #boats #satisfying', '#engineering #canal', '#fyp #foryou'],
    captions: {
      en: ['the boat goes up a hill on water', 'close behind, open ahead', 'the slowest elevator in the world', 'and now back down'],
      fr: ['le bateau monte une colline sur l’eau', 'on ferme derrière, on ouvre devant', 'l’ascenseur le plus lent du monde', 'et maintenant on redescend'],
    },
    sounds: {
      en: ['rushing sluice water', 'original sound - lock.keeper', 'sunday canal folk'],
      fr: ['eau qui jaillit de la vanne', 'son original - lock.keeper', 'folk du dimanche au bord du canal'],
    },
  },
  fizzypour: {
    name: { en: 'fizzy pour', fr: 'soda qui déborde' },
    authors: ['@foam.to.the.brim', '@pour.it.slow', '@fizz.overflow'],
    tags: ['#soda #satisfying #asmr', '#pour #overflow', '#fyp #foryou'],
    captions: {
      en: ['to the brim… and over', 'the foam always wins', 'I said pour it SLOWLY', 'now we wait for the foam to go down'],
      fr: ['jusqu’au bord… et au-delà', 'la mousse gagne toujours', 'j’ai dit de verser DOUCEMENT', 'maintenant on attend que la mousse redescende'],
    },
    sounds: {
      en: ['fizz and crackle (ASMR)', 'original sound - foam.to.the.brim', 'summer pop'],
      fr: ['pétillement (ASMR)', 'son original - foam.to.the.brim', 'pop d’été'],
    },
  },
} satisfies Record<string, Entry>
