/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  declare interface TimeManagerSyncData {
    elapsedTime: float;
    timeScale: float;
    timeFromStart: float;
    firstFrame: boolean;
    timers: Hashtable<TimerNetworkSyncData>;
    firstUpdateDone: boolean;
  }
  /**
   * Manage the timers and times elapsed during last
   * frame, since the beginning of the scene and other time related values.
   * All durations are expressed in milliseconds.
   * @group Core Engine
   */
  export class TimeManager {
    _elapsedTime: float = 0;
    _timeScale: float = 1;
    _timeFromStart: float = 0;
    _firstFrame: boolean = true;
    _timers: Hashtable<gdjs.Timer> = new Hashtable();
    _firstUpdateDone: boolean = false;

    constructor() {
      this.reset();
    }

    reset(): void {
      this._elapsedTime = 0;
      this._timeScale = 1;
      this._timeFromStart = 0;
      this._firstFrame = true;
      this._timers = new Hashtable();
    }

    update(elapsedTime: float, minimumFPS: integer): void {
      if (this._firstUpdateDone) {
        this._firstFrame = false;
      }
      this._firstUpdateDone = true;

      //Compute the elapsed time since last frame
      this._elapsedTime = Math.min(elapsedTime, 1000 / minimumFPS);
      this._elapsedTime *= this._timeScale;

      //Update timers and others members
      for (const name in this._timers.items) {
        if (this._timers.items.hasOwnProperty(name)) {
          this._timers.items[name].updateTime(this._elapsedTime);
        }
      }
      this._timeFromStart += this._elapsedTime;
    }

    /**
     * Set the time scale: time will be slower if time scale is < 1,
     * faster if > 1.
     * @param timeScale The new time scale (must be positive).
     */
    setTimeScale(timeScale: float): void {
      if (timeScale >= 0) {
        this._timeScale = timeScale;
      }
    }

    getNetworkSyncData(): TimeManagerSyncData {
      const timerNetworkSyncDatas = new Hashtable<TimerNetworkSyncData>();
      Object.entries(this._timers.items).forEach(([key, timer]) => {
        timerNetworkSyncDatas.put(key, timer.getNetworkSyncData());
      });

      return {
        elapsedTime: this._elapsedTime,
        timeScale: this._timeScale,
        timeFromStart: this._timeFromStart,
        firstFrame: this._firstFrame,
        timers: timerNetworkSyncDatas,
        firstUpdateDone: this._firstUpdateDone,
      };
    }

    updateFromNetworkSyncData(syncData: TimeManagerSyncData): void {
      if (syncData.elapsedTime !== undefined) {
        this._elapsedTime = syncData.elapsedTime;
      }
      if (syncData.timeScale !== undefined) {
        this._timeScale = syncData.timeScale;
      }
      if (syncData.timeFromStart !== undefined) {
        this._timeFromStart = syncData.timeFromStart;
      }
      if (syncData.firstFrame !== undefined) {
        this._firstFrame = syncData.firstFrame;
      }
      if (syncData.timers !== undefined) {
        this._timers.clear();
        Object.entries(syncData.timers.items).forEach(([key, timerData]) => {
          const newTimer = new gdjs.Timer(timerData.name);
          newTimer.updateFromNetworkSyncData(timerData);
          this._timers.put(key, newTimer);
        });
      }

      if (syncData.firstUpdateDone !== undefined) {
        this._firstUpdateDone = syncData.firstUpdateDone;
      }
    }
    /**
     * Get the time scale.
     * @return The time scale (positive, 1 is normal speed).
     */
    getTimeScale(): float {
      return this._timeScale;
    }

    /**
     * Get the time since the instantiation of the manager (i.e: since
     * the beginning of the scene most of the time), in milliseconds.
     */
    getTimeFromStart(): float {
      return this._timeFromStart;
    }

    /**
     * Return true if update was called only once (i.e: if the scene
     * is rendering its first frame).
     */
    isFirstFrame(): boolean {
      return this._firstFrame;
    }

    /**
     * Return the time elapsed since the last call to update
     * (i.e: the last frame), in milliseconds.
     */
    getElapsedTime(): float {
      return this._elapsedTime;
    }

    addTimer(name: string): void {
      this._timers.put(name, new gdjs.Timer(name));
    }

    hasTimer(name: string): boolean {
      return this._timers.containsKey(name);
    }

    getTimer(name: string): gdjs.Timer {
      return this._timers.get(name);
    }

    removeTimer(name: string): void {
      if (this._timers.containsKey(name)) {
        this._timers.remove(name);
      }
    }
  }
}
