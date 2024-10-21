import { useKv } from "~~/server/utils/useKv";
import {
  BUILDINGS_CLASSES,
  ENTITIES_CLASSES,
  GRID_SIZE,
} from "~~/shared/consts";
import type { Entity, Game, Position } from "~~/shared/types";

async function getCellAt(game: Game, pos: Position) {
  const cell = game.map.find((c) => c.x == pos.x && c.y == pos.y);

  if (!cell)
    throw createError({
      statusCode: 500,
      statusMessage: "Internal error",
      message: `Can't find cell at (${pos.x}, ${pos.y})`,
    });

  return cell;
}

async function leaveCell(game: Game, entity: Entity) {
  const cell = await getCellAt(game, entity);

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
  const cell = await getCellAt(game, pos);

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
  const { gid, pid, eid, action, x: strx, y: stry } = getQuery(event);

  if (
    typeof gid != "string" ||
    typeof pid != "string" ||
    typeof eid != "string" ||
    typeof action != "string" ||
    typeof strx != "string" ||
    typeof stry != "string"
  ) {
    return new Response("Invalid gid, pid, eid, action, x or y", {
      status: 400,
    });
  }

  const { x, y } = { x: Number(strx), y: Number(stry) };

  if (
    isNaN(x) ||
    isNaN(x) ||
    x < 0 ||
    y < 0 ||
    x >= GRID_SIZE ||
    y >= GRID_SIZE ||
    Math.floor(x) != x ||
    Math.floor(y) != y
  ) {
    return new Response("Invalid x or y", {
      status: 400,
    });
  }

  const target = { x, y };

  const kv = await useKv();

  await updateGame(kv, gid, async (game) => {
    if (game == null)
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Game "${gid}" not found`,
      });
    else if (game.state != "started")
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Game "${gid}" not started`,
      });
    else if (game.players[game.turn]?.pid != pid)
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Not currently "${pid}"'s turn`,
      });
    else {
      const entity = game.entities.find((e) => e.eid == eid);

      if (!entity)
        throw createError({
          statusCode: 400,
          statusMessage: "Bad Request",
          message: `Entity "${eid}" not found`,
        });
      else if (entity.owner != game.turn)
        throw createError({
          statusCode: 400,
          statusMessage: "Bad Request",
          message: `Entity "${eid}" isn't owned by you`,
        });

      const entityClass = ENTITIES_CLASSES.find((e) => e.type == entity.type);

      if (!entityClass)
        throw createError({
          statusCode: 500,
          statusMessage: "Internal error",
          message: `Unknown entity type "${entity.type}"`,
        });

      const actionAttr = entityClass.actions.find((a) => a.type == action);

      if (!actionAttr)
        throw createError({
          statusCode: 400,
          statusMessage: "Bad Request",
          message: `Action "${action}" isn't defined for entity "${entity.type}"`,
        });

      const dist = Math.max(Math.abs(entity.x - x), Math.abs(entity.y - y));

      if (dist == 0 || dist > actionAttr.range)
        throw createError({
          statusCode: 400,
          statusMessage: "Bad Request",
          message: `Requested (${strx}, ${stry}) invalid for action "${action}"`,
        });

      const entityAtPos = game.entities.find((e) => e.x == x && e.y == y);

      if (actionAttr.target == null && entityAtPos) {
        throw createError({
          statusCode: 400,
          statusMessage: "Bad Request",
          message: `Requested (${strx}, ${stry}) occupied for action "${action}"`,
        });
      } else if (
        actionAttr.target == "enemy" &&
        (!entityAtPos || entityAtPos.owner == game.turn)
      )
        throw createError({
          statusCode: 400,
          statusMessage: "Bad Request",
          message: `Requested (${strx}, ${stry}) empty or occupied by your-self for action "${action}"`,
        });
      if (actionAttr.type == "move") {
        await performMove(game, entity, target);
      } else if (actionAttr.type == "melee") {
        game.entities = game.entities.filter((e) => e.eid != entityAtPos!.eid);
        await performMove(game, entity, target);
      } else if (actionAttr.type == "ranged") {
        await leaveCell(game, entityAtPos!);
        game.entities = game.entities.filter((e) => e.eid != entityAtPos!.eid);
      } else if (actionAttr.type == "build") {
        const cell = await getCellAt(game, target);

        if (cell.building) cell.building = null;
        else {
          cell.building = "wall";
          cell.owner = game.turn;
        }
      }

      return game;
    }
  });

  return null;
});
