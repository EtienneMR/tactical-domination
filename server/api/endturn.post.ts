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
    else if (game.state != "started") {
      return Promise.reject(
        createError({
          statusCode: 400,
          statusMessage: "Bad Request",
          message: `Game "${gid}" not started`,
        })
      );
    } else {
      game.turn = (game.turn + 1) % game.players.length;
      return game;
    }
  });

  return null;
});
