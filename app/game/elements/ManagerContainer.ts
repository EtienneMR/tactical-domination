import { Container, type ContainerChild } from "pixi.js";
import type { GameClient } from "../Game";
import displayError from "../utils/displayError";
import { RESOURCES_HEIGHT } from "./ResourcesContainer";
import SliceButton from "./SliceButton";

export default class ManagerContainer extends Container<ContainerChild> {
  public declare children: SliceButton[];
  private startButton: SliceButton;
  private regenerateButton: SliceButton;
  private endTurnButton: SliceButton;
  private resetTurnButton: SliceButton;

  constructor(gameClient: GameClient) {
    super();

    const fetchQuery = { uid: gameClient.settings.uid, gid: gameClient.gid };

    const startButton = (this.startButton = this.addChild(
      new SliceButton(gameClient, {
        label: "Jouer",
        height: RESOURCES_HEIGHT,
        fontSize: RESOURCES_HEIGHT,
      })
    ));

    startButton.onPress.connect(async () => {
      startButton.active = false;

      try {
        await $fetch("/api/start", { method: "POST", query: fetchQuery });
      } catch (error) {
        displayError(
          "Impossible de lancer la partie",
          "Nous n'avons pas pu lancer votre partie",
          error
        );
        startButton.active = true;
      }
    });

    const regenerateButton = (this.regenerateButton = this.addChild(
      new SliceButton(gameClient, {
        label: "Regénérer",
        height: RESOURCES_HEIGHT,
        fontSize: RESOURCES_HEIGHT,
      })
    ));
    regenerateButton.x = startButton.x + startButton.width + 20;

    regenerateButton.onPress.connect(async () => {
      regenerateButton.active = false;

      try {
        await $fetch("/api/regenmap", {
          method: "POST",
          query: fetchQuery,
        });
      } catch (error) {
        displayError(
          "Impossible de regénérer la carte",
          "Nous n'avons pas pu regénérer la carte",
          error
        );
        regenerateButton.active = true;
      }
    });

    const endTurnButton = (this.endTurnButton = this.addChild(
      new SliceButton(gameClient, {
        label: "Fin de tour",
        height: RESOURCES_HEIGHT,
        fontSize: RESOURCES_HEIGHT,
        width: 125,
      })
    ));

    endTurnButton.onPress.connect(async () => {
      endTurnButton.active = false;

      try {
        await $fetch("/api/endturn", { method: "POST", query: fetchQuery });
      } catch (error) {
        displayError(
          "Impossible de finir le tour",
          "Nous n'avons pas pu finir votre tour",
          error
        );
        endTurnButton.active = true;
      }
    });

    const resetTurnButton = (this.resetTurnButton = this.addChild(
      new SliceButton(gameClient, {
        label: "Anuler",
        height: RESOURCES_HEIGHT,
        fontSize: RESOURCES_HEIGHT,
        width: 75,
      })
    ));
    resetTurnButton.x = endTurnButton.x + endTurnButton.width + 20;

    resetTurnButton.onPress.connect(async () => {
      resetTurnButton.active = false;
      endTurnButton.active = false;

      try {
        await $fetch("/api/resetturn", {
          method: "POST",
          query: fetchQuery,
        });
      } catch (error) {
        displayError(
          "Impossible de regénérer la carte",
          "Nous n'avons pas pu regénérer la carte",
          error
        );
        resetTurnButton.active = true;
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

    this.resetTurnButton.visible = gameState.status == "started";
    this.resetTurnButton.active =
      gameState.turn == me?.index && game.previousState != null;
  }
}
