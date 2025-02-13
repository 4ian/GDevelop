namespace gdjs {
  export namespace evtTools {
    export namespace spatialSound {
      export const setSoundPosition = (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        channel: integer,
        x: float,
        y: float,
        z: float
      ) => {
        // TODO EBO The position must be transform to the scene position when it comes from a custom object.
        const soundManager = instanceContainer.getScene().getSoundManager();
        soundManager.setSoundSpatialPositionOnChannel(channel, x, y, z);
      };
    }
  }
}
