export declare class ResourceCache<T> {
  private _cachedValues;
  private _callbacks;
  /**
   *
   */
  constructor();
  getOrLoad(
    key: string,
    load: (callback: (value: T | null) => void) => void,
    callback: (value: T | null) => void
  ): void;
}
//# sourceMappingURL=ResourceCache.d.ts.map
