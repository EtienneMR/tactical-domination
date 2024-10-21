import {
  BIOMES_TYPES,
  BUILDINGS_TYPES,
  ENTITIES_CLASSES,
  ENTITIES_TYPES,
} from "~~/shared/consts";

export type EntityClass = (typeof ENTITIES_CLASSES)[number];

export type BiomeType = (typeof BIOMES_TYPES)[number];
export type BuildingType = (typeof BUILDINGS_TYPES)[number] | null;
export type EntityType = (typeof ENTITIES_TYPES)[number];

export interface Position {
  x: number;
  y: number;
}

export interface Cell {
  x: number;
  y: number;
  biome: BiomeType;
  building: BuildingType;
  height: number;
  heightLimits: [number, number];
  owner: number | null;
}

export type SharedCell = Pick<Cell, "biome" | "building" | "owner">;

interface GenerationRule {
  if: (cell: Cell, opp: Cell) => boolean;
  then?: Partial<Cell>;
  action?: (cell: Cell) => void;
}

export type GenerationPatern = {
  pre: GenerationRule[];
  step: GenerationRule[];
  post: GenerationRule[];
};

interface Player {
  pid: string | null;
  replay: boolean;

  gold: number;
  food: number;
}

type indexedPlayer = Player & { index: number };

interface Entity {
  eid: string;
  type: EntityType;
  owner: number;
  x: number;
  y: number;
}

export interface Game {
  state: "initing" | "started" | "ended";

  players: Player[];
  turn: number;

  entities: Entity[];
  map: Cell[];
}

export type MaybeGame = Game | null;
export type MaybePromise<T> = T | Promise<T>;
