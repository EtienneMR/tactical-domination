import { ButtonContainer } from "@pixi/ui";
import { NineSliceSprite, Text, Texture } from "pixi.js";

export interface ButtonSettings {
  width: number;
  height: number;
  fontSize: number;
  label: string;
  stroke: string;
}

const NOT_SCALABLE_AREA = 4;

export default class SliceButton extends ButtonContainer {
  private settings: ButtonSettings;
  private textLabel: Text;
  private nineSlice: NineSliceSprite | undefined;

  constructor(settings?: Partial<ButtonSettings>) {
    super();

    this.settings = {
      width: 100,
      height: 50,

      fontSize: 20,
      label: "Button",
      stroke: "#336699",
    };

    this.textLabel = this.addChild(new Text());
    this.textLabel.anchor.set(0.5, 0.5);
    this.textLabel.zIndex += 1;

    this.update(settings ?? {});
  }

  get active() {
    return this.enabled;
  }

  set active(value: boolean) {
    this.enabled = value;
    this.alpha = value ? 1 : 0.5;
  }

  init() {
    this.nineSlice = this.addChild(
      new NineSliceSprite({
        texture: Texture.from("ui:button"),
        leftWidth: NOT_SCALABLE_AREA,
        topHeight: NOT_SCALABLE_AREA,
        rightWidth: NOT_SCALABLE_AREA,
        bottomHeight: NOT_SCALABLE_AREA,
      })
    );
    this.resize();
  }

  update(settings: Partial<ButtonSettings>) {
    this.settings = {
      ...this.settings,
      ...settings,
    };

    this.textLabel.text = this.settings.label;
    this.textLabel.style = {
      fontSize: this.settings.fontSize + "px",
      fill: "#ffffff",
      stroke: this.settings.stroke,
    };

    this.resize();
  }

  resize() {
    const { nineSlice } = this;

    if (nineSlice) {
      nineSlice.width = this.settings.width;
      nineSlice.height = this.settings.height;
    }

    this.textLabel.x = this.settings.width * 0.5;
    this.textLabel.y = this.settings.height * 0.5;
    this.width = this.settings.width;
    this.height = this.settings.height;
  }
}
