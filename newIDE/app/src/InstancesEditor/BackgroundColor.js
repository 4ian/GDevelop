// @flow
import * as PIXI from 'pixi.js-legacy';
import { rgbToHex } from '../Utils/ColorTransformer';

type Props = {|
  layout: gdLayout,
|};

export default class BackgroundColor {
  layout: gdLayout;

  constructor({ layout }: Props) {
    this.layout = layout;
  }

  setBackgroundColorForPixi(pixiRenderer: PIXI.Renderer) {
    pixiRenderer.backgroundColor = parseInt(
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
