/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * JsonManager loads json files (using XMLHttpRequest), using the "json" resources
 * registered in the game resources.
 *
 * Contrary to audio/fonts, json files are loaded asynchronously, when requested.
 * You should properly handle errors, and give the developer/player a way to know
 * that loading failed.
 *
 * @class JsonManager
 * @memberof gdjs
 * @param {Object[]} resources The resources data of the game.
 */
gdjs.JsonManager = function(resources) {
  this._resources = resources;
};

/**
 * The callback called when a json that was requested is loaded (or an error occured).
 * @callback JsonManagerRequestCallback
 * @param {?Error} error The error, if any. `null` otherwise.
 * @param {?Object} jsonContent The content of the json file (or null if an error occured).
 * @returns {undefined} Nothing
 */

/**
 * Request the json file from the given resource name.
 * When loaded, the `callback` is called with the error (null if none) and the loaded
 * json (string).
 *
 * @param {string} resourceName The resource pointing to the json file to load.
 * @param {JsonManagerRequestCallback} callback The callback function called when json is loaded (or an error occured).
 */
gdjs.JsonManager.prototype.loadJson = function(resourceName, callback) {
  var resource = this._resources.find(
    resource => resource.kind === 'json' && resource.name === resourceName
  );
  if (!resource) {
    callback(
      new Error(
        'Can\'t find resource with name: "' +
          resourceName +
          '" (or is not a json resource).'
      ),
      null
    );
    return;
  }

  var xhr = new XMLHttpRequest();
  xhr.responseType = 'json';
  xhr.open('GET', resource.file);
  xhr.onload = function() {
    if (xhr.status !== 200) {
      callback(
        new Error('HTTP error: ' + xhr.status + '(' + xhr.statusText + ')'),
        null
      );
      return;
    }

    callback(null, xhr.response);
  };
  xhr.onerror = function() {
    callback(new Error('Network error'), null);
  };
  xhr.onabort = function() {
    callback(new Error('Request aborted'), null);
  };
  xhr.send();
};
