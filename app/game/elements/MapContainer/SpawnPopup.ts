import { Assets, Sprite, Text } from "pixi.js";
import type { GameClient } from "~/game/Game";
import displayError from "~/game/utils/displayError";
import SliceButton from "../SliceButton";
import { DEFINITION } from "./MapContainerConsts";
import RenderedEntity from "./RenderedEntity";

type EntityData = [EntityClass, RenderedEntity, Text];

export default class SpawnPopup extends SliceButton {
  private cell: Cell | null;
  private entities: EntityData[];

  constructor(gameClient: GameClient) {
    super(gameClient, {
      width: DEFINITION * ENTITIES_TYPES.length,
      height: DEFINITION,

      label: " ",
    });
    this.x = DEFINITION;
    this.visible = false;
    this.cell = null;
    this.entities = [];
  }

  override init() {
    super.init();
    for (const [i, entityClassName] of Object.entries(ENTITIES_TYPES)) {
      const entity = this.addChild(
        new RenderedEntity(
          {
            entityId: `spawnPopupFakeEntity-${entityClassName}`,
            className: entityClassName,
            owner: null,
            x: Number(i),
            y: 0,
            budget: 0,
          },
          null,
          this.gameClient.settings.bundle
        )
      );
      entity.width -= 6;
      entity.height -= 6;

      const entityClass = getEntityClassFromName(entityClassName);

      this.addChild(
        new Sprite({
          texture: Assets.get(
            `${this.gameClient.settings.bundle}:resources:${entityClass.resource}`
          ),
          x: (Number(i) + 1) * DEFINITION - 6,
          y: 3,
          anchor: { x: 1, y: 0 },
          width: DEFINITION / 4,
          height: DEFINITION / 4,
          zIndex: 11,
        })
      );

      const cost = this.addChild(
        new Text({
          style: { fontSize: DEFINITION / 4, fill: "white" },
          text: "Test",
          x: (Number(i) + 1) * DEFINITION - 6 - DEFINITION / 4,
          y: 3,
        })
      );
      cost.zIndex = 11;
      cost.anchor.set(1, 0);

      const entityData: EntityData = [entityClass, entity, cost];

      entity.on(
        "pointerdown",
        this.requestSpawn.bind(this, entityData),
        entityData
      );

      this.entities.push(entityData);
    }
  }

  async requestSpawn([entityClass, renderedEntity]: EntityData) {
    if (this.cell && renderedEntity.alpha == 1) {
      try {
        await $fetch("/api/create", {
          query: {
            gameId: this.gameClient.gameId,
            userId: this.gameClient.settings.userId,
            entityClassName: entityClass.name,
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

    const alignLeft = cell.x > MAP_SIZE / 2 ? 1 : 0;

    this.x = (cell.x + 1 - alignLeft) * DEFINITION - alignLeft * this.width;
    this.y = cell.y * DEFINITION;
  }

  hide() {
    this.visible = false;
    this.cell = null;
  }

  updateState() {
    const gameState = this.gameClient.game?.state;
    const me = this.gameClient.me;

    if (gameState && me) {
      const spawnCost = getSpawnCost(gameState, me);

      for (const [entityClass, renderedEntity, costText] of this.entities) {
        const cost = spawnCost[entityClass.name];
        const canAfford = !cost || me.ressources[entityClass.resource] >= cost;

        renderedEntity.alpha =
          gameState.currentPlayer == me?.index && canAfford ? 1 : 0.5;
        costText.text = cost ?? "";
        costText.style.fill = canAfford ? "white" : "red";
      }
    }
  }
}
