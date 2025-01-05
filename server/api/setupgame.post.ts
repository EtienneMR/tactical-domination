export default defineEventHandler(async (event) => {
  const { mapName, gameId, userId, v } = getQuery(event);

  assertValidString(gameId, "gameId");
  assertValidString(userId, "userId");
  assertValidString(v, "v");
  assertValidString(mapName, "mapName");

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
