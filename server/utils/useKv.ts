import { type Kv } from "@deno/kv";

export const useKv: () => Promise<Kv> = async () => {
  if (process.dev) {
    // @ts-expect-error
    return openKv("kv.db");

    // @ts-expect-error globalThis not defined
  } else return globalThis.Deno.openKv();
};
