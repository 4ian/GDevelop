namespace gdjs {
  export namespace evtTools {
    export namespace spatialSound {
      const logger = new gdjs.Logger('Spatial Sound');
      export const setSoundPosition = (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer,
        x: float,
        y: float,
        z: float
      ) => {
        const sound = runtimeScene.getSoundManager().getSoundOnChannel(channel);
        if (sound) sound.setSpatialPosition(x, y, z);
        else
          logger.error(
            `Cannot set the spatial position of a non-existing sound on channel ${channel}.`
          );
      };
    }
  }
}
