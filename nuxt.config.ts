import { execSync } from "child_process";
import { writeFileSync } from "fs";
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
      }

      const assets: BundleAsset[] = files
        .filter((file) => !file.endsWith(".json"))
        .map((file) => {
          const path = file.split(PATH_SEP);
          const name = path.pop()!.split(".")[0];
          const scope = path.pop()!;
          const bundle = path.pop()!;

          return {
            src: file
              .replace(__dirname, "")
              .replace("public", "")
              .replaceAll("\\", "/")
              .replace("//", "/"),
            alias: `${bundle}:${scope}:${name}`,
            data: { scaleMode: "nearest" },
            bundle,
          };
        });

      const manifest = {
        bundles: assets.reduce((bundles, { bundle: bundleName, ...asset }) => {
          const bundle = bundles.find((b) => b.name == bundleName);

          if (bundle) bundle.assets.push(asset);
          else bundles.push({ name: bundleName, assets: [asset] });

          return bundles;
        }, [] as { name: string; assets: Asset[] }[]),
      };

      const baseBundle = manifest.bundles.find((b) => b.name == "base")!;

      for (const bundle of manifest.bundles) {
        if (bundle != baseBundle) {
          for (const baseAsset of baseBundle.assets) {
            const [_, scope, id] = baseAsset.alias.split(":");
            const expectedAlias = `${bundle.name}:${scope}:${id}`;

            if (!bundle.assets.some((a) => a.alias == expectedAlias))
              bundle.assets.push({ ...baseAsset, alias: expectedAlias });
          }
        }
      }

      writeFileSync(
        manifestFilePath,
        JSON.stringify(manifest, null, 2),
        "utf-8"
      );

      console.info(`Generated Assets manifest with ${assets.length} entries`);
    },
  },

  modules: ["@nuxt/ui", "@nuxt/image"],
});
