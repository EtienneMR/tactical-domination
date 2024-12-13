import { sound } from "@pixi/sound";
import { Assets, Sprite } from "pixi.js";
import type { Game, Player } from "~~/shared/types/game";

export default class ResultBanner extends Sprite {
  private showState: number;
  private hiddedState: number;

  constructor() {
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

  update(game: Game, player: Player | null) {
    const targetPlayer =
      player ?? game.players.find((p) => p.alive) ?? game.players[0]!;

    this.showState = game.state == "ended" ? 2 : !targetPlayer.alive ? 1 : 0;
    if (this.showState == 0) this.hiddedState = 0;

    const target = this.showState > this.hiddedState;

    if (this.visible != target) {
      this.visible = target;
      sound.play(`sounds:game_${targetPlayer.alive ? "won" : "lost"}`);
    }

    this.texture = Assets.get(
      `ui:${targetPlayer.index}_${targetPlayer.alive ? "victory" : "defeat"}`
    );
  }
}
