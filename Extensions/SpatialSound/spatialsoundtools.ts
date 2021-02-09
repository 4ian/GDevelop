namespace gdjs {
  export namespace evtTools {
    export namespace spatialSound {
      export const setSoundPosition = (
        runtimeScene: gdjs.RuntimeScene,
        channel: integer,
        x: float,
        y: float,
        z: float
      ) =>
        runtimeScene
          .getSoundManager()
          .getSoundOnChannel(channel)
          .setSpatialPosition(x, y, z);
    }
  }
}
