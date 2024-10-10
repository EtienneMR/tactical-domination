import { GRID_HEIGHT, GRID_WIDTH } from "~~/shared/consts";
import type { Game } from "~~/shared/types";

export function createGame(initiator: string): Game {
  const data = [];

  for (let i = 0; i < GRID_WIDTH * GRID_HEIGHT; i++) {
    data.push({ biome: "plains", building: "main_base", owner: null });
  }

  return {
    id: `g${Math.floor(Math.random() * 1000000)}`,

    state: "initing",

    players: [
      {
        pid: null,
        replay: false,

        gold: 1,
        wheat: 5,
      },
    ],

    entities: [],
    map: {
      v: 0,
      data,
    },
  };
}
