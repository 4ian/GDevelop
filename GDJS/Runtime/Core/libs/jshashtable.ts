/**
 * A generic map (key-value) container.
 *
 * Used notably for storing lists of objects for
 * GDevelop generated events.
 */
class Hashtable<T> {
  /**
   * The content of the Hashtable. Prefer using methods rather
   * than accessing this internal object, unless you need to iterate
   * on the values.
   */
  items: { [key: string]: T } = {};

  /**
   * Construct a Hashtable from a JS object.
   *
   * @param items The content of the Hashtable.
   * @returns The new hashtable.
   * @static
   */
  static newFrom<T>(items: { [key: string]: T }): Hashtable<T> {
    const hashtable = new Hashtable<T>();
    hashtable.items = items;
    return hashtable;
  }

  /**
   * Add a key-value pair to the Hashtable.
   * If a value already exists for this key, it is overwritten.
   *
   * @param key The key.
   * @param value The value to associate to the key.
   */
  put(key: string | number, value: T) {
    this.items[key] = value;
  }

  /**
   * Get a value corresponding to a key, or undefined if not found.
   *
   * @param key The key associated to the value.
   */
  get(key: string | number) {
    return this.items[key];
  }

  /**
   * Verify if a key exists in the Hashtable.
   *
   * @param key The key to search in the Hashtable.
   * @returns true if the key exists.
   */
  containsKey(key: string | number): boolean {
    return this.items.hasOwnProperty(key);
  }

  /**
   * Remove the value associated to the specified key.
   *
   * @param key The key to remove.
   */
  remove(key: string | number) {
    delete this.items[key];
  }

  /**
   * Get the first key of the Hashtable.
   *
   * @returns The first key of the Hashtable, or undefined if empty.
   */
  firstKey(): string | number | null {
    for (const k in this.items) {
      if (this.items.hasOwnProperty(k)) {
        return k;
      }
    }
    return null;
  }

  /**
   * Dump all the keys of the Hashtable to an array (which is cleared first).
   *
   * @param result The Array where the result gets pushed.
   */
  keys(result: string[]) {
    result.length = 0;
    for (const k in this.items) {
      if (this.items.hasOwnProperty(k)) {
        result.push(k);
      }
    }
  }

  /**
   * Dump all the values of the Hashtable to an array (which is cleared first).
   *
   * @param result The Array where the results get pushed.
   */
  values(result: Array<T>) {
    result.length = 0;
    for (const k in this.items) {
      if (this.items.hasOwnProperty(k)) {
        result.push(this.items[k]);
      }
    }
  }

  /**
   * Clear the Hashtable.
   */
  clear() {
    for (const k in this.items) {
      if (this.items.hasOwnProperty(k)) {
        delete this.items[k];
      }
    }
  }
}
