/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * OnceTriggers is used to store the status of the conditions "Trigger once",
   * that are used in events to have conditions that are only valid for one frame in a row.
   */
  export class OnceTriggers {
    _onceTriggers: Record<integer, boolean> = {};
    _lastFrameOnceTrigger: Record<integer, boolean> = {};

    /**
     * To be called when events begin so that "Trigger once" conditions
     * are properly handled.
     */
    startNewFrame(): void {
      // Clear triggers from 2 frames ago
      for (const k in this._lastFrameOnceTrigger)
        if (this._lastFrameOnceTrigger.hasOwnProperty(k))
          delete this._lastFrameOnceTrigger[k];

      // Move triggers from this frame to last frame
      for (const k in this._onceTriggers) {
        if (this._onceTriggers.hasOwnProperty(k)) {
          this._lastFrameOnceTrigger[k] = this._onceTriggers[k];
          delete this._onceTriggers[k];
        }
      }
    }

    /**
     * Used by "Trigger once" conditions: return true only if
     * this method was not called with the same identifier during the last frame.
     * @param triggerId The identifier of the "Trigger once" condition.
     */
    triggerOnce(triggerId: integer): boolean {
      this._onceTriggers[triggerId] = true;
      return !this._lastFrameOnceTrigger.hasOwnProperty(triggerId);
    }
  }
}
