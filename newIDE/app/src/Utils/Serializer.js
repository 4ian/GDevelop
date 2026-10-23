// @flow
const gd: libGDevelop = global.gd;

/**
 * Options that affect how a project (or any serializable) is converted to JSON.
 */
export type SerializationOptions = {|
  /**
   * When true, the C++ serializer writes default values for properties that
   * would normally be omitted (e.g. `disabled: false`, `folded: false`,
   * empty `events`/`variables` arrays, etc.) and writes JSON object keys in
   * alphabetical order. This makes git diffs minimal and shift-free when
   * toggling flags or adding/removing sub-events.
   */
  canonicalEventSerialization?: boolean,
|};

/**
 * Helper to run a serialization callback with the canonical mode flag
 * temporarily enabled in the gd.Serializer. Always resets the flag,
 * even if `callback` throws.
 *
 * The flag is global to the gd.Serializer (and to the C++ side), so we must
 * be careful to reset it: leaving it on would silently change the format of
 * every subsequent serialization (including ones that don't expect it).
 */
function withSerializationOptions<T>(
  options: ?SerializationOptions,
  callback: () => T
): T {
  const useCanonical = !!(options && options.canonicalEventSerialization);
  if (!useCanonical) {
    return callback();
  }

  const previous = gd.Serializer.isCanonicalMode();
  gd.Serializer.setCanonicalMode(true);
  try {
    return callback();
  } finally {
    gd.Serializer.setCanonicalMode(previous);
  }
}

/**
 * Tool function to save a serializable object to a JS object.
 * Most gd.* objects are "serializable", meaning they have a serializeTo
 * and unserializeFrom method.
 *
 * @param {*} serializable
 * @param {*} methodName The name of the serialization method. "serializeTo" by default
 * @param {*} options Optional serialization options (e.g. canonical mode)
 */
export function serializeToJSObject(
  serializable: gdSerializable,
  methodName: string = 'serializeTo',
  options: ?SerializationOptions = undefined
): any {
  return withSerializationOptions(options, () => {
    const serializedElement = new gd.SerializerElement();
    try {
      serializable[methodName](serializedElement);

      // JSON.parse + toJSON is 30% faster than gd.Serializer.toJSObject.
      const json = gd.Serializer.toJSON(serializedElement);

      try {
        return JSON.parse(json);
      } catch (error) {
        console.error(
          'Invalid JSON when serializing to JS object. toJSON should always return a valid JSON string.',
          { json, error }
        );
        throw error;
      }
    } finally {
      serializedElement.delete();
    }
  });
}

export function serializeObjectWithCleanDefaultBehaviorFlags(
  object: gdObject
): any {
  const serializedElement = new gd.SerializerElement();
  gd.BehaviorDefaultFlagClearer.serializeObjectWithCleanDefaultBehaviorFlags(
    object,
    serializedElement
  );

  // JSON.parse + toJSON is 30% faster than gd.Serializer.toJSObject.
  const json = gd.Serializer.toJSON(serializedElement);
  try {
    const object = JSON.parse(json);

    serializedElement.delete();
    return object;
  } catch (error) {
    serializedElement.delete();
    console.error(
      'Invalid JSON when serializing to JS object. toJSON should always return a valid JSON string.',
      { json, error }
    );
    throw error;
  }
}

export function serializeToObjectAsset(
  project: gdProject,
  object: gdObject,
  objectFullName: string,
  usedResourceNames: Array<string>,
  extensionDependencyCache: gdExtensionDependencyCache
): any {
  const usedResourceNamesVector = new gd.VectorString();
  const serializedElement = new gd.SerializerElement();
  gd.ObjectAssetSerializer.serializeTo(
    project,
    object,
    objectFullName,
    serializedElement,
    usedResourceNamesVector,
    extensionDependencyCache
  );
  usedResourceNames.push(...usedResourceNamesVector.toJSArray());
  usedResourceNamesVector.delete();

  // JSON.parse + toJSON is 30% faster than gd.Serializer.toJSObject.
  const objectAsset = JSON.parse(gd.Serializer.toJSON(serializedElement));
  serializedElement.delete();

  return objectAsset;
}

/**
 * Tool function to save a serializable object to a JSON.
 * Most gd.* objects are "serializable", meaning they have a serializeTo
 * and unserializeFrom method.
 *
 * @param {*} serializable
 * @param {*} methodName The name of the serialization method. "unserializeFrom" by default
 * @param {*} options Optional serialization options (e.g. canonical mode)
 */
export function serializeToJSON(
  serializable: gdSerializable,
  methodName: string = 'serializeTo',
  options: ?SerializationOptions = undefined
): string {
  return withSerializationOptions(options, () => {
    const serializedElement = new gd.SerializerElement();
    try {
      serializable[methodName](serializedElement);

      // toJSON is 20% faster than gd.Serializer.toJSObject + JSON.stringify.
      return gd.Serializer.toJSON(serializedElement);
    } finally {
      serializedElement.delete();
    }
  });
}

/**
 * POSIX / editor convention: text files end with a newline. Use when persisting `.json`.
 */
export function addFinalNewline(json: string): string {
  return json.endsWith('\n') ? json : json + '\n';
}

/**
 * Tool function to restore a serializable object from a JS object.
 * Most gd.* objects are "serializable", meaning they have a serializeTo
 * and unserializeFrom method.
 * @param {*} serializable A gd.* object to restore
 * @param {*} object The JS object to be used to restore the serializable.
 * @param {*} methodName The name of the unserialization method. "unserializeFrom" by default
 * @param {*} optionalProject The project to pass as argument for unserialization
 */
export function unserializeFromJSObject(
  serializable: gdSerializable,
  object: Object,
  methodName: string = 'unserializeFrom',
  optionalProject: ?gdProject = undefined
) {
  const serializedElement = gd.Serializer.fromJSObject(object);
  try {
    if (!optionalProject) {
      serializable[methodName](serializedElement);
    } else {
      // It's not uncommon for unserializeFrom methods of gd.* classes
      // to require the project to be passed as first argument.
      serializable[methodName](optionalProject, serializedElement);
    }
  } finally {
    serializedElement.delete();
  }
}

export function unserializeResourceFromJSObject(
  resource: gdResource,
  object: Object
) {
  const serializedElement = gd.Serializer.fromJSObject(object);
  gd.ResourcesContainer.unserializeResourceFrom(resource, serializedElement);
  serializedElement.delete();
}

// A project is serialized and unserialized one part at a time: first the rest
// of the project, then each of its layouts, external events and external
// layouts. The elements of the whole project take several times the memory of
// the project itself: this keeps in memory the elements of only one part at a
// time, so that big projects don't run out of WebAssembly memory. The rest of
// the project (extensions, global objects and variables, resources...) is still
// serialized at once.

type ProjectPartList = {|
  listName: string,
  deprecatedListName: string,
  itemName: string,
  getPartsCount: (project: gdProject) => number,
  getPartAt: (project: gdProject, index: number) => gdSerializable,
  unserializeAndInsertPartFrom: (
    project: gdProject,
    serializedElement: gdSerializerElement
  ) => void,
|};

// In the order of the lists in the project, with the names read by
// `Project::UnserializeFrom`.
const projectPartLists: Array<ProjectPartList> = [
  {
    listName: 'layouts',
    deprecatedListName: 'Scenes',
    itemName: 'layout',
    getPartsCount: project => project.getLayoutsCount(),
    getPartAt: (project, index) => project.getLayoutAt(index),
    unserializeAndInsertPartFrom: (project, serializedElement) => {
      project.unserializeAndInsertLayoutFrom(serializedElement);
    },
  },
  {
    listName: 'externalEvents',
    deprecatedListName: 'ExternalEvents',
    itemName: 'externalEvents',
    getPartsCount: project => project.getExternalEventsCount(),
    getPartAt: (project, index) => project.getExternalEventsAt(index),
    unserializeAndInsertPartFrom: (project, serializedElement) => {
      project.unserializeAndInsertExternalEventsFrom(serializedElement);
    },
  },
  {
    listName: 'externalLayouts',
    deprecatedListName: 'ExternalLayouts',
    itemName: 'externalLayout',
    getPartsCount: project => project.getExternalLayoutsCount(),
    getPartAt: (project, index) => project.getExternalLayoutAt(index),
    unserializeAndInsertPartFrom: (project, serializedElement) => {
      project.unserializeAndInsertExternalLayoutFrom(serializedElement);
    },
  },
];

let emptyElementToReleaseLastJSON: ?gdSerializerElement = null;

// gd.Serializer.toJSON keeps its last result in the WebAssembly memory (in a
// static string of the bindings), and frees it only once the next result is
// built. Converting an empty element frees it, so that the JSON of the rest of
// the project or of a part is not in memory with the elements of the next part.
const releaseLastJSON = () => {
  const emptyElement =
    emptyElementToReleaseLastJSON || new gd.SerializerElement();
  emptyElementToReleaseLastJSON = emptyElement;
  gd.Serializer.toJSON(emptyElement);
};

/**
 * Serialize a project to a JS object, one part at a time. The result is the
 * same as `serializeToJSObject(project, 'serializeTo', options)`.
 */
export function serializeProjectToJSObject(
  project: gdProject,
  options: ?SerializationOptions = undefined
): any {
  return withSerializationOptions(options, () => {
    // The lists of the parts are written empty, at their usual place.
    const projectObject = serializeToJSObject(
      project,
      'serializeWithoutLayoutsAndExternalsTo'
    );
    releaseLastJSON();
    projectPartLists.forEach(({ listName, getPartsCount, getPartAt }) => {
      const partsCount = getPartsCount(project);
      for (let index = 0; index < partsCount; index++) {
        projectObject[listName].push(
          serializeToJSObject(getPartAt(project, index))
        );
        releaseLastJSON();
      }
    });
    return projectObject;
  });
}

/**
 * Serialize a project to JSON, one part at a time. The result is the same as
 * `serializeToJSON(project, 'serializeTo', options)`.
 */
export function serializeProjectToJSON(
  project: gdProject,
  options: ?SerializationOptions = undefined
): string {
  return withSerializationOptions(options, () => {
    // Each part is written as a marker in the JSON of the rest of the project,
    // then replaced by its own JSON. The random part makes it practically
    // impossible for a string of the project to be a marker.
    const markerPrefix = `__GDevelopProjectPart_${Math.random()
      .toString(36)
      .slice(2)}_`;
    const parts: Array<gdSerializable> = [];
    const serializeRestOfProjectToJSON = (): string => {
      const serializedElement = new gd.SerializerElement();
      try {
        project.serializeWithoutLayoutsAndExternalsTo(serializedElement);
        projectPartLists.forEach(
          ({ listName, itemName, getPartsCount, getPartAt }) => {
            const listElement = serializedElement.getChild(listName);
            const partsCount = getPartsCount(project);
            for (let index = 0; index < partsCount; index++) {
              listElement
                .addChild(itemName)
                .setStringValue(markerPrefix + parts.length);
              parts.push(getPartAt(project, index));
            }
          }
        );
        return gd.Serializer.toJSON(serializedElement);
      } finally {
        // Deleted before serializing the parts, so that its elements are never
        // in memory with the ones of a part.
        serializedElement.delete();
      }
    };

    // Splitting on the markers gives the JSON around them, and the index of
    // each part in between.
    const segments = serializeRestOfProjectToJSON().split(
      new RegExp(`"${markerPrefix}(\\d+)"`)
    );
    releaseLastJSON();
    if (segments.length !== 2 * parts.length + 1) {
      throw new Error(
        'Unable to serialize the project: a part marker was found in the project itself.'
      );
    }
    return segments
      .map((segment, segmentIndex) => {
        if (segmentIndex % 2 === 0) return segment;

        const partJson = serializeToJSON(parts[Number(segment)]);
        releaseLastJSON();
        return partJson;
      })
      .join('');
  });
}

/**
 * Unserialize a project from a JS object, one part at a time. The result is
 * the same as `unserializeFromJSObject(project, projectObject)`.
 */
export function unserializeProjectFromJSObject(
  project: gdProject,
  projectObject: Object
) {
  // A missing list is left to the rest of the project. So is a list also
  // stored under its deprecated name, as only the first of the two lists is
  // read.
  const splitPartLists = projectPartLists.filter(
    ({ listName, deprecatedListName }) =>
      Array.isArray(projectObject[listName]) &&
      !(deprecatedListName in projectObject)
  );
  const projectObjectWithoutParts = { ...projectObject };
  splitPartLists.forEach(({ listName }) => {
    projectObjectWithoutParts[listName] = [];
  });
  unserializeFromJSObject(project, projectObjectWithoutParts);

  splitPartLists.forEach(({ listName, unserializeAndInsertPartFrom }) => {
    projectObject[listName].forEach(partObject => {
      const serializedElement = gd.Serializer.fromJSObject(partObject);
      try {
        unserializeAndInsertPartFrom(project, serializedElement);
      } finally {
        serializedElement.delete();
      }
    });
  });
}
