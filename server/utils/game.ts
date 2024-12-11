import { H3Event } from "h3";

export function createGame(
  event: H3Event,
  initiator: string,
  mapName: string
): Game {
  const runtimeConfig = useRuntimeConfig(event);

  const map = generateMap(mapName);

  return {
    version: runtimeConfig.public.gitVersion,
    mapName,
    state: "initing",
    turn: 0,

    players: map
      .filter((cell) => cell.building == "castle")
      .map((cell, index) => ({
        pid: cell.owner == 0 ? initiator : null,
        replay: false,
        index: cell.owner!,

        gold: 1,
        food: 5,
      })),
    entities: map
      .filter((cell) => cell.building == "castle" && cell.owner)
      .map((cell, index) => ({
        eid: `e${index}`,
        type: "melee",
        owner: cell.owner,
        x: cell.x,
        y: cell.y,
        budget: 100,
      })),

    map,
  };
}
