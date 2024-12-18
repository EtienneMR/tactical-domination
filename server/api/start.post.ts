import { useKv } from "~~/server/utils/useKv";
import {
  assertGameInStatus,
  assertValidGame,
  assertValidString,
} from "../utils/checks";

export default defineEventHandler(async (event) => {
  const { gid, uid } = getQuery(event);

  assertValidString(gid, "gid");
  assertValidString(uid, "uid");

  const kv = await useKv();

  await updateGame(kv, gid, (game) => {
    assertValidGame(game, gid);
    assertGameInStatus(game.state, "initing", gid);
    game.state.status = "started";
    game.state.events.push("end_turn");
    return game;
  });

  return null;
});
