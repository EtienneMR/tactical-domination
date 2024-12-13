import { useKv } from "~~/server/utils/useKv";
import { assertMatchingVersions, assertValidString } from "../utils/checks";

export default defineEventHandler(async (event) => {
  const { mapName, gid, pid, v } = getQuery(event);

  assertValidString(gid, "gid");
  assertValidString(pid, "pid");
  assertValidString(v, "v");
  assertValidString(mapName, "mapName");

  const kv = await useKv();

  const success = await updateGame(kv, gid, (game) => {
    if (game)
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Game "${gid}" already exist`,
      });
    game = createGame(event, pid, mapName);

    assertMatchingVersions(event, game, v);

    return game;
  });

  return success;
});
