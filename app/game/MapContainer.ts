import { Assets, Container, Sprite, type ContainerChild } from "pixi.js";
import manifest from "~~/public/assets/manifest.json";
import { GRID_SIZE } from "~~/shared/consts";
import type { SharedCell } from "~~/shared/types";

const DEFINITION = 64;

export default class MapContainer extends Container<ContainerChild> {
  update(map: SharedCell[]) {
    this.removeChildren();

    for (const [i, data] of map.entries()) {
      const x = i % GRID_SIZE;
      const y = Math.floor(i / GRID_SIZE);

      const biomeSprite = new Sprite(Assets.get(`biomes:${data.biome}`));
      biomeSprite.setSize(DEFINITION);
      biomeSprite.x = x * DEFINITION;
      biomeSprite.y = y * DEFINITION;
      this.addChild(biomeSprite);

      if (data.building) {
        const assetName =
          manifest.bundles[0]!.assets.find(
            (a) => a.alias == `buildings:${data.owner}_${data.building}`
          )?.alias ?? `buildings:null_${data.building}`;
        const buildingSprite = new Sprite(Assets.get(assetName));
        buildingSprite.setSize(DEFINITION * 0.8, DEFINITION * 0.8);
        buildingSprite.zIndex += 1;
        buildingSprite.x = (x + 0.1) * DEFINITION;
        buildingSprite.y = (y + 0.1) * DEFINITION;
        this.addChild(buildingSprite);
      }
    }
  }
}
