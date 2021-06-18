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

  width() {
    return this.right - this.left;
  }

  height() {
    return this.bottom - this.top;
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
}
