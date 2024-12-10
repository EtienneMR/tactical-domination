import { H3Event } from "h3";

export function createGame(event: H3Event, initiator: string): Game {
  const runtimeConfig = useRuntimeConfig(event);
  const map = generateMap();

  return {
    version: runtimeConfig.public.gitVersion,
    state: "initing",
    turn: 0,

    players: [
      {
        pid: initiator,
        replay: false,
        index: 0,

        gold: 1,
        food: 5,
      },
      {
        pid: null,
        replay: false,
        index: 1,

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
        budget: 100,
      })),

    map,
  };
}
