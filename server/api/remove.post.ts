export default defineEventHandler(async (event) => {
  const { gameId, userId, entityId } = getQuery(event);

  assertValidString_old(gameId, "gameId");
  assertValidString_old(userId, "userId");
  assertValidString_old(entityId, "entityId");

  const kv = await useKv();

  await updateGame(kv, gameId, async (game) => {
    assertValidGame(game, gameId);

    const { state: gameState } = game;

    assertGameInStatus(gameState, "started", gameId);

    const entity = getEntityFromId(gameState, entityId);
    assertValidEntity(entity, entityId);

    if (entity.budget < 100) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Can't transform entity "${entityId}" which has already been used`,
      });
    }

    const player = getPlayerFromUserId(game.state, game.users, userId);
    assertValidPlayer(player, userId);
    assertCanPlay(gameState, player);

    const cell = getCellFromPosition(gameState, entity);

    if (cell.building != "castle")
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Can't remove entity "${entityId}" outside of a castle`,
      });

    const previous = getEntityClassFromName(entity.className);
    const spawnCost = getSpawnCost(gameState, player);

    player.ressources[previous.resource] += spawnCost[entity.className] - 1;

    gameState.entities.splice(
      gameState.entities.findIndex((e) => e.entityId == entity.entityId),
      1
    );

    gameState.events.push("unit_removed");

    return game;
  });
});
