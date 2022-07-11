/**
 * A cache of resources identified by a string.
 *
 * It ensures that a resource is never load twice.
 */
export class ResourceCache<T> {
  private _cachedValues: Map<string, T>;

  /**
   * Several calls can happen before the resource is loaded.
   * This allows to stack them.
   */
  private _callbacks: Map<string, Array<(value: T | null) => void>>;

  constructor() {
    this._cachedValues = new Map<string, T>();
    this._callbacks = new Map<string, Array<(value: T | null) => void>>();
  }

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
  ): void {
    // Check if the value is in the cache.
    {
      const value = this._cachedValues.get(key);
      if (value) {
        callback(value);
        return;
      }
    }
    // Check if the value is being loading.
    {
      const callbacks = this._callbacks.get(key);
      if (callbacks) {
        callbacks.push(callback);
        return;
      } else {
        this._callbacks.set(key, [callback]);
      }
    }

    load((value) => {
      if (value) {
        this._cachedValues.set(key, value);
      }
      const callbacks = this._callbacks.get(key)!;
      this._callbacks.delete(key);
      for (const callback of callbacks) {
        callback(value);
      }
    });
  }
}
