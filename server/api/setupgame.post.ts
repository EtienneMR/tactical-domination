import { useKv } from "~~/server/utils/useKv";
import { assertValidString } from "../utils/checks";

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
    return createGame(event, pid, mapName);
  });

  return success;
});
