import {
  Assets,
  Container,
  Sprite,
  type ContainerChild,
  type ContainerOptions,
} from "pixi.js";
import manifest from "~~/public/assets/manifest.json";
import { GRID_SIZE } from "~~/shared/consts";
import type { Entity, SharedCell } from "~~/shared/types";

const DEFINITION = 64;

class RenderedEntity extends Sprite {
  public eid: string;

  constructor(entity: Entity) {
    super({
      texture: Assets.get(`entities:${entity.owner}_${entity.type}`),
      x: (entity.x + 0.1) * DEFINITION,
      y: (entity.y + 0.1) * DEFINITION,
      width: DEFINITION * 0.8,
      height: DEFINITION * 0.8,
    });
    this.eid = entity.eid;
    this.update(entity);
  }

  public update(entity: Entity) {
    this.x = entity.x;
    this.y = entity.y;
  }
}

export default class MapContainer extends Container<ContainerChild> {
  private entities: RenderedEntity[];

  constructor(options?: ContainerOptions<ContainerChild>) {
    super(options);
    this.entities = [];
    new Container().label;
  }

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
