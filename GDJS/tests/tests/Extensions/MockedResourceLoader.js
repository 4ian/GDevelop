// @ts-check
/*
 * GDevelop JS Platform
 * Copyright 2013-2023 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
/**
 * @implements {gdjs.ResourceManager}
 */
gdjs.MockedResourceManager = class MockedResourceManager {
  loadResourcePromises = new Map();
  loadResourceCallbacks = new Map();
  loadResourceRejectCallbacks = new Map();
  disposedResources = new Set();
  loadedResources = new Set();
  waitingForProcessing = new Set();
  readyResources = new Set();

  loadResource(resourceName) {
    if (
      this.loadedResources.has(resourceName) ||
      this.waitingForProcessing.has(resourceName)
    ) {
      return Promise.resolve();
    }

    const existingPromise = this.loadResourcePromises.get(resourceName);
    if (existingPromise) {
      return existingPromise;
    }

    const promise = new Promise((resolve, reject) => {
      this.loadResourceCallbacks.set(resourceName, resolve);
      this.loadResourceRejectCallbacks.set(resourceName, reject);
    });
    this.loadResourcePromises.set(resourceName, promise);
    return promise;
  }

  /**
   * Make the pending download of a resource fail (the loader will retry it).
   * @param {string} resourceName
   * @param {string} errorMessage
   */
  failPendingResource(resourceName, errorMessage) {
    const rejectCallback = this.loadResourceRejectCallbacks.get(resourceName);
    if (!rejectCallback) {
      throw new Error(
        `Resource ${resourceName} was not being loaded, so cannot be marked as failed.`
      );
    }
    this.loadResourceCallbacks.delete(resourceName);
    this.loadResourceRejectCallbacks.delete(resourceName);
    this.loadResourcePromises.delete(resourceName);
    rejectCallback(new Error(errorMessage));
  }

  /**
   * Describe a ready resource for the debugger (see `gdjs.ResourceManager`).
   * @param {string} resourceName
   * @returns {gdjs.ResourceDebugMetrics | null}
   */
  getResourceDebugMetrics(resourceName) {
    return this.readyResources.has(resourceName)
      ? { estimatedMemoryBytes: 1024, extra: { mocked: true } }
      : null;
  }

  async processResource(resourceName) {
    // Mark resource as fully processed
    this.readyResources.add(resourceName);
  }

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
    if (loadResourceCallback) {
      this.loadedResources.add(resourceName);
      loadResourceCallback();
      this.loadResourceCallbacks.delete(resourceName);
      this.loadResourceRejectCallbacks.delete(resourceName);
      this.loadResourcePromises.delete(resourceName);
    } else {
      throw new Error(
        `Resource ${resourceName} was not being loaded, so cannot be marked as loaded.`
      );
    }
  }

  /**
   * Check if a resource is loaded (but maybe not yet processed)
   */
  isResourceLoaded(resourceName) {
    return this.loadedResources.has(resourceName);
  }

  /**
   * Check if a resource has been disposed
   */
  isResourceDisposed(resourceName) {
    return this.disposedResources.has(resourceName);
  }

  /**
   * Dispose all resources
   */
  dispose() {
    for (const resourceName of this.loadedResources) {
      this.disposedResources.add(resourceName);
    }
    this.loadedResources.clear();
    this.loadResourceCallbacks.clear();
    this.loadResourcePromises.clear();
  }

  /**
   * Dispose specific resource
   */
  unloadResource(resource) {
    this.disposedResources.add(resource.name);
    this.loadedResources.delete(resource.name);
    this.waitingForProcessing.delete(resource.name);
    this.readyResources.delete(resource.name);
    this.loadResourceCallbacks.delete(resource.name);
    this.loadResourcePromises.delete(resource.name);
  }

  /**
   * @returns {ResourceKind[]}
   */
  getResourceKinds() {
    return ['fake-resource-kind-for-testing-only'];
  }
};
