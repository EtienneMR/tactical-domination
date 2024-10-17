import { BIOMES, BUILDINGS, ENTITIES } from "~~/shared/consts";

export type Biome = (typeof BIOMES)[number];
export type BuildingType = (typeof BUILDINGS)[number] | null;
export type EntityType = (typeof ENTITIES)[number];

export interface Cell {
  x: number;
  y: number;
  biome: Biome;
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

  entities: Entity[];
  map: SharedCell[];
}

export type MaybeGame = Game | null;
export type MaybePromise<T> = T | Promise<T>;
