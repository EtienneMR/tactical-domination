export default defineEventHandler(async (event) => {
  const { gameId, userId } = getQuery(event);

  assertValidString(gameId, "gameId");
  assertValidString(userId, "userId");

  const kv = await useKv();

  await updateGame(kv, gameId, (game) => {
    assertValidGame(game, gameId);

    const { state: gameState } = game;

    assertGameInStatus(gameState, "started", gameId);

    const player = getPlayerFromUserId(game, userId);
    assertValidPlayer(player, userId);
    assertCanPlay(gameState, player);

    for (const entity of gameState.entities) {
      if (entity.owner == gameState.currentPlayer) {
        entity.budget = 100;

        const entityClass = getEntityClassFromName(entity.className);
        if (entityClass.resource == "gold") player.ressources.food -= 1;
      }
    }

    for (const cell of gameState.map.flat()) {
      if (cell.owner == gameState.currentPlayer && cell.building) {
        for (const effect of getBuildingClassFromType(cell.building).effects) {
          player.ressources[effect.type] += effect.value;
        }
      }
    }

    for (let _ = 0; _ < -player.ressources.food; _++) {
      const entity = gameState.entities.find((e) => e.owner == player.index);
      if (entity) {
        entity.owner = null;

        const cell = getCellFromPosition(gameState, entity);
        cell.owner = null;
      }
    }

    player.ressources.food = Math.max(player.ressources.food, 1);

    for (const player of gameState.players) {
      player.alive =
        gameState.map
          .flat()
          .some((c) => c.building == "castle" && c.owner == player.index) ||
        gameState.entities.some((e) => e.owner == player.index);
    }

    const currentPlayer = gameState.currentPlayer;

    while (true) {
      const turn = (gameState.currentPlayer =
        (gameState.currentPlayer + 1) % gameState.players.length);

      if (turn == currentPlayer) {
        gameState.status = "ended";
        break;
      } else if (gameState.players[turn]!.alive) break;
    }

    gameState.events.push("end_turn");

    game.previousState = structuredClone(gameState);

    return game;
  });
});
