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
import RenderedEntity from "./RenderedEntity";
import SpawnPopup from "./SpawnPopup";

const DEFINITION = 64;
const SECONDARY_CLICK_DELAY = 5000;
const TRANSFORM_CLICK_DELAY = 500;

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

  constructor(
    private gameClient: GameClient,
    options?: ContainerOptions<ContainerChild>
  ) {
    super(options);
    this.mapContainer = this.addChild(new Container());
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
    const { game } = this.gameClient;

    if (!game) return;

    this.mapContainer.removeChildren();

    for (const data of game.map) {
      const groundData = getGroundData(data, game.map);

      if (!groundData.full) {
        const backgroundSprite = new Sprite(Assets.get(`biomes:plains`));
        backgroundSprite.setSize(DEFINITION);
        backgroundSprite.x = data.x * DEFINITION;
        backgroundSprite.y = data.y * DEFINITION;
        this.mapContainer.addChild(backgroundSprite);
      }

      if (groundData.texture) {
        const tileSprite = new Sprite(groundData.texture);
        tileSprite.setSize(DEFINITION + 4);
        tileSprite.x = data.x * DEFINITION;
        tileSprite.y = data.y * DEFINITION;
        this.mapContainer.addChild(tileSprite);
      }

      if (data.building) {
        const assetName =
          manifest.bundles[0]!.assets.find(
            (a) => a.alias == `buildings:${data.owner}_${data.building}`
          )?.alias ?? `buildings:null_${data.building}`;
        const buildingSprite = new Sprite(Assets.get(assetName));
        buildingSprite.setSize(DEFINITION * 0.8, DEFINITION * 0.8);
        buildingSprite.zIndex += 1;
        buildingSprite.x = (data.x + 0.1) * DEFINITION;
        buildingSprite.y = (data.y + 0.1) * DEFINITION;
        this.mapContainer.addChild(buildingSprite);
      }
    }

    for (const entity of game.entities) {
      const renderedEntity = this.entitiesContainer.children.find(
        (e) => e.entity.eid == entity.eid
      );
      if (renderedEntity) {
        renderedEntity.update(entity, this.gameClient.me?.index ?? null);
      } else {
        const added = new RenderedEntity(
          entity,
          this.gameClient.me?.index ?? null
        );
        added.on("pointerdown", this.onDragStart.bind(this, added), added);
        this.entitiesContainer.addChild(added);
      }
    }

    for (const entity of this.entitiesContainer.children) {
      if (!game.entities.find((e) => e.eid == entity.entity.eid))
        this.entitiesContainer.removeChild(entity);
    }

    this.spawnPopup.updateState();
  }

  onDragMove(event: FederatedPointerEvent) {
    const { game, me } = this.gameClient;
    const { dragTarget } = this;

    if (game && me && dragTarget) {
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
        const entityAtPos = getEntityFromPos(game, pos);
        const cell = getCellAt(game, pos);
        const can = canDoAction(
          game,
          me,
          dragTarget.entity,
          action,
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
    const { game } = this.gameClient;

    if (
      this.clickTarget == target &&
      game &&
      game.turn == this.gameClient.me?.index
    ) {
      const cell = getCellAt(game, target.entity);

      if (
        cell.building == "castle" &&
        performance.now() - this.doubleClickStart <= TRANSFORM_CLICK_DELAY
      ) {
        try {
          await $fetch("/api/remove", {
            query: {
              gid: this.gameClient.gid,
              pid: this.gameClient.pid,
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
    } else if (target.draggable) {
      target.alpha = 0.5;
      this.dragTarget = target;
      if (this.clickTarget) this.clickTarget.reset();
      this.clickTarget = null;
    }
  }

  async onDragEnd() {
    const { dragTarget } = this;
    if (dragTarget) {
      this.dragTarget = null;

      const { game, me } = this.gameClient;

      if (game && me && dragTarget.action) {
        try {
          await $fetch("/api/doaction", {
            query: {
              gid: this.gameClient.gid,
              pid: this.gameClient.pid,
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
      }
    }
  }

  async onSecondaryAction(event: FederatedPointerEvent) {
    this.spawnPopup.hide();

    const { game, me } = this.gameClient;
    const { clickTarget } = this;
    this.clickTarget = null;
    if (game && me) {
      const point = this.toLocal(event.global);

      const actionX = Math.min(Math.floor(point.x / DEFINITION), GRID_SIZE - 1);
      const actionY = Math.min(Math.floor(point.y / DEFINITION), GRID_SIZE - 1);
      const pos = { x: actionX, y: actionY };

      if (clickTarget) {
        if (
          performance.now() - this.doubleClickStart <=
          SECONDARY_CLICK_DELAY
        ) {
          const lastAction = getEntityClass(
            clickTarget.entity.type
          ).actions.findLast(() => true)!;

          const entityAtPos = getEntityFromPos(game, pos);
          const cell = getCellAt(game, pos);

          const can = canDoAction(
            game,
            me,
            clickTarget.entity,
            lastAction,
            entityAtPos,
            entityAtPos ? getEntityClass(entityAtPos.type) : null,
            cell
          );

          if (can) {
            try {
              await $fetch("/api/doaction", {
                query: {
                  gid: this.gameClient.gid,
                  pid: this.gameClient.pid,
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
        const cell = getCellAt(game, pos);

        if (
          cell.building == "castle" &&
          cell.owner == me.index &&
          !getEntityFromPos(game, pos)
        ) {
          this.spawnPopup.showAt(cell);
        }
      }
    }
  }
}
