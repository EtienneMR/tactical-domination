import { Application, Assets, Container } from "pixi.js";
import manifest from "~~/public/assets/manifest.json";
import type { Game, IndexedPlayer } from "~~/shared/types";
import displayError from "./displayError";
import ManagerContainer from "./ManagerContainer";
import MapContainer from "./MapContainer";
import RessourcesContainer from "./RessourcesContainer";
import useEventSource from "./useEventSource";
import usePlayerId from "./usePlayerId";

export class GameClient {
  private loaded: boolean;
  private app: Application;
  private container: Container;
  private mapContainer: MapContainer;
  private managerContainer: ManagerContainer;
  private ressourcesContainer: RessourcesContainer;

  public parent: HTMLElement;
  public game: Game | null;
  private fetchUrl: string;
  private oninited: () => void;
  public events: {
    state: Ref<"CONNECTING" | "OPEN" | "CLOSED" | "Unknown">;
    eventsource: EventSource;
    update: () => void;
    destroy: () => void;
  };
  private updateBinded: () => void;
  public pid: string;

  constructor(public gid: string, oninited: () => void) {
    const pid = (this.pid = usePlayerId());

    this.loaded = false;
    this.app = new Application();
    this.container = new Container();
    this.ressourcesContainer = this.container.addChild(
      new RessourcesContainer({})
    );
    this.managerContainer = this.container.addChild(
      new ManagerContainer(pid, gid)
    );
    this.mapContainer = this.container.addChild(
      new MapContainer(this, { y: this.ressourcesContainer.height })
    );

    this.app.stage.addChild(this.container);

    this.parent = document.body;
    this.game = null;
    this.oninited = oninited;
    this.fetchUrl = `/api/game?gid=${encodeURIComponent(
      gid
    )}&pid=${encodeURIComponent(pid)}`;
    this.events = useEventSource<Game>(
      this.fetchUrl,
      this.onMessage.bind(this)
    );
    this.updateBinded = this.update.bind(this);
    addEventListener("resize", this.updateBinded);
  }

  get me(): IndexedPlayer | null {
    if (!this.game || this.game.state != "started") return null;

    const index = this.game.players.findIndex((p) => p.pid === this.pid);

    if (index === -1) return null;

    const player = this.game.players[index]!;

    return {
      index,
      ...player,
    };
  }

  async init(parent: HTMLElement) {
    this.parent = parent;
    try {
      const { app } = this;
      // Initialize the application
      await app.init({ background: "#1099bb", resizeTo: parent });
      await Assets.init({ manifest: manifest });
      await Assets.loadBundle("game");

      parent.appendChild(app.canvas);

      this.managerContainer.init();
      this.ressourcesContainer.init();

      this.loaded = true;

      if (!this.game) {
        this.game = (await $fetch(this.fetchUrl)) as Game;
      }
    } catch (error) {
      this.events.eventsource.close();
      this.events.update();
      displayError(
        "Erreur de chargement",
        "Nous n'avons pas pu charger votre partie.",
        error,
        true
      );
    }

    this.update();
    this.oninited();
  }

  private onMessage(data: Game) {
    this.game = data;
    this.update();
  }

  private update() {
    const { game, me } = this;
    if (!this.loaded || !game) return;

    this.mapContainer.update();
    this.ressourcesContainer.update(me);
    this.managerContainer.update(game, this.me);

    const mapSize = Math.min(
      this.app.screen.width,
      this.app.screen.height - this.ressourcesContainer.height,
      500
    );

    this.mapContainer.setSize(mapSize);
    this.ressourcesContainer.x = this.mapContainer.x + this.mapContainer.width;

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
