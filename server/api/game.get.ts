import { useKv } from "~~/server/utils/useKv";
import { assertMatchingVersions, assertValidString } from "../utils/checks";

export default defineEventHandler(async (event) => {
  const { gid, uid, v } = getQuery(event);

  assertValidString(gid, "gid");
  assertValidString(uid, "uid");
  assertValidString(v, "v");

  const kv = await useKv();

  if (getHeader(event, "accept") === "text/event-stream") {
    let cleanup: () => void;

    const body = new ReadableStream({
      async start(controller) {
        controller.enqueue(`retry: 1000\n\n`);
        cleanup = subscribeGame(kv, gid, (game) => {
          try {
            assertMatchingVersions(event, game, v);
            const data = JSON.stringify(game);
            controller.enqueue(`data: ${data}\n\n`);
          } catch (error) {
            controller.enqueue(`event: error\n`);
            controller.enqueue(
              `data:${error instanceof Error ? error.message : error}\n\n`
            );
            controller.close();
          }
        });
      },
      cancel() {
        cleanup();
      },
    });

    event.waitUntil(
      updateGame(kv, gid, async (game) => {
        try {
          assertValidGame(game, gid);
          assertMatchingVersions(event, game, v);
        } catch (error) {
          return null;
        }

        for (const user of game.users) {
          if (user.uid == uid) return null;
        }

        game.users.push({
          index:
            game.users.reduce(
              (max, user) =>
                user.index && user.index > max ? user.index : max,
              0
            ) + 1,
          uid,
          name: generateId("Annonyme", 4),
        });

        return game;
      })
    );

    return new Response(body.pipeThrough(new TextEncoderStream()), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } else {
    const game = await getGame(kv, gid);
    assertValidGame(game, gid);
    assertMatchingVersions(event, game, v);
    return game;
  }
});
