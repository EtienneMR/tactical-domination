import { writeFileSync } from "fs";
import { globSync } from "glob";
import { sep as PATH_SEP, resolve } from "path";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },
  typescript: {
    typeCheck: true,
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
});
