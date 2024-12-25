import { useKv } from "~~/server/utils/useKv";
import {
  assertCanPlay,
  getCellAt,
  getEntityFromEid,
  getPlayer,
  getSpawnCost,
} from "~~/shared/utils/game";
import {
  assertGameInStatus,
  assertValidEntity,
  assertValidGame,
  assertValidPlayer,
  assertValidString,
} from "../utils/checks";

export default defineEventHandler(async (event) => {
  const { gid, uid, eid } = getQuery(event);

  assertValidString(gid, "gid");
  assertValidString(uid, "uid");
  assertValidString(eid, "eid");

  const kv = await useKv();

  await updateGame(kv, gid, async (game) => {
    assertValidGame(game, gid);

    const { state: gameState } = game;

    assertGameInStatus(gameState, "started", gid);

    const entity = getEntityFromEid(gameState, eid);
    assertValidEntity(entity, eid);

    if (entity.budget < 100) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Can't transform entity "${eid}" which has already been used`,
      });
    }

    const player = getPlayer(game, uid);
    assertValidPlayer(player, uid);
    assertCanPlay(gameState, player);

    const cell = getCellAt(gameState, entity);

    if (cell.building != "castle")
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Can't remove entity "${eid}" outside of a castle`,
      });

    const previous = getEntityClass(entity.type);
    const spawnCost = getSpawnCost(gameState, player);

    player[previous.resource] += spawnCost[entity.type] - 1;

    gameState.entities.splice(
      gameState.entities.findIndex((e) => e.eid == entity.eid),
      1
    );

    gameState.events.push("unit_removed");

    return game;
  });
});
