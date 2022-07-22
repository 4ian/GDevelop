// @flow
import * as PIXI from '../PIXI';
import { rgbToHex } from '../Utils/ColorTransformer';

type Props = {|
  layout: gdLayout,
  pixiRenderer: PIXI.Renderer,
|};

export default class BackgroundColor {
  layout: gdLayout;
  pixiRenderer: PIXI.Renderer;

  constructor({ layout, pixiRenderer }: Props) {
    this.layout = layout;
    this.pixiRenderer = pixiRenderer;
  }

  render() {
    this.pixiRenderer.backgroundColor = parseInt(
      parseInt(
        rgbToHex(
          this.layout.getBackgroundColorRed(),
          this.layout.getBackgroundColorGreen(),
          this.layout.getBackgroundColorBlue()
        ),
        16
      ),
      10
    );
  }
}
