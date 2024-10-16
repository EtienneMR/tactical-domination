import { Container, type ContainerChild } from "pixi.js";
import type { Game } from "~~/shared/types";
import { RESSOURCES_HEIGHT } from "./RessourcesContainer";
import SliceButton from "./SliceButton";

export default class ManagerContainer extends Container<ContainerChild> {
  init(pid: string, gid: string) {
    const playButton = this.addChild(
      new SliceButton({
        label: "Jouer",
        height: RESSOURCES_HEIGHT,
        fontSize: RESSOURCES_HEIGHT - 3,
      })
    );

    playButton.onPress.connect(async () => {
      playButton.enabled = false;
      playButton.alpha = 0.75;

      try {
        await $fetch("/api/start", { method: "POST", query: { pid, gid } });
      } finally {
        playButton.enabled = true;
        playButton.alpha = 1;
      }
    });

    const regenerateButton = this.addChild(
      new SliceButton({
        label: "Regénérer",
        height: RESSOURCES_HEIGHT,
        fontSize: RESSOURCES_HEIGHT - 3,
      })
    );
    regenerateButton.x = playButton.x + playButton.width + 20;

    regenerateButton.onPress.connect(async () => {
      regenerateButton.enabled = false;
      regenerateButton.alpha = 0.75;

      try {
        await $fetch("/api/regenmap", { method: "POST", query: { pid, gid } });
      } finally {
        regenerateButton.enabled = true;
        regenerateButton.alpha = 1;
      }
    });
  }

  update(game: Game) {
    this.visible = game.state == "initing";
  }
}
