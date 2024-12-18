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

export type GameStatus = "initing" | "started" | "ended";

export type SpawnCostMap = {
  [entityType in EntityType]: number;
};

export interface Player {
  readonly index: number;
  alive: boolean;
  gold: number;
  food: number;
  spawnCost: SpawnCostMap;
}

export interface GameState {
  status: GameStatus;
  mapName: string;
  players: Player[];
  turn: number;
  entities: Entity[];
  events: string[];
  map: Cell[];
}

export interface User {
  uid: string;
  name: string;
  index: number | null;
}

export interface Game {
  gid: string;
  version: string;
  users: User[];

  state: GameState;
  previousState: GameState | null;
}
