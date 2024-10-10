import { useKv } from "~~/server/utils/useKv";

export default defineEventHandler(async (event) => {
  const { gid, pid } = getQuery(event);

  if (typeof gid != "string" || typeof pid != "string") {
    return new Response("Invalid gid or pid", {
      status: 400,
    });
  }

  const kv = await useKv();

  return null;
});
