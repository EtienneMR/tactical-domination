import { H3Event } from "h3";
import { useKv } from "~~/server/utils/useKv";
import type { Game } from "~~/shared/types";
import { assertValidString } from "../utils/checks";
import { createGame } from "../utils/game";

function assertMatchingVersions(
  event: H3Event,
  game: Game,
  clientVersion: string
) {
  const runtimeConfig = useRuntimeConfig(event);

  const buildVersion = runtimeConfig.public.gitVersion;
  const gameVersion = game.version;

  if (
    runtimeConfig.public.gitVersion != game.version ||
    game.version != clientVersion
  )
    throw createError({
      message: `Version mismatch buildVersion = "${buildVersion}"; gameVersion = "${gameVersion}"; clientVersion = "${clientVersion}"`,
      statusCode: 409,
    });
}

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

        event.waitUntil(
          updateGame(kv, gid, (game) => {
            game = game ?? createGame(event, pid);
            assertMatchingVersions(event, game, v);

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
      updateGame(kv, gid, async (game) => {
        game = game ?? createGame(event, pid);
        try {
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
    let game = await getGame(kv, gid);
    if (!game) {
      game = createGame(event, pid);
      await setGame(kv, gid, game);
    }
    assertMatchingVersions(event, game, v);
    return game;
  }
});
