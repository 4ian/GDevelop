/*
 * GDevelop JS Platform
 * Copyright 2013-2023 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * A resource managers that download and remember downloaded content for one
   * kind of resource.
   */
  export interface ResourceManager {
    /**
     * Load the specified resource.
     */
    loadResource(resourceName: string): Promise<void>;

    /**
     * Return the kind of resources handled by this manager.
     */
    getResourceKinds(): Array<ResourceKind>;
  }
}
