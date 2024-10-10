import type { Kv } from "@deno/kv";

export const useKv: () => Promise<Kv> = async () => {
  // @ts-expect-error unknwon global
  const global = globalThis.Deno;
  if (global) {
    return global.openKv();
  }
  if (process.dev) {
    const OpenKV = () => import("@deno/kv");
    const { openKv } = await OpenKV();
    return openKv("kv.db");
  }
  throw createError({
    statusCode: 500,
    message:
      "Could not find a Deno KV for production, make sure to deploy on Deno Deploy.",
  });
};
