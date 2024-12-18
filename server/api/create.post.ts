import { useKv } from "~~/server/utils/useKv";
import {
  assertCanPlay,
  getCellAt,
  getEntityFromPos,
  getPlayer,
} from "~~/shared/utils/game";
import {
  assertGameInStatus,
  assertValidGame,
  assertValidPlayer,
  assertValidString,
} from "../utils/checks";

export default defineEventHandler(async (event) => {
  const { gid, uid, entityType, x: strx, y: stry } = getQuery(event);

  assertValidString(gid, "gid");
  assertValidString(uid, "uid");
  assertValidString(entityType, "entityType");
  assertValidString(strx, "x");
  assertValidString(stry, "y");

  const pos = { x: Number(strx), y: Number(stry) };

  assertValidPosition(pos);

  const kv = await useKv();

  await updateGame(kv, gid, async (game) => {
    assertValidGame(game, gid);

    const { state: gameState } = game;

    assertGameInStatus(gameState, "started", gid);

    const player = getPlayer(game, uid);
    assertValidPlayer(player, uid);
    assertCanPlay(gameState, player);

    const cell = getCellAt(gameState, pos);

    if (cell.building != "castle")
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Can't create an entity outside of a castle at (${strx}, ${stry})`,
      });

    if (cell.owner != player.index)
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Can't create an entity in an enemy castle at (${strx}, ${stry})`,
      });

    if (getEntityFromPos(gameState, pos) != null)
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Can't create an entity if an other is there`,
      });

    const entityClass = getEntityClass(entityType);

    if (player[entityClass.resource] < player.spawnCost[entityClass.type])
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Player "${player.index}" hasn't enough resources`,
      });

    player[entityClass.resource] -= player.spawnCost[entityClass.type];
    player.spawnCost[entityClass.type] += 1;

    gameState.entities.push({
      eid: `e${Math.floor(Math.random() * 1000000)}`,
      type: entityClass.type,
      owner: player.index,
      x: pos.x,
      y: pos.y,
      budget: 100,
    });

    gameState.events.push("unit_created");

    return game;
  });
});
