import { BUILDINGS_CLASSES } from "~~/shared/consts";
import type { Action, ActionData } from "../types/entities";
import { hasEntityBudget } from "./entities";

export function getEntityFromEid(
  gameState: GameState,
  eid: string
): Entity | null {
  return gameState.entities.find((e) => e.eid == eid) ?? null;
}

export function getEntityFromPos(
  gameState: GameState,
  pos: Position
): Entity | null {
  return gameState.entities.find((e) => e.x == pos.x && e.y == pos.y) ?? null;
}

export function getPlayer(game: Game, uid: string): Player | null {
  const index = game.users.find((u) => u.uid === uid)?.index;

  return game.state.players[index ?? -1] ?? null;
}

export function getBuildingClass(type: string) {
  const buildingClass = BUILDINGS_CLASSES.find((b) => b.type == type);

  if (!buildingClass)
    throw createError({
      statusCode: 500,
      statusMessage: "Internal error",
      message: `Unknown building type "${type}"`,
    });

  return buildingClass;
}

export function getCellAt(gameState: GameState, pos: Position) {
  const cell = gameState.map.find((c) => c.x == pos.x && c.y == pos.y);

  if (!cell)
    throw createError({
      statusCode: 500,
      statusMessage: "Internal error",
      message: `Can't find cell at (${pos.x}, ${pos.y})`,
    });

  return cell;
}

export function assertCanPlay(gameState: GameState, player: Player) {
  if (gameState.turn != player.index)
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
      message: `Position (${pos.x}, ${pos.y}) not in range for action "${action.type}" with enity "${entity.eid}"`,
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
      targetEntity.owner != gameState.turn &&
      targetEntityClass &&
      targetEntityClass.immune != actionData.type);

  if (!valid)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Invalid target entity "${
        targetEntity?.eid ?? null
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

  if (entity.owner != gameState.turn)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Entity "${entity.eid}" isn't owned by you`,
    });

  if (!hasEntityBudget(entity))
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Entity "${entity.eid}" has no budget left`,
    });

  if (player.food <= 0)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Player "${player.index}" hasn't enough food`,
    });

  if (actionData.walk && cell.building) {
    const building = getBuildingClass(cell.building);

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
  gameState: GameState,
  player: Player,
  entity: Entity,
  action: Action,
  actionData: ActionData,
  targetEntity: Entity | null,
  targetEntityClass: EntityClass | null,
  cell: Cell
): boolean {
  try {
    assertCanDoAction(
      gameState,
      player,
      entity,
      action,
      actionData,
      targetEntity,
      targetEntityClass,
      cell
    );
    return true;
  } catch (error) {
    return false;
  }
}
