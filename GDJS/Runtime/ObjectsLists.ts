/*
 * GDevelop JS Platform
 * Copyright 2013-2023 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Picked objects lists.
 */
class ObjectsLists extends Hashtable<Array<gdjs.RuntimeObject>> {
  /** Is true as soon as an instruction has pick some or every instances */
  isPicked: boolean = false;
}

namespace gdjs {
  export namespace evtTools {
    export namespace objectsLists {
      /**
       * Construct a ObjectsLists from a JS object.
       *
       * @param items The content of the Hashtable.
       * @returns The new picked objects lists.
       */
      export const newFrom = (
        items: {
          [key: string]: Array<gdjs.RuntimeObject>;
        },
        isPicked: boolean
      ): ObjectsLists => {
        const hashtable = new ObjectsLists();
        hashtable.items = items;
        hashtable.isPicked = isPicked;
        return hashtable;
      };
    }
  }
}
