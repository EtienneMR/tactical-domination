import manifest from "~~/public/assets/manifest.json";

const ITEM_KEY = "assetBundle";

export default function useBundle() {
  return {
    get() {
      const requested =
        "localStorage" in window && localStorage.getItem(ITEM_KEY);
      return requested && manifest.bundles.some((m) => m.name == requested)
        ? requested
        : "base";
    },
    set(bundle: string) {
      localStorage.setItem(ITEM_KEY, bundle);
    },
  };
}
