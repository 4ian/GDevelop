namespace gdjs {
  export class AffineTransformation {
    private a: float;
    private b: float;
    private c: float;
    private d: float;
    private e: float;
    private f: float;

    constructor() {
      // | a b c |   | 1 0 0 |
      // | d e f | = | 0 1 0 |
      // | 0 0 1 |   | 0 0 1 |
      this.a = 1;
      this.b = 0;
      this.c = 0;
      this.d = 0;
      this.e = 1;
      this.f = 0;
    }

    setToIdentity() {
      // | a b c |   | 1 0 0 |
      // | d e f | = | 0 1 0 |
      // | 0 0 1 |   | 0 0 1 |
      this.a = 1;
      this.b = 0;
      this.c = 0;
      this.d = 0;
      this.e = 1;
      this.f = 0;
    }

    isIdentity(): boolean {
      return (
        this.a === 1 &&
        this.b === 0 &&
        this.c === 0 &&
        this.d === 0 &&
        this.e === 1 &&
        this.f === 0
      );
    }

    equals(other: AffineTransformation): boolean {
      return (
        this === other ||
        (this.a === other.a &&
          this.b === other.b &&
          this.c === other.c &&
          this.d === other.d &&
          this.e === other.e &&
          this.f === other.f)
      );
    }

    nearlyEquals(other: AffineTransformation, epsilon: float): boolean {
      return (
        this === other ||
        (gdjs.nearlyEqual(this.a, other.a, epsilon) &&
          gdjs.nearlyEqual(this.b, other.b, epsilon) &&
          gdjs.nearlyEqual(this.c, other.c, epsilon) &&
          gdjs.nearlyEqual(this.d, other.d, epsilon) &&
          gdjs.nearlyEqual(this.e, other.e, epsilon) &&
          gdjs.nearlyEqual(this.f, other.f, epsilon))
      );
    }

    setToTranslation(tx: float, ty: float) {
      // | a b c |   | 1 0 tx |
      // | d e f | = | 0 1 ty |
      // | 0 0 1 |   | 0 0 1  |
      this.a = 1;
      this.b = 0;
      this.c = tx;
      this.d = 0;
      this.e = 1;
      this.f = ty;
    }

    translate(tx: float, ty: float) {
      //       1 0 tx
      //       0 1 ty
      //       0 0 1
      // a b c
      // d e f
      // 0 0 1
      const c = tx * this.a + ty * this.b + this.c;
      const f = tx * this.d + ty * this.e + this.f;

      this.c = c;
      this.f = f;
    }

    setToScale(sx: float, sy: float) {
      // | a b c |   | sx 0  0 |
      // | d e f | = | 0  sy 0 |
      // | 0 0 1 |   | 0  0  1 |
      this.a = sx;
      this.b = 0;
      this.c = 0;
      this.d = 0;
      this.e = sy;
      this.f = 0;
    }

    scale(sx: float, sy: float) {
      //       sx 0  0
      //       0  sy 0
      //       0  0  1
      // a b c
      // d e f
      // 0 0 1
      const a = sx * this.a;
      const b = sy * this.b;
      const d = sx * this.d;
      const e = sy * this.e;

      this.a = a;
      this.b = b;
      this.d = d;
      this.e = e;
    }

    setToRotation(theta: float) {
      let cost = Math.cos(theta);
      let sint = Math.sin(theta);

      // Avoid rounding errors around 0.
      if (cost === -1 || cost === 1) {
        sint = 0;
      }
      if (sint === -1 || sint === 1) {
        cost = 0;
      }

      // | a b c |   | cost -sint 0 |
      // | d e f | = | sint  cost 0 |
      // | 0 0 1 |   |  0     0   1 |
      this.a = cost;
      this.b = -sint;
      this.c = 0;
      this.d = sint;
      this.e = cost;
      this.f = 0;
    }

    rotate(theta: float) {
      let cost = Math.cos(theta);
      let sint = Math.sin(theta);

      // Avoid rounding errors around 0.
      if (cost === -1 || cost === 1) {
        sint = 0;
      }
      if (sint === -1 || sint === 1) {
        cost = 0;
      }

      //       cost -sint 0
      //       sint  cost 0
      //        0     0   1
      // a b c
      // d e f
      // 0 0 1
      const a = cost * this.a + sint * this.b;
      const b = -sint * this.a + cost * this.b;
      const d = cost * this.d + sint * this.e;
      const e = -sint * this.d + cost * this.e;

      this.a = a;
      this.b = b;
      this.d = d;
      this.e = e;
    }

    setToRotationAround(theta: float, anchorX: float, anchorY: float) {
      let cost = Math.cos(theta);
      let sint = Math.sin(theta);

      // Avoid rounding errors around 0.
      if (cost === -1 || cost === 1) {
        sint = 0;
      }
      if (sint === -1 || sint === 1) {
        cost = 0;
      }

      // | a b c |   | cost -sint x-x*cost+y*sint |
      // | d e f | = | sint  cost y-x*sint-y*cost |
      // | 0 0 1 |   |  0     0          1        |
      this.a = cost;
      this.b = -sint;
      this.c = anchorX - anchorX * cost + anchorY * sint;
      this.d = sint;
      this.e = cost;
      this.f = anchorY - anchorX * sint + anchorY * cost;
    }

    rotateAround(theta: float, anchorX: float, anchorY: float) {
      this.translate(anchorX, anchorY);
      this.rotate(theta);
      // First: translate anchor to origin
      this.translate(-anchorX, -anchorY);
    }

    setToFlipX(anchorX: float) {
      // | a b c |   | -1  0 2x |
      // | d e f | = |  0  1  0 |
      // | 0 0 1 |   |  0  0  1 |
      this.a = -1;
      this.b = 0;
      this.c = 2 * anchorX;
      this.d = 0;
      this.e = 1;
      this.f = 0;
    }

    flipX(anchorX: float) {
      this.translate(anchorX, 0);
      this.scale(-1, 1);
      // First: translate anchor to origin
      this.translate(-anchorX, 0);
    }

    setToFlipY(anchorY: float) {
      // | a b c |   | 1  0  0 |
      // | d e f | = | 0 -1 2x |
      // | 0 0 1 |   | 0  0  1 |
      this.a = 1;
      this.b = 0;
      this.c = 0;
      this.d = 0;
      this.e = -1;
      this.f = 2 * anchorY;
    }

    flipY(anchorY: float) {
      this.translate(0, anchorY);
      this.scale(1, -1);
      // First: translate anchor to origin
      this.translate(0, -anchorY);
    }

    concatenate(other: AffineTransformation) {
      //       a b c
      //       d e f
      //       0 0 1
      // a b c
      // d e f
      // 0 0 1
      const a = this.a * other.a + this.b * other.d;
      const b = this.a * other.b + this.b * other.e;
      const c = this.a * other.c + this.b * other.f + this.c;

      const d = this.d * other.a + this.e * other.d;
      const e = this.d * other.b + this.e * other.e;
      const f = this.d * other.c + this.e * other.f + this.f;

      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
      this.e = e;
      this.f = f;
    }

    transform(source: FloatPoint, destination: FloatPoint) {
      //       x
      //       y
      //       1
      // a b c
      // d e f
      // 0 0 1
      const x = this.a * source[0] + this.b * source[1] + this.c;
      const y = this.d * source[0] + this.e * source[1] + this.f;
      destination[0] = x;
      destination[1] = y;
    }

    invert() {
      const a = this.a;
      const b = this.b;
      const c = this.c;
      const d = this.d;
      const e = this.e;
      const f = this.f;

      const n = a * e - d * b;

      this.a = e / n;
      this.d = -d / n;
      this.b = -b / n;
      this.e = a / n;
      this.c = (b * f - e * c) / n;
      this.f = -(a * f - d * c) / n;

      return this;
    }

    copyFrom(other: AffineTransformation) {
      this.a = other.a;
      this.b = other.b;
      this.c = other.c;
      this.d = other.d;
      this.e = other.e;
      this.f = other.f;

      return this;
    }

    toString() {
      return `[[${this.a} ${this.b} ${this.c}] [${this.d} ${this.e} ${this.f}]]`;
    }
  }
}
