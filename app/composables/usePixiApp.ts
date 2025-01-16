import { Application, Container } from "pixi.js";
import type { GameSharedState } from "~/types/GameSharedState";

export default function (sharedState: GameSharedState) {
  const app = new Application();
  const container = app.stage.addChild(new Container());

  const resizeContainer = () => {
    container.x = app.screen.width / 2;
    container.y = app.screen.height / 2;

    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;
  };

  onMounted(() => addEventListener("resize", resizeContainer));
  onUnmounted(() => removeEventListener("resize", resizeContainer));
}
