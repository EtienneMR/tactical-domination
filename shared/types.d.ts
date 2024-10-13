import { BIOMES, BUILDINGS } from "~~/shared/consts";

type Biome = (typeof BIOMES)[number];
type Building = (typeof BUILDINGS)[number] | null;

export interface Cell {
  x: number;
  y: number;
  biome: Biome;
  building: Building;
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

export interface Game {
  state: "initing" | "started" | "ended";

  players: {
    pid: string | null;
    replay: boolean;

    gold: number;
    wheat: number;
  }[];

  entities: {}[];
  map: SharedCell[];
}

export type MaybeGame = Game | null;
export type MaybePromise<T> = T | Promise<T>;
