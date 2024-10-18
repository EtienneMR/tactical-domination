import {
  Assets,
  Container,
  Sprite,
  type ContainerChild,
  type ContainerOptions,
} from "pixi.js";
import manifest from "~~/public/assets/manifest.json";
import { GRID_SIZE } from "~~/shared/consts";
import type { Entity, Game } from "~~/shared/types";

const DEFINITION = 64;

class RenderedEntity extends Sprite {
  public eid: string;

  constructor(entity: Entity) {
    super({
      texture: Assets.get(`entities:${entity.owner}_${entity.type}`),
      width: DEFINITION * 0.8,
      height: DEFINITION * 0.8,
      ...RenderedEntity.getTarget(entity),
    });
    this.eid = entity.eid;
    this.update(entity);
  }

  static getTarget(entity: Entity) {
    return {
      x: (entity.x + 0.1) * DEFINITION,
      y: (entity.y + 0.1) * DEFINITION,
    };
  }

  public update(entity: Entity) {
    const { x, y } = RenderedEntity.getTarget(entity);
    this.x = x;
    this.y = y;
  }
}

class EntitiesContainer extends Container<ContainerChild> {
  public declare children: RenderedEntity[];
}

export default class MapContainer extends Container<ContainerChild> {
  private mapContainer: Container<ContainerChild>;
  private entitiesContainer: EntitiesContainer;

  constructor(options?: ContainerOptions<ContainerChild>) {
    super(options);
    this.mapContainer = this.addChild(new Container());
    this.entitiesContainer = this.addChild(new EntitiesContainer());
  }

  update(game: Game) {
    this.mapContainer.removeChildren();

    for (const [i, data] of game.map.entries()) {
      const x = i % GRID_SIZE;
      const y = Math.floor(i / GRID_SIZE);

      const biomeSprite = new Sprite(Assets.get(`biomes:${data.biome}`));
      biomeSprite.setSize(DEFINITION);
      biomeSprite.x = x * DEFINITION;
      biomeSprite.y = y * DEFINITION;
      this.mapContainer.addChild(biomeSprite);

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
        this.mapContainer.addChild(buildingSprite);
      }
    }

    const toRemove = new Set(this.children);

    for (const entity of game.entities) {
      const renderedEntity = this.entitiesContainer.children.find(
        (e) => e.eid == entity.eid
      );
      if (renderedEntity) {
        renderedEntity.update(entity);
        toRemove.delete(renderedEntity);
      } else {
        const added = new RenderedEntity(entity);
        this.entitiesContainer.addChild(added);
      }
    }

    for (const entity of toRemove) {
      this.entitiesContainer.removeChild(entity);
    }
  }
}
