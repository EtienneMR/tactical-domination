async function leaveCell(gameState: GameState, entity: Entity) {
  const cell = getCellFromPosition(gameState, entity)

  if (cell.building) {
    const oldBuilding = getBuildingClassFromType(cell.building)

    if (!oldBuilding.ownable) {
      cell.owner = null
    }
  } else cell.owner = null
}

async function performMove(gameState: GameState, entity: Entity, cell: Cell) {
  await leaveCell(gameState, entity)

  gameState.events.push(`move_${cell.biome}`)

  if (cell.building) {
    const buildingClass = getBuildingClassFromType(cell.building)
    if (!buildingClass.walkable) {
      cell.building = "ruins"
      cell.owner = null
      gameState.events.push(`build`)
    } else if (buildingClass.effects.length) {
      gameState.events.push(`collect_${cell.building}`)
    }
  }

  cell.owner = gameState.currentPlayer
  entity.x = cell.x
  entity.y = cell.y
}

export default defineEventHandler(async event => {
  const {
    gameId,
    userId,
    entityId,
    action: actionType,
    x: strx,
    y: stry
  } = getQuery(event)

  assertValidString(gameId, "gameId")
  assertValidString(userId, "userId")
  assertValidString(entityId, "entityId")
  assertValidString(actionType, "action")
  assertValidString(strx, "x")
  assertValidString(stry, "y")

  const pos = { x: Number(strx), y: Number(stry) }

  assertValidPosition(pos)

  const kv = await useKv()

  await updateGame(kv, gameId, async game => {
    assertValidGame(game, gameId)

    const { state: gameState } = game

    assertGameInStatus(gameState, "started", gameId)

    const entity = getEntityFromId(gameState, entityId)
    assertValidEntity(entity, entityId)

    const player = getPlayerFromUserId(game, userId)
    assertValidPlayer(player, userId)
    assertCanPlay(gameState, player)

    const entityClass = getEntityClassFromName(entity.className)
    const action = getActionFromEntityClass(entityClass, actionType)
    const actionData = getActionDataFromType(actionType)
    const targetEntity = getEntityFromPosition(gameState, pos)
    const targetEntityClass =
      targetEntity ? getEntityClassFromName(targetEntity.className) : null
    const cell = getCellFromPosition(gameState, pos)

    assertCanDoAction(
      gameState,
      player,
      entity,
      action,
      actionData,
      targetEntity,
      targetEntityClass,
      cell
    )

    player.ressources.food -= 1
    entity.budget -= action.budget

    if (action.type == "move") {
      await performMove(gameState, entity, cell)
    } else if (action.type == "melee") {
      gameState.entities = gameState.entities.filter(
        e => e.entityId != targetEntity!.entityId
      )
      gameState.events.push(`atk_${entity.className}`)
      await performMove(gameState, entity, cell)
    } else if (action.type == "ranged") {
      await leaveCell(gameState, targetEntity!)
      gameState.entities = gameState.entities.filter(
        e => e.entityId != targetEntity!.entityId
      )
      gameState.events.push(`atk_${entity.className}`)
    } else if (action.type == "build") {
      const cell = getCellFromPosition(gameState, pos)
      gameState.events.push("build")

      const isEmpty = cell.building == null || cell.building == "ruins"

      if (!isEmpty) {
        cell.building = "ruins"
        cell.owner = null
      } else {
        cell.building =
          (
            gameState.map
              .flat()
              .some(c => c.building == "castle" && c.owner == player.index)
          ) ?
            "wall"
          : "castle"
        cell.owner = gameState.currentPlayer
      }
    }

    return game
  })
})
