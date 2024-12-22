import { useKv } from "~~/server/utils/useKv";
import { assertMatchingVersions, assertValidString } from "../utils/checks";

export default defineEventHandler(async (event) => {
  const { mapName, gid, uid, v } = getQuery(event);

  assertValidString(gid, "gid");
  assertValidString(uid, "uid");
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
    game = {
      gid,
      users: [{ uid, name: "Host Annonyme", index: 0 }],
      version: useRuntimeConfig(event).public.gitVersion,

      state: createGame(mapName),
      previousState: null,
    };

    assertMatchingVersions(event, game, v);

    return game;
  });

  return success;
});
