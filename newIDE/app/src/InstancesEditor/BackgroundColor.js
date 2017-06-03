import { rgbToHex } from '../Utils/ColorTransformer';

export default class BackgroundColor {
  constructor({ layout, pixiRenderer }) {
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
