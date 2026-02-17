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
    private _originalMeshPositions: Record<string, THREE.Vector3>;
    private _originalMeshRotations: Record<string, THREE.Euler>;
    private _originalMeshScales: Record<string, THREE.Vector3>;
    private _normalizationScale: { x: number; y: number; z: number } | null;

    constructor() {
      this._meshesMap = {};
      this._meshesNames = [];
      this._runtimeObject = null;
      this._originalMeshPositions = {};
      this._originalMeshRotations = {};
      this._originalMeshScales = {};
      this._normalizationScale = null;
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
      this._originalMeshPositions = {};
      this._originalMeshRotations = {};
      this._originalMeshScales = {};

      if (!threeObject) {
        return;
      }

      // Traverse the object hierarchy to find all meshes and groups
      threeObject.traverse((child: THREE.Object3D) => {
        // Only add objects that have a name
        if (child.name && child.name !== '') {
          // Skip if already indexed (avoid duplicates)
          if (child.name in this._meshesMap) {
            return;
          }
          
          // Only index Mesh and Group nodes, skip bones, lights, cameras, and other helper nodes
          const isMesh = child instanceof THREE.Mesh;
          const isGroup = child instanceof THREE.Group;
          
          if (isMesh || isGroup) {
            this._meshesMap[child.name] = child;
            this._meshesNames.push(child.name);
            // Store the original local transformations of the mesh before any user modifications
            this._originalMeshPositions[child.name] = child.position.clone();
            this._originalMeshRotations[child.name] = child.rotation.clone();
            this._originalMeshScales[child.name] = child.scale.clone();
          }
        }
      });
    }

    /**
     * Set the normalization scale used when the model was stretched into a unit cube.
     * This scale is needed to correctly convert between object space and mesh local space.
     * @param scaleX The X normalization scale (1 / modelWidth)
     * @param scaleY The Y normalization scale (1 / modelHeight)
     * @param scaleZ The Z normalization scale (1 / modelDepth)
     */
    setNormalizationScale(scaleX: number, scaleY: number, scaleZ: number): void {
      this._normalizationScale = { x: scaleX, y: scaleY, z: scaleZ };
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
     * @returns True if visible, false otherwise
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
      if (!this.hasMesh(name) || !this._runtimeObject || !this._normalizationScale) {
        return;
      }

      const originalPos = this._originalMeshPositions[name];
      if (!originalPos) {
        return;
      }

      // Convert from object space to mesh local space.
      // The transformation chain is: meshLocal -> normalized (1x1x1) -> objectDimensions
      // So: objectSpace = meshLocal * normalizationScale * objectDimensions
      // Therefore: meshLocal = objectSpace / (normalizationScale * objectDimensions)
      const objectWidth = this._runtimeObject.getWidth();
      const objectHeight = this._runtimeObject.getHeight();
      const objectDepth = this._runtimeObject.getDepth();

      const normalizedX = objectWidth !== 0 && this._normalizationScale.x !== 0
        ? x / (this._normalizationScale.x * objectWidth)
        : 0;
      // Y axis is flipped in the renderer, so we need to negate it
      const normalizedY = objectHeight !== 0 && this._normalizationScale.y !== 0
        ? -y / (this._normalizationScale.y * objectHeight)
        : 0;
      const normalizedZ = objectDepth !== 0 && this._normalizationScale.z !== 0
        ? z / (this._normalizationScale.z * objectDepth)
        : 0;

      // Add to the original local position to preserve the mesh's position in the model hierarchy
      this._meshesMap[name].position.set(
        originalPos.x + normalizedX,
        originalPos.y + normalizedY,
        originalPos.z + normalizedZ
      );
    }

    /**
     * Get the X position of a mesh.
     * The returned value is in the same coordinate system as the object dimensions.
     * @param name The mesh name
     * @returns X position or 0 if mesh doesn't exist
     */
    getMeshPositionX(name: string): number {
      if (!this.hasMesh(name) || !this._runtimeObject || !this._normalizationScale) {
        return 0;
      }

      const originalPos = this._originalMeshPositions[name];
      if (!originalPos) {
        return 0;
      }

      const currentPos = this._meshesMap[name].position;
      const objectWidth = this._runtimeObject.getWidth();

      // Subtract the original position and convert back to object space
      // The transformation is: objectSpace = meshLocal * normalizationScale * objectDimensions
      const normalizedOffset = currentPos.x - originalPos.x;
      return normalizedOffset * this._normalizationScale.x * objectWidth;
    }

    /**
     * Get the Y position of a mesh.
     * The returned value is in the same coordinate system as the object dimensions.
     * @param name The mesh name
     * @returns Y position or 0 if mesh doesn't exist
     */
    getMeshPositionY(name: string): number {
      if (!this.hasMesh(name) || !this._runtimeObject || !this._normalizationScale) {
        return 0;
      }

      const originalPos = this._originalMeshPositions[name];
      if (!originalPos) {
        return 0;
      }

      const currentPos = this._meshesMap[name].position;
      const objectHeight = this._runtimeObject.getHeight();

      // Subtract the original position and convert back to object space
      // Y axis is flipped in the renderer, so we need to negate it
      // The transformation is: objectSpace = meshLocal * normalizationScale * objectDimensions
      const normalizedOffset = currentPos.y - originalPos.y;
      return -normalizedOffset * this._normalizationScale.y * objectHeight;
    }

    /**
     * Get the Z position of a mesh.
     * The returned value is in the same coordinate system as the object dimensions.
     * @param name The mesh name
     * @returns Z position or 0 if mesh doesn't exist
     */
    getMeshPositionZ(name: string): number {
      if (!this.hasMesh(name) || !this._runtimeObject || !this._normalizationScale) {
        return 0;
      }

      const originalPos = this._originalMeshPositions[name];
      if (!originalPos) {
        return 0;
      }

      const currentPos = this._meshesMap[name].position;
      const objectDepth = this._runtimeObject.getDepth();

      // Subtract the original position and convert back to object space
      // The transformation is: objectSpace = meshLocal * normalizationScale * objectDimensions
      const normalizedOffset = currentPos.z - originalPos.z;
      return normalizedOffset * this._normalizationScale.z * objectDepth;
    }

    /**
     * Set the rotation of a mesh (in degrees).
     * The rotation values are offsets added to the mesh's original rotation in the model.
     * @param name The mesh name
     * @param rotationX Rotation offset around X axis in degrees
     * @param rotationY Rotation offset around Y axis in degrees
     * @param rotationZ Rotation offset around Z axis in degrees
     */
    setMeshRotation(
      name: string,
      rotationX: number,
      rotationY: number,
      rotationZ: number
    ): void {
      if (!this.hasMesh(name)) {
        return;
      }

      const originalRot = this._originalMeshRotations[name];
      if (!originalRot) {
        return;
      }

      // Set absolute rotation by adding user offset to original rotation
      this._meshesMap[name].rotation.set(
        originalRot.x + gdjs.toRad(rotationX),
        originalRot.y + gdjs.toRad(rotationY),
        originalRot.z + gdjs.toRad(rotationZ),
        originalRot.order
      );
    }

    /**
     * Get the X rotation of a mesh (in degrees).
     * The returned value is the offset from the mesh's original rotation.
     * @param name The mesh name
     * @returns X rotation offset in degrees or 0 if mesh doesn't exist
     */
    getMeshRotationX(name: string): number {
      if (!this.hasMesh(name)) {
        return 0;
      }

      const originalRot = this._originalMeshRotations[name];
      if (!originalRot) {
        return 0;
      }

      const currentRot = this._meshesMap[name].rotation;
      return gdjs.toDegrees(currentRot.x - originalRot.x);
    }

    /**
     * Get the Y rotation of a mesh (in degrees).
     * The returned value is the offset from the mesh's original rotation.
     * @param name The mesh name
     * @returns Y rotation offset in degrees or 0 if mesh doesn't exist
     */
    getMeshRotationY(name: string): number {
      if (!this.hasMesh(name)) {
        return 0;
      }

      const originalRot = this._originalMeshRotations[name];
      if (!originalRot) {
        return 0;
      }

      const currentRot = this._meshesMap[name].rotation;
      return gdjs.toDegrees(currentRot.y - originalRot.y);
    }

    /**
     * Get the Z rotation of a mesh (in degrees).
     * The returned value is the offset from the mesh's original rotation.
     * @param name The mesh name
     * @returns Z rotation offset in degrees or 0 if mesh doesn't exist
     */
    getMeshRotationZ(name: string): number {
      if (!this.hasMesh(name)) {
        return 0;
      }

      const originalRot = this._originalMeshRotations[name];
      if (!originalRot) {
        return 0;
      }

      const currentRot = this._meshesMap[name].rotation;
      return gdjs.toDegrees(currentRot.z - originalRot.z);
    }

    /**
     * Set the scale of a mesh.
     * The scale values are relative to the mesh's original scale in the model.
     * Note: If the mesh has zero scale on any axis in the original model,
     * the result will remain zero regardless of the input value.
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
      if (!this.hasMesh(name)) {
        return;
      }

      const originalScale = this._originalMeshScales[name];
      if (!originalScale) {
        return;
      }

      // Multiply the user-specified scale with the original scale
      this._meshesMap[name].scale.set(
        originalScale.x * scaleX,
        originalScale.y * scaleY,
        originalScale.z * scaleZ
      );
    }

    /**
     * Get the X scale of a mesh.
     * The returned value is relative to the mesh's original scale.
     * @param name The mesh name
     * @returns X scale or 1 if mesh doesn't exist
     */
    getMeshScaleX(name: string): number {
      if (!this.hasMesh(name)) {
        return 1;
      }

      const originalScale = this._originalMeshScales[name];
      if (!originalScale || originalScale.x === 0) {
        return 1;
      }

      return this._meshesMap[name].scale.x / originalScale.x;
    }

    /**
     * Get the Y scale of a mesh.
     * The returned value is relative to the mesh's original scale.
     * @param name The mesh name
     * @returns Y scale or 1 if mesh doesn't exist
     */
    getMeshScaleY(name: string): number {
      if (!this.hasMesh(name)) {
        return 1;
      }

      const originalScale = this._originalMeshScales[name];
      if (!originalScale || originalScale.y === 0) {
        return 1;
      }

      return this._meshesMap[name].scale.y / originalScale.y;
    }

    /**
     * Get the Z scale of a mesh.
     * The returned value is relative to the mesh's original scale.
     * @param name The mesh name
     * @returns Z scale or 1 if mesh doesn't exist
     */
    getMeshScaleZ(name: string): number {
      if (!this.hasMesh(name)) {
        return 1;
      }

      const originalScale = this._originalMeshScales[name];
      if (!originalScale || originalScale.z === 0) {
        return 1;
      }

      return this._meshesMap[name].scale.z / originalScale.z;
    }

    /**
     * Remove a mesh from the scene.
     * This also removes all descendant meshes from the registry.
     * @param name The mesh name
     */
    removeMesh(name: string): void {
      if (this.hasMesh(name)) {
        const mesh = this._meshesMap[name];
        
        // Collect all descendant mesh names that need to be removed from the registry
        const descendantNames: string[] = [];
        mesh.traverse((child: THREE.Object3D) => {
          if (child !== mesh && child.name && child.name in this._meshesMap) {
            descendantNames.push(child.name);
          }
        });
        
        // Remove from parent (this detaches the entire subtree from the scene)
        if (mesh.parent) {
          mesh.parent.remove(mesh);
        }
        
        // Clean up the mesh itself
        delete this._meshesMap[name];
        delete this._originalMeshPositions[name];
        delete this._originalMeshRotations[name];
        delete this._originalMeshScales[name];
        
        // Clean up all descendants
        for (const descendantName of descendantNames) {
          delete this._meshesMap[descendantName];
          delete this._originalMeshPositions[descendantName];
          delete this._originalMeshRotations[descendantName];
          delete this._originalMeshScales[descendantName];
        }
        
        // Update the names array to exclude the removed mesh and its descendants
        const removedNames = new Set([name, ...descendantNames]);
        this._meshesNames = this._meshesNames.filter(
          (meshName) => !removedNames.has(meshName)
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
      this._originalMeshPositions = {};
      this._originalMeshRotations = {};
      this._originalMeshScales = {};
      this._normalizationScale = null;
    }
  }
}
