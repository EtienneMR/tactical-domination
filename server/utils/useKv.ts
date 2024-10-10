import { type Kv } from "@deno/kv";

let warned = false;

export const useKv: () => Promise<Kv> = async () => {
  let useDev = import.meta.dev;

  // @ts-expect-error globalThis not defined
  if (!useDev && !globalThis.Deno) {
    if (!warned) {
      console.warn("Deno not found, using local kv");
      warned = true;
    }
    useDev = true;
  }

  if (useDev) {
    const { openKv } = await import("@deno/kv");
    return openKv("kv.db");

    // @ts-expect-error globalThis not defined
  } else return globalThis.Deno.openKv();
};
