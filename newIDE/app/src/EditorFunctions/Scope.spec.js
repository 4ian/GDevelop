// @flow
import {
  BOTH_GIVEN_DISAGREE_MESSAGE,
  EXTERNAL_EVENTS_NOT_SUPPORTED_MESSAGE,
  NAMED_VARIANT_REJECTED_MESSAGE,
  getNamedVariantRejection,
  getOutsideEditorChangesTarget,
  getScopeLabel,
  getFunctionTargetFromArgs,
  mergeLayersInScope,
  removeLayerInScope,
  renameLayerInScope,
  makeScopeProjectScopedContainersAccessor,
  normalizeLegacyArguments,
  parseScopeArgument,
  requireScopeArgument,
  resolveScope,
  withScopeObjectsContainersList,
  type ToolScopeType,
} from './Scope';
import { EXTENSION_STORE_ORIGIN_NAME } from './SimplifiedProject/SimplifiedExtensions';

const gd: libGDevelop = global.gd;

const allowedTypes: Array<ToolScopeType> = [
  'scene',
  'external_layout',
  'extension',
  'custom_behavior',
  'custom_object',
  'custom_object_variant',
];

/** A project with a scene, an external layout and an extension with a behavior and a custom object. */
const createFakeProjectWithScopes = (): gdProject => {
  // $FlowFixMe[invalid-constructor]
  const project = new gd.ProjectHelper.createNewGDJSProject();
  const scene = project.insertNewLayout('Level', 0);
  scene.getObjects().insertNewObject(project, 'Sprite', 'Player', 0);
  project.getObjects().insertNewObject(project, 'Sprite', 'GlobalSprite', 0);
  project.insertNewExternalLayout('Orphan', 0);
  project.insertNewExternalLayout('LevelChunk', 1).setAssociatedLayout('Level');

  const extension = project.insertNewEventsFunctionsExtension('UI', 0);
  extension.getEventsFunctions().insertNewEventsFunction('FreeFunction', 0);
  const behavior = extension.getEventsBasedBehaviors().insertNew('Blink', 0);
  behavior.getEventsFunctions().insertNewEventsFunction('Toggle', 0);
  const eventsBasedObject = extension
    .getEventsBasedObjects()
    .insertNew('Dialog', 0);
  eventsBasedObject.getObjects().insertNewObject(project, 'Sprite', 'Back', 0);
  eventsBasedObject.getEventsFunctions().insertNewEventsFunction('Open', 0);
  eventsBasedObject.getVariants().insertNewVariant('Dark', 0);

  const storeExtension = project.insertNewEventsFunctionsExtension('Health', 1);
  storeExtension.setOrigin(EXTENSION_STORE_ORIGIN_NAME, 'Health');
  return project;
};

describe('Scope', () => {
  describe('parseScopeArgument', () => {
    it('maps the legacy scene_name to a scene scope and returns null when nothing is given', () => {
      expect(
        parseScopeArgument({ scene_name: 'Level' }, { allowedTypes })
      ).toEqual({ type: 'scene', scene_name: 'Level' });
      expect(parseScopeArgument({}, { allowedTypes })).toBeNull();
      expect(
        parseScopeArgument({ scene_name: '' }, { allowedTypes })
      ).toBeNull();
    });

    it('accepts scene_name and scope when they agree, fails when they disagree', () => {
      expect(
        parseScopeArgument(
          { scene_name: 'A', scope: { type: 'scene', scene_name: 'A' } },
          { allowedTypes }
        )
      ).toEqual({ type: 'scene', scene_name: 'A' });
      expect(() =>
        parseScopeArgument(
          { scene_name: 'A', scope: { type: 'scene', scene_name: 'B' } },
          { allowedTypes }
        )
      ).toThrow(BOTH_GIVEN_DISAGREE_MESSAGE);
    });

    it('keeps only the fields of the type and requires them', () => {
      expect(
        parseScopeArgument(
          {
            scope: {
              type: 'custom_object_variant',
              extension_name: 'UI',
              custom_object_name: 'Dialog',
              variant_name: '',
              scene_name: 'Ignored',
            },
          },
          { allowedTypes }
        )
      ).toEqual({
        type: 'custom_object_variant',
        extension_name: 'UI',
        custom_object_name: 'Dialog',
        variant_name: '',
      });
      expect(() =>
        parseScopeArgument(
          { scope: { type: 'custom_object', extension_name: 'UI' } },
          { allowedTypes }
        )
      ).toThrow(
        '`scope` of type "custom_object" requires `extension_name` and `custom_object_name`.'
      );
    });

    it('rejects unknown, refused and reserved types', () => {
      expect(() =>
        parseScopeArgument({ scope: { type: 'layout' } }, { allowedTypes })
      ).toThrow('`scope.type` must be one of:');
      expect(() =>
        parseScopeArgument(
          { scope: { type: 'project' } },
          { allowedTypes: ['scene'] }
        )
      ).toThrow('`scope.type` "project" is not accepted here');
      expect(() =>
        parseScopeArgument(
          { scope: { type: 'external_events', external_events_name: 'E' } },
          { allowedTypes }
        )
      ).toThrow(EXTERNAL_EVENTS_NOT_SUPPORTED_MESSAGE);
    });

    it('requireScopeArgument falls back to the default scope, else fails', () => {
      expect(
        requireScopeArgument(
          {},
          {
            allowedTypes: ['project', 'scene'],
            defaultScope: { type: 'project' },
          }
        )
      ).toEqual({ type: 'project' });
      expect(() =>
        requireScopeArgument({}, { allowedTypes: ['scene'] })
      ).toThrow('Missing `scope`');
    });
  });

  it('refuses an empty identifying field but accepts "" as the default variant', () => {
    expect(() =>
      parseScopeArgument(
        {
          scope: {
            type: 'custom_object',
            extension_name: '',
            custom_object_name: 'Dialog',
          },
        },
        { allowedTypes }
      )
    ).toThrow(
      '`scope` of type "custom_object" requires `extension_name` and `custom_object_name`.'
    );
    expect(
      parseScopeArgument(
        {
          scope: {
            type: 'custom_object_variant',
            extension_name: 'UI',
            custom_object_name: 'Dialog',
            variant_name: '',
          },
        },
        { allowedTypes }
      )
    ).toEqual({
      type: 'custom_object_variant',
      extension_name: 'UI',
      custom_object_name: 'Dialog',
      variant_name: '',
    });
  });

  describe('resolveScope', () => {
    let project: gdProject;
    beforeEach(() => {
      project = createFakeProjectWithScopes();
    });
    afterEach(() => {
      project.delete();
    });

    it('resolves a scene with its containers and lists the scenes when not found', () => {
      const resolved = resolveScope(project, {
        type: 'scene',
        scene_name: 'Level',
      });
      if (resolved.success === false) throw new Error(resolved.message);
      expect(resolved.layout).toBe(project.getLayout('Level'));
      expect(resolved.objectsContainer).toBe(
        project.getLayout('Level').getObjects()
      );
      expect(resolved.globalObjectsContainer).toBe(project.getObjects());
      expect(resolved.layersContainer).toBe(
        project.getLayout('Level').getLayers()
      );
      expect(resolved.label).toBe('scene "Level"');

      const failure = resolveScope(project, {
        type: 'scene',
        scene_name: 'Nope',
      });
      expect(failure).toEqual({
        success: false,
        message: 'Scene not found: "Nope". Scenes in this project: "Level".',
      });
    });

    it('resolves an external layout to its own instances and the containers of its scene', () => {
      const resolved = resolveScope(project, {
        type: 'external_layout',
        external_layout_name: 'LevelChunk',
      });
      if (resolved.success === false) throw new Error(resolved.message);
      const externalLayout = project.getExternalLayout('LevelChunk');
      expect(resolved.externalLayout).toBe(externalLayout);
      expect(resolved.initialInstances).toBe(
        externalLayout.getInitialInstances()
      );
      expect(resolved.layout).toBe(project.getLayout('Level'));
      expect(resolved.objectsContainer).toBe(
        project.getLayout('Level').getObjects()
      );
      expect(getOutsideEditorChangesTarget(resolved)).toEqual({
        scene: project.getLayout('Level'),
        externalLayout,
      });

      expect(
        resolveScope(project, {
          type: 'external_layout',
          external_layout_name: 'Orphan',
        })
      ).toEqual({
        success: false,
        message:
          'External layout "Orphan" has no associated scene: set it in the editor first',
      });
      const notFound = resolveScope(project, {
        type: 'external_layout',
        external_layout_name: 'Nope',
      });
      expect(notFound.success).toBe(false);
      if (notFound.success === false)
        expect(notFound.message).toContain('"Orphan", "LevelChunk"');
    });

    it('resolves the extension scopes, with the read-only reason of store extensions', () => {
      const extension = resolveScope(project, {
        type: 'extension',
        extension_name: 'UI',
      });
      if (extension.success === false) throw new Error(extension.message);
      expect(extension.eventsFunctionsExtension).toBe(
        project.getEventsFunctionsExtension('UI')
      );
      expect(extension.readOnlyReason).toBeNull();

      const storeExtension = resolveScope(project, {
        type: 'extension',
        extension_name: 'Health',
      });
      if (storeExtension.success === false)
        throw new Error(storeExtension.message);
      expect(storeExtension.readOnlyReason).toContain(
        '"Health" is installed from the GDevelop extension store'
      );

      const behavior = resolveScope(project, {
        type: 'custom_behavior',
        extension_name: 'UI',
        custom_behavior_name: 'Blink',
      });
      if (behavior.success === false) throw new Error(behavior.message);
      expect(behavior.eventsBasedBehavior).toBe(
        project
          .getEventsFunctionsExtension('UI')
          .getEventsBasedBehaviors()
          .get('Blink')
      );

      expect(
        resolveScope(project, {
          type: 'custom_object',
          extension_name: 'UI',
          custom_object_name: 'Nope',
        })
      ).toEqual({
        success: false,
        message:
          'Custom object "Nope" not found in extension "UI". Existing custom objects: "Dialog".',
      });
      expect(
        resolveScope(project, { type: 'extension', extension_name: 'Nope' })
      ).toEqual({
        success: false,
        message:
          'Extension "Nope" not found. Existing extensions: "UI", "Health".',
      });
    });

    it('resolves the default and the named variants of a custom object, never falling back', () => {
      const eventsBasedObject = project
        .getEventsFunctionsExtension('UI')
        .getEventsBasedObjects()
        .get('Dialog');
      const defaultVariant = resolveScope(project, {
        type: 'custom_object_variant',
        extension_name: 'UI',
        custom_object_name: 'Dialog',
        variant_name: '',
      });
      if (defaultVariant.success === false)
        throw new Error(defaultVariant.message);
      expect(defaultVariant.isDefaultVariant).toBe(true);
      expect(defaultVariant.variant).toBe(
        eventsBasedObject.getDefaultVariant()
      );
      expect(defaultVariant.objectsContainer).toBe(
        eventsBasedObject.getObjects()
      );
      expect(defaultVariant.globalObjectsContainer).toBeNull();
      expect(defaultVariant.label).toBe(
        'custom object "UI::Dialog" (default variant)'
      );
      expect(getNamedVariantRejection(defaultVariant)).toBeNull();

      const namedVariant = resolveScope(project, {
        type: 'custom_object_variant',
        extension_name: 'UI',
        custom_object_name: 'Dialog',
        variant_name: 'Dark',
      });
      if (namedVariant.success === false) throw new Error(namedVariant.message);
      expect(namedVariant.isDefaultVariant).toBe(false);
      expect(namedVariant.variant).toBe(
        eventsBasedObject.getVariants().getVariant('Dark')
      );
      expect(getNamedVariantRejection(namedVariant)).toEqual({
        success: false,
        message: NAMED_VARIANT_REJECTED_MESSAGE,
      });
      expect(getOutsideEditorChangesTarget(namedVariant)).toEqual({
        scene: null,
        eventsBasedObject,
        variantName: 'Dark',
      });

      expect(
        resolveScope(project, {
          type: 'custom_object_variant',
          extension_name: 'UI',
          custom_object_name: 'Dialog',
          variant_name: 'Light',
        })
      ).toEqual({
        success: false,
        message:
          'Variant "Light" not found on custom object "UI::Dialog" ("" is the default variant). Existing variants: "Dark".',
      });
    });

    it('builds the objects containers list of a variant', () => {
      const variant = resolveScope(project, {
        type: 'custom_object_variant',
        extension_name: 'UI',
        custom_object_name: 'Dialog',
        variant_name: '',
      });
      if (variant.success === false) throw new Error(variant.message);
      const hasBack = withScopeObjectsContainersList(
        project,
        variant,
        objectsContainersList =>
          objectsContainersList.hasObjectOrGroupNamed('Back')
      );
      expect(hasBack).toBe(true);
      const hasGlobal = withScopeObjectsContainersList(
        project,
        variant,
        objectsContainersList =>
          objectsContainersList.hasObjectOrGroupNamed('GlobalSprite')
      );
      expect(hasGlobal).toBe(false);
    });

    it('builds the project scoped containers of a variant', () => {
      const variant = resolveScope(project, {
        type: 'custom_object_variant',
        extension_name: 'UI',
        custom_object_name: 'Dialog',
        variant_name: '',
      });
      if (variant.success === false) throw new Error(variant.message);
      const { accessor, dispose } = makeScopeProjectScopedContainersAccessor(
        project,
        variant,
        null
      );
      expect(
        accessor
          .get()
          .getObjectsContainersList()
          .hasObjectOrGroupNamed('Back')
      ).toBe(true);
      dispose();
    });
  });

  describe('layers of a variant', () => {
    let project: gdProject;
    beforeEach(() => {
      project = createFakeProjectWithScopes();
    });
    afterEach(() => {
      project.delete();
    });
    const resolveDark = () => {
      const resolved = resolveScope(project, {
        type: 'custom_object_variant',
        extension_name: 'UI',
        custom_object_name: 'Dialog',
        variant_name: 'Dark',
      });
      if (!resolved.success) throw new Error(resolved.message);
      return resolved;
    };

    it('renames, merges and removes the layers of a named variant without touching the default one', () => {
      const eventsBasedObject = project
        .getEventsFunctionsExtension('UI')
        .getEventsBasedObjects()
        .get('Dialog');
      // Variants are created with their base layer.
      const dark = eventsBasedObject.getVariants().getVariant('Dark');
      const defaultLayersCount = eventsBasedObject.getLayers().getLayersCount();
      dark.getLayers().insertNewLayer('Glow', 1);
      dark.getLayers().insertNewLayer('Old', 2);
      const instance = dark.getInitialInstances().insertNewInitialInstance();
      instance.setObjectName('Back');
      instance.setLayer('Glow');
      const onOld = dark.getInitialInstances().insertNewInitialInstance();
      onOld.setObjectName('Back');
      onOld.setLayer('Old');

      // Like the tool: the layer is renamed first, the helper updates what
      // refers to it.
      dark
        .getLayers()
        .getLayer('Glow')
        .setName('Shine');
      renameLayerInScope(project, resolveDark(), 'Glow', 'Shine');
      expect(instance.getLayer()).toBe('Shine');

      mergeLayersInScope(project, resolveDark(), 'Old', 'Shine');
      expect(dark.getLayers().hasLayerNamed('Old')).toBe(false);
      expect(onOld.getLayer()).toBe('Shine');
      expect(dark.getInitialInstances().getInstancesCount()).toBe(2);

      removeLayerInScope(project, resolveDark(), 'Shine');
      expect(dark.getLayers().getLayersCount()).toBe(1);
      expect(dark.getInitialInstances().getInstancesCount()).toBe(0);
      // The default variant keeps its own layers.
      expect(eventsBasedObject.getLayers().getLayersCount()).toBe(
        defaultLayersCount
      );
    });
  });

  describe('normalizeLegacyArguments', () => {
    it('maps scene_name to scope and keeps agreeing pairs', () => {
      expect(normalizeLegacyArguments({ scene_name: 'A', x: 1 })).toEqual({
        scene_name: 'A',
        x: 1,
        scope: { type: 'scene', scene_name: 'A' },
      });
      const scope = { type: 'scene', scene_name: 'A' };
      expect(normalizeLegacyArguments({ scene_name: 'A', scope }).scope).toBe(
        scope
      );
      expect(normalizeLegacyArguments({ scope })).toEqual({ scope });
    });

    it('fails when scene_name and scope disagree', () => {
      expect(() =>
        normalizeLegacyArguments({
          scene_name: 'A',
          scope: { type: 'scene', scene_name: 'B' },
        })
      ).toThrow(BOTH_GIVEN_DISAGREE_MESSAGE);
      expect(() =>
        normalizeLegacyArguments({
          scene_name: 'A',
          scope: { type: 'extension', extension_name: 'E' },
        })
      ).toThrow(BOTH_GIVEN_DISAGREE_MESSAGE);
    });

    it('maps the other aliases', () => {
      expect(
        normalizeLegacyArguments({
          duplicated_object_scene: 'A',
          event_batches: [
            { placement_relation: 'append_to_scene' },
            { placement_relation: 'delete' },
          ],
          parameters: [{ name: 'Target', type: 'object' }, { type: 'number' }],
        })
      ).toEqual({
        duplicated_object_scene: 'A',
        duplicated_object_scope: { type: 'scene', scene_name: 'A' },
        event_batches: [
          { placement_relation: 'append_to_end' },
          { placement_relation: 'delete' },
        ],
        parameters: [
          { name: 'Target', type: 'objectList' },
          { type: 'number' },
        ],
      });
    });

    it('leaves non-object arguments untouched', () => {
      expect(normalizeLegacyArguments(null)).toBeNull();
      expect(normalizeLegacyArguments('x')).toBe('x');
    });
  });

  it('labels every scope type', () => {
    expect(getScopeLabel({ type: 'project' })).toBe('the project');
    expect(
      getScopeLabel({
        type: 'custom_behavior',
        extension_name: 'UI',
        custom_behavior_name: 'Blink',
      })
    ).toBe('custom behavior "UI::Blink"');
    expect(
      getScopeLabel({
        type: 'custom_object_variant',
        extension_name: 'UI',
        custom_object_name: 'Dialog',
        variant_name: 'Dark',
      })
    ).toBe('custom object "UI::Dialog" (variant "Dark")');
  });

  describe('getFunctionTargetFromArgs', () => {
    it('names the function of a custom object, a custom behavior or an extension', () => {
      expect(
        getFunctionTargetFromArgs({
          scope: {
            type: 'custom_object',
            extension_name: 'UI',
            custom_object_name: 'Dialog',
          },
          function_name: 'Open',
        })
      ).toEqual({
        functionReference: 'UI::Dialog.Open',
        extensionName: 'UI',
        functionName: 'Open',
        behaviorName: undefined,
        objectName: 'Dialog',
      });
      expect(
        getFunctionTargetFromArgs({
          scope: {
            type: 'custom_behavior',
            extension_name: 'Combat',
            custom_behavior_name: 'Health',
          },
          function_name: 'Hit',
        })
      ).toMatchObject({
        functionReference: 'Combat::Health.Hit',
        behaviorName: 'Health',
      });
      expect(
        getFunctionTargetFromArgs({
          scope: { type: 'extension', extension_name: 'Combat' },
          function_name: 'Explode',
        })
      ).toMatchObject({ functionReference: 'Combat::Explode' });
    });

    it('is null without a function, for a scene, or for malformed arguments', () => {
      expect(
        getFunctionTargetFromArgs({
          scope: { type: 'extension', extension_name: 'Combat' },
          function_name: '',
        })
      ).toBeNull();
      expect(
        getFunctionTargetFromArgs({
          scope: { type: 'scene', scene_name: 'Level' },
          function_name: 'Open',
        })
      ).toBeNull();
      expect(
        getFunctionTargetFromArgs({ scope: 'Level', function_name: 'Open' })
      ).toBeNull();
      expect(getFunctionTargetFromArgs(null)).toBeNull();
    });
  });
});
