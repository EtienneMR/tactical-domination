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
    version = "unknown";
  }
  if (process.env.NODE_ENV == "development")
    version = `dev-${getFormattedTimestamp()}-${version}`;
  console.info(`Using game version ${version}`);
  return version;
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
    },
  },

  hooks: {
    "build:before": () => {
      const assetsDir = resolve(__dirname, "./public/assets");
      const manifestFilePath = resolve(assetsDir, "manifest.json");

      const files = globSync(`${assetsDir}/**/*.*`);

      const assets = files
        .filter((file) => !file.endsWith(".json"))
        .map((file) => {
          const path = file.split(PATH_SEP);
          const name = (path.pop() as string).split(".")[0];
          const scope = path.pop();
          return {
            src: file
              .replace(__dirname, "")
              .replace("public", "")
              .replaceAll("\\", "/")
              .replace("//", "/"),
            alias: `${scope}:${name}`,
          };
        });

      const manifest = {
        bundles: [
          {
            name: "game",
            assets,
          },
        ],
      };

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
