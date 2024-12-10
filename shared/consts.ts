export const GRID_SIZE = 12;
export const REGION_SIZE = 4;
export const SMOOTH_REPEATS = 30;

export const BIOMES_TYPES = ["plains", "forest", "rocks"] as const;

export const BUILDINGS_CLASSES = [
  {
    type: "castle",
    walkable: true,
    ownable: true,
    effects: [
      {
        type: "food",
        value: 3,
      },
    ],
  },
  {
    type: "mine",
    walkable: true,
    ownable: false,
    effects: [
      {
        type: "gold",
        value: 1,
      },
    ],
  },
  {
    type: "wheat",
    walkable: true,
    ownable: false,
    effects: [
      {
        type: "food",
        value: 5,
      },
    ],
  },
  {
    type: "pasture",
    walkable: true,
    ownable: false,
    effects: [
      {
        type: "food",
        value: 5,
      },
    ],
  },
  {
    type: "wall",
    walkable: false,
    ownable: true,
    effects: [],
  },
  {
    type: "lake",
    walkable: false,
    ownable: false,
    effects: [],
  },
  {
    type: "mountain",
    walkable: false,
    ownable: false,
    effects: [],
  },
] as const;

export const BUILDINGS_TYPES = BUILDINGS_CLASSES.map((b) => b.type);

export const ENTITIES_CLASSES = [
  {
    type: "archer",
    immune: null,
    actions: [
      {
        type: "move",
        target: null,
        range: 1,
        budget: 100,
      },
      {
        type: "ranged",
        target: "enemy",
        range: 3,
        budget: 100,
      },
    ],
  },
  {
    type: "builder",
    immune: null,
    actions: [
      {
        type: "move",
        target: null,
        range: 1,
        budget: 100,
      },
      {
        type: "build",
        target: null,
        range: 2,
        budget: 0,
      },
    ],
  },
  {
    type: "horseman",
    immune: null,
    actions: [
      {
        type: "move",
        target: null,
        range: 1,
        budget: 50,
      },
      {
        type: "melee",
        target: "enemy",
        range: 2,
        budget: 100,
      },
    ],
  },
  {
    type: "melee",
    immune: "ranged",
    actions: [
      {
        type: "move",
        target: null,
        range: 1,
        budget: 75,
      },
      {
        type: "melee",
        target: "enemy",
        range: 1,
        budget: 25,
      },
    ],
  },
] as const;

ENTITIES_CLASSES satisfies readonly EntityClass[];

export const ENTITIES_TYPES = ENTITIES_CLASSES.map((e) => e.type);
export const ACTIONS_TYPES = ENTITIES_CLASSES.map((e) =>
  e.actions.map((a) => a.type)
).flat();
