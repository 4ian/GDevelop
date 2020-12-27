namespace gdjs {
  /**
   * Firebase Tools Collection
   * @fileoverview
   * @author arthuro555
   */

  /**
   * A special array where push tries to reuse old unused indices.
   * Why? This is for storing UIDs. You can see this as a sort of memory optimization:
   * Each time an object is removed, it is replaced with null in the array.
   * Then a new object can reuse that emplacement when pushing, instead of adding an element
   * to the array. Technically the push function is not really pushing anymore,
   * but the name is kept to make it easier for new devs to use (almost same API as classic array).
   * @class
   */
  export class UIDArray {
    /**
     * The internal array of UIDs.
     */
    private _array: any[] = [];

    /**
     * Adds an object to the UIDs array and returns it's UID.
     * @param item - The item to assign a UID to.
     * @returns - The new UID of the object.
     */
    push(item: any): number {
      for (let i in this._array) {
        if (this._array[i] === null) {
          this._array[i] = item;
          return parseInt(i);
        }
      }
      return this._array.push(item) - 1;
    }

    /**
     * Removes an element from the UIDs array by UID.
     * @param uid - The UID of the object to remove.
     */
    remove(uid: number) {
      if (uid >= this._array.length) {
        return;
      }

      // Don't pollute the array with unecessary nulls.
      this._array[uid] = null;
    }

    /**
     * Get an element from the UIDs array by UID.
     * @param uid - The UID of the object to get.
     */
    get(uid: number) {
      if (uid >= this._array.length) {
        return null;
      }

      // Prevent out of range getting.
      return this._array[uid];
    }
  }
}
