import { useKv } from "~~/server/utils/useKv";
import { assertCanPlay, getPlayer } from "~~/shared/utils/game";
import {
  assertGameInStatus,
  assertValidGame,
  assertValidPlayer,
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

    assertGameInStatus(gameState, "started", gid);

    const player = getPlayer(game, uid);
    assertValidPlayer(player, uid);
    assertCanPlay(gameState, player);

    if (!game.previousState)
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Game has no previousState`,
      });

    game.state = structuredClone(game.previousState);

    return game;
  });
});
