const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');

/**
 * Pseudo-random numbers from a seed (mulberry32), so that a failure can be
 * reproduced.
 */
const makeRandom = (seed) => {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const pick = (random, array) => array[Math.floor(random() * array.length)];

const keys = [
  '',
  'a',
  'b',
  'name',
  'value',
  'children',
  '0',
  '12',
  'é',
  '官话',
  'with "quotes"',
  'with \\ backslash',
];
const characters = [
  'a',
  'Z',
  ' ',
  '"',
  '\\',
  '/',
  '\n',
  '\t',
  '\r',
  '\b',
  '\f',
  'é',
  '官',
  '🎮',
];

/**
 * Generate a random value that gd.Serializer reads from the JSON written by
 * JSON.stringify, and writes back to the same JSON:
 * - integers have 32 bits (gd.SerializerValue stores an int),
 * - doubles have few significant digits (rapidjson reads the doubles written
 *   with 17 significant digits to a slightly different double),
 * - no null (written back as an empty object),
 * - no control characters other than the ones escaped the same way.
 */
const generateValue = (random, depth) => {
  const kind = Math.floor(random() * (depth > 0 ? 8 : 6));
  if (kind === 0) return random() < 0.5;
  if (kind === 1) return pick(random, [-2147483648, 2147483647, 0, -1]);
  if (kind === 2) return Math.floor(random() * 2000) - 1000;
  if (kind === 3) return Math.floor((random() - 0.5) * 128000000) / 64;
  if (kind === 4 || kind === 5) {
    let text = '';
    const length = Math.floor(random() * 8);
    for (let i = 0; i < length; i++) text += pick(random, characters);
    return text;
  }
  if (kind === 6) {
    const array = [];
    const length = Math.floor(random() * 5);
    for (let i = 0; i < length; i++)
      array.push(generateValue(random, depth - 1));
    return array;
  }
  const object = {};
  const length = Math.floor(random() * 5);
  for (let i = 0; i < length; i++)
    object[pick(random, keys)] = generateValue(random, depth - 1);
  return object;
};

/** JSON.stringify, with the keys sorted like gd.Serializer canonical mode. */
const stringifyWithSortedKeys = (value) => {
  if (Array.isArray(value))
    return '[' + value.map(stringifyWithSortedKeys).join(',') + ']';
  if (value && typeof value === 'object') {
    const sortedKeys = Object.keys(value).sort((a, b) =>
      Buffer.compare(Buffer.from(a), Buffer.from(b))
    );
    return (
      '{' +
      sortedKeys
        .map(
          (key) =>
            JSON.stringify(key) + ':' + stringifyWithSortedKeys(value[key])
        )
        .join(',') +
      '}'
    );
  }
  return JSON.stringify(value);
};

const range = (count) => Array.from({ length: count }, (_, i) => i);

/** The names of the items of a folder structure, in order. */
const getFolderStructureItemNames = (folder, itemKey) =>
  folder[itemKey] !== undefined
    ? [folder[itemKey]]
    : (folder.children || []).flatMap((child) =>
        getFolderStructureItemNames(child, itemKey)
      );

/**
 * A folder structure listing the first half of the items in reverse order
 * (in a folder), and optionally an item that does not exist (ignored when
 * loaded). The other items are missing: they are added at the end of the root
 * folder when loaded.
 */
const makePartialFolderStructure = (names, itemKey, withNotExistingItem) => ({
  folderName: '__ROOT',
  children: [
    {
      folderName: 'Folder',
      children: names
        .slice(0, names.length / 2)
        .reverse()
        .map((name) => ({ [itemKey]: name })),
    },
    ...(withNotExistingItem ? [{ [itemKey]: 'NotExisting' }] : []),
  ],
});

const getExpectedFolderStructureItemNames = (names) => [
  ...names.slice(0, names.length / 2).reverse(),
  ...names.slice(names.length / 2),
];

describe('libGD.js - gd.Serializer with random JSON and big projects', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  const toJSONInCanonicalMode = (element) => {
    gd.Serializer.setCanonicalMode(true);
    try {
      return gd.Serializer.toJSON(element);
    } finally {
      gd.Serializer.setCanonicalMode(false);
    }
  };

  const binaryRoundTrip = (element) => {
    const binaryPtr = gd.BinarySerializer.createBinarySnapshot(element);
    const binarySize = gd.BinarySerializer.getLastBinarySnapshotSize();
    const restoredElement = gd.BinarySerializer.deserializeBinarySnapshot(
      binaryPtr,
      binarySize
    );
    gd.BinarySerializer.freeBinarySnapshot(binaryPtr);
    const json = gd.Serializer.toJSON(restoredElement);
    restoredElement.delete();
    return json;
  };

  it('writes back the random JSON it reads', function () {
    for (let seed = 1; seed <= 300; seed++) {
      const value = generateValue(makeRandom(seed), 5);
      const json = JSON.stringify(value);

      const element = gd.Serializer.fromJSON(json);
      // Do NOT delete element, it's a static value.
      const context = `seed ${seed}: ${json}`;
      expect([context, gd.Serializer.toJSON(element)]).toEqual([context, json]);
      expect([context, toJSONInCanonicalMode(element)]).toEqual([
        context,
        stringifyWithSortedKeys(value),
      ]);
      expect([context, binaryRoundTrip(element)]).toEqual([context, json]);
    }
  });

  it('loads and saves a project with big lists, keeping their order', function () {
    const itemsCount = 2000;

    // Make a project with an object, an instance, an extension with a
    // behavior and an object, and use them as templates.
    const templateProject = gd.ProjectHelper.createNewGDJSProject();
    const templateLayout = templateProject.insertNewLayout('Scene', 0);
    templateLayout
      .getObjects()
      .insertNewObject(templateProject, 'Sprite', 'TemplateObject', 0);
    templateLayout
      .getInitialInstances()
      .insertNewInitialInstance()
      .setObjectName('TemplateObject');
    const templateExtension = templateProject.insertNewEventsFunctionsExtension(
      'BigExtension',
      0
    );
    templateExtension
      .getEventsFunctions()
      .insertNewEventsFunction('Template', 0);
    templateExtension
      .getEventsBasedBehaviors()
      .insertNew('BigBehavior', 0)
      .getPropertyDescriptors()
      .insertNew('Template', 0);
    templateExtension
      .getEventsBasedObjects()
      .insertNew('BigObject', 0)
      .getPropertyDescriptors()
      .insertNew('Template', 0);
    const templateElement = new gd.SerializerElement();
    templateProject.serializeTo(templateElement);
    const projectData = JSON.parse(gd.Serializer.toJSON(templateElement));
    templateElement.delete();
    templateProject.delete();

    const layoutData = projectData.layouts[0];
    const extensionData = projectData.eventsFunctionsExtensions[0];
    const objectNames = range(itemsCount).map((i) => 'Object' + i);
    const functionNames = range(itemsCount).map((i) => 'Function' + i);
    const propertyNames = range(itemsCount).map((i) => 'Property' + i);

    projectData.variables = range(itemsCount).map((i) => ({
      name: 'Variable' + i,
      type: 'number',
      value: i,
    }));
    layoutData.objects = objectNames.map((name) => ({
      ...layoutData.objects[0],
      name,
    }));
    layoutData.objectsFolderStructure = makePartialFolderStructure(
      objectNames,
      'objectName',
      true
    );
    layoutData.instances = range(itemsCount).map((i) => ({
      ...layoutData.instances[0],
      name: objectNames[i],
      x: i,
      persistentUuid: 'instance-' + i,
    }));
    layoutData.events = range(itemsCount).map((i) => ({
      type: 'BuiltinCommonInstructions::Standard',
      conditions: [],
      actions: [
        { type: { value: 'ModVarScene' }, parameters: ['V', '=', String(i)] },
      ],
    }));
    layoutData.objectsGroups = [
      ...range(itemsCount).map((i) => ({
        name: 'Group' + i,
        // Duplicated members are only added once.
        objects: [
          { name: objectNames[i] },
          { name: 'Object0' },
          { name: objectNames[i] },
        ],
      })),
      {
        name: 'BigGroup',
        objects: [...objectNames, ...objectNames].map((name) => ({ name })),
      },
    ];
    extensionData.eventsFunctions = functionNames.map((name) => ({
      ...extensionData.eventsFunctions[0],
      name,
    }));
    extensionData.eventsFunctionsFolderStructure = makePartialFolderStructure(
      functionNames,
      'functionName',
      true
    );
    for (const eventsBasedEntity of [
      extensionData.eventsBasedBehaviors[0],
      extensionData.eventsBasedObjects[0],
    ]) {
      eventsBasedEntity.propertyDescriptors = propertyNames.map((name) => ({
        ...eventsBasedEntity.propertyDescriptors[0],
        name,
      }));
      // A property that does not exist is not ignored when loaded (the item
      // is kept, without property): don't reference one.
      eventsBasedEntity.propertiesFolderStructure = makePartialFolderStructure(
        propertyNames,
        'propertyName',
        false
      );
    }

    const loadAndSave = (json) => {
      const project = gd.ProjectHelper.createNewGDJSProject();
      project.unserializeFrom(gd.Serializer.fromJSON(json));
      const element = new gd.SerializerElement();
      project.serializeTo(element);
      const savedJson = gd.Serializer.toJSON(element);
      element.delete();
      project.delete();
      return savedJson;
    };
    const savedJson = loadAndSave(JSON.stringify(projectData));
    // Saving again what was loaded gives the same JSON.
    expect(loadAndSave(savedJson)).toBe(savedJson);

    const savedProjectData = JSON.parse(savedJson);
    const savedLayoutData = savedProjectData.layouts[0];
    const savedExtensionData = savedProjectData.eventsFunctionsExtensions[0];
    expect(savedProjectData.variables.map((variable) => variable.name)).toEqual(
      projectData.variables.map((variable) => variable.name)
    );
    expect(savedLayoutData.objects.map((object) => object.name)).toEqual(
      objectNames
    );
    expect(
      getFolderStructureItemNames(
        savedLayoutData.objectsFolderStructure,
        'objectName'
      )
    ).toEqual(getExpectedFolderStructureItemNames(objectNames));
    expect(
      savedLayoutData.instances.map((instance) => instance.persistentUuid)
    ).toEqual(layoutData.instances.map((instance) => instance.persistentUuid));
    expect(
      savedLayoutData.events.map((event) => event.actions[0].parameters[2])
    ).toEqual(layoutData.events.map((event) => event.actions[0].parameters[2]));
    expect(savedLayoutData.objectsGroups.map((group) => group.name)).toEqual(
      layoutData.objectsGroups.map((group) => group.name)
    );
    expect(
      savedLayoutData.objectsGroups[1].objects.map((object) => object.name)
    ).toEqual(['Object1', 'Object0']);
    expect(
      savedLayoutData.objectsGroups[itemsCount].objects.map(
        (object) => object.name
      )
    ).toEqual(objectNames);
    expect(
      savedExtensionData.eventsFunctions.map(
        (eventsFunction) => eventsFunction.name
      )
    ).toEqual(functionNames);
    expect(
      getFolderStructureItemNames(
        savedExtensionData.eventsFunctionsFolderStructure,
        'functionName'
      )
    ).toEqual(getExpectedFolderStructureItemNames(functionNames));
    for (const savedEventsBasedEntity of [
      savedExtensionData.eventsBasedBehaviors[0],
      savedExtensionData.eventsBasedObjects[0],
    ]) {
      expect(
        savedEventsBasedEntity.propertyDescriptors.map(
          (property) => property.name
        )
      ).toEqual(propertyNames);
      expect(
        getFolderStructureItemNames(
          savedEventsBasedEntity.propertiesFolderStructure,
          'propertyName'
        )
      ).toEqual(getExpectedFolderStructureItemNames(propertyNames));
    }
  });

  it('loads extensions given several times, using the first one', function () {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const makeExtensionData = (name, fullName) => {
      const extension = project.insertNewEventsFunctionsExtension(name, 0);
      extension.setFullName(fullName);
      extension.getEventsFunctions().insertNewEventsFunction('MyFunction', 0);
      const element = new gd.SerializerElement();
      extension.serializeTo(element);
      const extensionData = JSON.parse(gd.Serializer.toJSON(element));
      element.delete();
      project.removeEventsFunctionsExtension(name);
      return extensionData;
    };
    const extensionsData = range(200).map((i) =>
      makeExtensionData('Extension' + i, 'Extension ' + i)
    );
    // Extensions given twice: the second one updates the first one.
    extensionsData.splice(
      50,
      0,
      makeExtensionData('Extension10', 'Updated extension 10')
    );
    extensionsData.push(
      makeExtensionData('Extension150', 'Updated extension 150')
    );

    project.insertNewEventsFunctionsExtension('Extension20', 0);
    project.unserializeAndInsertExtensionsFrom(
      gd.Serializer.fromJSON(JSON.stringify(extensionsData))
    );

    const extensionNames = [];
    for (let i = 0; i < project.getEventsFunctionsExtensionsCount(); i++)
      extensionNames.push(project.getEventsFunctionsExtensionAt(i).getName());
    expect(extensionNames).toEqual([
      'Extension20',
      ...range(200)
        .filter((i) => i !== 20)
        .map((i) => 'Extension' + i),
    ]);
    expect(
      project.getEventsFunctionsExtension('Extension10').getFullName()
    ).toBe('Updated extension 10');
    expect(
      project.getEventsFunctionsExtension('Extension150').getFullName()
    ).toBe('Updated extension 150');
    expect(
      project.getEventsFunctionsExtension('Extension20').getFullName()
    ).toBe('Extension 20');
    expect(
      project
        .getEventsFunctionsExtension('Extension199')
        .getEventsFunctions()
        .hasEventsFunctionNamed('MyFunction')
    ).toBe(true);
    project.delete();
  });
});
