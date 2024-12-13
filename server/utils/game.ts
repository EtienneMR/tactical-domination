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
      .filter((cell) => cell.building == "castle" && cell.owner != null)
      .map((cell) => ({
        pid: cell.owner == 0 ? initiator : null,
        alive: true,
        index: cell.owner!,

        gold: 2,
        food: 5,
      })),
    entities: [],
    events: [],

    map,
  };
}
