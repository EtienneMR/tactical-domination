import { useKv } from "~~/server/utils/useKv";
import {
  assertCanPlay,
  getCellAt,
  getEntityFromPos,
  getPlayer,
} from "~~/shared/utils/game";
import {
  assertGameInState,
  assertValidGame,
  assertValidPlayer,
  assertValidString,
} from "../utils/checks";

export default defineEventHandler(async (event) => {
  const { gid, pid, entityType, x: strx, y: stry } = getQuery(event);

  assertValidString(gid, "gid");
  assertValidString(pid, "pid");
  assertValidString(entityType, "entityType");
  assertValidString(strx, "x");
  assertValidString(stry, "y");

  const pos = { x: Number(strx), y: Number(stry) };

  assertValidPosition(pos);

  const kv = await useKv();

  await updateGame(kv, gid, async (game) => {
    assertValidGame(game, gid);
    assertGameInState(game, "started", gid);

    const player = getPlayer(game, pid);
    assertValidPlayer(player, pid);
    assertCanPlay(game, player);

    const cell = getCellAt(game, pos);

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

    if (getEntityFromPos(game, pos) != null)
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Can't create an entity if an other is there`,
      });

    const entityClass = getEntityClass(entityType);

    if (player[entityClass.ressource] < player.spawnCost[entityClass.type])
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Player "${player.pid}" hasn't enough ressources`,
      });

    player[entityClass.ressource] -= player.spawnCost[entityClass.type];
    player.spawnCost[entityClass.type] += 1;

    game.entities.push({
      eid: `e${Math.floor(Math.random() * 1000000)}`,
      type: entityClass.type,
      owner: player.index,
      x: pos.x,
      y: pos.y,
      budget: 100,
    });

    game.events.push("unit_created");

    return game;
  });
});
