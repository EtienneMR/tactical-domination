export default defineEventHandler(async (event) => {
  const { gameId, userId, v, username } = getQuery(event);

  assertValidString_old(gameId, "gameId");
  assertValidString_old(userId, "userId");
  assertValidString_old(v, "v");
  assertValidString_old(username, "username");

  const kv = await useKv();

  if (getHeader(event, "accept") === "text/event-stream") {
    let cleanup: () => void;

    const body = new ReadableStream({
      async start(controller) {
        controller.enqueue(`retry: 1000\n\n`);
        cleanup = subscribeGame(kv, gameId, (game) => {
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
      updateGame(kv, gameId, async (game) => {
        try {
          assertValidGame(game, gameId);
          assertMatchingVersions(event, game, v);
        } catch (error) {
          return null;
        }

        for (const user of game.users) {
          if (user.userId == userId) {
            user.name = username;
            return game;
          }
        }

        game.users.push({
          index:
            game.users.reduce(
              (max, user) =>
                user.index && user.index > max ? user.index : max,
              0
            ) + 1,
          userId,
          name: username,
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
    const game = await getGame(kv, gameId);
    assertValidGame(game, gameId);
    assertMatchingVersions(event, game, v);
    return game;
  }
});
