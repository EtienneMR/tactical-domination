import { useKv } from "~~/server/utils/useKv";
import { createGame } from "../utils/game";

export default defineEventHandler(async (event) => {
  const { gid, pid } = getQuery(event);

  if (typeof gid != "string" || typeof pid != "string") {
    return new Response("Invalid gid or pid", {
      status: 400,
    });
  }

  const kv = await useKv();

  if (getHeader(event, "accept") === "text/event-stream") {
    let cleanup: () => void;

    const body = new ReadableStream({
      async start(controller) {
        controller.enqueue(`retry: 1000\n\n`);
        cleanup = subscribeGame(kv, gid, (game) => {
          const data = JSON.stringify(game);
          controller.enqueue(`data: ${data}\n\n`);
        });
      },
      cancel() {
        cleanup();

        event.waitUntil(
          updateGame(kv, gid, (game) => {
            game = game ?? createGame(pid);

            let found = false;

            for (const player of game.players) {
              if (player.pid == pid) {
                player.pid = null;
                found = true;
              }
            }

            return found ? game : null;
          })
        );
      },
    });

    event.waitUntil(
      updateGame(kv, gid, (game) => {
        game = game ?? createGame(pid);

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
    let game = await getGame(kv, gid);
    if (!game) {
      game = createGame(pid);
      await setGame(kv, gid, game);
    }
    return game;
  }
});
