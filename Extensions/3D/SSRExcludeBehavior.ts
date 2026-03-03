namespace gdjs {
  const ssrExcludeUserDataKey = '__gdScene3dSsrExclude';
  const ssrExcludeRefreshIntervalFrames = 15;

  type RuntimeObjectWith3DRenderer = gdjs.RuntimeObject & {
    get3DRendererObject?: () => THREE.Object3D | null;
  };

  /**
   * @category Behaviors > 3D
   */
  export class SSRExcludeRuntimeBehavior extends gdjs.RuntimeBehavior {
    private _enabled: boolean;
    private _refreshCounter: number;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject
    ) {
      super(instanceContainer, behaviorData, owner);

      this._enabled =
        behaviorData.enabled === undefined ? true : !!behaviorData.enabled;
      this._refreshCounter = ssrExcludeRefreshIntervalFrames;
    }

    override applyBehaviorOverriding(behaviorData): boolean {
      if (behaviorData.enabled !== undefined) {
        this.setEnabled(!!behaviorData.enabled);
      }
      return true;
    }

    override onCreated(): void {
      this._refreshCounter = ssrExcludeRefreshIntervalFrames;
      this._applyExcludeState();
    }

    override onActivate(): void {
      this._refreshCounter = ssrExcludeRefreshIntervalFrames;
      this._applyExcludeState();
    }

    override onDeActivate(): void {
      this._applyExcludeState(false);
    }

    override onDestroy(): void {
      this._applyExcludeState(false);
    }

    override doStepPreEvents(
      instanceContainer: gdjs.RuntimeInstanceContainer
    ): void {
      if (this._refreshCounter >= ssrExcludeRefreshIntervalFrames) {
        this._refreshCounter = 0;
        this._applyExcludeState();
      } else {
        this._refreshCounter++;
      }
    }

    isEnabled(): boolean {
      return this._enabled;
    }

    setEnabled(enabled: boolean): void {
      const normalizedEnabled = !!enabled;
      if (this._enabled === normalizedEnabled) {
        return;
      }

      this._enabled = normalizedEnabled;
      this._refreshCounter = ssrExcludeRefreshIntervalFrames;
      this._applyExcludeState();
    }

    private _getOwner3DObject(): THREE.Object3D | null {
      const owner3D = this.owner as RuntimeObjectWith3DRenderer;
      if (!owner3D || typeof owner3D.get3DRendererObject !== 'function') {
        return null;
      }
      return owner3D.get3DRendererObject() || null;
    }

    private _applyExcludeState(forceExclude?: boolean): void {
      const object3D = this._getOwner3DObject();
      if (!object3D) {
        return;
      }

      const shouldExclude =
        forceExclude !== undefined
          ? forceExclude
          : this.activated() && this._enabled;

      object3D.userData = object3D.userData || {};
      object3D.userData[ssrExcludeUserDataKey] = shouldExclude;

      object3D.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (!mesh || !mesh.isMesh) {
          return;
        }
        mesh.userData = mesh.userData || {};
        mesh.userData[ssrExcludeUserDataKey] = shouldExclude;
      });
    }
  }

  gdjs.registerBehavior('Scene3D::SSRExclude', gdjs.SSRExcludeRuntimeBehavior);
}
