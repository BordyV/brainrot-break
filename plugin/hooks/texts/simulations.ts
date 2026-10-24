import type { Entry } from '../i18n'

// Simulations & emergence: names, authors, tags, captions and sounds.

export const SIMULATIONS = {
  powder: {
    name: { en: 'falling sand world', fr: 'monde de sable' },
    authors: ['@powder.world', '@pixel.physics', '@sand.box'],
    tags: ['#fallingsand #simulation #satisfying', '#pixelart #physics', '#fyp #foryou'],
    captions: {
      en: ['sand, water... and then fire', 'every pixel follows the rules', 'wait for the spark', 'remember the powder games?'],
      fr: ['du sable, de l’eau... et puis le feu', 'chaque pixel suit les règles', 'attends l’étincelle', 'tu te souviens des powder games ?'],
    },
    sounds: {
      en: ['sand pouring (ASMR)', 'original sound - powder.world', 'chiptune ambience'],
      fr: ['sable qui coule (ASMR)', 'son original - powder.world', 'ambiance chiptune'],
    },
  },
  phantomjam: {
    name: { en: 'phantom traffic jam', fr: 'bouchon fantôme' },
    authors: ['@phantom.jam', '@ring.road', '@traffic.waves'],
    tags: ['#traffic #science #simulation', '#physics #driving', '#fyp #foryou'],
    captions: {
      en: ['one car brakes. watch the wave.', 'no accident, still a jam', 'the jam moves backwards', 'this is why you should not tailgate'],
      fr: ['une voiture freine. regarde la vague.', 'aucun accident, et pourtant un bouchon', 'le bouchon recule', 'voilà pourquoi il faut garder ses distances'],
    },
    sounds: {
      en: ['motorway hum (original sound)', 'original sound - phantom.jam', 'documentary synth'],
      fr: ['bourdonnement d’autoroute (son original)', 'son original - phantom.jam', 'synthé de documentaire'],
    },
  },
  particlelife: {
    name: { en: 'particle life', fr: 'vie de particules' },
    authors: ['@particle.life', '@four.colours.rule', '@tiny.creatures'],
    tags: ['#particlelife #simulation #emergence', '#artificiallife #generative', '#fyp #foryou'],
    captions: {
      en: ['four colours, one table of rules, and… creatures?', 'nobody coded those little guys', 'new rules every 20 seconds', 'the green squares pull, the red ones push'],
      fr: ['quatre couleurs, un tableau de règles, et… des créatures ?', 'personne n’a codé ces petites bêtes', 'nouvelles règles toutes les 20 secondes', 'les cases vertes attirent, les rouges repoussent'],
    },
    sounds: {
      en: ['ambient synth pads', 'original sound - particle.life', 'microscope ambience'],
      fr: ['nappes de synthé ambient', 'son original - particle.life', 'ambiance de microscope'],
    },
  },
  geneticcars: {
    name: { en: 'genetic cars', fr: 'voitures génétiques' },
    authors: ['@evolve.the.wheels', '@generation.next', '@survival.of.fastest'],
    tags: ['#geneticalgorithm #evolution #simulation', '#machinelearning #cars', '#fyp #foryou'],
    captions: {
      en: ['generation 1 can barely climb a bump', 'the best two have kids. the kids go further.', 'bigger wheels? longer body? evolution decides', 'the dotted line is the record to beat'],
      fr: ['la génération 1 passe à peine une bosse', 'les deux meilleures ont des enfants. les enfants vont plus loin.', 'plus grandes roues ? plus long ? l’évolution décide', 'la ligne pointillée, c’est le record à battre'],
    },
    sounds: {
      en: ['tiny engines revving', 'original sound - evolve.the.wheels', 'science documentary music'],
      fr: ['petits moteurs qui vrombissent', 'son original - evolve.the.wheels', 'musique de documentaire scientifique'],
    },
  },
  learncars: {
    name: { en: 'cars learn to drive', fr: 'les voitures apprennent à conduire' },
    authors: ['@ai.learns.to.drive', '@neural.racer', '@crash.and.learn'],
    tags: ['#ai #machinelearning #racing', '#neuralnetwork #simulation', '#fyp #foryou'],
    captions: {
      en: ['generation 1: straight into the grass', 'it only learns from the one that got furthest', 'the yellow lines are what it sees', 'by generation 5 it takes the corner'],
      fr: ['génération 1 : direct dans l’herbe', 'elle n’apprend que de celle qui est allée le plus loin', 'les lignes jaunes, c’est ce qu’elle voit', 'à la génération 5, elle prend le virage'],
    },
    sounds: {
      en: ['tyres screeching', 'original sound - ai.learns.to.drive', 'lo-fi coding beats'],
      fr: ['crissements de pneus', 'son original - ai.learns.to.drive', 'beats lo-fi pour coder'],
    },
  },
  ropebridge: {
    name: { en: 'rope bridge', fr: 'pont de corde' },
    authors: ['@bridge.inspector', '@one.more.crate', '@sag.and.snap'],
    tags: ['#bridge #physics #simulation', '#ropebridge #satisfying', '#fyp #foryou'],
    captions: {
      en: ['one crate: fine. two: fine. three…', 'watch it sag', 'the bridge inspector was on holiday', 'rated for two crates, apparently'],
      fr: ['une caisse : ça va. deux : ça va. trois…', 'regarde-le s’affaisser', 'l’inspecteur des ponts était en vacances', 'prévu pour deux caisses, visiblement'],
    },
    sounds: {
      en: ['creaking wood', 'original sound - bridge.inspector', 'suspense strings'],
      fr: ['bois qui grince', 'son original - bridge.inspector', 'cordes de suspense'],
    },
  },
  softbody: {
    name: { en: 'soft bodies', fr: 'corps mous' },
    authors: ['@jelly.physics', '@squish.squad', '@boing.boing'],
    tags: ['#softbody #physics #satisfying', '#jelly #simulation', '#fyp #foryou'],
    captions: {
      en: ['squish. squish. squish.', 'jelly vs stairs', 'they keep their volume, not their dignity', 'the little faces when they land'],
      fr: ['squish. squish. squish.', 'gelée contre escalier', 'ils gardent leur volume, pas leur dignité', 'les petites têtes quand ils atterrissent'],
    },
    sounds: {
      en: ['jelly boings (ASMR)', 'original sound - jelly.physics', 'bouncy cartoon music'],
      fr: ['boings de gelée (ASMR)', 'son original - jelly.physics', 'musique de dessin animé rebondissante'],
    },
  },
  ragdoll: {
    name: { en: 'ragdoll stairs', fr: 'ragdoll dans l’escalier' },
    authors: ['@crash.test.dummy', '@every.single.step', '@bonus.points.ouch'],
    tags: ['#ragdoll #physics #stairs', '#dummy #simulation', '#fyp #foryou'],
    captions: {
      en: ['he hit every single step', 'the score is in pain points', 'a little push. that’s all it took.', 'crash test dummy, stairs edition'],
      fr: ['il a touché chaque marche', 'le score est en points de douleur', 'une petite poussée. il n’en fallait pas plus.', 'mannequin de crash test, édition escalier'],
    },
    sounds: {
      en: ['thud thud thud', 'original sound - crash.test.dummy', 'dramatic slow-mo music'],
      fr: ['boum boum boum', 'son original - crash.test.dummy', 'musique dramatique au ralenti'],
    },
  },
} satisfies Record<string, Entry>
