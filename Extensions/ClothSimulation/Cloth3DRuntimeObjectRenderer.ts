namespace gdjs {
  export class Cloth3DRuntimeObjectRenderer extends gdjs.RuntimeObject3DRenderer {
    private _clothObject: gdjs.Cloth3DRuntimeObject;
    private _mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    private _lastSnapshotSequence = -1;
    private _lastWidth: number;
    private _lastHeight: number;
    private _disposed = false;

    constructor(
      runtimeObject: gdjs.Cloth3DRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      const geometry = Cloth3DRuntimeObjectRenderer._makeGeometry(
        runtimeObject.getSimulationTopology()
      );
      const material = new THREE.MeshStandardMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.frustumCulled = false;
      super(runtimeObject, instanceContainer, mesh);
      this._clothObject = runtimeObject;
      this._mesh = mesh;
      this._lastWidth = runtimeObject.getWidth();
      this._lastHeight = runtimeObject.getHeight();
      this.updateAppearance();
      this.updateSize();
      this.updatePosition();
      this.updateRotation();
      this.updateVisibility();
    }

    private static _makeGeometry(
      topology: ClothSimulationTopology
    ): THREE.BufferGeometry {
      const geometry = new THREE.BufferGeometry();
      const position = new THREE.BufferAttribute(
        topology.restPositions.slice(),
        3
      );
      position.setUsage(THREE.DynamicDrawUsage);
      geometry.setAttribute('position', position);
      geometry.setAttribute(
        'uv',
        new THREE.BufferAttribute(topology.uvs.slice(), 2)
      );
      geometry.setIndex(new THREE.BufferAttribute(topology.indices.slice(), 1));
      geometry.computeVertexNormals();
      const normal = geometry.getAttribute('normal') as THREE.BufferAttribute;
      normal.setUsage(THREE.DynamicDrawUsage);
      return geometry;
    }

    rebuildGeometry(topology: ClothSimulationTopology): void {
      if (this._disposed) return;
      const oldGeometry = this._mesh.geometry;
      this._mesh.geometry =
        Cloth3DRuntimeObjectRenderer._makeGeometry(topology);
      oldGeometry.dispose();
      this._lastSnapshotSequence = -1;
    }

    updateSnapshot(snapshot: ClothSimulationSnapshot): void {
      if (
        this._disposed ||
        snapshot.sequence <= this._lastSnapshotSequence ||
        snapshot.positions.length !==
          this._mesh.geometry.getAttribute('position').count * 3
      ) {
        return;
      }
      for (let index = 0; index < snapshot.positions.length; index++) {
        if (!Number.isFinite(snapshot.positions[index])) return;
      }
      const position = this._mesh.geometry.getAttribute(
        'position'
      ) as THREE.BufferAttribute;
      (position.array as Float32Array).set(snapshot.positions);
      position.needsUpdate = true;
      this._mesh.geometry.computeVertexNormals();
      const normal = this._mesh.geometry.getAttribute(
        'normal'
      ) as THREE.BufferAttribute;
      normal.needsUpdate = true;
      this._lastSnapshotSequence = snapshot.sequence;
    }

    updateAppearance(): void {
      if (this._disposed) return;
      const data = this._clothObject.getNormalizedContent();
      const components = data.color
        .split(';')
        .map((component) => Number(component));
      this._mesh.material.color.setRGB(
        components[0] / 255,
        components[1] / 255,
        components[2] / 255
      );
      this._mesh.material.opacity = data.opacity;
      this._mesh.material.transparent = data.opacity < 1;
      this._mesh.material.roughness = data.roughness;
      this._mesh.material.metalness = data.metalness;
      this._mesh.material.side = data.doubleSided
        ? THREE.DoubleSide
        : THREE.FrontSide;
      this._mesh.material.needsUpdate = true;
      this._mesh.castShadow = data.isCastingShadow;
      this._mesh.receiveShadow = data.isReceivingShadow;
    }

    override updateSize(): void {
      const object = this._object;
      this.get3DRendererObject().scale.set(
        object.isFlippedX() ? -1 : 1,
        object.isFlippedY() ? -1 : 1,
        object.isFlippedZ() ? -1 : 1
      );
      this.updatePosition();
      if (!this._clothObject) return;
      const width = object.getWidth();
      const height = object.getHeight();
      const topologySizeChanged =
        width !== this._lastWidth || height !== this._lastHeight;
      this._lastWidth = width;
      this._lastHeight = height;
      if (topologySizeChanged) this._clothObject._onRuntimeSizeChanged();
    }

    dispose(): void {
      if (this._disposed) return;
      this._disposed = true;
      this._mesh.geometry.dispose();
      this._mesh.material.dispose();
    }
  }
}
