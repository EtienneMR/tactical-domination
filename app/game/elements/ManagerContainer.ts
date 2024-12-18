import { Container, type ContainerChild, type ContainerOptions } from "pixi.js";
import displayError from "../utils/displayError";
import { RESOURCES_HEIGHT } from "./ResourcesContainer";
import SliceButton from "./SliceButton";

export default class ManagerContainer extends Container<ContainerChild> {
  public declare children: SliceButton[];
  private startButton: SliceButton;
  private regenerateButton: SliceButton;
  private endTurnButton: SliceButton;

  constructor(
    uid: string,
    gid: string,
    options?: ContainerOptions<ContainerChild>
  ) {
    super(options);

    const startButton = (this.startButton = this.addChild(
      new SliceButton({
        label: "Jouer",
        height: RESOURCES_HEIGHT,
        fontSize: RESOURCES_HEIGHT,
      })
    ));

    startButton.onPress.connect(async () => {
      startButton.active = false;

      try {
        await $fetch("/api/start", { method: "POST", query: { uid, gid } });
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
        height: RESOURCES_HEIGHT,
        fontSize: RESOURCES_HEIGHT,
      })
    ));
    regenerateButton.x = startButton.x + startButton.width + 20;

    regenerateButton.onPress.connect(async () => {
      regenerateButton.active = false;

      try {
        await $fetch("/api/regenmap", { method: "POST", query: { uid, gid } });
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
        height: RESOURCES_HEIGHT,
        fontSize: RESOURCES_HEIGHT,
        width: 200,
      })
    ));

    endTurnButton.onPress.connect(async () => {
      endTurnButton.active = false;

      try {
        await $fetch("/api/endturn", { method: "POST", query: { uid, gid } });
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
    const { state: gameState } = game;

    this.startButton.visible = gameState.status == "initing";
    this.regenerateButton.visible = gameState.status == "initing";

    this.endTurnButton.visible = gameState.status == "started";
    this.endTurnButton.active = gameState.turn == me?.index;
    this.endTurnButton.update({
      label:
        gameState.turn == me?.index
          ? "Fin du tour"
          : `Tour de ${
              game.users.find((u) => u.index == gameState.turn)?.name ??
              `Joueur ${gameState.turn}`
            }`,
    });
  }
}
