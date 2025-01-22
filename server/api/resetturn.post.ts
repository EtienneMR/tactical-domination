export default defineEventHandler(async event => {
  const { gameId, userId } = getQuery(event)

  assertValidString(gameId, "gameId")
  assertValidString(userId, "userId")

  const kv = await useKv()

  await updateGame(kv, gameId, game => {
    assertValidGame(game, gameId)

    const { state: gameState } = game

    assertGameInStatus(gameState, "started", gameId)

    const player = getPlayerFromUserId(game, userId)
    assertValidPlayer(player, userId)
    assertCanPlay(gameState, player)

    if (!game.previousState)
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Game has no previousState`
      })

    game.state = structuredClone(game.previousState)

    return game
  })
})
