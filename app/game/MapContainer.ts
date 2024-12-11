import gsap from "gsap";
import {
  Assets,
  Container,
  FederatedPointerEvent,
  Point,
  Sprite,
  type ContainerChild,
  type ContainerOptions,
} from "pixi.js";
import manifest from "~~/public/assets/manifest.json";
import { ENTITIES_TYPES, GRID_SIZE } from "~~/shared/consts";
import type { Cell } from "~~/shared/types/game";
import { getEntityClass, hasEntityBudget } from "~~/shared/utils/entities";
import { canDoAction, getCellAt, getEntityFromPos } from "~~/shared/utils/game";
import displayError from "./displayError";
import type { GameClient } from "./Game";
import SliceButton from "./SliceButton";

const DEFINITION = 64;
const SECONDARY_CLICK_DELAY = 5000;
const TRANSFORM_CLICK_DELAY = 500;

class RenderedEntity extends Sprite {
  public draggable!: boolean;
  public actionX: number;
  public actionY: number;
  public action: Action | null;
  public dragged!: boolean;

  static getProps(entity: Entity, myIndex: number | null) {
    return {
      x: (entity.x + 0.5) * DEFINITION,
      y: (entity.y + 0.5) * DEFINITION,
      actionX: entity.x,
      actionY: entity.y,
      alpha: hasEntityBudget(entity) ? 1 : 0.75,
      draggable: hasEntityBudget(entity) && entity.owner == myIndex,
      tint: 0xffffff,
      simpleClick: true,
      dragged: false,
    };
  }

  constructor(public entity: Entity, private myIndex: number | null) {
    super({
      width: DEFINITION * 0.8,
      height: DEFINITION * 0.8,
      zIndex: 10,
      eventMode: "static",
      cursor: "pointer",
      anchor: 0.5,
    });

    this.actionX = entity.x;
    this.actionY = entity.y;
    this.action = null;
    this.reset();
  }

  public update(entity: Entity, myIndex: number | null) {
    this.entity = entity;
    this.myIndex = myIndex;
    gsap.to(this, RenderedEntity.getProps(this.entity, myIndex));

    this.texture = Assets.get(`entities:${entity.owner}_${entity.type}`);
  }

  public reset() {
    Object.assign(this, RenderedEntity.getProps(this.entity, this.myIndex));
    this.texture = Assets.get(
      `entities:${this.entity.owner}_${this.entity.type}`
    );
  }
}

class SpawnPopup extends SliceButton {
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
      const biomeSprite = new Sprite(Assets.get(`biomes:${data.biome}`));
      biomeSprite.setSize(DEFINITION);
      biomeSprite.x = data.x * DEFINITION;
      biomeSprite.y = data.y * DEFINITION;
      this.mapContainer.addChild(biomeSprite);

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
        const can = canDoAction(
          game,
          me,
          dragTarget.entity,
          action,
          entityAtPos,
          entityAtPos ? getEntityClass(entityAtPos.type) : null,
          pos
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
        !dragTarget.dragged &&
        hasEntityBudget(dragTarget.entity) &&
        me &&
        me.food > 0;

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

          const can = canDoAction(
            game,
            me,
            clickTarget.entity,
            lastAction,
            entityAtPos,
            entityAtPos ? getEntityClass(entityAtPos.type) : null,
            pos
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

        if (cell.building == "castle" && !getEntityFromPos(game, pos)) {
          this.spawnPopup.showAt(cell);
        }
      }
    }
  }
}
