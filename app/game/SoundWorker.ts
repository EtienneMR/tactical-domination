import { sound } from "@pixi/sound"
import manifest from "~~/public/assets/manifest.json"
import type { GameClient } from "./Game"
import displayError from "./utils/displayError"

export default class SoundWorker {
  private nextSoundIndex: number = 0
  private isPlaying: boolean = false
  private events: string[] = []

  constructor(private gameClient: GameClient) {}

  public updateEvents(events: string[], isReset: boolean) {
    this.events = events
    this.nextSoundIndex = Math.min(this.nextSoundIndex, this.events.length)

    if (isReset) this.stop()
    else this.processQueue()
  }

  public stop() {
    this.nextSoundIndex = this.events.length
  }

  private async processQueue() {
    const nextSound = this.events[this.nextSoundIndex]

    if (this.isPlaying || !nextSound) {
      return
    }

    this.isPlaying = true
    this.nextSoundIndex += 1
    await this.playSound(nextSound)
    this.isPlaying = false

    this.processQueue()
  }

  private playSound(soundAlias: string): Promise<void> | void {
    const available = manifest.bundles
      .find(b => b.name == this.gameClient.settings.activeBundle)!
      .assets.filter(a =>
        a.alias.startsWith(
          `${this.gameClient.settings.activeBundle}:sounds:${soundAlias}`
        )
      )

    if (available.length == 0) {
      return displayError(
        "Impossible de jouer un son",
        `Impossible de jouer le son "${soundAlias}"`,
        new Error(`Sound "${soundAlias}" not found in manifest`)
      )
    }

    const selected = available[Math.floor(Math.random() * available.length)]!

    return new Promise(resolve => {
      sound.play(selected.alias, {
        complete: () => resolve()
      })
    })
  }
}
