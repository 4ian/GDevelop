/**
 * A cache of resources identified by a string.
 *
 * It ensures that a resource is never load twice.
 */
export declare class ResourceCache<T> {
  private _cachedValues;
  /**
   * Several calls can happen before the resource is loaded.
   * This allows to stack them.
   */
  private _callbacks;
  constructor();
  /**
   * Return a resource through a call back.
   * @param key the resource identifier.
   * @param load load the resource in case of cache default.
   * Note that the load callback is used by `getOrLoad` and not by the caller.
   * @param callback called when the resource is ready.
   */
  getOrLoad(
    key: string,
    load: (callback: (value: T | null) => void) => void,
    callback: (value: T | null) => void
  ): void;
}
//# sourceMappingURL=ResourceCache.d.ts.map
