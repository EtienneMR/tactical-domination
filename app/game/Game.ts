import { Application, Assets, Container, Sprite } from "pixi.js";
import useWebSocket from "./useWebSocket";

export class GameClient {
  public app: Application;
  public webSocket: {
    state: Ref<"CONNECTING" | "OPEN" | "CLOSING" | "CLOSED" | "Unknown">;
    websocket: WebSocket;
  };
  public messages: string[];

  constructor(public roomId: string) {
    this.app = new Application();

    this.messages = reactive([] as string[]);

    this.webSocket = useWebSocket(
      `connect?room=${encodeURIComponent(roomId)}`,
      this.onMessage.bind(this)
    );
  }

  async init(parent: HTMLElement) {
    const app = this.app;
    // Initialize the application
    await app.init({ background: "#1099bb", resizeTo: parent });

    parent.appendChild(app.canvas);

    // Create and add a container to the stage
    const container = new Container();

    app.stage.addChild(container);

    // Load the bunny texture
    const texture = await Assets.load("https://pixijs.com/assets/bunny.png");

    // Create a 5x5 grid of bunnies in the container
    for (let i = 0; i < 25; i++) {
      const bunny = new Sprite(texture);

      bunny.x = (i % 5) * 40;
      bunny.y = Math.floor(i / 5) * 40;
      container.addChild(bunny);
    }

    // Move the container to the center
    container.x = app.screen.width / 2;
    container.y = app.screen.height / 2;

    // Center the bunny sprites in local container coordinates
    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;

    // Listen for animate update
    app.ticker.add((time) => {
      // Continuously rotate the container!
      // * use delta to create frame-independent transform *
      container.rotation -= 0.01 * time.deltaTime;
    });
  }

  onMessage(data: string) {
    this.messages.push(data);
  }

  unmount() {
    this.app.canvas.remove();
    this.app.destroy();
  }
}
