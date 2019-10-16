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

  /** @type Object.<string, Object> */
  this._loadedJsons = {};
};

/**
 * The callback called when a json is preloaded
 * @callback JsonManagerOnProgressCallback
 * @param {number} loaded The number of json files loaded so far
 * @param {number} total The total number to be loaded
 * @returns {undefined} Nothing
 */

/**
 * The callback called when all jsons are preloaded
 * @callback JsonManagerOnCompleteCallback
 * @param {number} total The total number to be loaded
 * @returns {undefined} Nothing
 */

/**
 * Request all the json resources to be preloaded (unless they are marked as not preloaded).
 *
 * @param {JsonManagerOnProgressCallback} onProgress The function called after each json is loaded.
 * @param {JsonManagerOnCompleteCallback} onComplete The function called when all jsons are loaded.
 */
gdjs.JsonManager.prototype.preloadJsons = function(onProgress, onComplete) {
  var resources = this._resources;

  var jsonResources = resources.filter(function(resource) {
    return resource.kind === 'json' && !resource.disablePreload;
  });
  if (jsonResources.length === 0) return onComplete(jsonResources.length);

  var loaded = 0;
  /** @type JsonManagerRequestCallback */
  var onLoad = function(error, jsonContent) {
    if (error) {
      console.error("Error while preloading a json resource:" + error);
    }

    loaded++;
    if (loaded === jsonResources.length) {
      return onComplete(jsonResources.length);
    }

    onProgress(loaded, jsonResources.length);
  };

  for (var i = 0; i < jsonResources.length; ++i) {
    this.loadJson(jsonResources[i].name, onLoad);
  }
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
 * This method is asynchronous. When loaded, the `callback` is called with the error
 * (null if none) and the loaded json (a JS Object).
 *
 * @param {string} resourceName The resource pointing to the json file to load.
 * @param {JsonManagerRequestCallback} callback The callback function called when json is loaded (or an error occured).
 */
gdjs.JsonManager.prototype.loadJson = function(resourceName, callback) {
  var resource = this._resources.find(function(resource) {
    return resource.kind === 'json' && resource.name === resourceName;
  });
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

  var that = this;
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

    // Cache the result
    that._loadedJsons[resourceName] = xhr.response;

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

/**
 * Check if the given json resource was loaded (preloaded or loaded with `loadJson`).
 * @param {string} resourceName The name of the json resource.
 * @returns {boolean} true if the content of the json resource is loaded. false otherwise.
 */
gdjs.JsonManager.prototype.isJsonLoaded = function(resourceName) {
  return !!this._loadedJsons[resourceName];
};

/**
 * Get the object for the given resource that is already loaded (preloaded or loaded with `loadJson`).
 * If the resource is not loaded, `null` will be returned.
 *
 * @param {string} resourceName The name of the json resource.
 * @returns {?Object} the content of the json resource, if loaded. `null` otherwise.
 */
gdjs.JsonManager.prototype.getLoadedJson = function(resourceName) {
  return this._loadedJsons[resourceName] || null;
};
