class Model3DRuntimeObjectMeshParts {
    constructor() {
        this._meshesMap = {};
        this._meshesNames = [];
    }

    _buildMeshesMap() {
        // Implementation for building the meshes map
    }

    getMeshesNames() {
        return this._meshesNames;
    }

    getMeshesCount() {
        return this._meshesNames.length;
    }

    getMeshNameAt(index) {
        return this._meshesNames[index];
    }

    hasMesh(name) {
        return name in this._meshesMap;
    }

    setMeshVisible(name, visible) {
        if (this.hasMesh(name)) {
            this._meshesMap[name].visible = visible;
        }
    }

    getMeshVisible(name) {
        return this.hasMesh(name) ? this._meshesMap[name].visible : null;
    }

    setMeshPosition(name, position) {
        if (this.hasMesh(name)) {
            this._meshesMap[name].position = position;
        }
    }

    getMeshPosition(name) {
        return this.hasMesh(name) ? this._meshesMap[name].position : null;
    }

    getMeshPositionX(name) {
        return this.hasMesh(name) ? this._meshesMap[name].position.x : null;
    }

    getMeshPositionY(name) {
        return this.hasMesh(name) ? this._meshesMap[name].position.y : null;
    }

    getMeshPositionZ(name) {
        return this.hasMesh(name) ? this._meshesMap[name].position.z : null;
    }

    setMeshRotation(name, rotation) {
        if (this.hasMesh(name)) {
            this._meshesMap[name].rotation = rotation;
        }
    }

    getMeshRotation(name) {
        return this.hasMesh(name) ? this._meshesMap[name].rotation : null;
    }

    setMeshScale(name, scale) {
        if (this.hasMesh(name)) {
            this._meshesMap[name].scale = scale;
        }
    }

    getMeshScale(name) {
        return this.hasMesh(name) ? this._meshesMap[name].scale : null;
    }

    removeMesh(name) {
        if (this.hasMesh(name)) {
            delete this._meshesMap[name];
            this._meshesNames = this._meshesNames.filter(meshName => meshName !== name);
        }
    }
}