namespace gdjs {
  /**
   * @category Core Engine > Events interfacing
   */
  export namespace scene3d {
    const assumedFovIn2D = 45;

    export namespace camera {
      export const getCameraZ = (
        runtimeScene: RuntimeScene,
        layerName: string,
        cameraIndex: integer
      ): float => {
        const layer = runtimeScene.getLayer(layerName);
        const layerRenderer = layer.getRenderer();
        const threeCamera = layerRenderer.getThreeCamera();
        const fov = threeCamera
          ? threeCamera instanceof THREE.OrthographicCamera
            ? null
            : threeCamera.fov
          : assumedFovIn2D;
        return layer.getCameraZ(fov, cameraIndex);
      };

      export const setCameraZ = (
        runtimeScene: RuntimeScene,
        z: float,
        layerName: string,
        cameraIndex: integer
      ) => {
        const layer = runtimeScene.getLayer(layerName);
        const layerRenderer = layer.getRenderer();
        const threeCamera = layerRenderer.getThreeCamera();
        const fov = threeCamera
          ? threeCamera instanceof THREE.OrthographicCamera
            ? null
            : threeCamera.fov
          : assumedFovIn2D;
        layer.setCameraZ(z, fov, cameraIndex);
      };

      export const getCameraRotationX = (
        runtimeScene: RuntimeScene,
        layerName: string,
        cameraIndex: integer
      ): float => {
        const layer = runtimeScene.getLayer(layerName);
        return layer.getCameraRotationX(cameraIndex);
      };

      export const setCameraRotationX = (
        runtimeScene: RuntimeScene,
        angle: float,
        layerName: string,
        cameraIndex: integer
      ) => {
        const layer = runtimeScene.getLayer(layerName);
        layer.setCameraRotationX(angle, cameraIndex);
      };

      export const getCameraRotationY = (
        runtimeScene: RuntimeScene,
        layerName: string,
        cameraIndex: integer
      ): float => {
        const layer = runtimeScene.getLayer(layerName);
        return layer.getCameraRotationY(cameraIndex);
      };

      export const setCameraRotationY = (
        runtimeScene: RuntimeScene,
        angle: float,
        layerName: string,
        cameraIndex: integer
      ) => {
        const layer = runtimeScene.getLayer(layerName);
        layer.setCameraRotationY(angle, cameraIndex);
      };

      export const getCameraForwardX = (
        runtimeScene: RuntimeScene,
        layerName: string,
        cameraIndex: integer
      ): float => {
        const layer = runtimeScene.getLayer(layerName);
        return layer.getCameraForwardX(cameraIndex);
      };

      export const getCameraForwardY = (
        runtimeScene: RuntimeScene,
        layerName: string,
        cameraIndex: integer
      ): float => {
        const layer = runtimeScene.getLayer(layerName);
        return layer.getCameraForwardY(cameraIndex);
      };

      export const getCameraForwardZ = (
        runtimeScene: RuntimeScene,
        layerName: string,
        cameraIndex: integer
      ): float => {
        const layer = runtimeScene.getLayer(layerName);
        return layer.getCameraForwardZ(cameraIndex);
      };

      export const getCameraUpX = (
        runtimeScene: RuntimeScene,
        layerName: string,
        cameraIndex: integer
      ): float => {
        const layer = runtimeScene.getLayer(layerName);
        return layer.getCameraUpX(cameraIndex);
      };

      export const getCameraUpY = (
        runtimeScene: RuntimeScene,
        layerName: string,
        cameraIndex: integer
      ): float => {
        const layer = runtimeScene.getLayer(layerName);
        return layer.getCameraUpY(cameraIndex);
      };

      export const getCameraUpZ = (
        runtimeScene: RuntimeScene,
        layerName: string,
        cameraIndex: integer
      ): float => {
        const layer = runtimeScene.getLayer(layerName);
        return layer.getCameraUpZ(cameraIndex);
      };

      export const getCameraRightX = (
        runtimeScene: RuntimeScene,
        layerName: string,
        cameraIndex: integer
      ): float => {
        const layer = runtimeScene.getLayer(layerName);
        return layer.getCameraRightX(cameraIndex);
      };

      export const getCameraRightY = (
        runtimeScene: RuntimeScene,
        layerName: string,
        cameraIndex: integer
      ): float => {
        const layer = runtimeScene.getLayer(layerName);
        return layer.getCameraRightY(cameraIndex);
      };

      export const getCameraRightZ = (
        runtimeScene: RuntimeScene,
        layerName: string,
        cameraIndex: integer
      ): float => {
        const layer = runtimeScene.getLayer(layerName);
        return layer.getCameraRightZ(cameraIndex);
      };

      export const turnCameraTowardObject = (
        runtimeScene: RuntimeScene,
        object: gdjs.RuntimeObject | null,
        layerName: string,
        cameraIndex: integer,
        isStandingOnY: boolean
      ) => {
        if (!object) return;

        const layer = runtimeScene.getLayer(layerName);
        const layerRenderer = layer.getRenderer();

        const threeCamera = layerRenderer.getThreeCamera();
        if (!threeCamera) return;

        if (isStandingOnY) {
          threeCamera.up.set(0, 1, 0);
        } else {
          threeCamera.up.set(0, 0, 1);
        }
        const inverseWorldScale = runtimeScene.getRenderer3DInverseWorldScale();
        threeCamera.lookAt(
          object.getCenterXInScene() * inverseWorldScale,
          -object.getCenterYInScene() * inverseWorldScale,
          //@ts-ignore
          object.getZ ? object.getZ() * inverseWorldScale : 0
        );
        // The layer angle takes over the 3D camera Z rotation.
        layer.setCameraRotation(gdjs.toDegrees(-threeCamera.rotation.z));
      };

      export const turnCameraTowardPosition = (
        runtimeScene: RuntimeScene,
        x: float,
        y: float,
        z: float,
        layerName: string,
        cameraIndex: integer,
        isStandingOnY: boolean
      ) => {
        const layer = runtimeScene.getLayer(layerName);
        const layerRenderer = layer.getRenderer();

        const threeCamera = layerRenderer.getThreeCamera();
        if (!threeCamera) return;

        if (isStandingOnY) {
          threeCamera.up.set(0, 1, 0);
        } else {
          threeCamera.up.set(0, 0, 1);
        }
        const inverseWorldScale = runtimeScene.getRenderer3DInverseWorldScale();
        threeCamera.lookAt(
          x * inverseWorldScale,
          -y * inverseWorldScale,
          z * inverseWorldScale
        );
        // The layer angle takes over the 3D camera Z rotation.
        layer.setCameraRotation(gdjs.toDegrees(-threeCamera.rotation.z));
      };

      export const getNearPlane = (
        runtimeScene: RuntimeScene,
        layerName: string,
        cameraIndex: integer
      ): float => {
        const layer = runtimeScene.getLayer(layerName);
        return layer.getCamera3DNearPlaneDistance();
      };

      export const setNearPlane = (
        runtimeScene: RuntimeScene,
        distance: float,
        layerName: string,
        cameraIndex: integer
      ) => {
        const layer = runtimeScene.getLayer(layerName);
        layer.setCamera3DNearPlaneDistance(distance);
      };

      export const getFarPlane = (
        runtimeScene: RuntimeScene,
        layerName: string,
        cameraIndex: integer
      ): float => {
        const layer = runtimeScene.getLayer(layerName);
        return layer.getCamera3DFarPlaneDistance();
      };

      export const setFarPlane = (
        runtimeScene: RuntimeScene,
        distance: float,
        layerName: string,
        cameraIndex: integer
      ) => {
        const layer = runtimeScene.getLayer(layerName);
        layer.setCamera3DFarPlaneDistance(distance);
      };

      export const getFov = (
        runtimeScene: RuntimeScene,
        layerName: string,
        cameraIndex: integer
      ): float => {
        const layer = runtimeScene.getLayer(layerName);
        return layer.getCamera3DFieldOfView();
      };

      export const setFov = (
        runtimeScene: RuntimeScene,
        angle: float,
        layerName: string,
        cameraIndex: integer
      ) => {
        const layer = runtimeScene.getLayer(layerName);
        layer.setCamera3DFieldOfView(angle);
      };
    }
  }
}
