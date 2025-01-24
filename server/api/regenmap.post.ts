export default defineEventHandler(async event => {
  const { gameId, userId } = getQuery(event)

  assertValidString(gameId, "gameId")
  assertValidString(userId, "userId")

  const kv = await useKv()

  await updateGame(kv, gameId, game => {
    assertValidGame(game, gameId)

    const { state: gameState } = game

    assertGameInStatus(gameState, "initing", gameId)
    gameState.map = generateMap(game.mapName)
    gameState.events.push("unit_created")
    return game
  })

  return null
})
