export default defineEventHandler(async event => {
  const { gameId, userId, entityClassName, x: strx, y: stry } = getQuery(event)

  assertValidString(gameId, "gameId")
  assertValidString(userId, "userId")
  assertValidString(entityClassName, "entityClassName")
  assertValidString(strx, "x")
  assertValidString(stry, "y")

  const pos = { x: Number(strx), y: Number(stry) }

  assertValidPosition(pos)

  const kv = await useKv()

  await updateGame(kv, gameId, async game => {
    assertValidGame(game, gameId)

    const { state: gameState } = game

    assertGameInStatus(gameState, "started", gameId)

    const player = getPlayerFromUserId(game, userId)
    assertValidPlayer(player, userId)
    assertCanPlay(gameState, player)

    const cell = getCellFromPosition(gameState, pos)

    if (cell.building != "castle")
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Can't create an entity outside of a castle at (${strx}, ${stry})`
      })

    if (cell.owner != player.index)
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Can't create an entity in an enemy castle at (${strx}, ${stry})`
      })

    if (getEntityFromPosition(gameState, pos) != null)
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Can't create an entity if an other is there`
      })

    const entityClass = getEntityClassFromName(entityClassName)
    const spawnCost = getSpawnCost(gameState, player)

    if (player.ressources[entityClass.resource] < spawnCost[entityClass.name])
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Player "${player.index}" hasn't enough resources`
      })

    player.ressources[entityClass.resource] -= spawnCost[entityClass.name]

    gameState.entities.push({
      entityId: generateId("e"),
      className: entityClass.name,
      owner: player.index,
      x: pos.x,
      y: pos.y,
      budget: 100
    })

    gameState.events.push("unit_created")

    return game
  })
})
