// @flow

type Props = {|
  container: HTMLElement,
  getLastCursorSceneCoordinates: () => [number, number] | null,
  isPointerOverCanvas: () => boolean,
|};

/**
 * Display the cursor coordinates in a DOM element over the canvas
 * (rather than in the canvas) so that the text is rendered crisply.
 */
export default class StatusBar {
  _getLastCursorSceneCoordinates: () => [number, number] | null;
  _isPointerOverCanvas: () => boolean;
  _element: HTMLDivElement;
  _xValueElement: HTMLSpanElement;
  _yValueElement: HTMLSpanElement;
  _displayedX: string = '';
  _displayedY: string = '';

  constructor({
    container,
    getLastCursorSceneCoordinates,
    isPointerOverCanvas,
  }: Props) {
    this._getLastCursorSceneCoordinates = getLastCursorSceneCoordinates;
    this._isPointerOverCanvas = isPointerOverCanvas;

    const element = document.createElement('div');
    element.style.cssText = [
      'position: absolute',
      'right: 15px',
      'bottom: 15px',
      'color: #ddd',
      'font-family: var(--gdevelop-classic-font-family)',
      'font-size: 14px',
      'font-weight: 600',
      // Dark halo keeps the text readable over any scene content.
      'text-shadow: 0 0 2px #000, 0 0 2px #000, 0 0 2px #000, 0 0 4px #000',
      // Keeps the halos of neighbouring digits from merging.
      'letter-spacing: 0.5px',
      // Same width for all digits, so the text does not jitter.
      'font-variant-numeric: tabular-nums',
      'white-space: nowrap',
      'pointer-events: none',
      'user-select: none',
      'display: none',
    ].join(';');
    const createLabel = (text: string, marginLeft: string) => {
      const label = document.createElement('span');
      label.textContent = text;
      label.style.cssText = `opacity: 0.6; margin-right: 4px; margin-left: ${marginLeft}`;
      return label;
    };
    this._xValueElement = document.createElement('span');
    this._yValueElement = document.createElement('span');
    element.appendChild(createLabel('X', '0'));
    element.appendChild(this._xValueElement);
    element.appendChild(createLabel('Y', '14px'));
    element.appendChild(this._yValueElement);

    container.appendChild(element);
    this._element = element;
  }

  render() {
    const lastCursorSceneCoordinates = this._getLastCursorSceneCoordinates();
    if (!lastCursorSceneCoordinates || !this._isPointerOverCanvas()) {
      this._element.style.display = 'none';
      return;
    }
    this._element.style.display = 'block';

    const [x, y] = lastCursorSceneCoordinates;
    const displayedX = x.toFixed(0);
    const displayedY = y.toFixed(0);
    if (displayedX !== this._displayedX) {
      this._displayedX = displayedX;
      this._xValueElement.textContent = displayedX;
    }
    if (displayedY !== this._displayedY) {
      this._displayedY = displayedY;
      this._yValueElement.textContent = displayedY;
    }
  }
}
