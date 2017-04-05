/**
 * Convert a rgb color value to a hex value.
 * @note No "#" or "0x" are added.
 * @static
 */
const rgbToHex = (r, g, b) =>
  '' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

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
