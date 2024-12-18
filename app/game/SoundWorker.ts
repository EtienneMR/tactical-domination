import { sound } from "@pixi/sound";
import manifest from "~~/public/assets/manifest.json";
import displayError from "./utils/displayError";
import useBundle from "./utils/useBundle";

export default class SoundWorker {
  private nextSoundIndex: number = 0;
  private isPlaying: boolean = false;
  private events: string[] = [];

  public updateEvents(events: string[], isReset: boolean) {
    this.events = events;

    if (isReset) this.stop();
    else this.processQueue();
  }

  public stop() {
    this.nextSoundIndex = this.events.length;
  }

  private async processQueue() {
    const nextSound = this.events[this.nextSoundIndex];

    if (this.isPlaying || !nextSound) {
      return;
    }

    this.isPlaying = true;
    this.nextSoundIndex += 1;
    await this.playSound(nextSound);
    this.isPlaying = false;

    this.processQueue();
  }

  private playSound(soundAlias: string): Promise<void> | void {
    const available = manifest.bundles[0]!.assets.filter((a) =>
      a.alias.startsWith(`${useBundle()}:sounds:${soundAlias}`)
    );

    if (available.length == 0) {
      return displayError(
        "Impossible de jouer un son",
        `Impossible de jouer le son "${soundAlias}"`,
        new Error(`Sound "${soundAlias}" not found in manifest`)
      );
    }

    const selected = available[Math.floor(Math.random() * available.length)]!;

    return new Promise((resolve) => {
      sound.play(selected.alias, {
        complete: () => resolve(),
      });
    });
  }
}
