// Raycasts against meshes with a bounding volume hierarchy of their triangles, built once by geometry (and again
// when its positions or index change). GDJS extensions raycast every frame (from the camera, for line of sight...)
// against terrains and models of thousands of triangles: testing every triangle is too slow in an interpreter.
import * as S from '@threert/scene';

const LEAF_SIZE = 8;

type BVH = {
  /** Per node: min xyz, max xyz. */
  bounds: Float32Array;
  /** Per node: first child (inner node) or first triangle (leaf), and count (0 for an inner node). */
  offsets: Uint32Array;
  counts: Uint32Array;
  /** Triangles in the order of the leaves (indices of triangles). */
  triangles: Uint32Array;
};

const buildBVH = (positions: ArrayLike<number>, indices: ArrayLike<number>): BVH => {
  const triangleCount = Math.floor(indices.length / 3);
  const centroids = new Float32Array(triangleCount * 3);
  const triangleBounds = new Float32Array(triangleCount * 6);
  for (let t = 0; t < triangleCount; t++) {
    let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (let k = 0; k < 3; k++) {
      const v = indices[t * 3 + k] * 3;
      const x = positions[v], y = positions[v + 1], z = positions[v + 2];
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (z < minZ) minZ = z;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      if (z > maxZ) maxZ = z;
    }
    triangleBounds.set([minX, minY, minZ, maxX, maxY, maxZ], t * 6);
    centroids[t * 3] = (minX + maxX) / 2;
    centroids[t * 3 + 1] = (minY + maxY) / 2;
    centroids[t * 3 + 2] = (minZ + maxZ) / 2;
  }
  const triangles = new Uint32Array(triangleCount);
  for (let t = 0; t < triangleCount; t++) triangles[t] = t;
  const maxNodes = Math.max(1, 2 * Math.ceil(triangleCount / (LEAF_SIZE / 2)) + 1);
  const bounds = new Float32Array(maxNodes * 6);
  const offsets = new Uint32Array(maxNodes);
  const counts = new Uint32Array(maxNodes);
  let nodeCount = 1;
  const stack: Array<[number, number, number]> = [[0, 0, triangleCount]];
  while (stack.length) {
    const [node, start, end] = stack.pop()!;
    let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    let cMinX = Infinity, cMinY = Infinity, cMinZ = Infinity, cMaxX = -Infinity, cMaxY = -Infinity, cMaxZ = -Infinity;
    for (let i = start; i < end; i++) {
      const t = triangles[i];
      const b = t * 6;
      if (triangleBounds[b] < minX) minX = triangleBounds[b];
      if (triangleBounds[b + 1] < minY) minY = triangleBounds[b + 1];
      if (triangleBounds[b + 2] < minZ) minZ = triangleBounds[b + 2];
      if (triangleBounds[b + 3] > maxX) maxX = triangleBounds[b + 3];
      if (triangleBounds[b + 4] > maxY) maxY = triangleBounds[b + 4];
      if (triangleBounds[b + 5] > maxZ) maxZ = triangleBounds[b + 5];
      const c = t * 3;
      if (centroids[c] < cMinX) cMinX = centroids[c];
      if (centroids[c + 1] < cMinY) cMinY = centroids[c + 1];
      if (centroids[c + 2] < cMinZ) cMinZ = centroids[c + 2];
      if (centroids[c] > cMaxX) cMaxX = centroids[c];
      if (centroids[c + 1] > cMaxY) cMaxY = centroids[c + 1];
      if (centroids[c + 2] > cMaxZ) cMaxZ = centroids[c + 2];
    }
    bounds.set([minX, minY, minZ, maxX, maxY, maxZ], node * 6);
    const count = end - start;
    const extentX = cMaxX - cMinX, extentY = cMaxY - cMinY, extentZ = cMaxZ - cMinZ;
    const axis = extentX >= extentY && extentX >= extentZ ? 0 : extentY >= extentZ ? 1 : 2;
    const extent = axis === 0 ? extentX : axis === 1 ? extentY : extentZ;
    if (count <= LEAF_SIZE || extent <= 0 || nodeCount + 2 > maxNodes) {
      offsets[node] = start;
      counts[node] = count;
      continue;
    }
    // Split at the middle of the centroids along the longest axis.
    const middle = (axis === 0 ? cMinX : axis === 1 ? cMinY : cMinZ) + extent / 2;
    let i = start, j = end - 1;
    while (i <= j) {
      if (centroids[triangles[i] * 3 + axis] < middle) i++;
      else {
        const swap = triangles[i];
        triangles[i] = triangles[j];
        triangles[j] = swap;
        j--;
      }
    }
    let split = i;
    if (split === start || split === end) split = (start + end) >> 1;
    const left = nodeCount;
    nodeCount += 2;
    offsets[node] = left;
    counts[node] = 0;
    stack.push([left, start, split], [left + 1, split, end]);
  }
  return { bounds, offsets, counts, triangles };
};

const cache = new WeakMap<object, Array<{ positions: any; index: any; indices: ArrayLike<number>; bvh: BVH }>>();

/**
 * The triangle indices and BVH of a geometry for its positions and index (a few are kept: Terrain3D raycasts with
 * another index than it draws).
 */
const getBVH = (geometry: any, positions: ArrayLike<number>) => {
  const index = geometry.index && geometry.index.length ? geometry.index : null;
  const entries = cache.get(geometry) || [];
  const cached = entries.find((entry) => entry.positions === positions && entry.index === index);
  if (cached) return cached;
  const indices: ArrayLike<number> = index || geometry.triangleIndices();
  const entry = { positions, index, indices, bvh: buildBVH(positions, indices) };
  entries.push(entry);
  if (entries.length > 3) entries.shift();
  cache.set(geometry, entries);
  return entry;
};

/** Whether the ray meets the box of a node before `maxT`. */
const hitsBox = (b: Float32Array, o: number, ox: number, oy: number, oz: number, ix: number, iy: number, iz: number, maxT: number) => {
  let t1 = (b[o] - ox) * ix, t2 = (b[o + 3] - ox) * ix;
  let tmin = Math.min(t1, t2), tmax = Math.max(t1, t2);
  t1 = (b[o + 1] - oy) * iy;
  t2 = (b[o + 4] - oy) * iy;
  tmin = Math.max(tmin, Math.min(t1, t2));
  tmax = Math.min(tmax, Math.max(t1, t2));
  t1 = (b[o + 2] - oz) * iz;
  t2 = (b[o + 5] - oz) * iz;
  tmin = Math.max(tmin, Math.min(t1, t2));
  tmax = Math.min(tmax, Math.max(t1, t2));
  return tmax >= Math.max(tmin, 0) && tmin <= maxT;
};

/**
 * The hits of the ray of `raycaster` with the triangles of `geometry` placed by `world`, as @threert/scene's raycaster
 * gives them (distance, point, face, faceIndex, uv), with a BVH. Returns false if the geometry can't be used.
 */
export const raycastGeometry = (raycaster: any, object: any, geometry: any, materials: any[], world: S.Matrix4, out: any[]): boolean => {
  const positions: ArrayLike<number> = geometry.positions;
  if (!positions || !positions.length) return false;
  const triangleCount = geometry.index && geometry.index.length ? geometry.index.length / 3 : positions.length / 9;
  if (triangleCount < 64) return false;
  const { indices, bvh } = getBVH(geometry, positions);
  const inverse = new S.Matrix4().copy(world).invert();
  const local = new S.Ray(raycaster.ray.origin.clone(), raycaster.ray.direction.clone()).applyMatrix4(inverse);
  const ox = local.origin.x, oy = local.origin.y, oz = local.origin.z;
  const dx = local.direction.x, dy = local.direction.y, dz = local.direction.z;
  const ix = 1 / dx, iy = 1 / dy, iz = 1 / dz;
  const uvs: ArrayLike<number> = geometry.uvs || [];
  const groups = geometry.groups && geometry.groups.length ? geometry.groups : null;
  const materialOf = (triangle: number) => {
    if (!groups) return 0;
    const index = triangle * 3;
    for (const group of groups) if (index >= group.start && index < group.start + group.count) return group.materialIndex;
    return 0;
  };
  const stack = [0];
  while (stack.length) {
    const node = stack.pop()!;
    if (!hitsBox(bvh.bounds, node * 6, ox, oy, oz, ix, iy, iz, Infinity)) continue;
    const count = bvh.counts[node];
    if (count === 0) {
      stack.push(bvh.offsets[node], bvh.offsets[node] + 1);
      continue;
    }
    for (let k = bvh.offsets[node]; k < bvh.offsets[node] + count; k++) {
      const triangle = bvh.triangles[k];
      const a = indices[triangle * 3], b = indices[triangle * 3 + 1], c = indices[triangle * 3 + 2];
      const ax = positions[a * 3], ay = positions[a * 3 + 1], az = positions[a * 3 + 2];
      const e1x = positions[b * 3] - ax, e1y = positions[b * 3 + 1] - ay, e1z = positions[b * 3 + 2] - az;
      const e2x = positions[c * 3] - ax, e2y = positions[c * 3 + 1] - ay, e2z = positions[c * 3 + 2] - az;
      const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x;
      const det = e1x * px + e1y * py + e1z * pz;
      const materialIndex = materialOf(triangle);
      const material = materials[Math.min(materialIndex, materials.length - 1)];
      const doubleSided = !material || material.doubleSided;
      // three.js culls back faces (counter-clockwise front faces) of single sided materials.
      if (doubleSided ? Math.abs(det) < 1e-12 : det < 1e-12) continue;
      const invDet = 1 / det;
      const tx = ox - ax, ty = oy - ay, tz = oz - az;
      const u = (tx * px + ty * py + tz * pz) * invDet;
      if (u < 0 || u > 1) continue;
      const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x;
      const v = (dx * qx + dy * qy + dz * qz) * invDet;
      if (v < 0 || u + v > 1) continue;
      const t = (e2x * qx + e2y * qy + e2z * qz) * invDet;
      if (t < 0) continue;
      const point = new S.Vector3(ox + dx * t, oy + dy * t, oz + dz * t).applyMatrix4(world);
      const distance = raycaster.ray.origin.distanceTo(point);
      if (distance < raycaster.near || distance > raycaster.far) continue;
      const normal = new S.Vector3(e1y * e2z - e1z * e2y, e1z * e2x - e1x * e2z, e1x * e2y - e1y * e2x).normalize();
      const hit: any = { distance, point, object, face: { a, b, c, normal, materialIndex }, faceIndex: triangle, normal: normal.clone() };
      if (uvs.length >= (positions.length / 3) * 2) {
        const w = 1 - u - v;
        hit.uv = new S.Vector2(uvs[a * 2] * w + uvs[b * 2] * u + uvs[c * 2] * v, uvs[a * 2 + 1] * w + uvs[b * 2 + 1] * u + uvs[c * 2 + 1] * v);
      }
      out.push(hit);
    }
  }
  return true;
};
