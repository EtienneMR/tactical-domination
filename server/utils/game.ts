import type { Game } from "~~/shared/types";

export function createGame(initiator: string): Game {
  return {
    state: "initing",

    players: [
      {
        pid: initiator,
        replay: false,

        gold: 1,
        food: 5,
      },
      {
        pid: null,
        replay: false,

        gold: 1,
        food: 5,
      },
    ],

    entities: [],
    map: generateMap(),
  };
}
