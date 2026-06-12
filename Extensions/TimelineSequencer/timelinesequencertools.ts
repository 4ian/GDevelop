namespace gdjs {
  export namespace evtTools {
    export namespace timeline {
      export const registerTimelineJson = (
        runtimeScene: gdjs.RuntimeScene,
        timelineJson: string
      ): boolean =>
        gdjs.evtTools.timeline
          .getTimelineManager(runtimeScene)
          .registerTimelinesFromJson(timelineJson);

      export const playTimeline = (
        runtimeScene: gdjs.RuntimeScene,
        timelineName: string
      ): void => {
        gdjs.evtTools.timeline
          .getTimelineManager(runtimeScene)
          .play(timelineName);
      };

      export const playTimelineFromTime = (
        runtimeScene: gdjs.RuntimeScene,
        timelineName: string,
        time: number
      ): void => {
        gdjs.evtTools.timeline
          .getTimelineManager(runtimeScene)
          .play(timelineName, time);
      };

      export const pauseTimeline = (
        runtimeScene: gdjs.RuntimeScene,
        timelineName: string
      ): void => {
        gdjs.evtTools.timeline
          .getTimelineManager(runtimeScene)
          .pause(timelineName);
      };

      export const resumeTimeline = (
        runtimeScene: gdjs.RuntimeScene,
        timelineName: string
      ): void => {
        gdjs.evtTools.timeline
          .getTimelineManager(runtimeScene)
          .resume(timelineName);
      };

      export const stopTimeline = (
        runtimeScene: gdjs.RuntimeScene,
        timelineName: string
      ): void => {
        gdjs.evtTools.timeline
          .getTimelineManager(runtimeScene)
          .stop(timelineName);
      };

      export const seekTimeline = (
        runtimeScene: gdjs.RuntimeScene,
        timelineName: string,
        time: number
      ): void => {
        gdjs.evtTools.timeline
          .getTimelineManager(runtimeScene)
          .seek(timelineName, time);
      };

      export const setTimelineSpeed = (
        runtimeScene: gdjs.RuntimeScene,
        timelineName: string,
        speed: number
      ): void => {
        gdjs.evtTools.timeline
          .getTimelineManager(runtimeScene)
          .setSpeed(timelineName, speed);
      };

      export const setTimelineLoop = (
        runtimeScene: gdjs.RuntimeScene,
        timelineName: string,
        loop: boolean
      ): void => {
        gdjs.evtTools.timeline
          .getTimelineManager(runtimeScene)
          .setLoop(timelineName, loop);
      };

      export const bindTimelineObjectTarget = (
        runtimeScene: gdjs.RuntimeScene,
        bindingName: string,
        objects: Array<gdjs.RuntimeObject>
      ): void => {
        gdjs.evtTools.timeline
          .getTimelineManager(runtimeScene)
          .bindObjects(bindingName, objects);
      };

      export const isTimelinePlaying = (
        runtimeScene: gdjs.RuntimeScene,
        timelineName: string
      ): boolean =>
        gdjs.evtTools.timeline
          .getTimelineManager(runtimeScene)
          .isPlaying(timelineName);

      export const isTimelinePaused = (
        runtimeScene: gdjs.RuntimeScene,
        timelineName: string
      ): boolean =>
        gdjs.evtTools.timeline
          .getTimelineManager(runtimeScene)
          .isPaused(timelineName);

      export const hasTimelineFinished = (
        runtimeScene: gdjs.RuntimeScene,
        timelineName: string
      ): boolean =>
        gdjs.evtTools.timeline
          .getTimelineManager(runtimeScene)
          .hasFinished(timelineName);

      export const hasTimelineReachedMarker = (
        runtimeScene: gdjs.RuntimeScene,
        timelineName: string,
        markerName: string
      ): boolean =>
        gdjs.evtTools.timeline
          .getTimelineManager(runtimeScene)
          .reachedMarker(timelineName, markerName);

      export const timelineTimeGreaterThan = (
        runtimeScene: gdjs.RuntimeScene,
        timelineName: string,
        time: number
      ): boolean =>
        gdjs.evtTools.timeline
          .getTimelineManager(runtimeScene)
          .getCurrentTime(timelineName) > time;

      export const timelineProgressGreaterThan = (
        runtimeScene: gdjs.RuntimeScene,
        timelineName: string,
        progress: number
      ): boolean =>
        gdjs.evtTools.timeline
          .getTimelineManager(runtimeScene)
          .getProgress(timelineName) > progress;

      export const getTimelineTime = (
        runtimeScene: gdjs.RuntimeScene,
        timelineName: string
      ): number =>
        gdjs.evtTools.timeline
          .getTimelineManager(runtimeScene)
          .getCurrentTime(timelineName);

      export const getTimelineDuration = (
        runtimeScene: gdjs.RuntimeScene,
        timelineName: string
      ): number =>
        gdjs.evtTools.timeline
          .getTimelineManager(runtimeScene)
          .getDuration(timelineName);

      export const getTimelineProgress = (
        runtimeScene: gdjs.RuntimeScene,
        timelineName: string
      ): number =>
        gdjs.evtTools.timeline
          .getTimelineManager(runtimeScene)
          .getProgress(timelineName);

      export const getTimelineSpeed = (
        runtimeScene: gdjs.RuntimeScene,
        timelineName: string
      ): number =>
        gdjs.evtTools.timeline
          .getTimelineManager(runtimeScene)
          .getSpeed(timelineName);
    }
  }
}
