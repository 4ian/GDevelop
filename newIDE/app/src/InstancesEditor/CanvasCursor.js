// @flow

type Props = {|
  canvas: HTMLDivElement,
  shouldMoveView: () => boolean,
|};

/**
 * Change the cursor displayed when hovering the canvas.
 *
 * Some elements on the canvas (for example, resize buttons)
 * can also set their own cursor - this class is only for the canvas.
 */
export default class CanvasCursor {
  canvas: HTMLDivElement;
  shouldMoveView: () => boolean;

  constructor({ canvas, shouldMoveView }: Props) {
    this.canvas = canvas;
    this.shouldMoveView = shouldMoveView;
  }

  render() {
    if (this.shouldMoveView()) {
      this.canvas.style.cursor = 'grab';
      if (this.canvas.style.cursor !== 'grab') {
        this.canvas.style.cursor = '-webkit-grab';
      }
      return;
    }

    this.canvas.style.cursor = 'default';
  }
}
