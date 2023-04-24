namespace gdjs {
  export namespace threeD {
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
        if (threeCamera) {
          return threeCamera.position.z;
        }

        // No 3D camera found, compute the imaginary Z position as if we had a 3D camera.
        const zoomFactor = layer.getCameraZoom();
        const cameraFovInRadians = gdjs.toRad(assumedFovIn2D);
        const cameraZPosition =
          (0.5 * layer.getHeight()) /
          zoomFactor /
          Math.tan(0.5 * cameraFovInRadians);

        return cameraZPosition;
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

        const fov = threeCamera ? threeCamera.fov : assumedFovIn2D;
        const cameraFovInRadians = gdjs.toRad(fov);

        const zoomFactor =
          (0.5 * layer.getHeight()) / (z * Math.tan(0.5 * cameraFovInRadians));

        if (Number.isFinite(zoomFactor) && zoomFactor > 0)
          layer.setCameraZoom(zoomFactor);
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
    }
  }
}
