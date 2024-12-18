import manifest from "~~/public/assets/manifest.json";

const requested = localStorage.getItem("assetBundle");
const bundle =
  requested && manifest.bundles.some((m) => m.name == requested)
    ? requested
    : "base";

export default function useBundle() {
  return bundle;
}
