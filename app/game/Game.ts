import { Application, Assets, Container, Sprite } from "pixi.js";
import manifest from "~~/public/assets/manifest.json";
import { GRID_SIZE } from "~~/shared/consts";
import type { Game } from "~~/shared/types";
import useEventSource from "./useEventSource";
import usePlayerId from "./usePlayerId";

export class GameClient {
  private loaded: boolean;
  private app: Application;
  private container: Container;
  private map: Container;

  private game: Game | null;
  private fetchUrl: string;
  public messages: unknown[];
  private oninited: () => void;
  public events: {
    state: globalThis.Ref<"CONNECTING" | "OPEN" | "CLOSED" | "Unknown">;
    eventsource: EventSource;
    update: () => void;
    destroy: () => void;
  };
  private updateBinded: () => void;

  constructor(public gid: string, oninited: () => void) {
    const playerId = usePlayerId();

    this.loaded = false;
    this.app = new Application();
    this.container = new Container();
    this.map = this.container.addChild(new Container());

    this.game = null;
    this.messages = reactive([] as string[]);
    this.oninited = oninited;
    this.fetchUrl = `/api/game?gid=${encodeURIComponent(
      gid
    )}&pid=${encodeURIComponent(playerId)}`;
    this.events = useEventSource<Game>(
      this.fetchUrl,
      this.onMessage.bind(this)
    );
    this.updateBinded = this.update.bind(this);
    addEventListener("resize", this.updateBinded);
  }

  async init(parent: HTMLElement) {
    const { app, container } = this;
    // Initialize the application
    await app.init({ background: "#1099bb", resizeTo: parent });
    await Assets.init({ manifest: manifest });
    await Assets.loadBundle("game");
    this.loaded = true;

    parent.appendChild(app.canvas);
    app.stage.addChild(container);

    if (!this.game) {
      const game = (await $fetch(this.fetchUrl)) as Game;
      if (game) this.game = game;
    }

    this.update();
    this.oninited();
  }

  private onMessage(data: Game) {
    this.game = data;
    this.messages.push(data);
    this.update();
  }

  private update() {
    const { game } = this;
    if (!this.loaded || !game) return;

    this.map.removeChildren();

    const caseSize = Math.min(
      Math.floor(innerWidth / GRID_SIZE),
      Math.floor(innerHeight / GRID_SIZE),
      50
    );

    for (const [i, data] of game.map.entries()) {
      const x = i % GRID_SIZE;
      const y = Math.floor(i / GRID_SIZE);

      const biomeSprite = new Sprite(Assets.get(`biomes:${data.biome}`));
      biomeSprite.setSize(caseSize);
      biomeSprite.x = x * caseSize;
      biomeSprite.y = y * caseSize;
      this.map.addChild(biomeSprite);

      if (data.building) {
        const assetName =
          manifest.bundles[0]!.assets.find(
            (a) => a.alias == `buildings:${data.owner}_${data.building}`
          )?.alias ?? `buildings:null_${data.building}`;
        const buildingSprite = new Sprite(Assets.get(assetName));
        buildingSprite.setSize(caseSize * 0.8);
        buildingSprite.zIndex += 1;
        buildingSprite.x = (x + 0.1) * caseSize;
        buildingSprite.y = (y + 0.1) * caseSize;
        this.map.addChild(buildingSprite);
      }
    }

    this.container.x = this.app.screen.width / 2;
    this.container.y = this.app.screen.height / 2;

    this.container.pivot.x = this.container.width / 2;
    this.container.pivot.y = this.container.height / 2;
  }

  async destroy() {
    this.app.canvas.remove();
    this.app.destroy();
    this.events.destroy();
    removeEventListener("resize", this.updateBinded);
    await Assets.unloadBundle("game");
    if (import.meta.dev) Assets.reset();
  }
}
