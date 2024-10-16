import {
  Assets,
  Container,
  Sprite,
  Text,
  type ContainerChild,
  type ContainerOptions,
} from "pixi.js";

export const RESSOURCES_HEIGHT = 20;

export default class RessourcesContainer extends Container<ContainerChild> {
  private foodSprite: Sprite;
  private foodText: Text;
  private goldText: Text;
  private goldSprite: Sprite;

  constructor(options: ContainerOptions<ContainerChild>) {
    super(options);

    this.foodText = this.addChild(
      new Text({ style: { fontSize: RESSOURCES_HEIGHT } })
    );

    this.foodSprite = this.addChild(
      new Sprite({
        width: RESSOURCES_HEIGHT,
        height: RESSOURCES_HEIGHT,
      })
    );

    this.goldText = this.addChild(
      new Text({ style: { fontSize: RESSOURCES_HEIGHT } })
    );

    this.goldSprite = this.addChild(
      new Sprite({
        width: RESSOURCES_HEIGHT,
        height: RESSOURCES_HEIGHT,
      })
    );
  }

  init() {
    this.foodSprite.texture = Assets.get("ressources:food");
    this.goldSprite.texture = Assets.get("ressources:gold");
  }

  update(game: { gold: number; food: number } | null) {
    this.visible = game != null;
    if (game) {
      this.foodText.text = String(game.food);
      this.foodSprite.x = this.foodText.x + this.foodText.width;

      this.goldText.text = String(game.gold);
      this.goldText.x = this.foodSprite.x + this.foodSprite.width + 20;
      this.goldSprite.x = this.goldText.x + this.goldText.width;
      this.pivot.x = this.width;
    }
  }
}
