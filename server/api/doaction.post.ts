import { useKv } from "~~/server/utils/useKv";
import type { Cell } from "~~/shared/types/game";
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
    const oldBuilding = getBuildingClass(cell.building);

    if (!oldBuilding.ownable) {
      cell.owner = null;
    }
  } else cell.owner = null;
}

async function performMove(game: Game, entity: Entity, cell: Cell) {
  await leaveCell(game, entity);

  game.events.push(`move_${cell.biome}`);

  if (cell.building) {
    const buildingClass = getBuildingClass(cell.building);
    if (buildingClass.effects.length) {
      game.events.push(`collect_${cell.building}`);
    }
  }

  cell.owner = game.turn;
  entity.x = cell.x;
  entity.y = cell.y;
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
    const cell = getCellAt(game, pos);

    assertCanDoAction(
      game,
      player,
      entity,
      action,
      targetEntity,
      targetEntityClass,
      cell
    );

    player.food -= 1;
    entity.budget -= action.budget;

    if (action.type == "move") {
      await performMove(game, entity, cell);
    } else if (action.type == "melee") {
      game.entities = game.entities.filter((e) => e.eid != targetEntity!.eid);
      game.events.push(`atk_${entity.type}`);
      await performMove(game, entity, cell);
    } else if (action.type == "ranged") {
      await leaveCell(game, targetEntity!);
      game.entities = game.entities.filter((e) => e.eid != targetEntity!.eid);
      game.events.push(`atk_${entity.type}`);
    } else if (action.type == "build") {
      const cell = getCellAt(game, pos);
      game.events.push("build");

      if (cell.building) cell.building = null;
      else {
        cell.building = game.map.some(
          (c) => c.building == "castle" && c.owner == player.index
        )
          ? "wall"
          : "castle";
        cell.owner = game.turn;
      }
    }

    return game;
  });
});
