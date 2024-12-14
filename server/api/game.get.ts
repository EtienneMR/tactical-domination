import { useKv } from "~~/server/utils/useKv";
import { assertMatchingVersions, assertValidString } from "../utils/checks";

export default defineEventHandler(async (event) => {
  const { gid, pid, v } = getQuery(event);

  assertValidString(gid, "gid");
  assertValidString(pid, "pid");
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

        let empty = null;

        for (const player of game.players) {
          if (player.pid == pid) return null;
          else if (player.pid == null) empty = player;
        }

        if (empty) {
          empty.pid = pid;
          return game;
        } else return null;
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
