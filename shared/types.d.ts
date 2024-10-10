export interface Game {
  id: string;
  state: "initing" | "started" | "ended";

  players: {
    pid: string | null;
    replay: boolean;

    gold: number;
    wheat: number;
  }[];

  entities: {}[];
  map: {
    v: number;
    data: { biome: string; building: string | null; owner: number | null }[];
  };
}

export type MaybeGame = Game | null;
export type MaybePromise<T> = T | Promise<T>;
