namespace gdjs {
  /** Base parameters for {@link gdjs.Cube3DRuntimeObject} */
  export interface Model3DObjectData extends Object3DData {
    /** The base parameters of the Model3D object */
    content: Object3DDataContent & {
      modelResourceName: string;
      rotationX: number;
      rotationY: number;
      rotationZ: number;
      keepAspectRatio: boolean;
      materialType: 'Basic' | 'StandardWithoutMetalness' | 'KeepOriginal';
    };
  }

  /**
   * A 3D object which displays a 3D model.
   */
  export class Model3DRuntimeObject extends gdjs.RuntimeObject3D {
    _renderer: gdjs.Model3DRuntimeObjectRenderer;

    _modelResourceName: string;
    _materialType: gdjs.Model3DRuntimeObject.MaterialType =
      gdjs.Model3DRuntimeObject.MaterialType.Basic;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: Model3DObjectData
    ) {
      super(instanceContainer, objectData);
      this._modelResourceName = objectData.content.modelResourceName;
      this._renderer = new gdjs.Model3DRuntimeObjectRenderer(
        this,
        instanceContainer
      );
      this._updateMaterialType(objectData);

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    updateFromObjectData(
      oldObjectData: Model3DObjectData,
      newObjectData: Model3DObjectData
    ): boolean {
      super.updateFromObjectData(oldObjectData, newObjectData);
      if (
        oldObjectData.content.width !== newObjectData.content.width ||
        oldObjectData.content.height !== newObjectData.content.height ||
        oldObjectData.content.depth !== newObjectData.content.depth ||
        oldObjectData.content.rotationX !== newObjectData.content.rotationX ||
        oldObjectData.content.rotationY !== newObjectData.content.rotationY ||
        oldObjectData.content.rotationZ !== newObjectData.content.rotationZ ||
        oldObjectData.content.keepAspectRatio !==
          newObjectData.content.keepAspectRatio
      ) {
        this._updateDefaultTransformation(newObjectData);
      }
      if (
        oldObjectData.content.materialType !==
        newObjectData.content.materialType
      ) {
        this._updateMaterialType(newObjectData);
      }
      return true;
    }

    _updateDefaultTransformation(objectData: Model3DObjectData) {
      const rotationX = objectData.content.rotationX || 0;
      const rotationY = objectData.content.rotationY || 0;
      const rotationZ = objectData.content.rotationZ || 0;
      const keepAspectRatio = objectData.content.keepAspectRatio;
      this._renderer._updateDefaultTransformation(
        rotationX,
        rotationY,
        rotationZ,
        this._getOriginalWidth(),
        this._getOriginalHeight(),
        this._getOriginalDepth(),
        keepAspectRatio
      );
    }

    getRenderer(): RuntimeObject3DRenderer {
      return this._renderer;
    }

    _convertMaterialType(
      materialTypeString: string
    ): gdjs.Model3DRuntimeObject.MaterialType {
      if (materialTypeString === 'KeepOriginal') {
        return gdjs.Model3DRuntimeObject.MaterialType.KeepOriginal;
      } else if (materialTypeString === 'StandardWithoutMetalness') {
        return gdjs.Model3DRuntimeObject.MaterialType.StandardWithoutMetalness;
      } else {
        return gdjs.Model3DRuntimeObject.MaterialType.Basic;
      }
    }

    _updateMaterialType(objectData: Model3DObjectData) {
      this._materialType = this._convertMaterialType(
        objectData.content.materialType
      );
      this._renderer._updateMaterials();
      this._updateDefaultTransformation(objectData);
    }
  }

  export namespace Model3DRuntimeObject {
    export enum MaterialType {
      Basic,
      StandardWithoutMetalness,
      KeepOriginal,
    }
  }
  gdjs.registerObject('Scene3D::Model3DObject', gdjs.Model3DRuntimeObject);
}
