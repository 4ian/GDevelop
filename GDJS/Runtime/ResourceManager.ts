/*
 * GDevelop JS Platform
 * Copyright 2013-2023 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * What a resource manager knows about a loaded resource, shown by the
   * debugger. Every field is optional: a manager fills what it can.
   * @category Resources > Debugging
   */
  export type ResourceDebugMetrics = {
    /** Dimensions in pixels (textures, videos). */
    width?: integer;
    height?: integer;
    /** Duration in seconds (audio, videos). */
    durationInSeconds?: float;
    /** Estimated bytes used in memory (GPU or RAM) by the loaded content. */
    estimatedMemoryBytes?: integer;
    /** Anything else worth showing. */
    extra?: Record<string, string | number | boolean>;
  };

  /**
   * A resource managers that download and remember downloaded content for one
   * kind of resource.
   * @category Resources
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

    /**
     * Describe a loaded resource for the debugger: dimensions, duration,
     * estimated memory... Return null when the resource is not loaded (or
     * when the manager knows nothing about it).
     *
     * Optional: managers without it only report what the loader knows.
     */
    getResourceDebugMetrics?(resourceName: string): ResourceDebugMetrics | null;
  }
}
