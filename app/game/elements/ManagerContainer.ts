import { Container, type ContainerChild } from "pixi.js";
import EndTurnTransformation from "~~/shared/utils/transformations/EndTurnTransformation";
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

  constructor(private gameClient: GameClient) {
    super();

    const fetchQuery = {
      userId: gameClient.settings.userId,
      gameId: gameClient.gameId,
    };

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
      }
      startButton.active = true;
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
      }
      regenerateButton.active = true;
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

      const index = gameClient.me?.index;
      if (index == null) return;

      const transformation = new EndTurnTransformation(index);

      try {
        await applyTransformation(
          transformation,
          gameClient.game!.state,
          fetchQuery.gameId
        );
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
        label: "Annuler",
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

  update() {
    const game = this.gameClient.game!;
    const { state: gameState } = game;
    const { me } = this.gameClient;

    this.startButton.visible = gameState.status == "initing";
    this.regenerateButton.visible = gameState.status == "initing";

    this.endTurnButton.visible = gameState.status == "started";
    this.endTurnButton.active = gameState.currentPlayer == me?.index;
    this.endTurnButton.update({
      label:
        gameState.currentPlayer == me?.index
          ? "Fin du tour"
          : `Tour de ${
              game.users.find((u) => u.index == gameState.currentPlayer)
                ?.name ?? `Joueur ${gameState.currentPlayer}`
            }`,
    });

    this.resetTurnButton.visible = gameState.status == "started";
    this.resetTurnButton.active =
      gameState.currentPlayer == me?.index && game.previousState != null;
  }
}
