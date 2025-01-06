import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { globSync } from "glob";
import { sep as PATH_SEP, resolve } from "path";

function getFormattedTimestamp() {
  const now = new Date();
  const YYYY = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const DD = String(now.getDate()).padStart(2, "0");
  const HH = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const SS = String(now.getSeconds()).padStart(2, "0");
  return `${YYYY}${MM}${DD}${HH}${mm}${SS}`;
}

const getGitVersion = () => {
  let version;
  try {
    version = execSync("git rev-parse --short HEAD").toString().trim();
  } catch (error) {
    console.error(error);
    version = "unknown";
  }
  if (process.env.NODE_ENV == "development")
    version = `dev-${getFormattedTimestamp()}-${version}`;
  console.info(`Using game version ${version}`);
  return version;
};

const getGitMessage = () => {
  try {
    return execSync("git log -1 --pretty=%B").toString().trim();
  } catch (error) {
    console.error(error);
    return "unknown";
  }
};

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",

  future: {
    compatibilityVersion: 4,
  },

  app: {
    pageTransition: { name: "page", mode: "out-in" },
  },

  devtools: { enabled: true },

  typescript: {
    typeCheck: true,
  },

  runtimeConfig: {
    public: {
      gitVersion: getGitVersion(),
      gitMessage: getGitMessage(),
    },
  },

  hooks: {
    "build:before": () => {
      const assetsDir = resolve(__dirname, "./public/assets");
      const manifestFilePath = resolve(assetsDir, "manifest.json");

      const files = globSync(`${assetsDir}/**/*.*`);

      interface Asset {
        src: string;
        alias: string;
        data: {};
      }

      interface BundleAsset extends Asset {
        bundle: string;
        ext: string | undefined;
        path: string;
      }

      const assets: BundleAsset[] = files
        .filter((file) => !file.endsWith(".json"))
        .map((file) => {
          const path = file.split(PATH_SEP);
          const fileName = path.pop()!.split(".");
          const name = fileName[0]!;
          const ext = fileName[1];
          const scope = path.pop()!;
          const bundle = path.pop()!;

          return {
            src: file
              .replace(__dirname, "")
              .replace("public", "")
              .replaceAll("\\", "/")
              .replace("//", "/"),
            path: file,
            alias: `${bundle}:${scope}:${name}`,
            data: { scaleMode: "nearest" },
            bundle,
            ext,
          };
        });

      const manifest = {
        bundles: assets.reduce(
          (bundles, { bundle: bundleName, ext, path, ...asset }) => {
            const bundle = bundles.find((b) => b.name == bundleName);

            if (ext == "alias") {
              const targetAlias = readFileSync(path, "utf-8");
              const targetAsset = assets.find((a) => a.alias == targetAlias);

              if (!targetAsset)
                throw new Error(
                  `Invalid asset alias "${asset.alias}": target asset "${targetAlias}" not found`
                );

              asset.src = `${targetAsset.src}#${encodeURIComponent(
                asset.alias
              )}`;
              asset.data = targetAsset.data;
            } else if (ext == "source") {
              return bundles;
            }

            if (bundle) bundle.assets.push(asset);
            else bundles.push({ name: bundleName, assets: [asset] });

            return bundles;
          },
          [] as { name: string; assets: Asset[] }[]
        ),
      };

      const baseBundle = manifest.bundles.find((b) => b.name == "base")!;

      for (const bundle of manifest.bundles) {
        if (bundle != baseBundle) {
          for (const baseAsset of baseBundle.assets) {
            const [_, scope, idTrack] = baseAsset.alias.split(":");
            const id = idTrack?.split("-")[0];
            const expectedAlias = `${bundle.name}:${scope}:${id}`;

            if (!bundle.assets.some((a) => a.alias.startsWith(expectedAlias)))
              bundle.assets.push({ ...baseAsset, alias: expectedAlias });
          }
        }
      }

      writeFileSync(manifestFilePath, JSON.stringify(manifest), "utf-8");

      console.info(`Generated Assets manifest with ${assets.length} entries`);
    },
  },

  modules: ["@nuxt/ui", "@nuxt/image"],
});
