namespace gdjs {
  export namespace evtTools {
    export namespace spatialSound {
      const logger = new gdjs.Logger('Spatial Sound');
      export const setSoundPosition = (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        channel: integer,
        x: float,
        y: float,
        z: float
      ) => {
        // TODO EBO The position must be transform to the scene position when it comes from a custom object.
        const sound = instanceContainer
          .getScene()
          .getSoundManager()
          .getSoundOnChannel(channel);
        if (sound) sound.setSpatialPosition(x, y, z);
        else
          logger.error(
            `Cannot set the spatial position of a non-existing sound on channel ${channel}.`
          );
      };
    }
  }
}
