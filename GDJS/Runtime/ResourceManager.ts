/*
 * GDevelop JS Platform
 * Copyright 2013-2023 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * A resource managers that download and remember downloaded content for one
   * kind of resource.
   * @group Resources
   */
  export interface ResourceManager {
    /**
     * Load the specified resource.
     *
     * This method will be run during the game. It should only do light tasks
     * like file downloading.
     */
    loadResource(resourceName: string): Promise<void>;

    /**
     * Process the specified resource.
     *
     * This method will only be run while loading screen is shown. It can do
     * heavy tasks like parsing data.
     */
    processResource(resourceName: string): Promise<void>;

    /**
     * Return the kind of resources handled by this manager.
     */
    getResourceKinds(): Array<ResourceKind>;

    /**
     * Clear all resources, data, loaders stored by this manager.
     * Using the manager after calling this method is undefined behavior.
     */
    dispose(): void;

    /**
     * Clear any data in cache for a resource. Embedded resources are also
     * cleared.
     *
     * Usually called when scene resources are unloaded.
     *
     * @param resourceData The resource to clear
     */
    unloadResource(resourceData: ResourceData): void;
  }
}
