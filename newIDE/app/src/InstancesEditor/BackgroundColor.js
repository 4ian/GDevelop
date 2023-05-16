// @flow
import * as PIXI from 'pixi.js-legacy';
import * as THREE from 'three';
import { rgbToHexNumber } from '../Utils/ColorTransformer';

type Props = {|
  layout: gdLayout,
|};

export default class BackgroundColor {
  layout: gdLayout;

  constructor({ layout }: Props) {
    this.layout = layout;
  }

  setBackgroundColorForPixi(pixiRenderer: PIXI.Renderer) {
    pixiRenderer.backgroundColor = rgbToHexNumber(
      this.layout.getBackgroundColorRed(),
      this.layout.getBackgroundColorGreen(),
      this.layout.getBackgroundColorBlue()
    );
  }

  setBackgroundColorForThree(
    threeRenderer: THREE.Renderer,
    threeScene: THREE.Scene
  ) {
    const colorCode = rgbToHexNumber(
      this.layout.getBackgroundColorRed(),
      this.layout.getBackgroundColorGreen(),
      this.layout.getBackgroundColorBlue()
    );
    threeRenderer.setClearColor(colorCode);
    threeScene.background = new THREE.Color(colorCode);
  }
}
