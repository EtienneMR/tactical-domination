import {
  Assets,
  Container,
  type ContainerChild,
  type ContainerOptions,
  FederatedPointerEvent,
  Point,
  Sprite,
} from "pixi.js";
import type { GameClient } from "~/game/Game";
import displayError from "~/game/utils/displayError";
import getGroundData from "~/game/utils/getGroundData";
import manifest from "~~/public/assets/manifest.json";
import { GRID_SIZE } from "~~/shared/consts";
import EntityMask from "./EntityMask";
import { DEFINITION } from "./MapContainerConsts";
import RenderedEntity from "./RenderedEntity";
import SpawnPopup from "./SpawnPopup";

const SECONDARY_CLICK_DELAY = 5000;
const REMOVE_CLICK_DELAY = 500;

class EntitiesContainer extends Container<ContainerChild> {
  public declare children: RenderedEntity[];
}

export default class MapContainer extends Container<ContainerChild> {
  private mapContainer: Container<ContainerChild>;
  private entitiesContainer: EntitiesContainer;
  private dragTarget: RenderedEntity | null;
  private clickTarget: RenderedEntity | null;
  private doubleClickStart: DOMHighResTimeStamp;
  private spawnPopup: SpawnPopup;
  private entityMask: EntityMask;

  constructor(
    private gameClient: GameClient,
    options?: ContainerOptions<ContainerChild>
  ) {
    super(options);
    this.mapContainer = this.addChild(new Container());
    this.entityMask = this.addChild(new EntityMask());
    this.entitiesContainer = this.addChild(new EntitiesContainer());
    this.spawnPopup = this.addChild(new SpawnPopup(gameClient));
    this.dragTarget = null;
    this.clickTarget = null;
    this.doubleClickStart = performance.timeOrigin;

    this.eventMode = "static";

    this.on("pointerdown", this.onSecondaryAction.bind(this));
    this.on("pointerup", this.onDragEnd.bind(this));
    this.on("pointerupoutside", this.onDragEnd.bind(this));
    this.on("pointermove", this.onDragMove.bind(this));
  }

  init() {
    this.spawnPopup.init();
  }

  update() {
    const gameState = this.gameClient.game?.state;

    if (!gameState) return;

    this.mapContainer.removeChildren();

    for (const data of gameState.map) {
      const groundData = getGroundData(
        data,
        gameState.map,
        this.gameClient.bundle
      );

      const tint = (data.x + data.y) % 2 == 0 ? "#ffffff" : "#dddddd";

      if (!groundData.full) {
        const backgroundSprite = new Sprite(
          Assets.get(`${this.gameClient.bundle}:biomes:plains`)
        );
        backgroundSprite.setSize(DEFINITION);
        backgroundSprite.x = data.x * DEFINITION;
        backgroundSprite.y = data.y * DEFINITION;
        backgroundSprite.tint = tint;
        this.mapContainer.addChild(backgroundSprite);
      }

      if (groundData.texture) {
        const tileSprite = new Sprite(groundData.texture);
        tileSprite.setSize(DEFINITION);
        tileSprite.x = data.x * DEFINITION;
        tileSprite.y = data.y * DEFINITION;
        tileSprite.tint = tint;
        this.mapContainer.addChild(tileSprite);
      }

      if (data.building) {
        const assetName =
          manifest.bundles
            .find((b) => b.name == this.gameClient.bundle)!
            .assets.find(
              (a) =>
                a.alias ==
                `${this.gameClient.bundle}:buildings:${data.owner}_${data.building}`
            )?.alias ??
          `${this.gameClient.bundle}:buildings:null_${data.building}`;
        const buildingSprite = new Sprite(Assets.get(assetName));
        buildingSprite.setSize(DEFINITION * 0.8, DEFINITION * 0.8);
        buildingSprite.zIndex += 1;
        buildingSprite.x = (data.x + 0.1) * DEFINITION;
        buildingSprite.y = (data.y + 0.1) * DEFINITION;
        this.mapContainer.addChild(buildingSprite);
      }
    }

    for (const entity of gameState.entities) {
      const renderedEntity = this.entitiesContainer.children.find(
        (e) => e.entity.eid == entity.eid
      );
      if (renderedEntity) {
        renderedEntity.update(entity, this.gameClient.me?.index ?? null);
      } else {
        const added = new RenderedEntity(
          entity,
          this.gameClient.me?.index ?? null,
          this.gameClient.bundle
        );
        added.on("pointerdown", this.onDragStart.bind(this, added), added);
        this.entitiesContainer.addChild(added);
      }
    }

    for (const entity of this.entitiesContainer.children) {
      if (!gameState.entities.find((e) => e.eid == entity.entity.eid))
        this.entitiesContainer.removeChild(entity);
    }

    this.spawnPopup.updateState();
  }

  onDragMove(event: FederatedPointerEvent) {
    const gameState = this.gameClient.game?.state;
    const me = this.gameClient.me;

    const { dragTarget } = this;

    if (gameState && me && dragTarget) {
      dragTarget.action = null;

      const point = this.toLocal(event.global);

      dragTarget.actionX = Math.min(
        Math.floor(point.x / DEFINITION),
        GRID_SIZE - 1
      );
      dragTarget.actionY = Math.min(
        Math.floor(point.y / DEFINITION),
        GRID_SIZE - 1
      );

      dragTarget.position = new Point(
        (dragTarget.actionX + 0.5) * DEFINITION,
        (dragTarget.actionY + 0.5) * DEFINITION
      );

      if (
        dragTarget.actionX != dragTarget.entity.x &&
        dragTarget.actionY != dragTarget.entity.y
      )
        dragTarget.dragged = true;

      const pos = { x: dragTarget.actionX, y: dragTarget.actionY };

      for (const action of getEntityClass(dragTarget.entity.type).actions) {
        const actionData = getActionDataFromType(action.type);
        const entityAtPos = getEntityFromPos(gameState, pos);
        const cell = getCellAt(gameState, pos);
        const can = canDoAction(
          gameState,
          me,
          dragTarget.entity,
          action,
          actionData,
          entityAtPos,
          entityAtPos ? getEntityClass(entityAtPos.type) : null,
          cell
        );

        dragTarget.tint = can ? 0xffffff : 0xff0000;
        if (can) {
          dragTarget.action = action;
          break;
        }
      }
    }
  }

  async onDragStart(target: RenderedEntity) {
    const gameState = this.gameClient.game?.state;

    if (
      this.clickTarget == target &&
      gameState &&
      gameState.turn == this.gameClient.me?.index
    ) {
      const cell = getCellAt(gameState, target.entity);

      if (
        cell.building == "castle" &&
        performance.now() - this.doubleClickStart <= REMOVE_CLICK_DELAY
      ) {
        try {
          await $fetch("/api/remove", {
            query: {
              gid: this.gameClient.gid,
              uid: this.gameClient.uid,
              eid: target.entity.eid,
            },
            method: "POST",
          });
        } catch (error) {
          displayError(
            "Impossible de renvoyer l'unitée",
            "Nous n'avons pas pu renvoyer l'unitée",
            error
          );
        }
      }

      if (this.clickTarget) this.clickTarget.reset();
      this.clickTarget = null;
      this.entityMask.visible = false;
    } else if (target.draggable) {
      target.alpha = 0.5;
      this.dragTarget = target;

      this.entityMask.update(target.entity, 0);
      if (this.clickTarget) this.clickTarget.reset();
      this.clickTarget = null;
    }
  }

  async onDragEnd() {
    const { dragTarget } = this;
    if (dragTarget) {
      this.dragTarget = null;
      this.entityMask.visible = false;

      const gameState = this.gameClient.game?.state;
      const me = this.gameClient.me;

      if (gameState && me && dragTarget.action) {
        try {
          await $fetch("/api/doaction", {
            query: {
              gid: this.gameClient.gid,
              uid: this.gameClient.uid,
              eid: dragTarget.entity.eid,
              action: dragTarget.action.type,
              x: dragTarget.actionX,
              y: dragTarget.actionY,
            },
            method: "POST",
          });
        } catch (error) {
          displayError(
            "Impossible de faire cette action",
            "Nous n'avons pas pu exécuter votre action",
            error
          );
        }
      }

      const canSecondary =
        !dragTarget.dragged && hasEntityBudget(dragTarget.entity);

      dragTarget.reset();

      if (canSecondary) {
        this.clickTarget = dragTarget;
        this.doubleClickStart = performance.now();
        dragTarget.tint = 0x999999;

        this.entityMask.update(dragTarget.entity, 1);
      }
    }
  }

  async onSecondaryAction(event: FederatedPointerEvent) {
    this.spawnPopup.hide();

    const gameState = this.gameClient.game?.state;
    const me = this.gameClient.me;

    const { clickTarget } = this;
    this.clickTarget = null;
    if (gameState && me) {
      const point = this.toLocal(event.global);

      const actionX = Math.min(Math.floor(point.x / DEFINITION), GRID_SIZE - 1);
      const actionY = Math.min(Math.floor(point.y / DEFINITION), GRID_SIZE - 1);
      const pos = { x: actionX, y: actionY };

      if (clickTarget) {
        this.entityMask.visible = false;
        if (
          performance.now() - this.doubleClickStart <=
          SECONDARY_CLICK_DELAY
        ) {
          const lastAction = getEntityClass(
            clickTarget.entity.type
          ).actions.findLast(() => true)!;
          const lastActionData = getActionDataFromType(lastAction.type);

          const entityAtPos = getEntityFromPos(gameState, pos);
          const cell = getCellAt(gameState, pos);

          const can = canDoAction(
            gameState,
            me,
            clickTarget.entity,
            lastAction,
            lastActionData,
            entityAtPos,
            entityAtPos ? getEntityClass(entityAtPos.type) : null,
            cell
          );

          if (can) {
            try {
              await $fetch("/api/doaction", {
                query: {
                  gid: this.gameClient.gid,
                  uid: this.gameClient.uid,
                  eid: clickTarget.entity.eid,
                  action: lastAction.type,
                  x: actionX,
                  y: actionY,
                },
                method: "POST",
              });
            } catch (error) {
              displayError(
                "Impossible de faire cette action",
                "Nous n'avons pas pu exécuter votre action",
                error
              );
            }
          }
        }
        clickTarget.reset();
      } else {
        const cell = getCellAt(gameState, pos);

        if (
          cell.building == "castle" &&
          cell.owner == me.index &&
          !getEntityFromPos(gameState, pos)
        ) {
          this.spawnPopup.showAt(cell);
        }
      }
    }
  }
}
