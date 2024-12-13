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
    assertGameInState(game, "initing", gid);
    game.state = "started";
    game.events.push("end_turn");
    return game;
  });

  return null;
});
