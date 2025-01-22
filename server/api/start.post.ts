export default defineEventHandler(async event => {
  const { gameId, userId } = getQuery(event)

  assertValidString(gameId, "gameId")
  assertValidString(userId, "userId")

  const kv = await useKv()

  await updateGame(kv, gameId, game => {
    assertValidGame(game, gameId)
    assertGameInStatus(game.state, "initing", gameId)

    game.state.status = "started"
    game.state.events.push("end_turn")
    game.previousState = structuredClone(game.state)

    return game
  })

  return null
})
