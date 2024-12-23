import { Graphics } from "pixi.js";
import type { GameClient } from "~/game/Game";
import { GRID_SIZE } from "~~/shared/consts";
import type { Entity } from "~~/shared/types/entities";
import { DEFINITION } from "./MapContainerConsts";

export default class EntityClass extends Graphics {
  constructor(private gameClient: GameClient) {
    super();
    this.visible = false;
    this.eventMode = "none";

    this.rect(0, 0, DEFINITION, DEFINITION);
    this.fill({ alpha: 0.5, color: "black" });
  }

  update({ x, y, type }: Entity, action: number) {
    if (this.gameClient.settings.showRange) {
      const entityClass = getEntityClass(type);
      const range = entityClass.actions[action]?.range;

      if (range) {
        const minX = Math.max(x - range, 0);
        const minY = Math.max(y - range, 0);
        const maxX = Math.min(x + range, GRID_SIZE);
        const maxY = Math.min(y + range, GRID_SIZE);

        this.x = minX * DEFINITION;
        this.y = minY * DEFINITION;
        this.width = (maxX - minX + 1) * DEFINITION;
        this.height = (maxY - minY + 1) * DEFINITION;
        this.visible = true;
      }
    }
  }
}
