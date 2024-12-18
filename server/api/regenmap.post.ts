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

    const { state: gameState } = game;

    assertGameInStatus(gameState, "initing", gid);
    gameState.map = generateMap(gameState.mapName);
    gameState.events.push("unit_created");
    return game;
  });

  return null;
});
