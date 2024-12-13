import { Application, Assets, Container } from "pixi.js";
import manifest from "~~/public/assets/manifest.json";
import { getPlayer } from "~~/shared/utils/game";
import ManagerContainer from "./elements/ManagerContainer";
import MapContainer from "./elements/MapContainer/MapContainer";
import RessourcesContainer from "./elements/RessourcesContainer";
import ResultBanner from "./elements/ResultBanner";
import displayError from "./utils/displayError";
import useEventSource from "./utils/useEventSource";
import usePlayerId from "./utils/usePlayerId";

export class GameClient {
  private loaded: boolean;
  private app: Application;
  private container: Container;
  private mapContainer: MapContainer;
  private managerContainer: ManagerContainer;
  private ressourcesContainer: RessourcesContainer;
  private resultBanner: ResultBanner;

  public parent: HTMLElement;
  public game: Game | null;
  private fetchUrl: string;
  private oninited: () => void;
  public events: Ref<{
    state: Ref<"CONNECTING" | "OPEN" | "CLOSED" | "Unknown">;
    eventsource: EventSource;
    update: () => void;
    destroy: () => void;
  } | null>;
  public state: Ref<"CONNECTING" | "OPEN" | "CLOSED" | "Unknown">;
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
    this.resultBanner = this.container.addChild(new ResultBanner());

    this.app.stage.addChild(this.container);

    this.parent = document.body;
    this.game = null;
    this.state = ref("Unknown");
    this.events = ref(null);
    this.oninited = oninited;
    this.fetchUrl = `/api/game?gid=${encodeURIComponent(
      gid
    )}&pid=${encodeURIComponent(pid)}&v=${encodeURIComponent(
      useRuntimeConfig().public.gitVersion
    )}`;
    this.updateBinded = this.update.bind(this);
    addEventListener("resize", this.updateBinded);
  }

  async connect() {
    if (!this.loaded) return;
    this.events.value?.eventsource.close();
    this.events.value = useEventSource<Game>(
      this.fetchUrl,
      this.onMessage.bind(this),
      this.state
    );
  }

  get me(): Player | null {
    if (!this.game || this.game.state == "initing") return null;

    return getPlayer(this.game, this.pid);
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
      this.mapContainer.init();

      if (!this.game) {
        this.game = (await $fetch(this.fetchUrl)) as Game;
      }

      this.loaded = true;
      this.connect();
    } catch (error) {
      this.events.value?.eventsource.close();
      this.events.value?.update();
      displayError(
        "Erreur de chargement",
        "Nous n'avons pas pu charger votre partie.",
        error,
        location.reload.bind(location)
      );
      await this.destroy();
    }

    this.update();
    this.oninited();
  }

  private onMessage(data: Game) {
    this.game = data;
    this.update();
  }

  private resize() {
    const { container, app } = this;

    container.x = app.screen.width / 2;
    container.y = app.screen.height / 2;

    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;
  }

  private update() {
    this.resize();

    const { game, me } = this;
    if (!this.loaded || !game) return;

    const mapSize = Math.min(
      this.app.screen.width,
      this.app.screen.height - this.ressourcesContainer.height,
      500
    );

    this.mapContainer.setSize(mapSize);
    this.ressourcesContainer.x = this.mapContainer.x + this.mapContainer.width;

    this.resultBanner.scale.set(mapSize / this.resultBanner.texture.width / 2);
    this.resultBanner.position.set(
      this.container.width / 2,
      this.container.height / 2
    );

    this.mapContainer.update();
    this.ressourcesContainer.update(me);
    this.managerContainer.update(game, me);
    this.resultBanner.update(game, me);

    this.resize();
  }

  async destroy() {
    this.app.canvas.remove();
    this.app.destroy();
    this.events.value?.destroy();
    removeEventListener("resize", this.updateBinded);
    await Assets.unloadBundle("game");
    if (import.meta.dev) Assets.reset();
  }
}
