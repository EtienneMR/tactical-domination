import { BiomeType, BuildingType } from "./biomes";

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

export interface Player {
  readonly index: number;
  pid: string | null;
  replay: boolean;
  gold: number;
  food: number;
}

export interface Game {
  state: GameState;
  players: Player[];
  turn: number;
  entities: Entity[];
  map: Cell[];
  version: string;
}
