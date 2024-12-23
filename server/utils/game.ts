import { ENTITIES_TYPES } from "~~/shared/consts";

export function createGame(mapName: string): GameState {
  const map = generateMap(mapName);

  return {
    mapName,
    status: "initing",
    turn: 0,

    players: map
      .filter((cell) => cell.building == "castle" && cell.owner != null)
      .map((cell) => cell.owner!)
      .toSorted()
      .map((owner) => ({
        alive: true,
        index: owner,

        gold: 3,
        food: 5,
        spawnCost: ENTITIES_TYPES.reduce((acc, type) => {
          acc[type] = 1;
          return acc;
        }, {} as SpawnCostMap),
      })),
    entities: [],
    events: [],

    map,
  };
}
