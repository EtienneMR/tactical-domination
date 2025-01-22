import type { AtomicOperation, Kv } from "@deno/kv"

const SET_OPTIONS = {
  expireIn: 1000 * 60 * 60 * 24 * 7
}

export async function updateGame(
  kv: Kv,
  gameId: string,
  perform: (game: Game | null, ao: AtomicOperation) => MaybePromise<MaybeGame>,
  tries: number = 3
) {
  const ao = kv.atomic()

  const getRes = await kv.get<Game>(["games", gameId])

  ao.check({ key: ["games", gameId], versionstamp: getRes.versionstamp })

  const value = await perform(getRes.value, ao)

  if (value != null) {
    ao.set(["games", gameId], value, SET_OPTIONS)
    const { ok } = await ao.commit()
    if (ok) {
      return true
    } else if (tries > 0) {
      return updateGame(kv, gameId, perform, tries - 1)
    } else
      throw createError({
        message: "Failled to update game",
        statusCode: 500,
        fatal: true
      })
  } else return false
}

export async function getGame(kv: Kv, gameId: string) {
  const res = await kv.get<Game>(["games", gameId])
  return res.value
}

export async function setGame(kv: Kv, gameId: string, game: Game) {
  return (await kv.set(["games", gameId], game, SET_OPTIONS)).ok
}

export function subscribeGame(
  kv: Kv,
  gameId: string,
  cb: (game: Game) => void
): () => void {
  const stream = kv.watch([["games", gameId]])
  const reader = stream.getReader()

  ;(async () => {
    while (true) {
      const x = await reader.read()
      if (x.done) {
        console.log("subscribeGame: Subscription stream closed")
        return
      }

      const [game] = x.value!
      if (game.value) {
        cb(game.value as Game)
      }
    }
  })()

  return () => {
    reader.cancel()
  }
}
