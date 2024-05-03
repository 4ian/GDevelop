// @flow
export default class Rectangle {
  left: number;
  right: number;
  top: number;
  bottom: number;
  zMin: number;
  zMax: number;

  constructor(
    left: number = 0,
    top: number = 0,
    right: number = 0,
    bottom: number = 0,
    zMin: number = 0,
    zMax: number = 0
  ) {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.zMin = zMin;
    this.zMax = zMax;
  }

  static fromDOMRect(domRect: DOMRect | ClientRect) {
    return new this(domRect.left, domRect.top, domRect.right, domRect.bottom);
  }

  set({
    left,
    top,
    right,
    bottom,
    zMin,
    zMax,
  }: {
    left: number,
    top: number,
    right: number,
    bottom: number,
    zMin?: number,
    zMax?: number,
  }) {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.zMin = zMin || 0;
    this.zMax = zMax || 0;
  }

  setThroughCenter({
    centerX,
    centerY,
    width,
    height,
  }: {
    centerX: number,
    centerY: number,
    width: number,
    height: number,
  }) {
    this.set({
      left: centerX - width / 2,
      top: centerY - height / 2,
      right: centerX + width / 2,
      bottom: centerY + height / 2,
      zMin: 0,
      zMax: 0,
    });
  }

  setRectangle(rectangle: Rectangle) {
    this.left = rectangle.left;
    this.top = rectangle.top;
    this.right = rectangle.right;
    this.bottom = rectangle.bottom;
    this.zMin = rectangle.zMin;
    this.zMax = rectangle.zMax;
  }

  width() {
    return this.right - this.left;
  }

  height() {
    return this.bottom - this.top;
  }

  depth() {
    return this.zMax - this.zMin;
  }

  centerX() {
    return (this.left + this.right) / 2;
  }

  centerY() {
    return (this.top + this.bottom) / 2;
  }

  centerZ() {
    return (this.zMin + this.zMax) / 2;
  }

  union(rectangle: Rectangle) {
    if (rectangle.left < this.left) {
      this.left = rectangle.left;
    }
    if (rectangle.top < this.top) {
      this.top = rectangle.top;
    }
    if (rectangle.right > this.right) {
      this.right = rectangle.right;
    }
    if (rectangle.bottom > this.bottom) {
      this.bottom = rectangle.bottom;
    }
    if (rectangle.zMin < this.zMin) {
      this.zMin = rectangle.zMin;
    }
    if (rectangle.zMax > this.zMax) {
      this.zMax = rectangle.zMax;
    }
  }

  containsPoint(x: number, y: number): boolean {
    return this.left <= x && this.right > x && this.bottom > y && this.top <= y;
  }

  toCSSPosition() {
    return {
      top: this.top,
      left: this.left,
      width: this.width(),
      height: this.height(),
    };
  }

  toString() {
    return (
      '[' +
      this.left +
      ' -> ' +
      this.right +
      ' ; ' +
      this.top +
      ' -> ' +
      this.bottom +
      ' ; ' +
      this.zMin +
      ' -> ' +
      this.zMax +
      ']'
    );
  }
}
