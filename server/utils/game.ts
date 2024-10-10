import { GRID_HEIGHT, GRID_WIDTH } from "~~/shared/consts";
import type { Game } from "~~/shared/types";

const BIOMES = ["plains", "forest", "rocks"];

export function createGame(initiator: string): Game {
  const data = [];

  for (let i = 0; i < GRID_WIDTH * GRID_HEIGHT; i++) {
    data.push({
      biome: BIOMES[Math.floor((i / GRID_WIDTH / GRID_HEIGHT) * 3)] as string,
      building: null as string | null,
      owner: null as number | null,
    });
  }

  data[0]!.building = "castle";
  data[0]!.owner = 0;

  data[data.length - 1]!.building = "castle";
  data[data.length - 1]!.owner = 1;

  return {
    id: `g${Math.floor(Math.random() * 1000000)}`,

    state: "initing",

    players: [
      {
        pid: initiator,
        replay: false,

        gold: 1,
        wheat: 5,
      },
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
