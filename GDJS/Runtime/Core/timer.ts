/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * Represents a timer, which must be updated manually with {@link gdjs.Timer.updateTime}.
   */
  export class Timer {
    _name: string;
    _time: float = 0;
    _paused: boolean = false;

    /**
     * @param name The name of the timer.
     */
    constructor(name: string) {
      this._name = name;
    }

    /**
     * Get the name of the timer
     * @return The name of the timer
     */
    getName(): string {
      return this._name;
    }

    /**
     * Get the time of the timer, in milliseconds.
     * @return The time of the timer, in milliseconds.
     */
    getTime(): float {
      return this._time;
    }

    /**
     * Notify the timer that some time has passed.
     * @param time The elapsed time, in milliseconds.
     */
    updateTime(time: float): void {
      if (!this._paused) {
        this._time += time;
      }
    }

    /**
     * Change the time.
     * @param time The new time, in milliseconds.
     */
    setTime(time: float): void {
      this._time = time;
    }

    /**
     * Reset the time to zero.
     */
    reset(): void {
      this.setTime(0);
    }

    /**
     * Set if the timer is paused.
     * @param enable true to pause the timer, false otherwise.
     */
    setPaused(enable: boolean): void {
      this._paused = enable;
    }

    /**
     * Check if the timer is paused.
     */
    isPaused(): boolean {
      return this._paused;
    }
  }
}
