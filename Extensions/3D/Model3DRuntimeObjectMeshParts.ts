namespace gdjs {
  /**
   * Manages individual mesh parts of a 3D model.
   * Allows control over visibility, position, rotation, and scale of child meshes.
   * @category Objects > 3D Model
   */
  export class Model3DRuntimeObjectMeshParts {
    private _meshesMap: Record<string, THREE.Object3D>;
    private _meshesNames: string[];
    private _runtimeObject: gdjs.Model3DRuntimeObject | null;

    constructor() {
      this._meshesMap = {};
      this._meshesNames = [];
      this._runtimeObject = null;
    }

    /**
     * Build the meshes map from a THREE.Object3D.
     * This traverses the object hierarchy and indexes all named meshes.
     * @param threeObject The root THREE.Object3D to traverse
     * @param runtimeObject The runtime object that owns this mesh parts manager
     */
    buildMeshesMap(threeObject: THREE.Object3D, runtimeObject?: gdjs.Model3DRuntimeObject): void {
      this._runtimeObject = runtimeObject || null;
      this._meshesMap = {};
      this._meshesNames = [];

      if (!threeObject) {
        return;
      }

      // Traverse the object hierarchy to find all meshes
      threeObject.traverse((child: THREE.Object3D) => {
        // Only add objects that have a name and are meshes or groups
        if (child.name && child.name !== '') {
          // Avoid duplicate names by using the first occurrence
          if (!(child.name in this._meshesMap)) {
            this._meshesMap[child.name] = child;
            this._meshesNames.push(child.name);
          }
        }
      });
    }

    /**
     * Get all mesh names.
     * @returns Array of mesh names
     */
    getMeshesNames(): string[] {
      return this._meshesNames;
    }

    /**
     * Get the total number of meshes.
     * @returns Number of meshes
     */
    getMeshesCount(): number {
      return this._meshesNames.length;
    }

    /**
     * Get mesh name at a specific index.
     * @param index The index of the mesh
     * @returns The mesh name or empty string if index is out of bounds
     */
    getMeshNameAt(index: number): string {
      if (index < 0 || index >= this._meshesNames.length) {
        return '';
      }
      return this._meshesNames[index];
    }

    /**
     * Check if a mesh with the given name exists.
     * @param name The mesh name
     * @returns True if the mesh exists
     */
    hasMesh(name: string): boolean {
      return name in this._meshesMap;
    }

    /**
     * Set the visibility of a mesh.
     * @param name The mesh name
     * @param visible Whether the mesh should be visible
     */
    setMeshVisible(name: string, visible: boolean): void {
      if (this.hasMesh(name)) {
        this._meshesMap[name].visible = visible;
      }
    }

    /**
     * Get the visibility of a mesh.
     * @param name The mesh name
     * @returns True if visible, false if hidden, null if mesh doesn't exist
     */
    isMeshVisible(name: string): boolean {
      return this.hasMesh(name) ? this._meshesMap[name].visible : false;
    }

    /**
     * Set the position of a mesh.
     * The position values are in the same coordinate system as the object dimensions.
     * They are automatically scaled to match the model's internal coordinate system.
     * @param name The mesh name
     * @param x X position
     * @param y Y position
     * @param z Z position
     */
    setMeshPosition(name: string, x: number, y: number, z: number): void {
      if (this.hasMesh(name) && this._runtimeObject) {
        // The model is stretched into a 1x1x1 cube internally,
        // and then scaled by the object dimensions.
        // To make the position values match the object coordinate system,
        // we need to divide by the object dimensions.
        const scaleX = this._runtimeObject.getWidth();
        const scaleY = this._runtimeObject.getHeight();
        const scaleZ = this._runtimeObject.getDepth();
        
        this._meshesMap[name].position.set(
          scaleX !== 0 ? x / scaleX : x,
          scaleY !== 0 ? y / scaleY : y,
          scaleZ !== 0 ? z / scaleZ : z
        );
      }
    }

    /**
     * Get the X position of a mesh.
     * The returned value is in the same coordinate system as the object dimensions.
     * @param name The mesh name
     * @returns X position or 0 if mesh doesn't exist
     */
    getMeshPositionX(name: string): number {
      if (!this.hasMesh(name) || !this._runtimeObject) {
        return 0;
      }
      // Convert from internal coordinate system back to object coordinate system
      return this._meshesMap[name].position.x * this._runtimeObject.getWidth();
    }

    /**
     * Get the Y position of a mesh.
     * The returned value is in the same coordinate system as the object dimensions.
     * @param name The mesh name
     * @returns Y position or 0 if mesh doesn't exist
     */
    getMeshPositionY(name: string): number {
      if (!this.hasMesh(name) || !this._runtimeObject) {
        return 0;
      }
      // Convert from internal coordinate system back to object coordinate system
      return this._meshesMap[name].position.y * this._runtimeObject.getHeight();
    }

    /**
     * Get the Z position of a mesh.
     * The returned value is in the same coordinate system as the object dimensions.
     * @param name The mesh name
     * @returns Z position or 0 if mesh doesn't exist
     */
    getMeshPositionZ(name: string): number {
      if (!this.hasMesh(name) || !this._runtimeObject) {
        return 0;
      }
      // Convert from internal coordinate system back to object coordinate system
      return this._meshesMap[name].position.z * this._runtimeObject.getDepth();
    }

    /**
     * Set the rotation of a mesh (in degrees).
     * @param name The mesh name
     * @param rotationX Rotation around X axis in degrees
     * @param rotationY Rotation around Y axis in degrees
     * @param rotationZ Rotation around Z axis in degrees
     */
    setMeshRotation(
      name: string,
      rotationX: number,
      rotationY: number,
      rotationZ: number
    ): void {
      if (this.hasMesh(name)) {
        this._meshesMap[name].rotation.set(
          gdjs.toRad(rotationX),
          gdjs.toRad(rotationY),
          gdjs.toRad(rotationZ)
        );
      }
    }

    /**
     * Get the X rotation of a mesh (in degrees).
     * @param name The mesh name
     * @returns X rotation in degrees or 0 if mesh doesn't exist
     */
    getMeshRotationX(name: string): number {
      return this.hasMesh(name)
        ? gdjs.toDegrees(this._meshesMap[name].rotation.x)
        : 0;
    }

    /**
     * Get the Y rotation of a mesh (in degrees).
     * @param name The mesh name
     * @returns Y rotation in degrees or 0 if mesh doesn't exist
     */
    getMeshRotationY(name: string): number {
      return this.hasMesh(name)
        ? gdjs.toDegrees(this._meshesMap[name].rotation.y)
        : 0;
    }

    /**
     * Get the Z rotation of a mesh (in degrees).
     * @param name The mesh name
     * @returns Z rotation in degrees or 0 if mesh doesn't exist
     */
    getMeshRotationZ(name: string): number {
      return this.hasMesh(name)
        ? gdjs.toDegrees(this._meshesMap[name].rotation.z)
        : 0;
    }

    /**
     * Set the scale of a mesh.
     * @param name The mesh name
     * @param scaleX Scale on X axis
     * @param scaleY Scale on Y axis
     * @param scaleZ Scale on Z axis
     */
    setMeshScale(
      name: string,
      scaleX: number,
      scaleY: number,
      scaleZ: number
    ): void {
      if (this.hasMesh(name)) {
        this._meshesMap[name].scale.set(scaleX, scaleY, scaleZ);
      }
    }

    /**
     * Get the X scale of a mesh.
     * @param name The mesh name
     * @returns X scale or 1 if mesh doesn't exist
     */
    getMeshScaleX(name: string): number {
      return this.hasMesh(name) ? this._meshesMap[name].scale.x : 1;
    }

    /**
     * Get the Y scale of a mesh.
     * @param name The mesh name
     * @returns Y scale or 1 if mesh doesn't exist
     */
    getMeshScaleY(name: string): number {
      return this.hasMesh(name) ? this._meshesMap[name].scale.y : 1;
    }

    /**
     * Get the Z scale of a mesh.
     * @param name The mesh name
     * @returns Z scale or 1 if mesh doesn't exist
     */
    getMeshScaleZ(name: string): number {
      return this.hasMesh(name) ? this._meshesMap[name].scale.z : 1;
    }

    /**
     * Remove a mesh from the scene.
     * @param name The mesh name
     */
    removeMesh(name: string): void {
      if (this.hasMesh(name)) {
        const mesh = this._meshesMap[name];
        // Remove from parent
        if (mesh.parent) {
          mesh.parent.remove(mesh);
        }
        // Clean up
        delete this._meshesMap[name];
        this._meshesNames = this._meshesNames.filter(
          (meshName) => meshName !== name
        );
      }
    }

    /**
     * Clear all mesh references.
     */
    clear(): void {
      this._meshesMap = {};
      this._meshesNames = [];
      this._runtimeObject = null;
    }
  }
}