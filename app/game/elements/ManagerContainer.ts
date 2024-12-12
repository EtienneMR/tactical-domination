import { Container, type ContainerChild, type ContainerOptions } from "pixi.js";
import { RESSOURCES_HEIGHT } from "./RessourcesContainer";
import SliceButton from "./SliceButton";
import displayError from "../utils/displayError";

export default class ManagerContainer extends Container<ContainerChild> {
  public declare children: SliceButton[];
  private startButton: SliceButton;
  private regenerateButton: SliceButton;
  private endTurnButton: SliceButton;

  constructor(
    pid: string,
    gid: string,
    options?: ContainerOptions<ContainerChild>
  ) {
    super(options);

    const startButton = (this.startButton = this.addChild(
      new SliceButton({
        label: "Jouer",
        height: RESSOURCES_HEIGHT,
        fontSize: RESSOURCES_HEIGHT - 3,
      })
    ));

    startButton.onPress.connect(async () => {
      startButton.active = false;

      try {
        await $fetch("/api/start", { method: "POST", query: { pid, gid } });
      } catch (error) {
        displayError(
          "Impossible de lancer la partie",
          "Nous n'avons pas pu lancer votre partie",
          error
        );
      } finally {
        startButton.active = true;
      }
    });

    const regenerateButton = (this.regenerateButton = this.addChild(
      new SliceButton({
        label: "Regénérer",
        height: RESSOURCES_HEIGHT,
        fontSize: RESSOURCES_HEIGHT - 3,
      })
    ));
    regenerateButton.x = startButton.x + startButton.width + 20;

    regenerateButton.onPress.connect(async () => {
      regenerateButton.active = false;

      try {
        await $fetch("/api/regenmap", { method: "POST", query: { pid, gid } });
      } catch (error) {
        displayError(
          "Impossible de regénérer la carte",
          "Nous n'avons pas pu regénérer la carte",
          error
        );
      } finally {
        regenerateButton.active = true;
      }
    });

    const endTurnButton = (this.endTurnButton = this.addChild(
      new SliceButton({
        label: "Fin de tour",
        height: RESSOURCES_HEIGHT,
        fontSize: RESSOURCES_HEIGHT - 3,
        width: 200,
      })
    ));

    endTurnButton.onPress.connect(async () => {
      endTurnButton.active = false;

      try {
        await $fetch("/api/endturn", { method: "POST", query: { pid, gid } });
      } catch (error) {
        displayError(
          "Impossible de finir le tour",
          "Nous n'avons pas pu finir votre tour",
          error
        );
      } finally {
        endTurnButton.active = true;
      }
    });
  }

  init() {
    this.children.forEach((c) => c.init());
  }

  update(game: Game, me: Player | null) {
    this.startButton.visible = game.state == "initing";
    this.regenerateButton.visible = game.state == "initing";

    this.endTurnButton.visible = game.state == "started";
    this.endTurnButton.active = game.turn == me?.index;
    this.endTurnButton.update({
      label:
        game.turn == me?.index ? "Fin du tour" : `Tour de Joueur ${game.turn}`,
    });
  }
}
