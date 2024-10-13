import {
  Assets,
  Container,
  Sprite,
  type ContainerChild,
  type ContainerOptions,
} from "pixi.js";

export const RESSOURCES_HEIGHT = 0;

export default class RessourcesContainer extends Container<ContainerChild> {
  private wheatSprite: Sprite;

  constructor(options: ContainerOptions<ContainerChild>) {
    super(options);

    this.wheatSprite = new Sprite({
      x: 100,
      texture: Assets.get("ressources:wheat"),
    });
  }

  update(game: { gold: number; wheat: number }) {
    this.pivot.x = this.width;
  }
}
