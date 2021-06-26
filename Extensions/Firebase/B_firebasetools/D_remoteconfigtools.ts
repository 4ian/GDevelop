namespace gdjs {
  export namespace evtTools {
    export namespace firebaseTools {
      /**
       * Remote Config Tools
       * @namespace
       */
      export namespace remoteConfig {
        /**
         * Set the interval between auto-config updates.
         */
        export const setAutoUpdateInterval = (interval: integer) => {
          firebase.remoteConfig().settings.minimumFetchIntervalMillis = interval;
        };

        /**
         * Set the default configuration, for when starting the game offline.
         * @param variable - A structure defining the default variables.
         */
        export const setDefaultConfig = (variable: gdjs.Variable) => {
          firebase.remoteConfig().defaultConfig = variable.toJSObject();
        };

        gdjs.evtTools.firebaseTools.onAppCreated.push(() => {
          // Synchronisation seems to be impossible when that value isn't preset.
          firebase.remoteConfig().settings.minimumFetchIntervalMillis = -1;
        });
      }
    }
  }
}
