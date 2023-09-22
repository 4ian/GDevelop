/*
 * GDevelop JS Platform
 * Copyright 2013-2023 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
// implements gdjs.ResourceManager
gdjs.MockedResourceManager = class MockedResourceManager {

  loadResourceCallbacks = [];

  loadResource(resourceName) {
    const that = this;
    return new Promise((resolve, reject) => {
      that.loadResourceCallbacks.push(resolve);
    });
  }

  markAllPendingResourcesAsLoaded() {
    for (const loadResourceCallback of this.loadResourceCallbacks) {
      loadResourceCallback();
    }
    this.loadResourceCallbacks.length = 0;
  }

  getResourceKinds() {
    return ['fake-heavy-resource'];
  }
}