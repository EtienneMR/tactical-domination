import { useKv } from "~~/server/utils/useKv";
import {
  assertCanPlay,
  getCellAt,
  getEntityFromEid,
  getPlayer,
} from "~~/shared/utils/game";
import {
  assertGameInState,
  assertValidEntity,
  assertValidGame,
  assertValidPlayer,
  assertValidString,
} from "../utils/checks";

export default defineEventHandler(async (event) => {
  const { gid, pid, eid } = getQuery(event);

  assertValidString(gid, "gid");
  assertValidString(pid, "pid");
  assertValidString(eid, "eid");

  const kv = await useKv();

  await updateGame(kv, gid, async (game) => {
    assertValidGame(game, gid);
    assertGameInState(game, "started", gid);

    const entity = getEntityFromEid(game, eid);
    assertValidEntity(entity, eid);

    if (entity.budget < 100) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Can't transform entity "${eid}" which has already been used`,
      });
    }

    const player = getPlayer(game, pid);
    assertValidPlayer(player, pid);
    assertCanPlay(game, player);

    const cell = getCellAt(game, entity);

    if (cell.building != "castle")
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Can't remove entity "${eid}" outside of a castle`,
      });

    const previous = getEntityClass(entity.type);
    player[previous.ressource] += 1;

    game.entities.splice(
      game.entities.findIndex((e) => e.eid == entity.eid),
      1
    );

    game.events.push("unit_removed");

    return game;
  });
});
