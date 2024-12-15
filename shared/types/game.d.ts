import type { BiomeType, BuildingType } from "./biomes";
import type { EntityType } from "./entities";

export type GameState = "initing" | "started" | "ended";

export interface Position {
  x: number;
  y: number;
}

export interface WriteCell extends Position {
  biome: BiomeType;
  building: BuildingType;
  height: number;
  heightLimits: [number, number];
  owner: number | null;
}

export interface Cell extends WriteCell {
  readonly biome: BiomeType;
  readonly height: number;
  readonly heightLimits: [number, number];
}

export type SharedCell = Pick<Cell, "biome" | "building" | "owner">;

export type SpawnCostMap = {
  [entityType in EntityType]: number;
};

export interface Player {
  readonly index: number;
  pid: string | null;
  alive: boolean;
  gold: number;
  food: number;
  spawnCost: SpawnCostMap;
}

export interface Game {
  state: GameState;
  mapName: string;
  players: Player[];
  turn: number;
  entities: Entity[];
  events: string[];
  map: Cell[];
  version: string;
}
