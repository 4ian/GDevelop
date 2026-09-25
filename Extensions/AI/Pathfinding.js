// Lightweight A* pathfinding helper (grid based)
export default class AStar {
  constructor(grid, width, height) {
    this.grid = grid; // 0 = walkable, 1 = blocked
    this.width = width;
    this.height = height;
  }

  _index(x, y) {
    return y * this.width + x;
  }

  _neighbors(x, y) {
    const n = [];
    const dirs = [ [1,0],[-1,0],[0,1],[0,-1] ];
    for (const d of dirs) {
      const nx = x + d[0], ny = y + d[1];
      if (nx >=0 && ny >=0 && nx < this.width && ny < this.height && this.grid[this._index(nx,ny)] === 0) n.push([nx,ny]);
    }
    return n;
  }

  heuristic(a,b) {
    return Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1]);
  }

  findPath(start, goal) {
    const startKey = `${start[0]},${start[1]}`;
    const goalKey = `${goal[0]},${goal[1]}`;
    const open = new Map();
    const closed = new Set();
    const gScore = new Map();
    const fScore = new Map();
    const cameFrom = new Map();

    function key(p){ return `${p[0]},${p[1]}`; }

    open.set(startKey, start);
    gScore.set(startKey, 0);
    fScore.set(startKey, this.heuristic(start, goal));

    while (open.size > 0) {
      // get node in open with lowest fScore
      let currentKey = null;
      let current = null;
      let lowest = Infinity;
      for (const [k,v] of open) {
        const f = fScore.get(k) || Infinity;
        if (f < lowest) { lowest = f; currentKey = k; current = v; }
      }
      if (!current) break;
      if (currentKey === goalKey) {
        // reconstruct path
        const path = [];
        let k = currentKey;
        while (k) {
          const parts = k.split(',').map(Number);
          path.push(parts);
          k = cameFrom.get(k);
        }
        return path.reverse();
      }

      open.delete(currentKey);
      closed.add(currentKey);

      for (const nb of this._neighbors(current[0], current[1])) {
        const nbKey = key(nb);
        if (closed.has(nbKey)) continue;
        const tentativeG = (gScore.get(currentKey) || Infinity) + 1;
        if (!open.has(nbKey)) open.set(nbKey, nb);
        else if (tentativeG >= (gScore.get(nbKey)||Infinity)) continue;
        cameFrom.set(nbKey, currentKey);
        gScore.set(nbKey, tentativeG);
        fScore.set(nbKey, tentativeG + this.heuristic(nb, goal));
      }
    }
    return null; // no path
  }
}
