export function createGame(mapName: string): GameState {
  const map = generateMap(mapName);

  return {
    status: "initing",
    currentPlayer: 0,

    players: map
      .flat()
      .filter((cell) => cell.building == "castle" && cell.owner != null)
      .map((cell) => cell.owner!)
      .toSorted()
      .map((owner) => ({
        alive: true,
        index: owner,

        ressources: { gold: 3, food: 5 },
      })),
    entities: [],
    events: [],
    uniqueIdCounter: 0,

    map,
  };
}
