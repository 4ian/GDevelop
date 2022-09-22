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

  set(left: number, top: number, right: number, bottom: number) {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
  }

  setThroughCenter(
    centerX: number,
    centerY: number,
    width: number,
    height: number
  ) {
    this.set(
      centerX - width / 2,
      centerY - height / 2,
      centerX + width / 2,
      centerY + height / 2
    );
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
