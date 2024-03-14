type SearchArea = { minX: float; minY: float; maxX: float; maxY: float };
type SearchedItem<T> = {
  source: T;
  minX: float;
  minY: float;
  maxX: float;
  maxY: float;
};

declare class RBush<T> {
  constructor(maxEntries?: number);
  search(bbox: SearchArea, result?: Array<T>): Array<T>;
  insert(item: SearchedItem<T>): RBush<T>;
  clear(): RBush<T>;
  remove(
    item: SearchedItem<T>,
    equalsFn?: (item: SearchedItem<T>, otherItem: SearchedItem<T>) => boolean
  ): RBush<T>;
}
