import { Application, Assets, Container, Sprite } from "pixi.js";
import manifest from "~~/public/assets/manifest.json";
import { GRID_HEIGHT, GRID_WIDTH } from "~~/shared/consts";
import type { Game } from "~~/shared/types";
import useEventSource from "./useEventSource";

export class GameClient {
  private loaded: boolean;
  private app: Application;
  private container: Container;
  private map: Container;
  private versions: {
    map: number | null;
  };
  private caseSize: number;

  private game: Game | null;
  public messages: unknown[];
  public events: {
    state: globalThis.Ref<"CONNECTING" | "OPEN" | "CLOSED" | "Unknown">;
    eventsource: EventSource;
    update: () => void;
  };

  constructor(public gid: string) {
    this.loaded = false;
    this.app = new Application();
    this.container = new Container();
    this.map = this.container.addChild(new Container());
    this.versions = {
      map: null,
    };

    this.caseSize = Math.min(
      Math.floor(innerWidth / GRID_WIDTH),
      Math.floor(innerHeight / GRID_HEIGHT),
      50
    );

    this.game = null;
    this.messages = reactive([] as string[]);
    this.events = useEventSource<Game>(
      `connect?room=${encodeURIComponent(gid)}`,
      this.onMessage.bind(this)
    );
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

    container.x = app.screen.width / 2;
    container.y = app.screen.height / 2;
    this.update();
  }

  private onMessage(data: Game) {
    this.game = data;
    this.messages.push(data);
    this.update();
  }

  private update() {
    const { game, versions } = this;
    if (!game || !this.loaded) return;

    if (versions.map != game.map.v) {
      versions.map = game.map.v;
      this.map.removeChildren();

      for (const [i, data] of game.map.data.entries()) {
        const x = i % GRID_WIDTH;
        const y = Math.floor(i / GRID_WIDTH);
        const sprite = new Sprite(Assets.get(`biome:${data.biome}`));
        sprite.setSize(this.caseSize);
        sprite.x = x * this.caseSize;
        sprite.y = y * this.caseSize;
        this.map.addChild(sprite);
      }
    }

    this.container.pivot.x = this.container.width / 2;
    this.container.pivot.y = this.container.height / 2;
  }

  unmount() {
    this.app.canvas.remove();
    this.app.destroy();
  }
}
