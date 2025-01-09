export type GameStatus = "initing" | "started" | "ended";

export interface GameState {
  status: GameStatus;
  players: Player[];
  currentPlayer: number;
  entities: Entity[];
  events: string[];
  map: Cell[][];
  uniqueIdCounter: number;
}

export interface Game {
  gameId: string;
  version: string;
  mapName: string;
  users: User[];
  state: GameState;
  previousState: GameState | null;
}
