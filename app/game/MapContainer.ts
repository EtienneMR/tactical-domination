import { Assets, Container, Sprite, type ContainerChild } from "pixi.js";
import manifest from "~~/public/assets/manifest.json";
import { GRID_SIZE } from "~~/shared/consts";
import type { SharedCell } from "~~/shared/types";
import { RESSOURCES_HEIGHT } from "./RessourcesContainer";

export default class MapContainer extends Container<ContainerChild> {
  update(map: SharedCell[], parent: HTMLElement) {
    this.removeChildren();

    const caseSize =
      Math.min(
        Math.floor(parent.clientWidth / GRID_SIZE),
        Math.floor(parent.clientHeight / GRID_SIZE),
        50
      ) -
      RESSOURCES_HEIGHT / GRID_SIZE;

    for (const [i, data] of map.entries()) {
      const x = i % GRID_SIZE;
      const y = Math.floor(i / GRID_SIZE);

      const biomeSprite = new Sprite(Assets.get(`biomes:${data.biome}`));
      biomeSprite.setSize(caseSize);
      biomeSprite.x = x * caseSize;
      biomeSprite.y = y * caseSize;
      this.addChild(biomeSprite);

      if (data.building) {
        const assetName =
          manifest.bundles[0]!.assets.find(
            (a) => a.alias == `buildings:${data.owner}_${data.building}`
          )?.alias ?? `buildings:null_${data.building}`;
        const buildingSprite = new Sprite(Assets.get(assetName));
        buildingSprite.setSize(caseSize * 0.8);
        buildingSprite.zIndex += 1;
        buildingSprite.x = (x + 0.1) * caseSize;
        buildingSprite.y = (y + 0.1) * caseSize;
        this.addChild(buildingSprite);
      }
    }
  }
}
