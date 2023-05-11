// @flow
import * as PIXI from 'pixi.js-legacy';
import * as THREE from 'three';
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

  setBackgroundColorForThree(
    threeRenderer: THREE.Renderer,
    threeScene: THREE.Scene
  ) {
    const colorCode = parseInt(
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
    threeRenderer.setClearColor(colorCode);
    threeScene.background = new THREE.Color(colorCode);
  }
}
