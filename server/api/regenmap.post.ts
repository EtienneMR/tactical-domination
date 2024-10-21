import { useKv } from "~~/server/utils/useKv";

export default defineEventHandler(async (event) => {
  const { gid, pid } = getQuery(event);

  if (typeof gid != "string" || typeof pid != "string") {
    return new Response("Invalid gid or pid", {
      status: 400,
    });
  }

  const kv = await useKv();

  await updateGame(kv, gid, (game) => {
    if (game == null)
      return Promise.reject(
        createError({
          statusCode: 400,
          statusMessage: "Bad Request",
          message: `Game "${gid}" not found`,
        })
      );
    else if (game.state != "initing") {
      return Promise.reject(
        createError({
          statusCode: 400,
          statusMessage: "Bad Request",
          message: `Game "${gid}" already started`,
        })
      );
    } else {
      game.map = generateMap();
      return game;
    }
  });

  return null;
});
