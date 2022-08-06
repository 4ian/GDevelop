/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export type CollisionTestResult = {
    collision: boolean;
    move_axis: FloatPoint;
  };

  export type RaycastTestResult = {
    collision: boolean;
    closeX: float;
    closeY: float;
    closeSqDist: float;
    farX: float;
    farY: float;
    farSqDist: float;
  };

  /** Build a new object to store collision test results. */
  const makeNewCollisionTestResult = (): CollisionTestResult => {
    return { collision: false, move_axis: [0, 0] };
  };

  /** Build a new object to store raycast test results. */
  const makeNewRaycastTestResult = (): RaycastTestResult => {
    return {
      collision: false,
      closeX: 0,
      closeY: 0,
      closeSqDist: 0,
      farX: 0,
      farY: 0,
      farSqDist: 0,
    };
  };

  /**
   * Arrays and data structure that are (re)used by Polygon.collisionTest to
   * avoid any allocation.
   */
  const collisionTestStatics: {
    minMaxA: FloatPoint;
    minMaxB: FloatPoint;
    edge: FloatPoint;
    axis: FloatPoint;
    move_axis: FloatPoint;
    result: CollisionTestResult;
  } = {
    minMaxA: [0, 0],
    minMaxB: [0, 0],
    edge: [0, 0],
    axis: [0, 0],
    move_axis: [0, 0],
    result: makeNewCollisionTestResult(),
  };

  /**
   * Arrays and data structure that are (re)used by Polygon.raycastTest to
   * avoid any allocation.
   */
  const raycastTestStatics: {
    p: FloatPoint;
    q: FloatPoint;
    r: FloatPoint;
    s: FloatPoint;
    deltaQP: FloatPoint;
    axis: FloatPoint;
    result: RaycastTestResult;
  } = {
    p: [0, 0],
    q: [0, 0],
    r: [0, 0],
    s: [0, 0],
    deltaQP: [0, 0],
    axis: [0, 0],
    result: makeNewRaycastTestResult(),
  };

  /**
   * Polygon represents a polygon which can be used to create collisions masks for RuntimeObject.
   */
  export class Polygon {
    /**
     * The vertices of the polygon
     */
    vertices: Array<FloatPoint> = [];

    /**
     * The edges of the polygon. This property is only valid after calling
     * computeEdges, and remains valid until vertices are modified.
     */
    edges: Array<FloatPoint> = [];

    /**
     * The center of the polygon. This property is only valid after calling
     * computeCenter, and remains valid until vertices are modified.
     */
    center: FloatPoint = [0, 0];

    move(x: float, y: float): void {
      for (let i = 0, len = this.vertices.length; i < len; ++i) {
        this.vertices[i][0] += x;
        this.vertices[i][1] += y;
      }
    }

    rotate(angle: float): void {
      let t: float = 0;

      //We want a clockwise rotation
      const cosa = Math.cos(-angle);
      const sina = Math.sin(-angle);
      for (let i = 0, len = this.vertices.length; i < len; ++i) {
        t = this.vertices[i][0];
        this.vertices[i][0] = t * cosa + this.vertices[i][1] * sina;
        this.vertices[i][1] = -t * sina + this.vertices[i][1] * cosa;
      }
    }

    computeEdges(): void {
      //Ensure edge array has the right size (and avoid recreating an edge array).
      while (this.edges.length < this.vertices.length) {
        this.edges.push([0, 0]);
      }
      if (this.edges.length != this.vertices.length) {
        this.edges.length = this.vertices.length;
      }
      for (let i = 0, len = this.vertices.length; i < len; ++i) {
        const v1 = this.vertices[i];
        const v2 = i + 1 >= len ? this.vertices[0] : this.vertices[i + 1];
        this.edges[i][0] = v2[0] - v1[0];
        this.edges[i][1] = v2[1] - v1[1];
      }
    }

    isConvex(): boolean {
      this.computeEdges();
      const edgesLen = this.edges.length;
      if (edgesLen < 3) {
        return false;
      }
      const zProductIsPositive =
        this.edges[0][0] * this.edges[0 + 1][1] -
          this.edges[0][1] * this.edges[0 + 1][0] >
        0;
      for (let i = 1; i < edgesLen - 1; ++i) {
        const zCrossProduct =
          this.edges[i][0] * this.edges[i + 1][1] -
          this.edges[i][1] * this.edges[i + 1][0];
        if (zCrossProduct > 0 !== zProductIsPositive) {
          return false;
        }
      }
      const lastZCrossProduct =
        this.edges[edgesLen - 1][0] * this.edges[0][1] -
        this.edges[edgesLen - 1][1] * this.edges[0][0];
      if (lastZCrossProduct > 0 !== zProductIsPositive) {
        return false;
      }
      return true;
    }

    computeCenter(): FloatPoint {
      this.center[0] = 0;
      this.center[1] = 0;
      const len = this.vertices.length;
      for (let i = 0; i < len; ++i) {
        this.center[0] += this.vertices[i][0];
        this.center[1] += this.vertices[i][1];
      }
      this.center[0] /= len;
      this.center[1] /= len;
      return this.center;
    }

    static createRectangle(width: float, height: float): gdjs.Polygon {
      const rect = new gdjs.Polygon();
      rect.vertices.push([-width / 2.0, -height / 2.0]);
      rect.vertices.push([+width / 2.0, -height / 2.0]);
      rect.vertices.push([+width / 2.0, +height / 2.0]);
      rect.vertices.push([-width / 2.0, +height / 2.0]);
      return rect;
    }

    /**
     * Do a collision test between two polygons.
     * Please note that polygons must *convexes*!
     *
     * You can read the result but do not keep a reference to it as it's a static object
     * reused between function calls. If you need to keep the results, use `copyCollisionTestResult`.
     *
     * Uses <a href="http://en.wikipedia.org/wiki/Hyperplane_separation_theorem">Separating Axis Theorem </a>.<br>
     * Based on <a href="http://www.codeproject.com/Articles/15573/2D-Polygon-Collision-Detection">this</a>
     * and <a href="http://stackoverflow.com/questions/5742329/problem-with-collision-response-sat">this</a> article.
     *
     * @return A collision result. `collision` property is equal to true if polygons are overlapping. Do NOT keep a reference to this.
     * @param p1 The first polygon
     * @param p2 The second polygon
     * @param ignoreTouchingEdges If true, then edges that are touching each other, without the polygons actually overlapping, won't be considered in collision.
     */
    static collisionTest(
      p1: gdjs.Polygon,
      p2: gdjs.Polygon,
      ignoreTouchingEdges: boolean
    ): CollisionTestResult {
      //Algorithm core :
      p1.computeEdges();
      p2.computeEdges();
      let edge = collisionTestStatics.edge;
      const move_axis = collisionTestStatics.move_axis;
      const result = collisionTestStatics.result;
      let minDist = Number.MAX_VALUE;
      edge[0] = 0;
      edge[1] = 0;
      edge[0] = 0;
      edge[1] = 0;
      result.collision = false;
      result.move_axis[0] = 0;
      result.move_axis[1] = 0;

      //Iterate over all the edges composing the polygons
      for (
        let i = 0, len1 = p1.vertices.length, len2 = p2.vertices.length;
        i < len1 + len2;
        i++
      ) {
        if (i < len1) {
          // or <=
          edge = p1.edges[i];
        } else {
          edge = p2.edges[i - len1];
        }
        const axis = collisionTestStatics.axis;

        //Get the axis to which polygons will be projected
        axis[0] = -edge[1];
        axis[1] = edge[0];
        Polygon.normalise(axis);
        const minMaxA = collisionTestStatics.minMaxA;
        const minMaxB = collisionTestStatics.minMaxB;
        Polygon.project(
          axis,
          p1,
          //Do projection on the axis.
          minMaxA
        );
        Polygon.project(axis, p2, minMaxB);

        //If the projections on the axis do not overlap, then their is no collision
        const dist = Polygon.distance(
          minMaxA[0],
          minMaxA[1],
          minMaxB[0],
          minMaxB[1]
        );
        if (dist > 0 || (dist === 0 && ignoreTouchingEdges)) {
          result.collision = false;
          result.move_axis[0] = 0;
          result.move_axis[1] = 0;
          return result;
        }
        const absDist = Math.abs(dist);
        if (absDist < minDist) {
          minDist = absDist;
          move_axis[0] = axis[0];
          move_axis[1] = axis[1];
        }
      }
      result.collision = true;

      //Ensure move axis is correctly oriented.
      const p1Center = p1.computeCenter();
      const p2Center = p2.computeCenter();
      const d: FloatPoint = [
        p1Center[0] - p2Center[0],
        p1Center[1] - p2Center[1],
      ];
      if (Polygon.dotProduct(d, move_axis) < 0) {
        move_axis[0] = -move_axis[0];
        move_axis[1] = -move_axis[1];
      }

      //Add the magnitude to the move axis.
      result.move_axis[0] = move_axis[0] * minDist;
      result.move_axis[1] = move_axis[1] * minDist;
      return result;
    }

    /**
     * Do a raycast test.
     * Please note that the polygon must be **convex**!
     *
     * You can read the result but do not keep a reference to it as it's a static object
     * reused between function calls. If you need to keep the results, use `copyRaycastTestResult`.
     *
     * For some theory, check <a href="https://www.codeproject.com/Tips/862988/Find-the-Intersection-Point-of-Two-Line-Segments">Find the Intersection Point of Two Line Segments</a>.
     *
     * @param poly The polygon to test
     * @param startX The raycast start point X
     * @param startY The raycast start point Y
     * @param endX The raycast end point X
     * @param endY The raycast end point Y
     * @return A raycast result with the contact points and distances. Do NOT keep a reference to this.
     */
    static raycastTest(
      poly: gdjs.Polygon,
      startX: float,
      startY: float,
      endX: float,
      endY: float
    ): RaycastTestResult {
      const result = raycastTestStatics.result;
      result.collision = false;
      if (poly.vertices.length < 2) {
        return result;
      }
      poly.computeEdges();
      const p = raycastTestStatics.p;
      const q = raycastTestStatics.q;
      const r = raycastTestStatics.r;
      const s = raycastTestStatics.s;
      let minSqDist = Number.MAX_VALUE;

      // Ray segment: p + t*r, with p = start and r = end - start
      p[0] = startX;
      p[1] = startY;
      r[0] = endX - startX;
      r[1] = endY - startY;
      for (let i = 0; i < poly.edges.length; i++) {
        // Edge segment: q + u*s
        q[0] = poly.vertices[i][0];
        q[1] = poly.vertices[i][1];
        s[0] = poly.edges[i][0];
        s[1] = poly.edges[i][1];
        const deltaQP = raycastTestStatics.deltaQP;
        deltaQP[0] = q[0] - p[0];
        deltaQP[1] = q[1] - p[1];
        const crossRS = Polygon.crossProduct(r, s);
        const t = Polygon.crossProduct(deltaQP, s) / crossRS;
        const u = Polygon.crossProduct(deltaQP, r) / crossRS;

        // Collinear
        // One point intersection
        if (
          Math.abs(crossRS) <= 0.0001 &&
          Math.abs(Polygon.crossProduct(deltaQP, r)) <= 0.0001
        ) {
          // Project the ray and the edge to work on floats, keeping linearity through t
          const axis = raycastTestStatics.axis;
          axis[0] = r[0];
          axis[1] = r[1];
          Polygon.normalise(axis);
          const rayA = 0;
          const rayB = Polygon.dotProduct(axis, r);
          const edgeA = Polygon.dotProduct(axis, deltaQP);
          const edgeB = Polygon.dotProduct(axis, [
            deltaQP[0] + s[0],
            deltaQP[1] + s[1],
          ]);

          // Get overlapping range
          const minOverlap = Math.max(
            Math.min(rayA, rayB),
            Math.min(edgeA, edgeB)
          );
          const maxOverlap = Math.min(
            Math.max(rayA, rayB),
            Math.max(edgeA, edgeB)
          );
          if (minOverlap > maxOverlap) {
            return result;
          }
          result.collision = true;

          // Zero distance ray
          if (rayB === 0) {
            result.closeX = startX;
            result.closeY = startY;
            result.closeSqDist = 0;
            result.farX = startX;
            result.farY = startY;
            result.farSqDist = 0;
          }
          const t1 = minOverlap / Math.abs(rayB);
          const t2 = maxOverlap / Math.abs(rayB);
          result.closeX = startX + t1 * r[0];
          result.closeY = startY + t1 * r[1];
          result.closeSqDist = t1 * t1 * (r[0] * r[0] + r[1] * r[1]);
          result.farX = startX + t2 * r[0];
          result.farY = startY + t2 * r[1];
          result.farSqDist = t2 * t2 * (r[0] * r[0] + r[1] * r[1]);
          return result;
        } else {
          if (crossRS !== 0 && 0 <= t && t <= 1 && 0 <= u && u <= 1) {
            const x = p[0] + t * r[0];
            const y = p[1] + t * r[1];
            const sqDist =
              (x - startX) * (x - startX) + (y - startY) * (y - startY);
            if (sqDist < minSqDist) {
              if (!result.collision) {
                result.farX = x;
                result.farY = y;
                result.farSqDist = sqDist;
              }
              minSqDist = sqDist;
              result.closeX = x;
              result.closeY = y;
              result.closeSqDist = sqDist;
              result.collision = true;
            } else {
              result.farX = x;
              result.farY = y;
              result.farSqDist = sqDist;
            }
          }
        }
      }
      return result;
    }

    //Tools functions :
    static normalise(v: FloatPoint): void {
      const len = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
      if (len != 0) {
        v[0] /= len;
        v[1] /= len;
      }
    }

    static dotProduct(a: FloatPoint, b: FloatPoint): float {
      const dp = a[0] * b[0] + a[1] * b[1];
      return dp;
    }

    static crossProduct(a: FloatPoint, b: FloatPoint): float {
      const cp = a[0] * b[1] - a[1] * b[0];
      return cp;
    }

    static project(
      axis: FloatPoint,
      p: gdjs.Polygon,
      result: FloatPoint
    ): void {
      let dp = Polygon.dotProduct(axis, p.vertices[0]);
      result[0] = dp;
      result[1] = dp;
      for (let i = 1, len = p.vertices.length; i < len; ++i) {
        dp = Polygon.dotProduct(axis, p.vertices[i]);
        if (dp < result[0]) {
          result[0] = dp;
        } else {
          if (dp > result[1]) {
            result[1] = dp;
          }
        }
      }
    }

    static distance(minA: float, maxA: float, minB: float, maxB: float): float {
      if (minA < minB) {
        return minB - maxA;
      } else {
        return minA - maxB;
      }
    }

    /**
     * Check if a point is inside a polygon.
     *
     * Uses <a href="https://wrf.ecse.rpi.edu//Research/Short_Notes/pnpoly.html">PNPOLY</a> by W. Randolph Franklin.
     *
     * @param poly The polygon to test
     * @param x The point x coordinate
     * @param y The point y coordinate
     * @return true if the point is inside the polygon
     */
    static isPointInside(poly: gdjs.Polygon, x: float, y: float): boolean {
      let inside = false;
      for (
        let i = 0, j = poly.vertices.length - 1;
        i < poly.vertices.length;
        j = i++
      ) {
        let vi = poly.vertices[i];
        let vj = poly.vertices[j];
        if (
          vi[1] > y != vj[1] > y &&
          x < ((vj[0] - vi[0]) * (y - vi[1])) / (vj[1] - vi[1]) + vi[0]
        ) {
          inside = !inside;
        }
      }
      return inside;
    }

    /**
     * Copy a `CollisionTestResult` into another one.
     * Use `gdjs.Polygon.makeNewCollisionTestResult()` to build a new
     * destination before copying the existing source inside it.
     */
    static copyCollisionTestResult(
      source: CollisionTestResult,
      dest: CollisionTestResult
    ) {
      dest.collision = source.collision;
      dest.move_axis[0] = source.move_axis[0];
      dest.move_axis[1] = source.move_axis[1];
    }

    static makeNewCollisionTestResult = makeNewCollisionTestResult;

    /**
     * Copy a `RaycastTestResult` into another one.
     * Use `gdjs.Polygon.makeNewRaycastTestResult()` to build a new
     * destination before copying the existing source inside it.
     */
    static copyRaycastTestResult(
      source: RaycastTestResult,
      dest: RaycastTestResult
    ) {
      dest.collision = source.collision;
      dest.closeX = source.closeX;
      dest.closeY = source.closeY;
      dest.closeSqDist = source.closeSqDist;
      dest.farX = source.farX;
      dest.farY = source.farY;
      dest.farSqDist = source.farSqDist;
    }

    static makeNewRaycastTestResult = makeNewRaycastTestResult;
  }
}
