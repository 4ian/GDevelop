import * as THREE from 'three';

class FullScreenTriangleGeometry extends THREE.BufferGeometry {
  boundingSphere = new THREE.Sphere();

  constructor() {
    super()
    this.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 3, -1, -1, 3]), 2));
    this.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2));
  }

  computeBoundingSphere() {}
}

const _geometry = /* @__PURE__ */ new FullScreenTriangleGeometry();
const _camera = /* @__PURE__ */ new THREE.OrthographicCamera();

export class FullScreenTriangle {
  constructor(material) {
    this._mesh = new THREE.Mesh(_geometry, material);
    this._mesh.frustumCulled = false;
  }

  render(renderer) {
    renderer.render(this._mesh, _camera);
  }

  get material() {
    return this._mesh.material;
  }

  set material(value) {
    this._mesh.material = value;
  }

  dispose() {
    this._mesh.material.dispose();
    this._mesh.geometry.dispose();
  }
}
