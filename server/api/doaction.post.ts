import { useKv } from "~~/server/utils/useKv";
import { BUILDINGS_CLASSES } from "~~/shared/consts";
import type { Entity, Game, Position } from "~~/shared/types";
import {
  getActionFromEntityClass,
  getEntityClass,
} from "~~/shared/utils/entities";
import {
  assertCanDoAction,
  assertCanPlay,
  getCellAt,
  getEntityFromEid,
  getEntityFromPos,
  getPlayer,
} from "~~/shared/utils/game";
import {
  assertGameInState,
  assertValidEntity,
  assertValidGame,
  assertValidPlayer,
  assertValidPosition,
  assertValidString,
} from "../utils/checks";

async function leaveCell(game: Game, entity: Entity) {
  const cell = getCellAt(game, entity);

  if (cell.building) {
    const oldBuilding = BUILDINGS_CLASSES.find((b) => b.type == cell.building);

    if (!oldBuilding)
      throw createError({
        statusCode: 500,
        statusMessage: "Internal error",
        message: `Unknown building type "${cell.building}"`,
      });
    if (!oldBuilding.ownable) {
      cell.owner = null;
    }
  } else cell.owner = null;
}

async function performMove(game: Game, entity: Entity, pos: Position) {
  const cell = getCellAt(game, pos);

  if (cell.building) {
    const building = BUILDINGS_CLASSES.find((b) => b.type == cell.building);

    if (!building)
      throw createError({
        statusCode: 500,
        statusMessage: "Internal error",
        message: `Unknown building type "${cell.building}"`,
      });

    if (!building.walkable)
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Building at (${pos.x}, ${pos.y}) isn't walkable`,
      });
  }

  await leaveCell(game, entity);

  cell.owner = game.turn;
  entity.x = pos.x;
  entity.y = pos.y;
}

export default defineEventHandler(async (event) => {
  const {
    gid,
    pid,
    eid,
    action: actionName,
    x: strx,
    y: stry,
  } = getQuery(event);

  assertValidString(gid, "gid");
  assertValidString(pid, "pid");
  assertValidString(eid, "eid");
  assertValidString(actionName, "action");
  assertValidString(strx, "x");
  assertValidString(stry, "y");

  const pos = { x: Number(strx), y: Number(stry) };

  assertValidPosition(pos);

  const kv = await useKv();

  await updateGame(kv, gid, async (game) => {
    assertValidGame(game, gid);
    assertGameInState(game, "started", gid);

    const entity = getEntityFromEid(game, eid);
    assertValidEntity(entity, eid);

    const player = getPlayer(game, pid);
    assertValidPlayer(player, pid);
    assertCanPlay(game, player);

    const entityClass = getEntityClass(entity.type);
    const action = getActionFromEntityClass(entityClass, actionName);
    const targetEntity = getEntityFromPos(game, pos);
    const targetEntityClass = targetEntity
      ? getEntityClass(targetEntity.type)
      : null;
    assertCanDoAction(
      game,
      player,
      entity,
      action,
      targetEntity,
      targetEntityClass,
      pos
    );

    player.food -= 1;
    entity.used = true;

    if (action.type == "move") {
      await performMove(game, entity, pos);
    } else if (action.type == "melee") {
      game.entities = game.entities.filter((e) => e.eid != targetEntity!.eid);
      await performMove(game, entity, pos);
    } else if (action.type == "ranged") {
      await leaveCell(game, targetEntity!);
      game.entities = game.entities.filter((e) => e.eid != targetEntity!.eid);
    } else if (action.type == "build") {
      const cell = getCellAt(game, pos);

      if (cell.building) cell.building = null;
      else {
        cell.building = "wall";
        cell.owner = game.turn;
      }
    }

    return game;
  });
});
