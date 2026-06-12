namespace gdjs {
  export interface RuntimeScene {
    _timelineSequencer?: gdjs.evtTools.timeline.TimelineManager;
  }

  export namespace evtTools {
    export namespace timeline {
      export class TimelineManager {
        private _runtimeScene: gdjs.RuntimeScene;
        private _timelines = new Map<string, TimelineData>();
        private _players = new Map<
          string,
          gdjs.evtTools.timeline.TimelinePlayer
        >();
        private _bindings = new Map<string, Array<gdjs.RuntimeObject>>();

        constructor(runtimeScene: gdjs.RuntimeScene) {
          this._runtimeScene = runtimeScene;
          this.loadTimelinesFromProjectProperties();
        }

        loadTimelinesFromProjectProperties(): void {
          const serializedTimelines = this._runtimeScene
            .getGame()
            .getExtensionProperty('TimelineSequencer', 'timelines');
          if (!serializedTimelines) {
            return;
          }
          this.registerTimelinesFromJson(serializedTimelines);
        }

        registerTimelinesFromJson(json: string): boolean {
          try {
            const parsed = JSON.parse(json);
            const timelines = Array.isArray(parsed)
              ? parsed
              : Array.isArray(parsed.timelines)
                ? parsed.timelines
                : [];
            for (const timeline of timelines) {
              this.registerTimeline(timeline);
            }
            return true;
          } catch (error) {
            console.error(
              'Unable to parse TimelineSequencer timelines:',
              error
            );
            return false;
          }
        }

        registerTimeline(timeline: TimelineData): void {
          if (!timeline || !timeline.name) {
            return;
          }
          this._timelines.set(timeline.name, timeline);
          if (this._players.has(timeline.name)) {
            this._players.delete(timeline.name);
          }
        }

        hasTimeline(name: string): boolean {
          return this._timelines.has(name);
        }

        getTimeline(name: string): TimelineData | null {
          return this._timelines.get(name) || null;
        }

        getPlayer(name: string): gdjs.evtTools.timeline.TimelinePlayer | null {
          const existingPlayer = this._players.get(name);
          if (existingPlayer) {
            return existingPlayer;
          }

          const timeline = this.getTimeline(name);
          if (!timeline) {
            return null;
          }

          const player = new gdjs.evtTools.timeline.TimelinePlayer(
            this._runtimeScene,
            timeline,
            this._bindings
          );
          this._players.set(name, player);
          return player;
        }

        play(name: string, fromTime: number = 0): void {
          const player = this.getPlayer(name);
          if (player) {
            player.play(fromTime);
          }
        }

        pause(name: string): void {
          const player = this.getPlayer(name);
          if (player) {
            player.pause();
          }
        }

        resume(name: string): void {
          const player = this.getPlayer(name);
          if (player) {
            player.resume();
          }
        }

        stop(name: string): void {
          const player = this.getPlayer(name);
          if (player) {
            player.stop();
          }
        }

        seek(name: string, time: number): void {
          const player = this.getPlayer(name);
          if (player) {
            player.seek(time);
          }
        }

        setSpeed(name: string, speed: number): void {
          const player = this.getPlayer(name);
          if (player) {
            player.setSpeed(speed);
          }
        }

        setLoop(name: string, loop: boolean): void {
          const player = this.getPlayer(name);
          if (player) {
            player.setLoop(loop);
          }
        }

        bindObjects(
          bindingName: string,
          objects: Array<gdjs.RuntimeObject>
        ): void {
          this._bindings.set(bindingName, objects.slice());
        }

        update(deltaTime: number): void {
          this._players.forEach((player) => player.update(deltaTime));
        }

        isPlaying(name: string): boolean {
          const player = this.getPlayer(name);
          return !!player && player.isPlaying();
        }

        isPaused(name: string): boolean {
          const player = this.getPlayer(name);
          return !!player && player.isPaused();
        }

        hasFinished(name: string): boolean {
          const player = this.getPlayer(name);
          return !!player && player.hasFinished();
        }

        reachedMarker(name: string, markerName: string): boolean {
          const player = this.getPlayer(name);
          return !!player && player.reachedMarker(markerName);
        }

        getCurrentTime(name: string): number {
          const player = this.getPlayer(name);
          return player ? player.getCurrentTime() : 0;
        }

        getDuration(name: string): number {
          const timeline = this.getTimeline(name);
          return timeline ? timeline.duration || 0 : 0;
        }

        getProgress(name: string): number {
          const player = this.getPlayer(name);
          return player ? player.getProgress() : 0;
        }

        getSpeed(name: string): number {
          const player = this.getPlayer(name);
          return player ? player.getSpeed() : 1;
        }
      }

      export const getTimelineManager = (
        runtimeScene: gdjs.RuntimeScene
      ): TimelineManager => {
        if (!runtimeScene._timelineSequencer) {
          runtimeScene._timelineSequencer = new TimelineManager(runtimeScene);
        }
        return runtimeScene._timelineSequencer;
      };

      gdjs.registerRuntimeScenePostEventsCallback((runtimeScene) => {
        const manager = runtimeScene._timelineSequencer;
        if (!manager) {
          return;
        }
        manager.update(runtimeScene.getElapsedTime() / 1000);
      });

      gdjs.registerRuntimeSceneUnloadedCallback((runtimeScene) => {
        runtimeScene._timelineSequencer = undefined;
      });
    }
  }
}
