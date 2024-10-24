import {
  Assets,
  Container,
  Sprite,
  type ContainerChild,
  type ContainerOptions,
} from "pixi.js";
import type { GameClient } from "./Game";

export default class ActionContainer extends Container<ContainerChild> {
  private background: Sprite;

  constructor(
    private gameClient: GameClient,
    options?: ContainerOptions<ContainerChild>
  ) {
    super(options);

    this.background = this.addChild(new Sprite());
  }

  update() {
    this.background.texture = Assets.get(
      `actions:${this.gameClient.me?.index ?? 0}_banner`
    );
  }
}
