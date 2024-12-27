import { useKv } from "~~/server/utils/useKv";
import type { Cell, GameState } from "~~/shared/types/game";
import {
  getActionDataFromType,
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
  assertGameInStatus,
  assertValidEntity,
  assertValidGame,
  assertValidPlayer,
  assertValidPosition,
  assertValidString,
} from "../utils/checks";

async function leaveCell(gameState: GameState, entity: Entity) {
  const cell = getCellAt(gameState, entity);

  if (cell.building) {
    const oldBuilding = getBuildingClass(cell.building);

    if (!oldBuilding.ownable) {
      cell.owner = null;
    }
  } else cell.owner = null;
}

async function performMove(gameState: GameState, entity: Entity, cell: Cell) {
  await leaveCell(gameState, entity);

  gameState.events.push(`move_${cell.biome}`);

  if (cell.building) {
    const buildingClass = getBuildingClass(cell.building);
    if (!buildingClass.walkable) {
      cell.building = null;
      gameState.events.push(`build`);
    } else if (buildingClass.effects.length) {
      gameState.events.push(`collect_${cell.building}`);
    }
  }

  cell.owner = gameState.turn;
  entity.x = cell.x;
  entity.y = cell.y;
}

export default defineEventHandler(async (event) => {
  const {
    gid,
    uid,
    eid,
    action: actionType,
    x: strx,
    y: stry,
  } = getQuery(event);

  assertValidString(gid, "gid");
  assertValidString(uid, "uid");
  assertValidString(eid, "eid");
  assertValidString(actionType, "action");
  assertValidString(strx, "x");
  assertValidString(stry, "y");

  const pos = { x: Number(strx), y: Number(stry) };

  assertValidPosition(pos);

  const kv = await useKv();

  await updateGame(kv, gid, async (game) => {
    assertValidGame(game, gid);

    const { state: gameState } = game;

    assertGameInStatus(gameState, "started", gid);

    const entity = getEntityFromEid(gameState, eid);
    assertValidEntity(entity, eid);

    const player = getPlayer(game, uid);
    assertValidPlayer(player, uid);
    assertCanPlay(gameState, player);

    const entityClass = getEntityClass(entity.type);
    const action = getActionFromEntityClass(entityClass, actionType);
    const actionData = getActionDataFromType(actionType);
    const targetEntity = getEntityFromPos(gameState, pos);
    const targetEntityClass = targetEntity
      ? getEntityClass(targetEntity.type)
      : null;
    const cell = getCellAt(gameState, pos);

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

    player.food -= 1;
    entity.budget -= action.budget;

    if (action.type == "move") {
      await performMove(gameState, entity, cell);
    } else if (action.type == "melee") {
      gameState.entities = gameState.entities.filter(
        (e) => e.eid != targetEntity!.eid
      );
      gameState.events.push(`atk_${entity.type}`);
      await performMove(gameState, entity, cell);
    } else if (action.type == "ranged") {
      await leaveCell(gameState, targetEntity!);
      gameState.entities = gameState.entities.filter(
        (e) => e.eid != targetEntity!.eid
      );
      gameState.events.push(`atk_${entity.type}`);
    } else if (action.type == "build") {
      const cell = getCellAt(gameState, pos);
      gameState.events.push("build");

      const isEmpty = cell.building == null || cell.building == "ruins";

      if (!isEmpty) {
        cell.building = "ruins";
        cell.owner = null;
      } else {
        cell.building = gameState.map.some(
          (c) => c.building == "castle" && c.owner == player.index
        )
          ? "wall"
          : "castle";
        cell.owner = gameState.turn;
      }
    }

    return game;
  });
});
