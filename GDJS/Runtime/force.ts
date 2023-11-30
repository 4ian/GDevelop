/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * A vector used to move objects.
   */
  export class Force {
    _x: float;
    _y: float;
    _angle: float;
    _length: float;
    _dirty: boolean = false;
    _multiplier: integer;

    /**
     * @param x The initial x component
     * @param y The initial y component
     * @param multiplier The multiplier (0 for a force that disappear on next frame, 1 for a permanent force)
     */
    constructor(x: float, y: float, multiplier: integer) {
      this._x = x || 0;
      this._y = y || 0;
      this._angle = (Math.atan2(y, x) * 180) / Math.PI;
      this._length = Math.sqrt(x * x + y * y);
      this._multiplier = multiplier;
    }

    /**
     * Returns the X component of the force.
     */
    getX(): float {
      return this._x;
    }

    /**
     * Returns the Y component of the force.
     */
    getY(): float {
      return this._y;
    }

    /**
     * Set the x component of the force.
     * @param x The new X component
     */
    setX(x: float): void {
      this._x = x;
      this._dirty = true;
    }

    /**
     * Set the y component of the force.
     * @param y The new Y component
     */
    setY(y: float): void {
      this._y = y;
      this._dirty = true;
    }

    clear() {
      this._x = 0;
      this._y = 0;
      this._length = 0;
      this._dirty = false;
    }

    addForce(force: Force) {
      this._x += force._x;
      this._y += force._y;
      this._dirty = true;
    }

    add(x: float, y: float) {
      this._x += x;
      this._y += y;
      this._dirty = true;
    }

    /**
     * Set the angle of the force.
     * @param angle The new angle
     */
    setAngle(angle: float): void {
      if (this._dirty) {
        this._length = Math.sqrt(this._x * this._x + this._y * this._y);
        this._dirty = false;
      }
      this._angle = angle;
      const angleInRadians = (angle / 180) * Math.PI;
      this._x = Math.cos(angleInRadians) * this._length;
      this._y = Math.sin(angleInRadians) * this._length;
    }

    /**
     * Set the length of the force.
     * @param len The length
     */
    setLength(len: number): void {
      if (this._dirty) {
        this._angle = (Math.atan2(this._y, this._x) * 180) / Math.PI;
        this._dirty = false;
      }
      this._length = len;
      const angleInRadians = (this._angle / 180) * Math.PI;
      this._x = Math.cos(angleInRadians) * this._length;
      this._y = Math.sin(angleInRadians) * this._length;
    }

    /**
     * Get the angle of the force
     */
    getAngle(): float {
      if (this._dirty) {
        this._angle = (Math.atan2(this._y, this._x) * 180) / Math.PI;
        this._length = Math.sqrt(this._x * this._x + this._y * this._y);
        this._dirty = false;
      }
      return this._angle;
    }

    /**
     * Get the length of the force
     */
    getLength(): float {
      if (this._dirty) {
        this._angle = (Math.atan2(this._y, this._x) * 180) / Math.PI;
        this._length = Math.sqrt(this._x * this._x + this._y * this._y);
        this._dirty = false;
      }
      return this._length;
    }

    /**
     * Return 1 (true) if the force is permanent, 0 (false) if it is instant.
     */
    getMultiplier(): integer {
      return this._multiplier;
    }

    /**
     * Set if the force multiplier.
     * @param multiplier The new value
     */
    setMultiplier(multiplier: integer): void {
      this._multiplier = multiplier;
    }
  }
}
