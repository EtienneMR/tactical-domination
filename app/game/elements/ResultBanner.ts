import { sound } from "@pixi/sound";
import { Assets, Sprite } from "pixi.js";
import type { GameClient } from "../Game";

export default class ResultBanner extends Sprite {
  private showState: number;
  private hiddedState: number;

  constructor(private gameClient: GameClient) {
    super({
      eventMode: "static",
      visible: false,
    });

    this.showState = 0;
    this.hiddedState = 0;

    this.anchor.set(0.5);
    this.on("click", () => {
      this.hiddedState = this.showState;
      this.visible = false;
    });
  }

  update() {
    const gameState = this.gameClient.game!.state;

    const targetPlayer =
      this.gameClient.me ??
      gameState.players.find((p) => p.alive) ??
      gameState.players[0]!;

    this.showState =
      gameState.status == "ended" ? 2 : !targetPlayer.alive ? 1 : 0;
    if (this.showState == 0) this.hiddedState = 0;

    const target = this.showState > this.hiddedState;

    if (this.visible != target) {
      this.visible = target;
      sound.play(
        `${this.gameClient.settings.activeBundle}:sounds:game_${
          targetPlayer.alive ? "won" : "lost"
        }`
      );
    }

    this.texture = Assets.get(
      `${this.gameClient.settings.activeBundle}:ui:${targetPlayer.index}_${
        targetPlayer.alive ? "victory" : "defeat"
      }`
    );
  }
}
