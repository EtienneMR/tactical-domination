import { type Kv } from "@deno/kv";

export const useKv: () => Promise<Kv> = async () => {
  const OpenKV = () => import("@deno/kv");
  const { openKv } = await OpenKV();
  if (process.dev) {
    return openKv("kv.db");
  } else return openKv();
};
