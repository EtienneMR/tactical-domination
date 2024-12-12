import type { GameClient } from "~/game/Game";
import displayError from "~/game/utils/displayError";
import { ENTITIES_TYPES, GRID_SIZE } from "~~/shared/consts";
import SliceButton from "../SliceButton";
import RenderedEntity from "./RenderedEntity";

const DEFINITION = 64;

export default class SpawnPopup extends SliceButton {
  private cell: Cell | null;

  constructor(private gameClient: GameClient) {
    super({
      width: DEFINITION * ENTITIES_TYPES.length,
      height: DEFINITION,

      label: " ",
    });
    this.x = DEFINITION;
    this.visible = false;
    this.cell = null;
  }

  override init() {
    super.init();
    for (const [i, entityType] of Object.entries(ENTITIES_TYPES)) {
      const entity = this.addChild(
        new RenderedEntity(
          {
            eid: `spawnPopupFakeEntity-${entityType}`,
            type: entityType,
            owner: null,
            x: Number(i),
            y: 0,
            budget: 0,
          },
          null
        )
      );
      entity.on(
        "pointerdown",
        this.requestSpawn.bind(this, entityType),
        entityType
      );
    }
  }

  async requestSpawn(entityType: string) {
    if (this.cell) {
      try {
        await $fetch("/api/create", {
          query: {
            gid: this.gameClient.gid,
            pid: this.gameClient.pid,
            entityType,
            x: this.cell.x,
            y: this.cell.y,
          },
          method: "POST",
        });
      } catch (error) {
        displayError(
          "Impossible de créer une unitée",
          "Nous n'avons pas pu créer votre unitée",
          error
        );
      }
    }
  }

  showAt(cell: Cell) {
    this.visible = true;
    this.cell = cell;

    const alignLeft = cell.x > GRID_SIZE / 2 ? 1 : 0;

    this.x = (cell.x + 1 - alignLeft) * DEFINITION - alignLeft * this.width;
    this.y = cell.y * DEFINITION;
  }

  hide() {
    this.visible = false;
    this.cell = null;
  }
}
