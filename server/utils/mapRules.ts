import { ValueNoise } from "value-noise-js"

const REGION_SIZE = 4

function distance(a: { x: number; y: number }, b: { x: number; y?: number }) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - (b.y ?? b.x), 2))
}

function is(a: { x: number; y: number }, b: { x: number; y?: number }) {
  return a.x == b.x && a.y == (b.y ?? b.x)
}

function random(x: number) {
  return Math.random() < x
}

export const rules = {
  castlesBasic: [
    {
      if: cell => is(cell, { x: 0 }),
      then: {
        building: "castle",
        owner: 0
      },
      when: "pre"
    },
    {
      if: cell => is(cell, { x: MAP_SIZE - 1 }),
      then: {
        building: "castle",
        owner: 1
      },
      when: "pre"
    },
    {
      if: cell =>
        distance(cell, { x: 0 }) <= 4 ||
        distance(cell, { x: MAP_SIZE - 1 }) <= 4,
      then: {
        biome: "plains",
        heightLimits: [0, 0]
      },
      when: "step"
    }
  ],
  castlesPlus: [
    {
      if: cell => is(cell, { x: 0, y: MAP_SIZE - 1 }),
      then: {
        building: "castle",
        owner: 2
      },
      when: "pre"
    },
    {
      if: cell => is(cell, { x: MAP_SIZE - 1, y: 0 }),
      then: {
        building: "castle",
        owner: 3
      },
      when: "pre"
    },
    {
      if: cell =>
        distance(cell, { x: 0, y: MAP_SIZE - 1 }) <= 4 ||
        distance(cell, { x: MAP_SIZE - 1, y: 0 }) <= 4,
      then: {
        biome: "plains",
        heightLimits: [0, 0]
      },
      when: "step"
    }
  ],
  castlesNeutral: [
    {
      if: cell => is(cell, { x: 0, y: MAP_SIZE - 1 }),
      then: {
        building: "castle",
        owner: null
      },
      when: "pre"
    },
    {
      if: cell => is(cell, { x: MAP_SIZE - 1, y: 0 }),
      then: {
        building: "castle",
        owner: null
      },
      when: "pre"
    },
    {
      if: cell =>
        distance(cell, { x: 0, y: MAP_SIZE - 1 }) <= 4 ||
        distance(cell, { x: MAP_SIZE - 1, y: 0 }) <= 4,
      then: {
        biome: "plains",
        heightLimits: [0, 0]
      },
      when: "step"
    }
  ],
  castlesDuo: [
    {
      if: cell => is(cell, { x: 1, y: 0 }),
      then: {
        building: "castle",
        owner: 0
      },
      when: "pre"
    },
    {
      if: cell => is(cell, { x: 0, y: 1 }),
      then: {
        building: "castle",
        owner: 3
      },
      when: "pre"
    },
    {
      if: cell => is(cell, { x: MAP_SIZE - 1, y: MAP_SIZE - 2 }),
      then: {
        building: "castle",
        owner: 1
      },
      when: "pre"
    },
    {
      if: cell => is(cell, { x: MAP_SIZE - 2, y: MAP_SIZE - 1 }),
      then: {
        building: "castle",
        owner: 2
      },
      when: "pre"
    },
    {
      if: cell =>
        distance(cell, { x: 0 }) <= 4 ||
        distance(cell, { x: MAP_SIZE - 1 }) <= 4,
      then: {
        biome: "plains",
        heightLimits: [0, 0]
      },
      when: "step"
    }
  ],
  castlesTriple: [
    {
      if: cell => is(cell, { x: 0, y: 0 }),
      then: {
        building: "castle",
        owner: 0
      },
      when: "pre"
    },
    {
      if: cell => is(cell, { x: MAP_SIZE - 1, y: 0 }),
      then: {
        building: "castle",
        owner: 1
      },
      when: "pre"
    },
    {
      if: cell => is(cell, { x: Math.floor(MAP_SIZE / 2), y: MAP_SIZE - 1 }),
      then: {
        building: "castle",
        owner: 2
      },
      when: "pre"
    },
    {
      if: cell =>
        distance(cell, { x: 0, y: 0 }) <= 4 ||
        distance(cell, { x: MAP_SIZE - 1, y: 0 }) <= 4 ||
        distance(cell, { x: Math.floor(MAP_SIZE / 2), y: MAP_SIZE - 1 }) <= 4,
      then: {
        biome: "plains",
        heightLimits: [0, 0]
      },
      when: "step"
    }
  ],

  minesEdge: [
    {
      if: cell =>
        is(cell, { x: 1, y: MAP_SIZE - 2 }) ||
        is(cell, { x: MAP_SIZE - 2, y: 1 }),
      then: {
        building: "mine"
      },
      when: "pre"
    },
    {
      if: cell =>
        distance(cell, { x: 0, y: MAP_SIZE - 1 }) <= 4 ||
        distance(cell, { x: MAP_SIZE - 1, y: 0 }) <= 4,
      then: {
        biome: "rocks",
        heightLimits: [0.8, 1]
      },
      when: "step"
    }
  ],
  minesCenter: [
    {
      if: cell =>
        is(cell, { x: MAP_SIZE / 2 - 1 }) || is(cell, { x: MAP_SIZE / 2 }),
      then: {
        building: "mine"
      },
      when: "pre"
    },
    {
      if: cell => distance(cell, { x: (MAP_SIZE - 1) / 2 }) <= 2,
      then: {
        biome: "rocks",
        heightLimits: [0.8, 1]
      },
      when: "step"
    }
  ],
  minesSquare: [
    {
      if: cell =>
        is(cell, { x: 4 }) ||
        is(cell, { x: MAP_SIZE - 1 - 4 }) ||
        is(cell, { x: 4, y: MAP_SIZE - 1 - 4 }) ||
        is(cell, { x: MAP_SIZE - 1 - 4, y: 4 }),
      then: {
        building: "mine"
      },
      when: "pre"
    },
    {
      if: cell => distance(cell, { x: (MAP_SIZE - 1) / 2 }) <= 4,
      then: {
        biome: "rocks",
        heightLimits: [0.8, 1]
      },
      when: "step"
    }
  ],
  minesClose: [
    {
      if: cell => is(cell, { x: 3 }) || is(cell, { x: MAP_SIZE - 1 - 3 }),
      then: {
        building: "mine"
      },
      when: "pre"
    },
    {
      if: cell =>
        distance(cell, { x: 3 }) <= 2 ||
        distance(cell, { x: MAP_SIZE - 1 - 3 }) <= 2,
      then: {
        biome: "rocks",
        heightLimits: [0.8, 1]
      },
      when: "step"
    }
  ],
  minesTriangle: [
    {
      if: cell =>
        is(cell, { x: 4 }) ||
        is(cell, { x: MAP_SIZE - 1 - 4, y: 4 }) ||
        is(cell, { x: Math.floor((MAP_SIZE - 1) / 2), y: MAP_SIZE - 1 - 4 }),
      then: {
        building: "mine"
      },
      when: "pre"
    },
    {
      if: cell => distance(cell, { x: (MAP_SIZE - 1) / 2 }) <= 3,
      then: {
        biome: "rocks",
        heightLimits: [0.8, 1]
      },
      when: "step"
    }
  ],

  biomes: [
    {
      if: cell => cell.height < 0.4,
      then: {
        biome: "plains"
      },
      when: "post"
    },
    {
      if: cell => 0.4 <= cell.height && cell.height < 0.7,
      then: {
        biome: "forest"
      },
      when: "post"
    },
    {
      if: cell => 0.7 <= cell.height,
      then: {
        biome: "rocks"
      },
      when: "post"
    }
  ],

  food: [
    {
      if: (cell, opp) =>
        cell.building == null &&
        cell.biome == "plains" &&
        opp.building == null &&
        opp.biome == "plains" &&
        random(0.1),
      then: {
        building: "wheat"
      },
      when: "post"
    },
    {
      if: (cell, opp) => opp.building == "wheat",
      then: {
        building: "wheat"
      },
      when: "post"
    },
    {
      if: (cell, opp) =>
        cell.building == null &&
        cell.biome == "rocks" &&
        opp.building == null &&
        opp.biome == "rocks" &&
        random(0.1),
      then: {
        building: "pasture"
      },
      when: "post"
    },
    {
      if: (cell, opp) => opp.building == "pasture",
      then: {
        building: "pasture"
      },
      when: "post"
    }
  ],

  obstacles: [
    {
      if: (cell, opp) =>
        cell.building == null &&
        cell.biome == "plains" &&
        opp.building == null &&
        opp.biome == "plains" &&
        cell.height > 0 &&
        opp.height > 0 &&
        random(0.1),
      then: {
        building: "lake"
      },
      when: "post"
    },
    {
      if: (cell, opp) => opp.building == "lake",
      then: {
        building: "lake"
      },
      when: "post"
    },
    {
      if: (cell, opp) =>
        cell.building == null &&
        cell.biome == "rocks" &&
        opp.building == null &&
        opp.biome == "rocks" &&
        random(0.1),
      then: {
        building: "mountain"
      },
      when: "post"
    },
    {
      if: (cell, opp) => opp.building == "mountain",
      then: {
        building: "mountain"
      },
      when: "post"
    }
  ],
  middleMountains: [
    {
      if: cell => Math.abs(cell.x - (MAP_SIZE - 1 - cell.y)) < 2,
      then: {
        building: "mountain"
      },
      when: "pre"
    },
    {
      if: cell => Math.abs(cell.x - (MAP_SIZE - 1 - cell.y)) < 3,
      then: {
        biome: "rocks",
        heightLimits: [0.8, 1]
      },
      when: "step"
    }
  ],

  ruins: [
    {
      if: cell =>
        cell.building == null &&
        cell.biome == "plains" &&
        cell.height > 0 &&
        random(0.05),
      then: {
        building: "ruins"
      },
      when: "post"
    }
  ]
} satisfies { [ruleName: string]: GenerationRule[] }

export function getNoiseRule(): GenerationRule {
  const noise = new ValueNoise(undefined, undefined, "perlin")

  return {
    if: cell => true,
    action: cell =>
      (cell.height = noise.evalXY(
        (cell.x / MAP_SIZE) * REGION_SIZE,
        (cell.y / MAP_SIZE) * REGION_SIZE
      )),
    when: "pre"
  }
}

export const mapsRules = {
  centeredMines: [
    ...rules.castlesBasic,
    ...rules.minesCenter,
    ...rules.biomes,
    ...rules.food,
    ...rules.obstacles,
    ...rules.ruins
  ],
  edgeMines: [
    ...rules.castlesBasic,
    ...rules.minesEdge,
    ...rules.biomes,
    ...rules.food,
    ...rules.obstacles,
    ...rules.ruins
  ],
  fourCastles: [
    ...rules.castlesBasic,
    ...rules.castlesPlus,
    ...rules.minesSquare,
    ...rules.biomes,
    ...rules.food,
    ...rules.obstacles,
    ...rules.ruins
  ],
  emptyCastles: [
    ...rules.castlesBasic,
    ...rules.castlesNeutral,
    ...rules.minesSquare,
    ...rules.biomes,
    ...rules.food,
    ...rules.obstacles,
    ...rules.ruins
  ],
  duoCastles: [
    ...rules.castlesDuo,
    ...rules.minesEdge,
    ...rules.biomes,
    ...rules.food,
    ...rules.obstacles,
    ...rules.ruins
  ],
  tripleCastles: [
    ...rules.castlesTriple,
    ...rules.minesTriangle,
    ...rules.biomes,
    ...rules.food,
    ...rules.obstacles,
    ...rules.ruins
  ],
  mountainBarrier: [
    ...rules.castlesBasic,
    ...rules.minesClose,
    ...rules.biomes,
    ...rules.food,
    ...rules.obstacles,
    ...rules.middleMountains,
    ...rules.ruins
  ]
} satisfies { [ruleName in (typeof MAP_IDS)[number]]: GenerationRule[] }
