import { Application, Assets, Container } from "pixi.js";
import manifest from "~~/public/assets/manifest.json";
import { getPlayer } from "~~/shared/utils/game";
import ManagerContainer from "./elements/ManagerContainer";
import MapContainer from "./elements/MapContainer/MapContainer";
import ResourcesContainer from "./elements/ResourcesContainer";
import ResultBanner from "./elements/ResultBanner";
import SoundWorker from "./SoundWorker";
import displayError from "./utils/displayError";
import useEventSource from "./utils/useEventSource";
import useSettings, { type SettingsInterface } from "./utils/useSettings";

export class GameClient {
  private loaded: boolean;
  private app: Application;
  private container: Container;
  private mapContainer: MapContainer;
  private managerContainer: ManagerContainer;
  private resourcesContainer: ResourcesContainer;
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
  private soundWorker: SoundWorker;
  public readonly settings: SettingsInterface;

  constructor(public gid: string, oninited: () => void) {
    const settings = (this.settings = useSettings());

    this.loaded = false;
    this.app = new Application();
    this.container = new Container();
    this.resourcesContainer = this.container.addChild(
      new ResourcesContainer(this)
    );
    this.managerContainer = this.container.addChild(new ManagerContainer(this));
    this.mapContainer = this.container.addChild(
      new MapContainer(this, { y: this.resourcesContainer.height })
    );
    this.resultBanner = this.container.addChild(new ResultBanner(this));

    this.app.stage.addChild(this.container);

    this.parent = document.body;
    this.game = null;
    this.state = ref("Unknown");
    this.events = ref(null);
    this.oninited = oninited;
    this.fetchUrl = `/api/game?gid=${encodeURIComponent(
      gid
    )}&uid=${encodeURIComponent(settings.uid)}&v=${encodeURIComponent(
      useRuntimeConfig().public.gitVersion
    )}`;
    this.updateBinded = this.update.bind(this);

    this.soundWorker = new SoundWorker(this);

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
    if (!this.game || this.game.state.status == "initing") return null;

    return getPlayer(this.game, this.settings.uid);
  }

  async init(parent: HTMLElement) {
    this.parent = parent;
    try {
      const { app } = this;

      await app.init({ background: "#1099bb", resizeTo: parent });
      await Assets.init({ manifest: manifest });

      await Assets.loadBundle(this.settings.bundle);

      parent.appendChild(app.canvas);

      this.managerContainer.init();
      this.resourcesContainer.init();
      this.mapContainer.init();

      if (!this.game) {
        this.game = (await $fetch(this.fetchUrl)) as Game;
      }

      this.soundWorker.updateEvents(this.game.state.events, true);

      this.loaded = true;
      this.connect();

      this.update();
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
      this.app.screen.height - this.resourcesContainer.height,
      500
    );

    this.mapContainer.setSize(mapSize);
    this.resourcesContainer.x = this.mapContainer.x + this.mapContainer.width;

    this.resultBanner.scale.set(mapSize / this.resultBanner.texture.width / 2);
    this.resultBanner.position.set(
      this.container.width / 2,
      this.container.height / 2
    );

    this.mapContainer.update();
    this.resourcesContainer.update(me);
    this.managerContainer.update(game, me);
    this.resultBanner.update(game.state, me);

    this.soundWorker.updateEvents(
      game.state.events,
      game.state.status == "ended"
    );

    this.resize();
  }

  async destroy() {
    this.app.canvas.remove();
    this.app.destroy();
    this.events.value?.destroy();
    removeEventListener("resize", this.updateBinded);
    await Assets.unloadBundle(this.settings.bundle);
    if (import.meta.dev) Assets.reset();
  }
}
