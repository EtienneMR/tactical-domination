import { useKv } from "~~/server/utils/useKv";
import { ENTITIES_TYPES } from "~~/shared/consts";
import { getCellAt, getEntityFromEid, getPlayer } from "~~/shared/utils/game";
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

    const player = getPlayer(game, pid);
    assertValidPlayer(player, pid);

    const cell = getCellAt(game, entity);

    if (cell.building != "castle")
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Can't transform entity "${eid}" outside of a castle`,
      });

    entity.type =
      ENTITIES_TYPES[
        (ENTITIES_TYPES.indexOf(entity.type) + 1) % ENTITIES_TYPES.length
      ];

    return game;
  });
});
