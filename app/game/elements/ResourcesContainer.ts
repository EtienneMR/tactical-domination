import { Assets, Container, Sprite, Text, type ContainerChild } from "pixi.js"
import type { GameClient } from "../Game"

export const RESOURCES_HEIGHT = 20

export default class ResourcesContainer extends Container<ContainerChild> {
  private foodSprite: Sprite
  private foodText: Text
  private goldText: Text
  private goldSprite: Sprite

  constructor(private gameClient: GameClient) {
    super()

    this.foodText = this.addChild(
      new Text({ style: { fontSize: RESOURCES_HEIGHT } })
    )

    this.foodSprite = this.addChild(
      new Sprite({
        width: RESOURCES_HEIGHT,
        height: RESOURCES_HEIGHT
      })
    )

    this.goldText = this.addChild(
      new Text({ style: { fontSize: RESOURCES_HEIGHT } })
    )

    this.goldSprite = this.addChild(
      new Sprite({
        width: RESOURCES_HEIGHT,
        height: RESOURCES_HEIGHT
      })
    )
  }

  init() {
    this.foodSprite.texture = Assets.get(
      `${this.gameClient.settings.activeBundle}:resources:food`
    )
    this.goldSprite.texture = Assets.get(
      `${this.gameClient.settings.activeBundle}:resources:gold`
    )
  }

  update() {
    const ressources = this.gameClient.me?.ressources

    this.visible = !!ressources
    if (ressources) {
      this.foodText.text = String(ressources.food)
      this.foodSprite.x = this.foodText.x + this.foodText.width

      this.goldText.text = String(ressources.gold)
      this.goldText.x = this.foodSprite.x + this.foodSprite.width + 20
      this.goldSprite.x = this.goldText.x + this.goldText.width
      this.pivot.x = this.width
    }
  }
}
