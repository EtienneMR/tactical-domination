export default defineEventHandler(async (event) => {
  const { mapName, gameId, userId, v } = getQuery(event);

  assertValidString_old(gameId, "gameId");
  assertValidString_old(userId, "userId");
  assertValidString_old(v, "v");
  assertValidString_old(mapName, "mapName");

  const kv = await useKv();

  const success = await updateGame(kv, gameId, (game) => {
    if (game)
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Game "${gameId}" already exist`,
      });

    game = {
      gameId,
      users: [{ userId, name: "Host", index: 0 }],
      version: useRuntimeConfig(event).public.gitVersion,
      mapName,

      state: createGame(mapName),
      previousState: null,
    };

    assertMatchingVersions(event, game, v);

    return game;
  });

  return success;
});
