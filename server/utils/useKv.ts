import { type Kv } from "@deno/kv"

export const useKv: () => Promise<Kv> = async () => {
  if (import.meta.dev) {
    const { openKv } = await import("@deno/kv")
    return openKv("kv.db")

    // @ts-expect-error globalThis not defined
  } else return globalThis.Deno.openKv()
}
