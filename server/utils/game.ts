import type { Game } from "~~/shared/types";

export function createGame(initiator: string): Game {
  const map = generateMap();

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

    entities: map
      .filter((cell) => cell.building == "castle")
      .map((cell, index) => ({
        eid: `e${index}`,
        type: "melee",
        owner: cell.owner!,
        x: cell.x,
        y: cell.y,
      })),

    map,
  };
}
