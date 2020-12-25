/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * OnceTriggers is used to store the status of the conditions "Trigger once",
   * that are used in events to have conditions that are only valid for one frame in a row.
   *
   * @memberof gdjs
   * @class OnceTriggers
   */
  export class OnceTriggers {
    _onceTriggers: any = {};
    _lastFrameOnceTrigger: any = {};

    /**
     * To be called when events begin so that "Trigger once" conditions
     * are properly handled.
     */
    startNewFrame() {
      this._clearObject(this._lastFrameOnceTrigger);
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
    triggerOnce(triggerId) {
      this._onceTriggers[triggerId] = true;
      return !this._lastFrameOnceTrigger.hasOwnProperty(triggerId);
    }

    _clearObject(obj) {
      for (const k in obj) {
        if (obj.hasOwnProperty(k)) {
          delete obj[k];
        }
      }
    }
  }
}
