// @flow
import {
  getExtensionMemberChangeDetails,
  getExtensionMemberDifferences,
  getMergedSerializedExtension,
  getExtensionReferenceProblems,
} from './ExtensionChangesToKeep';

const createFakeInstruction = (type: string) => ({
  type: { value: type },
  parameters: [],
});

const createFakeFunction = ({
  name,
  parameterNames = [],
  calledInstructionTypes = [],
  sentence = '',
}: {|
  name: string,
  parameterNames?: Array<string>,
  calledInstructionTypes?: Array<string>,
  sentence?: string,
|}) => ({
  name,
  fullName: name,
  functionType: 'Action',
  sentence,
  parameters: parameterNames.map(parameterName => ({
    name: parameterName,
    type: 'number',
    description: '',
  })),
  objectGroups: [],
  events: [
    {
      type: 'BuiltinCommonInstructions::Standard',
      conditions: [],
      actions: calledInstructionTypes.map(createFakeInstruction),
    },
  ],
});

const createFakeObject = ({
  name,
  functions = [],
  childNames = [],
}: {|
  name: string,
  functions?: Array<Object>,
  childNames?: Array<string>,
|}) => ({
  name,
  fullName: name,
  defaultName: name,
  description: '',
  eventsFunctions: functions,
  propertyDescriptors: [],
  objects: childNames.map(childName => ({
    name: childName,
    type: 'Sprite',
  })),
  instances: [],
  layers: [],
  areaMinX: 0,
  areaMaxX: 64,
  editionSettings: { zoomFactor: 1 },
});

const createFakeExtension = ({
  version = '1.0.0',
  description = '',
  functions = [],
  objects = [],
  globalVariableNames = [],
  functionFolderStructure,
}: {|
  version?: string,
  description?: string,
  functions?: Array<Object>,
  objects?: Array<Object>,
  globalVariableNames?: Array<string>,
  functionFolderStructure?: Object,
|}) => ({
  name: 'MyExtension',
  version,
  description,
  globalVariables: globalVariableNames.map(variableName => ({
    name: variableName,
    type: 'number',
    value: 0,
  })),
  sceneVariables: [],
  eventsFunctions: functions,
  eventsFunctionsFolderStructure: functionFolderStructure,
  eventsBasedBehaviors: [],
  eventsBasedObjects: objects,
});

/** A serialized folder structure, from `{ folderName: [...children] }` and function names. */
const createFakeFolder = (folderName: string, children: Array<any>) => ({
  folderName,
  children: children.map(child =>
    typeof child === 'string' ? { functionName: child } : child
  ),
});

describe('ExtensionChangesToKeep', () => {
  describe('getExtensionMemberDifferences', () => {
    it('ignores differences that do not change the extension', () => {
      const projectExtension = createFakeExtension({
        functions: [createFakeFunction({ name: 'Jump' })],
      });
      const newExtension = createFakeExtension({
        version: '1.1.0',
        functions: [
          {
            // Fields in a different order and an empty value omitted.
            events: createFakeFunction({ name: 'Jump' }).events,
            parameters: [],
            name: 'Jump',
            fullName: 'Jump',
            functionType: 'Action',
          },
        ],
      });

      expect(
        getExtensionMemberDifferences(projectExtension, newExtension)
      ).toEqual([]);
    });

    it('lists the changed members and the ones only in the project', () => {
      const projectExtension = createFakeExtension({
        description: 'My tweaked description',
        functions: [
          createFakeFunction({ name: 'Jump', parameterNames: ['Height'] }),
          createFakeFunction({ name: 'MyStudioHelper' }),
        ],
        objects: [
          createFakeObject({ name: 'Dialog', childNames: ['MyPanel'] }),
        ],
      });
      const newExtension = createFakeExtension({
        version: '1.1.0',
        functions: [
          createFakeFunction({
            name: 'Jump',
            parameterNames: ['Height', 'Speed'],
            calledInstructionTypes: ['MyExtension::Land'],
          }),
          createFakeFunction({ name: 'Land' }),
        ],
        objects: [createFakeObject({ name: 'Dialog', childNames: ['Panel'] })],
      });

      expect(
        getExtensionMemberDifferences(projectExtension, newExtension)
      ).toEqual([
        {
          key: 'extension-settings',
          kind: 'extension-settings',
          name: '',
          status: 'changed',
          differentParts: ['configuration'],
        },
        {
          key: 'function:Jump',
          kind: 'function',
          name: 'Jump',
          status: 'changed',
          differentParts: ['parameters', 'events'],
        },
        {
          key: 'function:MyStudioHelper',
          kind: 'function',
          name: 'MyStudioHelper',
          status: 'only-in-project',
          differentParts: [],
        },
        {
          key: 'object-children:Dialog',
          kind: 'object-children',
          name: 'Dialog',
          status: 'changed',
          differentParts: ['children'],
        },
      ]);
    });
  });

  describe('getMergedSerializedExtension', () => {
    const projectExtension = createFakeExtension({
      description: 'My tweaked description',
      globalVariableNames: ['MyScore'],
      functions: [
        createFakeFunction({ name: 'Jump', sentence: 'My jump' }),
        createFakeFunction({ name: 'MyStudioHelper' }),
      ],
      objects: [
        createFakeObject({
          name: 'Dialog',
          functions: [createFakeFunction({ name: 'Open', sentence: 'Mine' })],
          childNames: ['MyPanel'],
        }),
      ],
    });
    const newExtension = createFakeExtension({
      version: '1.1.0',
      description: 'New description',
      globalVariableNames: ['BestScore'],
      functions: [
        createFakeFunction({ name: 'Jump', sentence: 'New jump' }),
        createFakeFunction({ name: 'Land' }),
      ],
      objects: [
        createFakeObject({
          name: 'Dialog',
          functions: [createFakeFunction({ name: 'Open', sentence: 'New' })],
          childNames: ['Panel'],
        }),
      ],
    });

    it('gives the new version when nothing is kept', () => {
      expect(
        getMergedSerializedExtension(projectExtension, newExtension, new Set())
      ).toEqual(newExtension);
    });

    it('keeps the chosen functions, including the ones only in the project', () => {
      const mergedExtension = getMergedSerializedExtension(
        projectExtension,
        newExtension,
        new Set(['function:Jump', 'function:MyStudioHelper'])
      );

      expect(mergedExtension.version).toBe('1.1.0');
      expect(
        mergedExtension.eventsFunctions.map(({ name, sentence }) => [
          name,
          sentence,
        ])
      ).toEqual([['Jump', 'My jump'], ['Land', ''], ['MyStudioHelper', '']]);
    });

    it('keeps the kept functions in the folders they have in the project', () => {
      const projectExtensionWithFolders = createFakeExtension({
        functions: [
          createFakeFunction({ name: 'Jump', sentence: 'My jump' }),
          createFakeFunction({ name: 'MyStudioHelper' }),
        ],
        functionFolderStructure: createFakeFolder('__ROOT', [
          createFakeFolder('Moves', [createFakeFolder('Air', ['Jump'])]),
          createFakeFolder('Studio', [
            createFakeFolder('Helpers', ['MyStudioHelper']),
          ]),
        ]),
      });
      const newExtensionWithFolders = createFakeExtension({
        version: '1.1.0',
        functions: [
          createFakeFunction({ name: 'Jump', sentence: 'New jump' }),
          createFakeFunction({ name: 'Land' }),
        ],
        functionFolderStructure: createFakeFolder('__ROOT', [
          createFakeFolder('Moves', ['Jump', 'Land']),
        ]),
      });

      const mergedExtension = getMergedSerializedExtension(
        projectExtensionWithFolders,
        newExtensionWithFolders,
        new Set(['function:Jump', 'function:MyStudioHelper'])
      );

      expect(mergedExtension.eventsFunctionsFolderStructure).toEqual(
        createFakeFolder('__ROOT', [
          createFakeFolder('Moves', [
            'Land',
            createFakeFolder('Air', ['Jump']),
          ]),
          createFakeFolder('Studio', [
            createFakeFolder('Helpers', ['MyStudioHelper']),
          ]),
        ])
      );
      // The new version is not modified.
      expect(newExtensionWithFolders.eventsFunctionsFolderStructure).toEqual(
        createFakeFolder('__ROOT', [
          createFakeFolder('Moves', ['Jump', 'Land']),
        ])
      );
    });

    it('keeps the children of an object without its logic', () => {
      const mergedExtension = getMergedSerializedExtension(
        projectExtension,
        newExtension,
        new Set(['object-children:Dialog'])
      );

      const mergedObject = mergedExtension.eventsBasedObjects[0];
      expect(mergedObject.objects.map(({ name }) => name)).toEqual(['MyPanel']);
      expect(mergedObject.eventsFunctions[0].sentence).toBe('New');
    });

    it('keeps the logic of an object without its children', () => {
      const mergedExtension = getMergedSerializedExtension(
        projectExtension,
        newExtension,
        new Set(['object:Dialog'])
      );

      const mergedObject = mergedExtension.eventsBasedObjects[0];
      expect(mergedObject.objects.map(({ name }) => name)).toEqual(['Panel']);
      expect(mergedObject.eventsFunctions[0].sentence).toBe('Mine');
    });

    it('keeps the settings and adds the variables of the new version', () => {
      const mergedExtension = getMergedSerializedExtension(
        projectExtension,
        newExtension,
        new Set(['extension-settings'])
      );

      expect(mergedExtension.version).toBe('1.1.0');
      expect(mergedExtension.description).toBe('My tweaked description');
      expect(mergedExtension.globalVariables.map(({ name }) => name)).toEqual([
        'MyScore',
        'BestScore',
      ]);
    });
  });

  describe('getExtensionReferenceProblems', () => {
    it('finds a new function using a kept function with different parameters', () => {
      const projectExtension = createFakeExtension({
        functions: [
          createFakeFunction({ name: 'Land', parameterNames: ['Height'] }),
          createFakeFunction({
            name: 'Jump',
            calledInstructionTypes: ['MyExtension::Land'],
          }),
        ],
      });
      const newExtension = createFakeExtension({
        version: '1.1.0',
        functions: [
          createFakeFunction({
            name: 'Land',
            parameterNames: ['Height', 'Speed'],
          }),
          createFakeFunction({
            name: 'Jump',
            calledInstructionTypes: ['MyExtension::Land', 'MyExtension::Fall'],
          }),
          createFakeFunction({ name: 'Fall' }),
        ],
      });

      expect(
        getExtensionReferenceProblems(projectExtension, newExtension, new Set())
      ).toEqual([]);
      expect(
        getExtensionReferenceProblems(
          projectExtension,
          newExtension,
          new Set(['function:Land'])
        )
      ).toEqual([
        {
          memberKey: 'function:Jump',
          referencedMemberKey: 'function:Land',
          problem: 'different-signature',
          missingChildNames: [],
          fixingSource: 'new-version',
        },
      ]);
    });

    it('ignores a kept function with the same parameters', () => {
      const projectExtension = createFakeExtension({
        functions: [
          createFakeFunction({ name: 'Land', sentence: 'My landing' }),
          createFakeFunction({ name: 'Jump' }),
        ],
      });
      const newExtension = createFakeExtension({
        functions: [
          createFakeFunction({ name: 'Land' }),
          createFakeFunction({
            name: 'Jump',
            calledInstructionTypes: ['MyExtension::Land'],
          }),
        ],
      });

      expect(
        getExtensionReferenceProblems(
          projectExtension,
          newExtension,
          new Set(['function:Land'])
        )
      ).toEqual([]);
    });

    it('finds a kept function using a removed function', () => {
      const projectExtension = createFakeExtension({
        functions: [
          createFakeFunction({ name: 'MyStudioHelper' }),
          createFakeFunction({
            name: 'MyStudioAction',
            calledInstructionTypes: ['MyExtension::MyStudioHelper'],
          }),
        ],
      });
      const newExtension = createFakeExtension({});

      expect(
        getExtensionReferenceProblems(
          projectExtension,
          newExtension,
          new Set(['function:MyStudioAction'])
        )
      ).toEqual([
        {
          memberKey: 'function:MyStudioAction',
          referencedMemberKey: 'function:MyStudioHelper',
          problem: 'removed',
          missingChildNames: [],
          fixingSource: 'project',
        },
      ]);
    });

    it('finds object logic using children that are not kept', () => {
      const projectExtension = createFakeExtension({
        objects: [
          createFakeObject({ name: 'Dialog', childNames: ['MyPanel'] }),
        ],
      });
      const newExtension = createFakeExtension({
        objects: [
          createFakeObject({
            name: 'Dialog',
            functions: [createFakeFunction({ name: 'Open' })],
            childNames: ['MyPanel', 'Medal'],
          }),
        ],
      });

      expect(
        getExtensionReferenceProblems(
          projectExtension,
          newExtension,
          new Set(['object-children:Dialog'])
        )
      ).toEqual([
        {
          memberKey: 'object:Dialog',
          referencedMemberKey: 'object-children:Dialog',
          problem: 'missing-children',
          missingChildNames: ['Medal'],
          fixingSource: 'new-version',
        },
      ]);
    });
  });

  describe('getExtensionMemberChangeDetails', () => {
    it('describes the changes of a function', () => {
      const projectExtension = createFakeExtension({
        functions: [
          createFakeFunction({
            name: 'Jump',
            parameterNames: ['Height', 'MyStudioParameter'],
            sentence: 'Make _PARAM0_ jump',
          }),
        ],
      });
      const newExtension = createFakeExtension({
        functions: [
          createFakeFunction({
            name: 'Jump',
            parameterNames: ['Height', 'Speed'],
            calledInstructionTypes: ['MyExtension::Land'],
            sentence: 'Make _PARAM0_ jump high',
          }),
        ],
      });

      expect(
        getExtensionMemberChangeDetails(
          projectExtension,
          newExtension,
          'function:Jump'
        )
      ).toEqual({
        displayName: 'Jump',
        functionType: 'Action',
        fieldChanges: [
          {
            field: 'sentence',
            projectValue: 'Make _PARAM0_ jump',
            newVersionValue: 'Make _PARAM0_ jump high',
          },
        ],
        itemChanges: [
          { part: 'parameters', name: 'Speed', change: 'added' },
          { part: 'parameters', name: 'MyStudioParameter', change: 'removed' },
        ],
        eventsCount: { project: 1, newVersion: 1 },
      });
    });

    it('describes the changes of the children of an object', () => {
      const projectExtension = createFakeExtension({
        objects: [
          createFakeObject({ name: 'Dialog', childNames: ['Panel', 'Logo'] }),
        ],
      });
      const newExtension = createFakeExtension({
        objects: [
          createFakeObject({ name: 'Dialog', childNames: ['Panel', 'Medal'] }),
        ],
      });

      expect(
        getExtensionMemberChangeDetails(
          projectExtension,
          newExtension,
          'object-children:Dialog'
        ).itemChanges
      ).toEqual([
        { part: 'children', name: 'Medal', change: 'added' },
        { part: 'children', name: 'Logo', change: 'removed' },
      ]);
    });
  });
});
