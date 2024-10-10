//import type { AtomicOperation, Kv } from "@deno/kv";
import type { Game, MaybeGame, MaybePromise } from "~~/shared/types";

type Kv = any;
type AtomicOperation = any;

const SET_OPTIONS = {
  expireIn: 1000 * 60 * 60,
};

export async function updateGame(
  kv: Kv,
  gid: string,
  perform: (game: Game | null, ao: AtomicOperation) => MaybePromise<MaybeGame>,
  tries: number = 3
) {
  const ao = kv.atomic();

  // @ts-expect-error globalThis not defined
  const getRes = await kv.get<Game>(["games", gid]);

  ao.check({ key: ["games", gid], versionstamp: getRes.versionstamp });

  const value = await perform(getRes.value, ao);

  if (value != null) {
    ao.set(["games", gid], value, SET_OPTIONS);
    const { ok } = await ao.commit();
    if (ok) {
      return true;
    } else if (tries > 0) {
      return updateGame(kv, gid, perform, tries - 1);
    } else
      throw createError({
        message: "Failled to update game",
        statusCode: 500,
        fatal: true,
      });
  } else return false;
}

export async function getGame(kv: Kv, gid: string) {
  // @ts-expect-error globalThis not defined
  const res = await kv.get<Game>(["games", gid]);
  return res.value;
}

export async function setGame(kv: Kv, gid: string, game: Game) {
  return (await kv.set(["games", gid], game, SET_OPTIONS)).ok;
}

export function subscribeGame(
  kv: Kv,
  gid: string,
  cb: (game: Game) => void
): () => void {
  const stream = kv.watch([["games", gid]]);
  const reader = stream.getReader();

  (async () => {
    while (true) {
      const x = await reader.read();
      if (x.done) {
        console.log("subscribeGame: Subscription stream closed");
        return;
      }

      const [game] = x.value!;
      if (game.value) {
        cb(game.value as Game);
      }
    }
  })();

  return () => {
    reader.cancel();
  };
}
