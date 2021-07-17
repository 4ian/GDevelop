// MIT License

// Copyright (c) 2017 Michael Hadley

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

namespace gdjs {
  export interface Point {
    x: number;
    y: number;
  }

  /** Lightweight representation of a Polygon2 as a series of points. */
  export type PolyPoints = Point[];

  type PointLike = Vector2 | Point;

  /**
   * Stripped down version of Phaser's Vector2 with just the functionality needed for navmeshes.
   *
   * @export
   * @class Vector2
   */
  export class Vector2 {
    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
      this.x = x;
      this.y = y;
    }

    public equals(v: PointLike) {
      return this.x === v.x && this.y === v.y;
    }

    public angle(v: PointLike) {
      return Math.atan2(v.y - this.y, v.x - this.x);
    }

    public distance(v: PointLike) {
      const dx = v.x - this.x;
      const dy = v.y - this.y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    public add(v: PointLike) {
      this.x += v.x;
      this.y += v.y;
    }

    public subtract(v: PointLike) {
      this.x -= v.x;
      this.y -= v.y;
    }

    public clone() {
      return new Vector2(this.x, this.y);
    }
  }

  /**
   * Stripped down version of Phaser's Line with just the functionality needed for navmeshes.
   *
   * @export
   * @class Line
   */
  export class Line {
    public start: Vector2;
    public end: Vector2;
    public left: number;
    public right: number;
    public top: number;
    public bottom: number;

    constructor(x1: number, y1: number, x2: number, y2: number) {
      this.start = new Vector2(x1, y1);
      this.end = new Vector2(x2, y2);

      this.left = Math.min(x1, x2);
      this.right = Math.max(x1, x2);
      this.top = Math.min(y1, y2);
      this.bottom = Math.max(y1, y2);
    }

    public pointOnSegment(x: number, y: number) {
      return (
        x >= this.left &&
        x <= this.right &&
        y >= this.top &&
        y <= this.bottom &&
        this.pointOnLine(x, y)
      );
    }

    pointOnLine(x: number, y: number) {
      // Compare slope of line start -> xy to line start -> line end
      return (
        (x - this.left) * (this.bottom - this.top) ===
        (this.right - this.left) * (y - this.top)
      );
    }
  }

  /**
   * Stripped down version of Phaser's Polygon2 with just the functionality needed for navmeshes.
   *
   * @export
   * @class Polygon2
   */
  export class Polygon2 {
    public edges: Line[];
    public points: Point[];
    private isClosed: boolean;

    constructor(points: Point[], closed = true) {
      this.isClosed = closed;
      this.points = points;
      this.edges = [];

      for (let i = 1; i < points.length; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];
        this.edges.push(new Line(p1.x, p1.y, p2.x, p2.y));
      }

      if (this.isClosed) {
        const first = points[0];
        const last = points[points.length - 1];
        this.edges.push(new Line(first.x, first.y, last.x, last.y));
      }
    }

    public contains(x: number, y: number) {
      let inside = false;

      for (
        let i = -1, j = this.points.length - 1;
        ++i < this.points.length;
        j = i
      ) {
        const ix = this.points[i].x;
        const iy = this.points[i].y;

        const jx = this.points[j].x;
        const jy = this.points[j].y;

        if (
          ((iy <= y && y < jy) || (jy <= y && y < iy)) &&
          x < ((jx - ix) * (y - iy)) / (jy - iy) + ix
        ) {
          inside = !inside;
        }
      }

      return inside;
    }
  }

  /**
   * Calculate the distance squared between two points. This is an optimization to a square root when
   * you just need to compare relative distances without needing to know the specific distance.
   * @param a
   * @param b
   */
  export function distanceSquared(a: Point, b: Point) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return dx * dx + dy * dy;
  }

  /**
   * Project a point onto a line segment.
   * JS Source: http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
   * @param point
   * @param line
   */
  export function projectPointToEdge(point: Point, line: Line) {
    const a = line.start;
    const b = line.end;
    // Consider the parametric equation for the edge's line, p = a + t (b - a). We want to find
    // where our point lies on the line by solving for t:
    //  t = [(p-a) . (b-a)] / |b-a|^2
    const l2 = distanceSquared(a, b);
    let t =
      ((point.x - a.x) * (b.x - a.x) + (point.y - a.y) * (b.y - a.y)) / l2;
    // We clamp t from [0,1] to handle points outside the segment vw.
    t = clamp(t, 0, 1);
    // Project onto the segment
    const p = new Vector2(a.x + t * (b.x - a.x), a.y + t * (b.y - a.y));
    return p;
  }

  /**
   * Twice the area of the triangle formed by a, b and c.
   */
  export function triarea2(a: Point, b: Point, c: Point) {
    const ax = b.x - a.x;
    const ay = b.y - a.y;
    const bx = c.x - a.x;
    const by = c.y - a.y;
    return bx * ay - ax * by;
  }

  /**
   * Clamp the given value between min and max.
   */
  export function clamp(value: number, min: number, max: number) {
    if (value < min) value = min;
    if (value > max) value = max;
    return value;
  }

  /**
   * Check if two values are within a small margin of one another.
   */
  export function almostEqual(
    value1: number,
    value2: number,
    errorMargin = 0.0001
  ) {
    if (Math.abs(value1 - value2) <= errorMargin) return true;
    else return false;
  }

  /**
   * Find the smallest angle difference between two angles
   * https://gist.github.com/Aaronduino/4068b058f8dbc34b4d3a9eedc8b2cbe0
   */
  export function angleDifference(x: number, y: number) {
    let a = x - y;
    const i = a + Math.PI;
    const j = Math.PI * 2;
    a = i - Math.floor(i / j) * j; // (a+180) % 360; this ensures the correct sign
    a -= Math.PI;
    return a;
  }

  /**
   * Check if two lines are collinear (within a small error margin).
   */
  export function areCollinear(line1: Line, line2: Line, errorMargin = 0.0001) {
    // Figure out if the two lines are equal by looking at the area of the triangle formed
    // by their points
    const area1 = triarea2(line1.start, line1.end, line2.start);
    const area2 = triarea2(line1.start, line1.end, line2.end);
    if (
      almostEqual(area1, 0, errorMargin) &&
      almostEqual(area2, 0, errorMargin)
    ) {
      return true;
    } else return false;
  }

  export function isTruthy<InputType>(input: InputType) {
    return Boolean(input);
  }

  export class AStar<NodeType extends GridNode> {
    /**
     * Perform an A* Search on a graph given a start and end node.
     * @param {ASGraph} graph
     * @param {GridNode} start
     * @param {GridNode} end
     * @param {Object} [options]
     * @param {bool} [options.closest] Specifies whether to return the
     path to the closest node if the target is unreachable.
     * @param {Function} [options.heuristic] Heuristic function (see
     *          astar.heuristics).
     */
    search(
      graph: ASGraph<NodeType>,
      start: NodeType,
      end: NodeType,
      // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
      heuristic: (pos0: NodeType, pos1: NodeType) => number,
      closest: boolean = false
    ): Array<NodeType> {
      graph.cleanDirty();
      var heuristic = heuristic;

      var openHeap = this.getHeap();
      var closestNode = start; // set the start node to be the closest if required

      start.h = heuristic(start, end);
      graph.markDirty(start);

      openHeap.push(start);

      while (openHeap.size() > 0) {
        // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
        var currentNode = openHeap.pop();
        // never happen
        if (!currentNode) return [];

        // End case -- result has been found, return the traced path.
        if (currentNode === end) {
          return this.pathTo(currentNode);
        }

        // Normal case -- move currentNode from open to closed, process each of its neighbors.
        currentNode.closed = true;

        // Find all neighbors for the current node.
        var neighbors = graph.neighbors(currentNode);

        for (var i = 0, il = neighbors.length; i < il; ++i) {
          var neighbor = neighbors[i];

          if (neighbor.closed || neighbor.isWall()) {
            // Not a valid node to process, skip to next neighbor.
            continue;
          }

          // The g score is the shortest distance from start to current node.
          // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
          var gScore = currentNode.g + neighbor.getCost(currentNode);
          var beenVisited = neighbor.visited;

          if (!beenVisited || gScore < neighbor.g) {
            // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
            neighbor.visited = true;
            neighbor.parent = currentNode;
            neighbor.h = neighbor.h || heuristic(neighbor, end);
            neighbor.g = gScore;
            neighbor.f = neighbor.g + neighbor.h;
            graph.markDirty(neighbor);
            if (closest) {
              // If the neighbour is closer than the current closestNode or if it's equally close but has
              // a cheaper path than the current closest node then it becomes the closest node
              if (
                neighbor.h < closestNode.h ||
                (neighbor.h === closestNode.h && neighbor.g < closestNode.g)
              ) {
                closestNode = neighbor;
              }
            }

            if (!beenVisited) {
              // Pushing to heap will put it in proper place based on the 'f' value.
              openHeap.push(neighbor);
            } else {
              // Already seen the node, but since it has been rescored we need to reorder it in the heap
              openHeap.rescoreElement(neighbor);
            }
          }
        }
      }

      if (closest) {
        return this.pathTo(closestNode);
      }

      // No result was found - empty array signifies failure to find path.
      return [];
    }

    private pathTo(node: NodeType): NodeType[] {
      var curr = node;
      var path = new Array<NodeType>();
      while (curr.parent) {
        path.unshift(curr);
        curr = curr.parent as NodeType;
      }
      return path;
    }

    private getHeap(): BinaryHeap<NodeType> {
      return new BinaryHeap(function (node) {
        return node.f;
      });
    }
  }

  export abstract class GridNode {
    weight: number;
    h: number = 0;
    g: number = 0;
    f: number = 0;
    closed: boolean = false;
    visited: boolean = false;
    parent: GridNode | null = null;

    constructor(weight: number) {
      this.weight = weight;
    }

    abstract getCost(fromNeighbor: GridNode): number;

    isWall(): boolean {
      return this.weight === 0;
    }

    clean() {
      this.f = 0;
      this.g = 0;
      this.h = 0;
      this.visited = false;
      this.closed = false;
      this.parent = null;
    }
  }

  class BinaryHeap<E> {
    content: Array<E>;
    scoreFunction: (element: E) => number;

    constructor(scoreFunction: (element: E) => number) {
      this.content = new Array<E>();
      this.scoreFunction = scoreFunction;
    }

    push(element: E) {
      // Add the new element to the end of the array.
      this.content.push(element);

      // Allow it to sink down.
      this.sinkDown(this.content.length - 1);
    }

    pop(): E | undefined {
      // Store the first element so we can return it later.
      var result = this.content[0];
      // Get the element at the end of the array.
      var end = this.content.pop();
      if (!end) return;
      // If there are any elements left, put the end element at the
      // start, and let it bubble up.
      if (this.content.length > 0) {
        this.content[0] = end;
        this.bubbleUp(0);
      }
      return result;
    }

    remove(node: E) {
      var i = this.content.indexOf(node);

      // When it is found, the process seen in 'pop' is repeated
      // to fill up the hole.
      var end = this.content.pop();
      if (!end) return;

      if (i !== this.content.length - 1) {
        this.content[i] = end;

        if (this.scoreFunction(end) < this.scoreFunction(node)) {
          this.sinkDown(i);
        } else {
          this.bubbleUp(i);
        }
      }
    }

    size() {
      return this.content.length;
    }

    rescoreElement(node: E) {
      this.sinkDown(this.content.indexOf(node));
    }

    sinkDown(n: number) {
      // Fetch the element that has to be sunk.
      var element = this.content[n];

      // When at 0, an element can not sink any further.
      while (n > 0) {
        // Compute the parent element's index, and fetch it.
        var parentN = ((n + 1) >> 1) - 1;
        var parent = this.content[parentN];
        // Swap the elements if the parent is greater.
        if (this.scoreFunction(element) < this.scoreFunction(parent)) {
          this.content[parentN] = element;
          this.content[n] = parent;
          // Update 'n' to continue at the new position.
          n = parentN;
        }
        // Found a parent that is less, no need to sink any further.
        else {
          break;
        }
      }
    }

    bubbleUp(n: number) {
      // Look up the target element and its score.
      var length = this.content.length;
      var element = this.content[n];
      var elemScore = this.scoreFunction(element);

      while (true) {
        // Compute the indices of the child elements.
        var child2N = (n + 1) << 1;
        var child1N = child2N - 1;
        // This is used to store the new position of the element, if any.
        var swap: number | null = null;
        var child1Score;
        // If the first child exists (is inside the array)...
        if (child1N < length) {
          // Look it up and compute its score.
          var child1 = this.content[child1N];
          child1Score = this.scoreFunction(child1);

          // If the score is less than our element's, we need to swap.
          if (child1Score < elemScore) {
            swap = child1N;
          }
        }

        // Do the same checks for the other child.
        if (child2N < length) {
          var child2 = this.content[child2N];
          var child2Score = this.scoreFunction(child2);
          if (child2Score < (swap === null ? elemScore : child1Score)) {
            swap = child2N;
          }
        }

        // If the element needs to be moved, swap it, and continue.
        if (swap !== null) {
          this.content[n] = this.content[swap];
          this.content[swap] = element;
          n = swap;
        }
        // Otherwise, we are done.
        else {
          break;
        }
      }
    }
  }

  /**
   * A graph memory structure
   */
  export abstract class ASGraph<NodeType extends GridNode> {
    nodes: Array<NodeType>;
    dirtyNodes: Array<NodeType> = [];
    diagonal: boolean;

    /**
     * A graph memory structure
     * @param {Array} gridIn 2D array of input weights
     * @param {Object} [options]
     * @param {bool} [options.diagonal] Specifies whether diagonal moves are allowed
     */
    constructor(nodes: Array<NodeType>, options?: { diagonal?: boolean }) {
      options = options || {};
      this.nodes = nodes;
      this.diagonal = !!options.diagonal;
      this.init();
    }

    init() {
      this.dirtyNodes = [];
      for (var i = 0; i < this.nodes.length; i++) {
        this.nodes[i].clean();
      }
    }

    cleanDirty() {
      for (var i = 0; i < this.dirtyNodes.length; i++) {
        this.dirtyNodes[i].clean();
      }
      this.dirtyNodes = [];
    }

    markDirty(node) {
      this.dirtyNodes.push(node);
    }

    abstract neighbors(node: NodeType): NodeType[];
  }

  /**
   * A class that represents a navigable polygon with a navmesh. It is built on top of a
   * {@link Polygon2}. It implements the properties and fields that javascript-astar needs - weight,
   * toString, isWall and getCost. See GPS test from astar repo for structure:
   * https://github.com/bgrins/javascript-astar/blob/master/test/tests.js
   */
  export class NavPoly extends GridNode {
    public id: number;
    public polygon: Polygon2;
    public edges: Line[];
    public neighbors: NavPoly[];
    public portals: Line[];
    public centroid: Vector2;
    public boundingRadius: number;

    /**
     * Creates an instance of NavPoly.
     */
    constructor(id: number, polygon: Polygon2) {
      super(1);
      this.id = id;
      this.polygon = polygon;
      this.edges = polygon.edges;
      this.neighbors = [];
      this.portals = [];
      this.centroid = this.calculateCentroid();
      this.boundingRadius = this.calculateRadius();
    }

    /**
     * Returns an array of points that form the polygon.
     */
    public getPoints() {
      return this.polygon.points;
    }

    /**
     * Check if the given point-like object is within the polygon.
     */
    public contains(point: Point) {
      // Phaser's polygon check doesn't handle when a point is on one of the edges of the line. Note:
      // check numerical stability here. It would also be good to optimize this for different shapes.
      return (
        this.polygon.contains(point.x, point.y) || this.isPointOnEdge(point)
      );
    }

    /**
     * Only rectangles are supported, so this calculation works, but this is not actually the centroid
     * calculation for a polygon. This is just the average of the vertices - proper centroid of a
     * polygon factors in the area.
     */
    public calculateCentroid() {
      const centroid = new Vector2(0, 0);
      const length = this.polygon.points.length;
      this.polygon.points.forEach((p) => centroid.add(p));
      centroid.x /= length;
      centroid.y /= length;
      return centroid;
    }

    /**
     * Calculate the radius of a circle that circumscribes the polygon.
     */
    public calculateRadius() {
      let boundingRadius = 0;
      for (const point of this.polygon.points) {
        const d = this.centroid.distance(point);
        if (d > boundingRadius) boundingRadius = d;
      }
      return boundingRadius;
    }

    /**
     * Check if the given point-like object is on one of the edges of the polygon.
     */
    public isPointOnEdge({ x, y }: Point) {
      for (const edge of this.edges) {
        if (edge.pointOnSegment(x, y)) return true;
      }
      return false;
    }

    public destroy() {
      this.neighbors = [];
      this.portals = [];
    }

    // === jsastar methods ===

    public toString() {
      return `NavPoly(id: ${this.id} at: ${this.centroid})`;
    }

    public isWall() {
      return this.weight === 0;
    }

    public centroidDistance(navPolygon: NavPoly) {
      return this.centroid.distance(navPolygon.centroid);
    }

    public getCost(navPolygon: GridNode) {
      //TODO the cost method should not be in the Node
      return this.centroidDistance(navPolygon as NavPoly);
    }
  }

  /**
   * Graph for javascript-astar. It implements the functionality for astar. See GPS test from astar
   * repo for structure: https://github.com/bgrins/javascript-astar/blob/master/test/tests.js
   *
   * @class NavGraph
   * @private
   */
  export class NavGraph extends ASGraph<NavPoly> {
    constructor(navPolygons: NavPoly[]) {
      super(navPolygons);
      this.nodes = navPolygons;
      this.init();
    }

    neighbors(navPolygon: NavPoly) {
      return navPolygon.neighbors;
    }

    navHeuristic(navPolygon1: NavPoly, navPolygon2: NavPoly) {
      return navPolygon1.centroidDistance(navPolygon2);
    }

    destroy() {
      this.cleanDirty();
      this.nodes = [];
    }

    // public init = ASGraph.prototype.init.bind(this);
    // public cleanDirty = ASGraph.prototype.cleanDirty.bind(this);
    // public markDirty = ASGraph.prototype.markDirty.bind(this);
    // public toString = ASGraph.prototype.toString.bind(this);
  }

  export interface Portal {
    left: Vector2;
    right: Vector2;
  }

  /**
   * @private
   */
  export class Channel {
    public path: Vector2[];
    private portals: Portal[];

    constructor() {
      this.portals = [];
      this.path = [];
    }

    push(p1: Vector2, p2?: Vector2) {
      if (p2 === undefined) p2 = p1;
      this.portals.push({
        left: p1,
        right: p2,
      });
    }

    stringPull() {
      const portals = this.portals;
      const pts: Vector2[] = [];
      // Init scan state
      let apexIndex = 0;
      let leftIndex = 0;
      let rightIndex = 0;
      let portalApex = portals[0].left;
      let portalLeft = portals[0].left;
      let portalRight = portals[0].right;

      // Add start point.
      pts.push(portalApex);

      for (var i = 1; i < portals.length; i++) {
        // Find the next portal vertices
        const left = portals[i].left;
        const right = portals[i].right;

        // Update right vertex.
        if (triarea2(portalApex, portalRight, right) <= 0.0) {
          if (
            portalApex.equals(portalRight) ||
            triarea2(portalApex, portalLeft, right) > 0.0
          ) {
            // Tighten the funnel.
            portalRight = right;
            rightIndex = i;
          } else {
            // Right vertex just crossed over the left vertex, so the left vertex should
            // now be part of the path.
            pts.push(portalLeft);

            // Restart scan from portal left point.

            // Make current left the new apex.
            portalApex = portalLeft;
            apexIndex = leftIndex;
            // Reset portal
            portalLeft = portalApex;
            portalRight = portalApex;
            leftIndex = apexIndex;
            rightIndex = apexIndex;
            // Restart scan
            i = apexIndex;
            continue;
          }
        }

        // Update left vertex.
        if (triarea2(portalApex, portalLeft, left) >= 0.0) {
          if (
            portalApex.equals(portalLeft) ||
            triarea2(portalApex, portalRight, left) < 0.0
          ) {
            // Tighten the funnel.
            portalLeft = left;
            leftIndex = i;
          } else {
            // Left vertex just crossed over the right vertex, so the right vertex should
            // now be part of the path
            pts.push(portalRight);

            // Restart scan from portal right point.

            // Make current right the new apex.
            portalApex = portalRight;
            apexIndex = rightIndex;
            // Reset portal
            portalLeft = portalApex;
            portalRight = portalApex;
            leftIndex = apexIndex;
            rightIndex = apexIndex;
            // Restart scan
            i = apexIndex;
            continue;
          }
        }
      }

      if (
        pts.length === 0 ||
        !pts[pts.length - 1].equals(portals[portals.length - 1].left)
      ) {
        // Append last point to path.
        pts.push(portals[portals.length - 1].left);
      }

      this.path = pts;
      return pts;
    }
  }

  /**
   * The `NavMesh` class is the workhorse that represents a navigation mesh built from a series of
   * polygons. Once built, the mesh can be asked for a path from one point to another point. Some
   * internal terminology usage:
   * - neighbor: a polygon that shares part of an edge with another polygon
   * - portal: when two neighbor's have edges that overlap, the portal is the overlapping line segment
   * - channel: the path of polygons from starting point to end point
   * - pull the string: run the funnel algorithm on the channel so that the path hugs the edges of the
   *   channel. Equivalent to having a string snaking through a hallway and then pulling it taut.
   */
  export class NavMesh {
    private meshShrinkAmount: number;
    private navPolygons: NavPoly[];
    private graph: NavGraph;

    /**
     * @param meshPolygonPoints Array where each element is an array of point-like objects that
     * defines a polygon.
     * @param meshShrinkAmount The amount (in pixels) that the navmesh has been shrunk around
     * obstacles (a.k.a the amount obstacles have been expanded).
     */
    public constructor(meshPolygonPoints: PolyPoints[], meshShrinkAmount = 0) {
      this.meshShrinkAmount = meshShrinkAmount;

      // Convert the PolyPoints[] into NavPoly instances.
      this.navPolygons = meshPolygonPoints.map((polyPoints, i) => new NavPoly(i, new Polygon2(polyPoints)));

      this.calculateNeighbors();

      // Astar graph of connections between polygons
      this.graph = new NavGraph(this.navPolygons);
    }

    /**
     * Get the NavPolys that are in this navmesh.
     */
    public getPolygons() {
      return this.navPolygons;
    }

    /**
     * Cleanup method to remove references.
     */
    public destroy() {
      this.graph.destroy();
      for (const poly of this.navPolygons) poly.destroy();
      this.navPolygons = [];
    }

    /**
     * Find if the given point is within any of the polygons in the mesh.
     * @param point
     */
    public isPointInMesh(point: Point) {
      return this.navPolygons.some((navPoly) => navPoly.contains(point));
    }

    /**
     * Find the closest point in the mesh to the given point. If the point is already in the mesh,
     * this will give you that point. If the point is outside of the mesh, this will attempt to
     * project this point into the mesh (up to the given maxAllowableDist). This returns an object
     * with:
     * - distance - from the given point to the mesh
     * - polygon - the one the point is closest to, or null
     * - point - the point inside the mesh, or null
     * @param point
     * @param maxAllowableDist
     */
    public findClosestMeshPoint(
      point: Vector2,
      maxAllowableDist: number = Number.POSITIVE_INFINITY
    ) {
      let minDistance = maxAllowableDist;
      let closestPoly: NavPoly | null = null;
      let pointOnClosestPoly: Point | null = null;
      for (const navPoly of this.navPolygons) {
        // If we are inside a poly, we've got the closest.
        if (navPoly.contains(point)) {
          minDistance = 0;
          closestPoly = navPoly;
          pointOnClosestPoly = point;
          break;
        }
        // Is the poly close enough to warrant a more accurate check? Point is definitely outside of
        // the polygon. Distance - Radius is the smallest possible distance to an edge of the poly.
        // This will underestimate distance, but that's perfectly fine.
        const r = navPoly.boundingRadius;
        const d = navPoly.centroid.distance(point);
        if (d - r < minDistance) {
          const result = this.projectPointToPolygon(point, navPoly);
          if (result.distance < minDistance) {
            minDistance = result.distance;
            closestPoly = navPoly;
            pointOnClosestPoly = result.point;
          }
        }
      }
      return {
        distance: minDistance,
        polygon: closestPoly,
        point: pointOnClosestPoly,
      };
    }

    /**
     * Find a path from the start point to the end point using this nav mesh.
     * @param {object} startPoint A point-like object in the form {x, y}
     * @param {object} endPoint A point-like object in the form {x, y}
     * @returns An array of points if a path is found, or null if no path
     */
    public findPath(startPoint: Point, endPoint: Point): Vector2[] | null {
      let startPoly: NavPoly | null = null;
      let endPoly: NavPoly | null = null;
      let startDistance = Number.MAX_VALUE;
      let endDistance = Number.MAX_VALUE;
      let d, r;
      const startVector = new Vector2(startPoint.x, startPoint.y);
      const endVector = new Vector2(endPoint.x, endPoint.y);

      // Find the closest poly for the starting and ending point
      for (const navPoly of this.navPolygons) {
        r = navPoly.boundingRadius;
        // Start
        d = navPoly.centroid.distance(startVector);
        if (d <= startDistance && d <= r && navPoly.contains(startVector)) {
          startPoly = navPoly;
          startDistance = d;
        }
        // End
        d = navPoly.centroid.distance(endVector);
        if (d <= endDistance && d <= r && navPoly.contains(endVector)) {
          endPoly = navPoly;
          endDistance = d;
        }
      }

      // If the end point wasn't inside a polygon, run a more liberal check that allows a point
      // to be within meshShrinkAmount radius of a polygon
      if (!endPoly && this.meshShrinkAmount > 0) {
        for (const navPoly of this.navPolygons) {
          r = navPoly.boundingRadius + this.meshShrinkAmount;
          d = navPoly.centroid.distance(endVector);
          if (d <= r) {
            const { distance } = this.projectPointToPolygon(endVector, navPoly);
            if (distance <= this.meshShrinkAmount && distance < endDistance) {
              endPoly = navPoly;
              endDistance = distance;
            }
          }
        }
      }

      // No matching polygons locations for the end, so no path found
      // because start point is valid normally, check end point first
      if (!endPoly) {
        console.log(
          'No matching polygons locations for the end, so no path found'
        );
        return null;
      }

      // Same check as above, but for the start point
      if (!startPoly && this.meshShrinkAmount > 0) {
        for (const navPoly of this.navPolygons) {
          // Check if point is within bounding circle to avoid extra projection calculations
          r = navPoly.boundingRadius + this.meshShrinkAmount;
          d = navPoly.centroid.distance(startVector);
          if (d <= r) {
            // Check if projected point is within range of a polygon and is closer than the
            // previous point
            const { distance } = this.projectPointToPolygon(
              startVector,
              navPoly
            );
            if (distance <= this.meshShrinkAmount && distance < startDistance) {
              startPoly = navPoly;
              startDistance = distance;
            }
          }
        }
      }

      // No matching polygons locations for the start, so no path found
      if (!startPoly) {
        console.log(
          'No matching polygons locations for the start, so no path found'
        );
        return null;
      }

      // If the start and end polygons are the same, return a direct path
      if (startPoly === endPoly) return [startVector, endVector];

      // Search!
      const astarPath = new AStar<NavPoly>().search(
        this.graph,
        startPoly,
        endPoly,
        this.graph.navHeuristic
      );

      // While the start and end polygons may be valid, no path between them
      if (astarPath.length === 0) return null;

      // jsastar drops the first point from the path, but the funnel algorithm needs it
      astarPath.unshift(startPoly);

      // We have a path, so now time for the funnel algorithm
      const channel = new Channel();
      channel.push(startVector);
      for (let i = 0; i < astarPath.length - 1; i++) {
        const navPolygon = astarPath[i];
        const nextNavPolygon = astarPath[i + 1];

        // Find the portal
        let portal: Line | null = null;
        for (let i = 0; i < navPolygon.neighbors.length; i++) {
          if (navPolygon.neighbors[i].id === nextNavPolygon.id) {
            portal = navPolygon.portals[i];
          }
        }
        if (!portal)
          throw new Error(
            'Path was supposed to be found, but portal is missing!'
          );

        // Push the portal vertices into the channel
        channel.push(portal.start, portal.end);
      }
      channel.push(endVector);

      // Pull a string along the channel to run the funnel
      channel.stringPull();

      // Clone path, excluding duplicates
      let lastPoint: Vector2 | null = null;
      const phaserPath = new Array<Vector2>();
      for (const p of channel.path) {
        const newPoint = p.clone();
        if (!lastPoint || !newPoint.equals(lastPoint))
          phaserPath.push(newPoint);
        lastPoint = newPoint;
      }

      return phaserPath;
    }

    private calculateNeighbors() {
      // Fill out the neighbor information for each navpoly
      for (let i = 0; i < this.navPolygons.length; i++) {
        const navPoly = this.navPolygons[i];

        for (let j = i + 1; j < this.navPolygons.length; j++) {
          const otherNavPoly = this.navPolygons[j];

          // Check if the other navpoly is within range to touch
          const d = navPoly.centroid.distance(otherNavPoly.centroid);
          if (d > navPoly.boundingRadius + otherNavPoly.boundingRadius)
            continue;

          // The are in range, so check each edge pairing
          for (const edge of navPoly.edges) {
            for (const otherEdge of otherNavPoly.edges) {
              // If edges aren't collinear, not an option for connecting navpolys
              if (!areCollinear(edge, otherEdge)) continue;

              // If they are collinear, check if they overlap
              const overlap = this.getSegmentOverlap(edge, otherEdge);
              if (!overlap) continue;

              // Connections are symmetric!
              navPoly.neighbors.push(otherNavPoly);
              otherNavPoly.neighbors.push(navPoly);

              // Calculate the portal between the two polygons - this needs to be in
              // counter-clockwise order, relative to each polygon
              const [p1, p2] = overlap;
              let edgeStartAngle = navPoly.centroid.angle(edge.start);
              let a1 = navPoly.centroid.angle(overlap[0]);
              let a2 = navPoly.centroid.angle(overlap[1]);
              let d1 = angleDifference(edgeStartAngle, a1);
              let d2 = angleDifference(edgeStartAngle, a2);
              if (d1 < d2) {
                navPoly.portals.push(new Line(p1.x, p1.y, p2.x, p2.y));
              } else {
                navPoly.portals.push(new Line(p2.x, p2.y, p1.x, p1.y));
              }

              edgeStartAngle = otherNavPoly.centroid.angle(otherEdge.start);
              a1 = otherNavPoly.centroid.angle(overlap[0]);
              a2 = otherNavPoly.centroid.angle(overlap[1]);
              d1 = angleDifference(edgeStartAngle, a1);
              d2 = angleDifference(edgeStartAngle, a2);
              if (d1 < d2) {
                otherNavPoly.portals.push(new Line(p1.x, p1.y, p2.x, p2.y));
              } else {
                otherNavPoly.portals.push(new Line(p2.x, p2.y, p1.x, p1.y));
              }

              // Two convex polygons shouldn't be connected more than once! (Unless
              // there are unnecessary vertices...)
            }
          }
        }
      }
    }

    // Check two collinear line segments to see if they overlap by sorting the points.
    // Algorithm source: http://stackoverflow.com/a/17152247
    private getSegmentOverlap(line1: Line, line2: Line) {
      const points = [
        { line: line1, point: line1.start },
        { line: line1, point: line1.end },
        { line: line2, point: line2.start },
        { line: line2, point: line2.end },
      ];
      points.sort(function (a, b) {
        if (a.point.x < b.point.x) return -1;
        else if (a.point.x > b.point.x) return 1;
        else {
          if (a.point.y < b.point.y) return -1;
          else if (a.point.y > b.point.y) return 1;
          else return 0;
        }
      });
      // If the first two points in the array come from the same line, no overlap
      const noOverlap = points[0].line === points[1].line;
      // If the two middle points in the array are the same coordinates, then there is a
      // single point of overlap.
      const singlePointOverlap = points[1].point.equals(points[2].point);
      if (noOverlap || singlePointOverlap) return null;
      else return [points[1].point, points[2].point];
    }

    /**
     * Project a point onto a polygon in the shortest distance possible.
     *
     * @param {Phaser.Point} point The point to project
     * @param {NavPoly} navPoly The navigation polygon to test against
     * @returns {{point: Phaser.Point, distance: number}}
     */
    private projectPointToPolygon(point: Vector2, navPoly: NavPoly) {
      let closestProjection: Vector2 | null = null;
      let closestDistance = Number.MAX_VALUE;
      for (const edge of navPoly.edges) {
        const projectedPoint = projectPointToEdge(point, edge);
        const d = point.distance(projectedPoint);
        if (closestProjection === null || d < closestDistance) {
          closestDistance = d;
          closestProjection = projectedPoint;
        }
      }
      return { point: closestProjection, distance: closestDistance };
    }
  }
}
