import { Container, Graphics } from "pixi.js"
import type { GameClient } from "~/game/Game"
import { DEFINITION } from "./MapContainerConsts"

export default class RangeIndicator extends Container {
  private graphic: Graphics

  constructor(private gameClient: GameClient) {
    super()
    this.visible = false
    this.eventMode = "none"
    this.alpha = 0.5

    this.graphic = this.addChild(new Graphics())

    this.addChild(
      (this.mask = new Graphics()
        .rect(0, 0, DEFINITION, DEFINITION)
        .fill(0xffffff))
    )
  }

  get isEnabled() {
    return this.gameClient.settings.showRange
  }

  private draw(size: number, color: number) {
    const { graphic } = this
    const sizeFactor = (DEFINITION * DEFINITION) / size

    graphic.clear()

    graphic.rect(0, 0, DEFINITION, DEFINITION)
    graphic.fill({ color: 0 })

    for (let i = -DEFINITION; i < DEFINITION; i += sizeFactor) {
      graphic.moveTo(i, 0)
      graphic.lineTo(i + DEFINITION, DEFINITION)
    }

    graphic.stroke({ width: sizeFactor / 8, color })
  }

  private update({ x, y }: Entity, range: number, color: number) {
    const minX = Math.max(x - range, 0)
    const minY = Math.max(y - range, 0)
    const maxX = Math.min(x + range, MAP_SIZE - 1)
    const maxY = Math.min(y + range, MAP_SIZE - 1)

    const width = maxX - minX + 1
    const height = maxY - minY + 1

    this.draw(Math.max(width * DEFINITION, height * DEFINITION), color)

    this.setSize(width * DEFINITION, height * DEFINITION)
    this.position.set(minX * DEFINITION, minY * DEFINITION)

    this.visible = true
  }

  hide() {
    this.visible = false
  }

  showOwned(entity: Entity, action: number) {
    if (this.isEnabled) {
      const range =
        entity.budget > 0 ?
          getEntityClassFromName(entity.className).actions[action]?.range
        : 0

      if (range !== undefined)
        this.update(
          entity,
          range,
          entity.budget <= 0 ? 0x777777
          : action === 0 ? 0x4caf50
          : 0xff4500
        )
    }
  }

  showEnemy(entity: Entity) {
    if (this.isEnabled) {
      const entityClass = getEntityClassFromName(entity.className)

      const walkAction = entityClass.actions[0]
      const attackAction = entityClass.actions[1]

      let budget = entity.budget
      let range = budget > 0 ? attackAction.range : 0

      while (budget > walkAction.budget) {
        range += walkAction.range
        budget -= walkAction.budget
      }

      this.update(entity, range, 0x8b0000)
    }
  }
}
