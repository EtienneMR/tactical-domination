import { BUILDINGS_CLASSES } from "~~/shared/consts";
import { hasEntityBudget } from "./entities";

export function getEntityFromEid(game: Game, eid: string): Entity | null {
  return game.entities.find((e) => e.eid == eid) ?? null;
}

export function getEntityFromPos(game: Game, pos: Position): Entity | null {
  return game.entities.find((e) => e.x == pos.x && e.y == pos.y) ?? null;
}

export function getPlayer(game: Game, pid: string): Player | null {
  return game.players.find((p) => p.pid === pid) ?? null;
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

export function getCellAt(game: Game, pos: Position) {
  const cell = game.map.find((c) => c.x == pos.x && c.y == pos.y);

  if (!cell)
    throw createError({
      statusCode: 500,
      statusMessage: "Internal error",
      message: `Can't find cell at (${pos.x}, ${pos.y})`,
    });

  return cell;
}

export function assertCanPlay(game: Game, player: Player) {
  if (game.turn != player.index)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Not currently "${player?.pid ?? null}"'s turn`,
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
  game: Game,
  targetEntity: Entity | null,
  targetEntityClass: EntityClass | null,
  action: Action
) {
  const valid =
    (action.target == null && targetEntity == null) ||
    (action.target == "enemy" &&
      targetEntity &&
      targetEntity.owner != game.turn &&
      targetEntityClass &&
      targetEntityClass.immune != action.type);

  if (!valid)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Invalid target entity "${
        targetEntity?.eid ?? null
      }" for action "${action.type}"`,
    });
}

export function assertCanDoAction(
  game: Game,
  player: Player,
  entity: Entity,
  action: Action,
  targetEntity: Entity | null,
  targetEntityClass: EntityClass | null,
  pos: Position
) {
  assertCanPlay(game, player);

  if (entity.owner != game.turn)
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
      message: `Player "${player.pid}" hasn't enough food`,
    });

  assertActionInRange(entity, pos, action);
  assertValidTargetForAction(game, targetEntity, targetEntityClass, action);
}

export function canDoAction(
  game: Game,
  player: Player,
  entity: Entity,
  action: Action,
  targetEntity: Entity | null,
  targetEntityClass: EntityClass | null,
  pos: Position
): boolean {
  try {
    assertCanDoAction(
      game,
      player,
      entity,
      action,
      targetEntity,
      targetEntityClass,
      pos
    );
    return true;
  } catch (error) {
    return false;
  }
}
