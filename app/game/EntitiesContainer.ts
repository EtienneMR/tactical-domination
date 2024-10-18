import {
  Assets,
  Container,
  Sprite,
  type ContainerChild,
  type ContainerOptions,
} from "pixi.js";
import type { Entity } from "~~/shared/types";

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
      zIndex: 10,
    });
    this.eid = entity.eid;
    this.update(entity);
  }

  public update(entity: Entity) {
    this.x = (entity.x + 0.1) * DEFINITION;
    this.y = (entity.y + 0.1) * DEFINITION;
  }
}

export default class MapContainer extends Container<ContainerChild> {
  public declare children: RenderedEntity[];

  constructor(options?: ContainerOptions<ContainerChild>) {
    super(options);
  }

  update(entities: Entity[]) {
    const toRemove = new Set(this.children);

    for (const entity of entities) {
      const renderedEntity = this.children.find((e) => e.eid == entity.eid);
      if (renderedEntity) {
        renderedEntity.update(entity);
        toRemove.delete(renderedEntity);
      } else {
        const added = new RenderedEntity(entity);
        this.addChild(added);
      }
    }

    for (const entity of toRemove) {
      this.removeChild(entity);
    }
  }
}
