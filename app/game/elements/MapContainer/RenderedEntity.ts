import gsap from "gsap";
import { Assets, Sprite } from "pixi.js";

const DEFINITION = 64;

export default class RenderedEntity extends Sprite {
  public draggable!: boolean;
  public actionX: number;
  public actionY: number;
  public action: Action | null;
  public dragged!: boolean;

  static getProps(entity: Entity, myIndex: number | null) {
    return {
      x: (entity.x + 0.5) * DEFINITION,
      y: (entity.y + 0.5) * DEFINITION,
      actionX: entity.x,
      actionY: entity.y,
      alpha: hasEntityBudget(entity) ? 1 : 0.75,
      draggable: hasEntityBudget(entity) && entity.owner == myIndex,
      tint: 0xffffff,
      simpleClick: true,
      dragged: false,
    };
  }

  constructor(public entity: Entity, private myIndex: number | null) {
    super({
      width: DEFINITION * 0.8,
      height: DEFINITION * 0.8,
      zIndex: 10,
      eventMode: "static",
      cursor: "pointer",
      anchor: 0.5,
    });

    this.actionX = entity.x;
    this.actionY = entity.y;
    this.action = null;
    this.reset();
  }

  public update(entity: Entity, myIndex: number | null) {
    this.entity = entity;
    this.myIndex = myIndex;
    gsap.to(this, RenderedEntity.getProps(this.entity, myIndex));

    this.texture = Assets.get(`entities:${entity.owner}_${entity.type}`);
  }

  public reset() {
    Object.assign(this, RenderedEntity.getProps(this.entity, this.myIndex));
    this.texture = Assets.get(
      `entities:${this.entity.owner}_${this.entity.type}`
    );
  }
}
