import { useKv } from "~~/server/utils/useKv";
import { assertValidString } from "../utils/checks";

export default defineEventHandler(async (event) => {
  const { team, gid, uid, v } = getQuery(event);

  assertValidString(gid, "gid");
  assertValidString(uid, "uid");
  assertValidString(team, "team");

  const kv = await useKv();

  const success = await updateGame(kv, gid, (game) => {
    assertValidGame(game, gid);

    const user = game.users.find((u) => u.uid === uid);

    if (!user)
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `User "${uid}" not found`,
      });

    user.index = team == "null" ? null : parseInt(team);

    return game;
  });

  return success;
});
