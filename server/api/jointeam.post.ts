export default defineEventHandler(async (event) => {
  const { team, gameId, userId, v } = getQuery(event);

  assertValidString(gameId, "gameId");
  assertValidString(userId, "userId");
  assertValidString(team, "team");

  const kv = await useKv();

  const success = await updateGame(kv, gameId, (game) => {
    assertValidGame(game, gameId);

    const user = game.users.find((u) => u.userId === userId);

    if (!user)
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `User "${userId}" not found`,
      });

    user.index = team == "null" ? null : parseInt(team);

    return game;
  });

  return success;
});
