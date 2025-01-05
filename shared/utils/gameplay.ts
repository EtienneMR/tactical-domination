export function getSpawnCost(gameState: GameState, { index }: Player) {
  const spawnCost = {} as { [entityClassName in EntityType]: number };

  for (const entityClassName of ENTITIES_TYPES) spawnCost[entityClassName] = 1;
  for (const entity of gameState.entities)
    if (entity.owner == index) spawnCost[entity.className] += 1;

  return Object.freeze(spawnCost);
}

export function hasEntityBudget(entity: Entity) {
  return entity.budget > 0;
}

export function assertCanPlay(gameState: GameState, player: Player) {
  if (gameState.currentPlayer != player.index)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Not currently "${player?.index ?? null}"'s turn`,
    });
}

export function assertActionInRange(
  entity: Entity,
  pos: Position,
  action: Action
) {
  const dist = Math.max(Math.abs(entity.x - pos.x), Math.abs(entity.y - pos.y));

  if (dist == 0 || dist > action.range)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Position (${pos.x}, ${pos.y}) not in range for action "${action.type}" with enity "${entity.entityId}"`,
    });
}

export function assertValidTargetForAction(
  gameState: GameState,
  targetEntity: Entity | null,
  targetEntityClass: EntityClass | null,
  actionData: ActionData
) {
  const valid =
    (actionData.target == null && targetEntity == null) ||
    (actionData.target == "enemy" &&
      targetEntity &&
      targetEntity.owner != gameState.currentPlayer &&
      targetEntityClass &&
      targetEntityClass.immune != actionData.type);

  if (!valid)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Invalid target entity "${
        targetEntity?.entityId ?? null
      }" for action "${actionData.type}"`,
    });
}

export function assertCanDoAction(
  gameState: GameState,
  player: Player,
  entity: Entity,
  action: Action,
  actionData: ActionData,
  targetEntity: Entity | null,
  targetEntityClass: EntityClass | null,
  cell: Cell
) {
  assertCanPlay(gameState, player);

  if (entity.owner != gameState.currentPlayer)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Entity "${entity.entityId}" isn't owned by you`,
    });

  if (!hasEntityBudget(entity))
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Entity "${entity.entityId}" has no budget left`,
    });

  if (player.ressources.food <= 0)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Player "${player.index}" hasn't enough food`,
    });

  if (actionData.walk && cell.building && cell.owner != player.index) {
    const building = getBuildingClassFromType(cell.building);

    if (!building.walkable)
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Building at (${cell.x}, ${cell.y}) isn't walkable`,
      });
  }

  if (
    action.type == "build" &&
    cell.building == "castle" &&
    cell.owner == player.index
  )
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Can't destroy your own castle at (${cell.x}, ${cell.y})`,
    });

  assertActionInRange(entity, cell, action);
  assertValidTargetForAction(
    gameState,
    targetEntity,
    targetEntityClass,
    actionData
  );
}

export function canDoAction(
  ...args: Parameters<typeof assertCanDoAction>
): boolean {
  try {
    assertCanDoAction(...args);
    return true;
  } catch (error) {
    return false;
  }
}
