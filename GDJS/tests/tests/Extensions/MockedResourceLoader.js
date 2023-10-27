/*
 * GDevelop JS Platform
 * Copyright 2013-2023 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
// implements gdjs.ResourceManager
gdjs.MockedResourceManager = class MockedResourceManager {

  loadResourceCallbacks = new Map();

  loadResource(resourceName) {
    const that = this;
    return new Promise((resolve, reject) => {
      that.loadResourceCallbacks.set(resourceName, resolve);
    });
  }

  async processResource(resourceName) {}

  /**
   * @param {string} resourceName 
   * @returns {boolean}
   */
  isResourceDownloadPending(resourceName) {
    return this.loadResourceCallbacks.has(resourceName);
  }

  /**
   * @param {string} resourceName 
   */
  markPendingResourcesAsLoaded(resourceName) {
    const loadResourceCallback = this.loadResourceCallbacks.get(resourceName);
    loadResourceCallback();
    this.loadResourceCallbacks.delete(resourceName);
  }

  getResourceKinds() {
    return ['fake-heavy-resource'];
  }
}