// @flow
export default class Rectangle {
  left: number;
  right: number;
  top: number;
  bottom: number;

  constructor(
    left: number = 0,
    top: number = 0,
    right: number = 0,
    bottom: number = 0
  ) {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
  }

  set({
    left,
    top,
    right,
    bottom,
  }: {
    left: number,
    top: number,
    right: number,
    bottom: number,
  }) {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
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
    });
  }

  setRectangle(rectangle: Rectangle) {
    this.left = rectangle.left;
    this.top = rectangle.top;
    this.right = rectangle.right;
    this.bottom = rectangle.bottom;
  }

  width() {
    return this.right - this.left;
  }

  height() {
    return this.bottom - this.top;
  }

  centerX() {
    return (this.left + this.right) / 2;
  }

  centerY() {
    return (this.top + this.bottom) / 2;
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
  }

  containsPoint(x: number, y: number): boolean {
    return this.left <= x && this.right > x && this.bottom > y && this.top <= y;
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
      ']'
    );
  }
}
