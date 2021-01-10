// @ts-nocheck - TODO: convert this file to use TypeScript namespaces
namespace gdjs {
  /**
   * Firebase Tools Collection
   * @fileoverview
   * @author arthuro555
   */

  /**
   * Remote Config Tools
   * @namespace
   */
  gdjs.evtTools.firebase.remoteConfig = {};

  /**
   * Set the interval between auto-config updates.
   */
  gdjs.evtTools.firebase.remoteConfig.setAutoUpdateInterval = function (
    interval
  ) {
    firebase.remoteConfig().settings.minimumFetchIntervalMillis = interval;
  };

  /**
   * Set the default configuration, for when starting the game offline.
   * @param variable - A structure defining the default variables.
   */
  gdjs.evtTools.firebase.remoteConfig.setDefaultConfig = function (
    variable: gdjs.Variable
  ) {
    firebase.remoteConfig().defaultConfig = JSON.parse(
      gdjs.evtTools.network.variableStructureToJSON(variable)
    );
  };
  gdjs.evtTools.firebase.onAppCreated.push(function () {
    // Synchronisation seems to be impossible when that value isn't preset.
    firebase.remoteConfig().settings.minimumFetchIntervalMillis = -1;
  });
}
