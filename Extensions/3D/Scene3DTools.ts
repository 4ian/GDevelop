namespace gdjs {
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
        const layerRenderer = layer.getRenderer();

        const threeCamera = layerRenderer.getThreeCamera();
        if (!threeCamera) return 0;
        return gdjs.toDegrees(threeCamera.rotation.x);
      };

      export const setCameraRotationX = (
        runtimeScene: RuntimeScene,
        angle: float,
        layerName: string,
        cameraIndex: integer
      ) => {
        const layer = runtimeScene.getLayer(layerName);
        const layerRenderer = layer.getRenderer();

        const threeCamera = layerRenderer.getThreeCamera();
        if (!threeCamera) return;

        threeCamera.rotation.x = gdjs.toRad(angle);
      };

      export const getCameraRotationY = (
        runtimeScene: RuntimeScene,
        layerName: string,
        cameraIndex: integer
      ): float => {
        const layer = runtimeScene.getLayer(layerName);
        const layerRenderer = layer.getRenderer();

        const threeCamera = layerRenderer.getThreeCamera();
        if (!threeCamera) return 0;
        return gdjs.toDegrees(threeCamera.rotation.y);
      };

      export const setCameraRotationY = (
        runtimeScene: RuntimeScene,
        angle: float,
        layerName: string,
        cameraIndex: integer
      ) => {
        const layer = runtimeScene.getLayer(layerName);
        const layerRenderer = layer.getRenderer();

        const threeCamera = layerRenderer.getThreeCamera();
        if (!threeCamera) return;

        threeCamera.rotation.y = gdjs.toRad(angle);
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
        threeCamera.lookAt(
          object.getCenterXInScene(),
          -object.getCenterYInScene(),
          //@ts-ignore
          object.getZ ? object.getZ() : 0
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
        threeCamera.lookAt(x, -y, z);
        // The layer angle takes over the 3D camera Z rotation.
        layer.setCameraRotation(gdjs.toDegrees(-threeCamera.rotation.z));
      };

      export const getNearPlane = (
        runtimeScene: RuntimeScene,
        layerName: string,
        cameraIndex: integer
      ): float => {
        const layer = runtimeScene.getLayer(layerName);
        const layerRenderer = layer.getRenderer();

        const threeCamera = layerRenderer.getThreeCamera();
        if (!threeCamera) return 0;
        return threeCamera.near;
      };

      export const setNearPlane = (
        runtimeScene: RuntimeScene,
        distance: float,
        layerName: string,
        cameraIndex: integer
      ) => {
        const layer = runtimeScene.getLayer(layerName);
        const layerRenderer = layer.getRenderer();

        const threeCamera = layerRenderer.getThreeCamera();
        if (!threeCamera) return;

        threeCamera.near = Math.min(
          // 0 is not a valid value for three js perspective camera:
          // https://threejs.org/docs/#api/en/cameras/PerspectiveCamera.
          Math.max(distance, 0.0001),
          // Near value cannot exceed far value.
          threeCamera.far
        );
        layerRenderer.setThreeCameraDirty(true);
      };

      export const getFarPlane = (
        runtimeScene: RuntimeScene,
        layerName: string,
        cameraIndex: integer
      ): float => {
        const layer = runtimeScene.getLayer(layerName);
        const layerRenderer = layer.getRenderer();

        const threeCamera = layerRenderer.getThreeCamera();
        if (!threeCamera) return 0;
        return threeCamera.far;
      };

      export const setFarPlane = (
        runtimeScene: RuntimeScene,
        distance: float,
        layerName: string,
        cameraIndex: integer
      ) => {
        const layer = runtimeScene.getLayer(layerName);
        const layerRenderer = layer.getRenderer();

        const threeCamera = layerRenderer.getThreeCamera();
        if (!threeCamera) return;

        // Far value cannot be lower than near value
        threeCamera.far = Math.max(distance, threeCamera.near);
        layerRenderer.setThreeCameraDirty(true);
      };

      export const getFov = (
        runtimeScene: RuntimeScene,
        layerName: string,
        cameraIndex: integer
      ): float => {
        const layer = runtimeScene.getLayer(layerName);
        const layerRenderer = layer.getRenderer();

        const threeCamera = layerRenderer.getThreeCamera();
        return threeCamera
          ? threeCamera instanceof THREE.OrthographicCamera
            ? 0
            : threeCamera.fov
          : assumedFovIn2D;
      };

      export const setFov = (
        runtimeScene: RuntimeScene,
        angle: float,
        layerName: string,
        cameraIndex: integer
      ) => {
        const layer = runtimeScene.getLayer(layerName);
        const layerRenderer = layer.getRenderer();

        const threeCamera = layerRenderer.getThreeCamera();
        if (!threeCamera || threeCamera instanceof THREE.OrthographicCamera)
          return;

        threeCamera.fov = Math.min(Math.max(angle, 0), 180);
        layerRenderer.setThreeCameraDirty(true);
      };
    }
  }
}
