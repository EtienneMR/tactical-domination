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
        value: 2,
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
    type: "melee",
    immune: "ranged",
    ressource: "gold",
    actions: [
      {
        type: "move",
        target: null,
        walk: true,
        range: 1,
        budget: 100,
      },
      {
        type: "melee",
        target: "enemy",
        walk: true,
        range: 1,
        budget: 50,
      },
    ],
  },
  {
    type: "archer",
    immune: null,
    ressource: "gold",
    actions: [
      {
        type: "move",
        target: null,
        walk: true,
        range: 1,
        budget: 100,
      },
      {
        type: "ranged",
        target: "enemy",
        walk: false,
        range: 3,
        budget: 100,
      },
    ],
  },
  {
    type: "horseman",
    immune: null,
    ressource: "gold",
    actions: [
      {
        type: "move",
        target: null,
        walk: true,
        range: 1,
        budget: 50,
      },
      {
        type: "melee",
        target: "enemy",
        walk: true,
        range: 1,
        budget: 100,
      },
    ],
  },
  {
    type: "builder",
    immune: null,
    ressource: "gold",
    actions: [
      {
        type: "move",
        target: null,
        walk: true,
        range: 1,
        budget: 100,
      },
      {
        type: "build",
        target: null,
        walk: false,
        range: 2,
        budget: 1,
      },
    ],
  },
  {
    type: "farmer",
    immune: null,
    ressource: "food",
    actions: [
      {
        type: "move",
        target: null,
        walk: true,
        range: 1,
        budget: 100,
      },
      {
        type: "melee",
        target: "enemy",
        walk: true,
        range: 1,
        budget: 100,
      },
    ],
  },
] as const;

ENTITIES_CLASSES satisfies readonly EntityClass[];

export const ENTITIES_TYPES = ENTITIES_CLASSES.map((e) => e.type);
export const ACTIONS_TYPES = ENTITIES_CLASSES.map((e) =>
  e.actions.map((a) => a.type)
).flat();

export const MAPS = [
  { id: "centeredMines", name: "Les mines du centre", label: "1v1" },
  { id: "edgeMines", name: "Les mines des angles", label: "1v1" },
  { id: "fourKingdoms", name: "Les quatres royaumes", label: "1v1v1v1" },
  { id: "forgotenCastles", name: "Les châteaux oubliés", label: "1v1" },
] as const;
export const MAP_IDS = MAPS.map((m) => m.id);
