import { useKv } from "~~/server/utils/useKv";
import {
  assertGameInState,
  assertValidGame,
  assertValidString,
} from "../utils/checks";

export default defineEventHandler(async (event) => {
  const { gid, pid } = getQuery(event);

  assertValidString(gid, "gid");
  assertValidString(pid, "pid");

  const kv = await useKv();

  await updateGame(kv, gid, (game) => {
    assertValidGame(game, gid);
    assertGameInState(game, "started", gid);

    for (const entity of game.entities) {
      if (entity.owner == game.turn) entity.used = false;
    }
    game.turn = (game.turn + 1) % game.players.length;
    return game;
  });
});
