// @flow
import * as React from 'react';
import classNames from 'classnames';
import { Trans, t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import { I18n } from '@lingui/react';

import CompactSearchBar, {
  type CompactSearchBarInterface,
} from '../UI/CompactSearchBar';
import IconButton from '../UI/IconButton';
import Add from '../UI/CustomSvgIcons/Add';
import ObjectIcon from '../UI/CustomSvgIcons/Object';
import BehaviorIcon from '../UI/CustomSvgIcons/Behavior';
import ThreeDotsMenu from '../UI/CustomSvgIcons/ThreeDotsMenu';
import ShareExternal from '../UI/CustomSvgIcons/ShareExternal';
import ChevronArrowLeft from '../UI/CustomSvgIcons/ChevronArrowLeft';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import { IconContainer } from '../UI/IconContainer';
import RaisedButton from '../UI/RaisedButton';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { CompactPropertiesEditorByVisibility } from '../CompactPropertiesEditor/CompactPropertiesEditorByVisibility';
import propertiesMapToSchema from '../PropertiesEditor/PropertiesMapToSchema';
import { type Schema } from '../PropertiesEditor/PropertiesEditorSchema';
import SingleBehaviorHost from '../BehaviorsEditor/SingleBehaviorHost';
import { useManageObjectBehaviors } from '../BehaviorsEditor';
import { createCompactBehaviorPropertiesSchema } from '../ObjectEditor/CompactObjectPropertiesEditor/CompactBehaviorPropertiesEditor';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import { getAllVisibleBehaviorNames } from '../Utils/Behavior';
import useForceUpdate, { useForceRecompute } from '../Utils/UseForceUpdate';
import newNameGenerator from '../Utils/NewNameGenerator';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import {
  getHistoryInitialState,
  saveSerializedValueToHistory,
  undo as undoHistory,
  redo as redoHistory,
  canUndo,
  canRedo,
  type HistoryState,
} from '../Utils/History';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { type ObjectWithContext } from '../ObjectsList/EnumerateObjects';
import ObjectSwitcher from './ObjectSwitcher';
import RichObjectEditorWindow from './RichObjectEditorWindow';
import {
  enumerateWorkbenchObjects,
  getObjectOriginLabel,
  getWorkbenchObjectKey,
  getWorkbenchObjectTypeLabel,
  type WorkbenchObject,
} from './EnumerateWorkbenchObjects';
import {
  createSourceFilterIndex,
  filterSourceFilterIndex,
  type SourceFilterIndex,
  type SourceFilterResult,
} from './PropertyFilter';
import classes from './ObjectSettingsWorkbench.module.css';

const gd: libGDevelop = global.gd;

export type ObjectSettingsWorkbenchInterface = {|
  forceRefresh: () => void,
|};

export type ObjectSettingsWorkbenchProps = {|
  project: gdProject,
  unsavedChanges: ?UnsavedChanges,
  resourceManagementProps: ResourceManagementProps,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  onOpenEventBasedObjectEditor: (
    extensionName: string,
    eventsBasedObjectName: string
  ) => void,
  onOpenEventBasedObjectVariantEditor: (
    extensionName: string,
    eventsBasedObjectName: string,
    variantName: string
  ) => void,
  onDeleteEventsBasedObjectVariant: (
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    eventsBasedObject: gdEventsBasedObject,
    variant: gdEventsBasedObjectVariant
  ) => void,
  onGlobalObjectEdited: (object: gdObject) => void,
  onSceneObjectEdited: (
    scene: gdLayout,
    objectWithContext: ObjectWithContext,
    hasResourceChanged?: boolean
  ) => void,
  onEventsBasedObjectChildrenEdited: (
    eventsBasedObject: gdEventsBasedObject,
    options?: {| editedObject?: ?gdObject, hasResourceChanged?: boolean |}
  ) => void,
  onObjectListsModified: ({ isNewObjectTypeUsed: boolean }) => void,
  triggerHotReloadInGameEditorIfNeeded: () => void,
  onRequestWindowFocus?: () => void,
|};

type SourceId = 'object' | string;

const getBehaviorSourceId = (behaviorName: string): SourceId =>
  `behavior:${behaviorName}`;

const getBehaviorFromSourceId = (
  object: gdObject,
  sourceId: SourceId
): gdBehavior | null => {
  if (!sourceId.startsWith('behavior:')) return null;
  const behaviorName = sourceId.slice('behavior:'.length);
  return object.hasBehaviorNamed(behaviorName)
    ? object.getBehavior(behaviorName)
    : null;
};

const isBehaviorInherited = (behavior: gdBehavior): boolean => {
  try {
    return behavior.isInheritedFromObjectType();
  } catch (error) {
    return false;
  }
};

const makeSchemaReadOnly = (schema: Schema): Schema =>
  schema.map(field => {
    if (field.children) {
      return ({
        ...field,
        children: makeSchemaReadOnly(field.children),
      }: any);
    }
    if (field.getValue && field.setValue) {
      return ({
        ...field,
        disabled: () => 'always',
      }: any);
    }
    return field;
  });

const getObjectConfigurationAsGd = (object: gdObject): gdObjectConfiguration =>
  object.getConfiguration();

const hasProjectNameCollision = ({
  project,
  item,
  name,
  currentName,
}: {|
  project: gdProject,
  item: WorkbenchObject,
  name: string,
  currentName: string,
|}): boolean => {
  if (project.getVariables().has(name)) return true;
  if (
    project.getObjects().hasObjectNamed(name) &&
    !(item.scope === 'global' && name === currentName)
  ) {
    return true;
  }
  for (let index = 0; index < project.getLayoutsCount(); index++) {
    const layout = project.getLayoutAt(index);
    if (layout.getVariables().has(name)) return true;
    if (
      layout.getObjects().hasObjectNamed(name) &&
      !(
        item.scope === 'scene' &&
        item.layout === layout &&
        name === currentName
      )
    ) {
      return true;
    }
  }
  if (
    item.scope === 'prefab' &&
    item.eventsBasedObject &&
    item.eventsBasedObject.getObjects().hasObjectNamed(name) &&
    name !== currentName
  ) {
    return true;
  }
  return false;
};

const getValidatedObjectName = ({
  project,
  item,
  value,
}: {|
  project: gdProject,
  item: WorkbenchObject,
  value: string,
|}): string => {
  const currentName = item.object.getName();
  return newNameGenerator(gd.Project.getSafeName(value), name =>
    hasProjectNameCollision({ project, item, name, currentName })
  );
};

const ObjectSettingsEmpty = ({
  project,
  objects,
  onSelectObject,
}: {|
  project: gdProject,
  objects: Array<WorkbenchObject>,
  onSelectObject: WorkbenchObject => void,
|}): React.Node => (
  <div className={classes.root}>
    <header className={classes.header}>
      <div className={classes.headerTitleRow}>
        <span className={classes.eyebrow}>
          <Trans>OBJECT SETTINGS</Trans>
        </span>
      </div>
      <div className={classes.headerControls}>
        <ObjectSwitcher
          project={project}
          objects={objects}
          selectedObject={null}
          onSelectObject={onSelectObject}
        />
        <div className={classes.propertyFilter}>
          <CompactSearchBar
            value=""
            onChange={() => {}}
            disabled
            placeholder={t`Filter properties`}
          />
        </div>
        <span className={classes.filterHelper}>
          <Trans>filters sources &amp; fields for the current object</Trans>
        </span>
      </div>
    </header>
    <div className={classes.body}>
      <aside className={classes.sourcesPane}>
        <div className={classes.emptyDetails}>
          <Trans>Select an object to see its sources.</Trans>
        </div>
      </aside>
      <main className={classes.detailsPane}>
        <div className={classes.emptyDetails}>
          {objects.length ? (
            <Trans>Select an object from the switcher.</Trans>
          ) : (
            <Trans>This project has no objects yet.</Trans>
          )}
        </div>
      </main>
    </div>
  </div>
);

type PendingHistoryCommit = {|
  key: string,
  serializedObject: Object,
  timeoutId: TimeoutID,
|};

type SelectedWorkspaceProps = {|
  ...ObjectSettingsWorkbenchProps,
  objects: Array<WorkbenchObject>,
  selectedObject: WorkbenchObject,
  onSelectObject: WorkbenchObject => void,
  onObjectsMayHaveChanged: () => void,
|};

const SelectedObjectWorkspace = ({
  project,
  unsavedChanges,
  resourceManagementProps,
  onWillInstallExtension,
  onExtensionInstalled,
  onOpenEventBasedObjectEditor,
  onOpenEventBasedObjectVariantEditor,
  onDeleteEventsBasedObjectVariant,
  onGlobalObjectEdited,
  onSceneObjectEdited,
  onEventsBasedObjectChildrenEdited,
  onObjectListsModified,
  triggerHotReloadInGameEditorIfNeeded,
  onRequestWindowFocus,
  objects,
  selectedObject,
  onSelectObject,
  onObjectsMayHaveChanged,
}: SelectedWorkspaceProps): React.Node => {
  const forceUpdate = useForceUpdate();
  const [renderVersion, setRenderVersion] = React.useState(0);
  const [structureVersion, setStructureVersion] = React.useState(0);
  const [filterQuery, setFilterQuery] = React.useState('');
  const [selectedSourceId, setSelectedSourceId] = React.useState<SourceId>(
    'object'
  );
  const [switcherOpenRequestId, setSwitcherOpenRequestId] = React.useState(0);
  const [sourcesDrawerOpen, setSourcesDrawerOpen] = React.useState(false);
  const [richEditorOpen, setRichEditorOpen] = React.useState(false);
  const [renamedBehavior, setRenamedBehavior] = React.useState<?gdBehavior>(
    null
  );
  const [renameValue, setRenameValue] = React.useState('');
  const filterRef = React.useRef<?CompactSearchBarInterface>(null);
  const sourcesListRef = React.useRef<?HTMLDivElement>(null);
  const detailsContentRef = React.useRef<?HTMLDivElement>(null);
  const selectionBeforeFilterRef = React.useRef<SourceId>('object');
  const previousFilterQueryRef = React.useRef('');
  const deletedBehaviorIndexRef = React.useRef(0);
  const historiesRef = React.useRef<Map<string, HistoryState>>(new Map());
  const pendingHistoryCommitRef = React.useRef<?PendingHistoryCommit>(null);
  const [schemaRecomputeTrigger, forceRecomputeSchema] = useForceRecompute();

  const object = selectedObject.object;
  const selectedObjectKey = getWorkbenchObjectKey(selectedObject);
  const firstLayout =
    project.getLayoutsCount() > 0 ? project.getLayoutAt(0) : null;
  const temporaryLayoutForLayers = React.useMemo(
    () => (firstLayout ? null : new gd.Layout()),
    [firstLayout]
  );
  React.useEffect(
    () => () => {
      if (temporaryLayoutForLayers) temporaryLayoutForLayers.delete();
    },
    [temporaryLayoutForLayers]
  );
  const editorLayout = selectedObject.layout || firstLayout;
  const layersContainer: gdLayersContainer = ((editorLayout
    ? editorLayout.getLayers()
    : temporaryLayoutForLayers
    ? temporaryLayoutForLayers.getLayers()
    : null): any);

  const projectScopedContainersAccessor = React.useMemo(
    () => {
      if (selectedObject.scope === 'scene' && selectedObject.layout) {
        return new ProjectScopedContainersAccessor({
          project,
          layout: selectedObject.layout,
        });
      }
      if (
        selectedObject.scope === 'prefab' &&
        selectedObject.eventsFunctionsExtension &&
        selectedObject.eventsBasedObject
      ) {
        return new ProjectScopedContainersAccessor(
          {
            project,
            eventsFunctionsExtension: selectedObject.eventsFunctionsExtension,
            eventsBasedObject: selectedObject.eventsBasedObject,
          },
          selectedObject.eventsBasedObject.getObjects()
        );
      }
      return new ProjectScopedContainersAccessor(
        editorLayout ? { project, layout: editorLayout } : { project }
      );
    },
    [editorLayout, project, selectedObject]
  );

  const ensureHistory = React.useCallback(
    (item: WorkbenchObject): HistoryState => {
      const key = getWorkbenchObjectKey(item);
      const existing = historiesRef.current.get(key);
      if (existing) return existing;
      const history = getHistoryInitialState(item.object, {
        historyMaxSize: 50,
      });
      historiesRef.current.set(key, history);
      return history;
    },
    []
  );
  ensureHistory(selectedObject);

  const commitPendingHistory = React.useCallback(
    () => {
      const pending = pendingHistoryCommitRef.current;
      if (!pending) return;
      clearTimeout(pending.timeoutId);
      pendingHistoryCommitRef.current = null;
      const history = historiesRef.current.get(pending.key);
      if (!history) return;
      if (
        JSON.stringify(pending.serializedObject) !==
        JSON.stringify(history.currentValue)
      ) {
        historiesRef.current.set(
          pending.key,
          saveSerializedValueToHistory(history, pending.serializedObject, 'EDIT', {
            operationLabel: 'Edit object settings',
          })
        );
      }
    },
    []
  );

  React.useEffect(() => () => commitPendingHistory(), [
    commitPendingHistory,
  ]);

  const scheduleHistoryCommit = React.useCallback(
    (item: WorkbenchObject) => {
      const existing = pendingHistoryCommitRef.current;
      if (existing) clearTimeout(existing.timeoutId);
      const key = getWorkbenchObjectKey(item);
      ensureHistory(item);
      // Capture plain data synchronously. Keeping `item.object` until the
      // timeout fires is unsafe because project refreshes can replace and
      // destroy the native object while its JavaScript wrapper still exists.
      const serializedObject = serializeToJSObject(item.object);
      const timeoutId = setTimeout(commitPendingHistory, 300);
      pendingHistoryCommitRef.current = { key, serializedObject, timeoutId };
    },
    [commitPendingHistory, ensureHistory]
  );

  const notifyObjectChanged = React.useCallback(
    (
      item: WorkbenchObject,
      isBehaviorStructureChange: boolean = false,
      shouldRecordHistory: boolean = true
    ) => {
      if (unsavedChanges) unsavedChanges.triggerUnsavedChanges();
      if (shouldRecordHistory) scheduleHistoryCommit(item);

      if (item.scope === 'global') {
        if (isBehaviorStructureChange) {
          gd.WholeProjectRefactorer.behaviorsAddedToGlobalObject(
            project,
            item.object.getName()
          );
          gd.WholeProjectRefactorer.updateBehaviorsSharedData(project);
        }
        onGlobalObjectEdited(item.object);
      } else if (item.scope === 'scene' && item.layout) {
        const itemLayout = item.layout;
        if (isBehaviorStructureChange) {
          gd.WholeProjectRefactorer.behaviorsAddedToObjectInScene(
            project,
            itemLayout,
            item.object.getName()
          );
          gd.WholeProjectRefactorer.updateBehaviorsSharedData(project);
        }
        onSceneObjectEdited(itemLayout, {
          object: item.object,
          global: false,
        });
      } else if (item.eventsBasedObject) {
        onEventsBasedObjectChildrenEdited(item.eventsBasedObject, {
          editedObject: item.object,
        });
      }
      if (isBehaviorStructureChange) {
        onObjectListsModified({ isNewObjectTypeUsed: false });
        setStructureVersion(version => version + 1);
      }
      triggerHotReloadInGameEditorIfNeeded();
      setRenderVersion(version => version + 1);
    },
    [
      onEventsBasedObjectChildrenEdited,
      onGlobalObjectEdited,
      onObjectListsModified,
      onSceneObjectEdited,
      project,
      scheduleHistoryCommit,
      triggerHotReloadInGameEditorIfNeeded,
      unsavedChanges,
    ]
  );

  const onUpdateBehaviorsSharedData = React.useCallback(
    () => gd.WholeProjectRefactorer.updateBehaviorsSharedData(project),
    [project]
  );

  const {
    openNewBehaviorDialog,
    newBehaviorDialog,
    removeBehavior,
    justAddedBehaviorName,
    resetJustAddedBehaviorName,
  } = useManageObjectBehaviors({
    project,
    object,
    isChildObject: selectedObject.scope === 'prefab',
    eventsFunctionsExtension: selectedObject.eventsFunctionsExtension,
    onUpdate: forceUpdate,
    onBehaviorsUpdated: () => notifyObjectChanged(selectedObject, true),
    onUpdateBehaviorsSharedData,
    onWillInstallExtension,
    onExtensionInstalled,
  });

  React.useEffect(
    () => {
      if (!justAddedBehaviorName) return;
      const addedSourceId = getBehaviorSourceId(justAddedBehaviorName);
      selectionBeforeFilterRef.current = addedSourceId;
      setFilterQuery('');
      setSelectedSourceId(addedSourceId);
      resetJustAddedBehaviorName();
      const timeoutId = setTimeout(() => {
        const firstField = detailsContentRef.current
          ? detailsContentRef.current.querySelector(
              'input,button,select,textarea'
            )
          : null;
        if (firstField && firstField instanceof HTMLElement) firstField.focus();
      }, 0);
      return () => clearTimeout(timeoutId);
    },
    [justAddedBehaviorName, resetJustAddedBehaviorName]
  );

  const visibleBehaviors = React.useMemo(
    () => {
      if (structureVersion) {
        // Invalidate after a behavior is added, renamed, duplicated or removed.
      }
      return getAllVisibleBehaviorNames([object])
        .filter(name => object.hasBehaviorNamed(name))
        .map(name => object.getBehavior(name));
    },
    [object, structureVersion]
  );

  React.useEffect(
    () => {
      if (
        selectedSourceId !== 'object' &&
        !getBehaviorFromSourceId(object, selectedSourceId)
      ) {
        setSelectedSourceId(
          visibleBehaviors.length
            ? getBehaviorSourceId(
                visibleBehaviors[
                  Math.min(
                    deletedBehaviorIndexRef.current,
                    visibleBehaviors.length - 1
                  )
                ].getName()
              )
            : 'object'
        );
      }
    },
    [object, selectedSourceId, visibleBehaviors]
  );

  const objectMetadata = gd.MetadataProvider.getObjectMetadata(
    project.getCurrentPlatform(),
    object.getType()
  );
  const objectTypeLabel = getWorkbenchObjectTypeLabel(project, object);
  const selectedObjectOriginLabel = getObjectOriginLabel(selectedObject);
  const fullEditorLabel =
    objectMetadata && !gd.MetadataProvider.isBadObjectMetadata(objectMetadata)
      ? objectMetadata.getOpenFullEditorLabel()
      : null;

  const objectSchema = React.useMemo(
    () => {
      if (schemaRecomputeTrigger || structureVersion) {
        // Both values explicitly invalidate extension-backed descriptors.
      }
      const objectConfiguration = getObjectConfigurationAsGd(object);
      const customObject = project.hasEventsBasedObject(object.getType())
        ? project.getEventsBasedObject(object.getType())
        : null;
      return propertiesMapToSchema({
        properties: objectConfiguration.getProperties(),
        defaultValueProperties: customObject
          ? customObject.getPropertyDescriptors()
          : null,
        getPropertyValue: ({ objectConfiguration }, name) =>
          objectConfiguration
            .getProperties()
            .get(name)
            .getValue(),
        onUpdateProperty: ({ objectConfiguration }, name, value) => {
          objectConfiguration.updateProperty(name, value);
        },
        object,
        layersContainer,
        visibility: 'All',
        shouldDisabledFieldsWithMixedValues: false,
      });
    },
    [layersContainer, object, project, structureVersion, schemaRecomputeTrigger]
  );

  const behaviorSchemas = React.useMemo(
    () => {
      if (schemaRecomputeTrigger || structureVersion) {
        // Invalidate descriptors after extension or behavior structure changes.
      }
      const schemas = new Map<string, Schema>();
      visibleBehaviors.forEach(behavior => {
        const metadata = gd.MetadataProvider.getBehaviorMetadata(
          project.getCurrentPlatform(),
          behavior.getTypeName()
        );
        if (gd.MetadataProvider.isBadBehaviorMetadata(metadata)) {
          schemas.set(behavior.getName(), []);
          return;
        }
        const schema = createCompactBehaviorPropertiesSchema({
          behaviorMetadata: metadata,
          behavior,
          object,
          layersContainer,
        });
        schemas.set(
          behavior.getName(),
          isBehaviorInherited(behavior) ? makeSchemaReadOnly(schema) : schema
        );
      });
      return schemas;
    },
    [
      layersContainer,
      object,
      project,
      schemaRecomputeTrigger,
      structureVersion,
      visibleBehaviors,
    ]
  );

  const objectInstances = React.useMemo(
    () => [
      {
        object,
        objectConfiguration: getObjectConfigurationAsGd(object),
      },
    ],
    [object]
  );

  const objectFilterIndex = React.useMemo(
    () =>
      createSourceFilterIndex({
        schema: objectSchema,
        instances: objectInstances,
        sourceSearchText: `Object Object properties ${objectTypeLabel} ${selectedObjectOriginLabel}`,
      }),
    [objectInstances, objectSchema, objectTypeLabel, selectedObjectOriginLabel]
  );

  const objectFilterResult = React.useMemo(
    () =>
      filterSourceFilterIndex({
        index: objectFilterIndex,
        query: filterQuery,
      }),
    [filterQuery, objectFilterIndex]
  );

  const behaviorFilterIndices = React.useMemo(
    () => {
      const indices = new Map<string, SourceFilterIndex>();
      visibleBehaviors.forEach(behavior => {
        const metadata = gd.MetadataProvider.getBehaviorMetadata(
          project.getCurrentPlatform(),
          behavior.getTypeName()
        );
        const typeLabel = gd.MetadataProvider.isBadBehaviorMetadata(metadata)
          ? behavior.getTypeName()
          : metadata.getFullName();
        indices.set(
          behavior.getName(),
          createSourceFilterIndex({
            schema: behaviorSchemas.get(behavior.getName()) || [],
            instances: [behavior],
            sourceSearchText: `${behavior.getName()} ${typeLabel}`,
          })
        );
      });
      return indices;
    },
    [behaviorSchemas, project, visibleBehaviors]
  );

  const behaviorFilterResults = React.useMemo(
    () => {
      const results = new Map<string, SourceFilterResult>();
      behaviorFilterIndices.forEach((index, behaviorName) => {
        results.set(
          behaviorName,
          filterSourceFilterIndex({ index, query: filterQuery })
        );
      });
      return results;
    },
    [behaviorFilterIndices, filterQuery]
  );

  React.useEffect(
    () => {
      const wasFiltering = !!previousFilterQueryRef.current;
      previousFilterQueryRef.current = filterQuery;

      if (!filterQuery) {
        // Restore the source that was selected before filtering only when the
        // filter has just been cleared. Running this on every source selection
        // immediately resets a clicked behavior back to the object source,
        // which makes the details panel appear to flicker.
        if (wasFiltering && selectionBeforeFilterRef.current) {
          const sourceToRestore = selectionBeforeFilterRef.current;
          if (
            sourceToRestore === 'object' ||
            getBehaviorFromSourceId(object, sourceToRestore)
          ) {
            setSelectedSourceId(sourceToRestore);
          }
        }
        return;
      }

      const currentMatches =
        selectedSourceId === 'object'
          ? objectFilterResult.matchCount
          : (() => {
              const behavior = getBehaviorFromSourceId(
                object,
                selectedSourceId
              );
              return behavior
                ? (
                    behaviorFilterResults.get(behavior.getName()) || {
                      matchCount: 0,
                    }
                  ).matchCount
                : 0;
            })();
      if (currentMatches) return;

      if (objectFilterResult.matchCount) {
        setSelectedSourceId('object');
        return;
      }
      const firstMatchingBehavior = visibleBehaviors.find(behavior => {
        const result = behaviorFilterResults.get(behavior.getName());
        return result && result.matchCount;
      });
      if (firstMatchingBehavior) {
        setSelectedSourceId(
          getBehaviorSourceId(firstMatchingBehavior.getName())
        );
      }
    },
    [
      behaviorFilterResults,
      filterQuery,
      object,
      objectFilterResult.matchCount,
      selectedSourceId,
      visibleBehaviors,
    ]
  );

  const updateFilterQuery = React.useCallback(
    (nextQuery: string) => {
      if (!filterQuery && nextQuery) {
        selectionBeforeFilterRef.current = selectedSourceId;
      }
      setFilterQuery(nextQuery);
    },
    [filterQuery, selectedSourceId]
  );

  const selectObject = React.useCallback(
    (item: WorkbenchObject) => {
      commitPendingHistory();
      selectionBeforeFilterRef.current = 'object';
      setFilterQuery('');
      setSelectedSourceId('object');
      onSelectObject(item);
    },
    [commitPendingHistory, onSelectObject]
  );

  const selectSource = React.useCallback(
    (sourceId: SourceId) => {
      commitPendingHistory();
      setSelectedSourceId(sourceId);
      setSourcesDrawerOpen(false);
    },
    [commitPendingHistory]
  );

  const onSourcesListKeyDown = React.useCallback(
    (event: SyntheticKeyboardEvent<HTMLDivElement>) => {
      if (
        event.key !== 'ArrowDown' &&
        event.key !== 'ArrowUp' &&
        event.key !== 'Home' &&
        event.key !== 'End'
      ) {
        return;
      }
      const sourceOptions: Array<HTMLElement> = (Array.from(
        event.currentTarget.querySelectorAll('[role="option"]')
      ): any);
      if (!sourceOptions.length) return;
      const currentIndex = sourceOptions.findIndex(
        option => option === document.activeElement
      );
      const nextIndex =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
          ? sourceOptions.length - 1
          : event.key === 'ArrowDown'
          ? Math.min(currentIndex + 1, sourceOptions.length - 1)
          : Math.max(currentIndex - 1, 0);
      const nextOption = sourceOptions[nextIndex];
      if (nextOption && nextOption instanceof HTMLElement) {
        event.preventDefault();
        nextOption.focus();
      }
    },
    []
  );

  const undo = React.useCallback(
    () => {
      commitPendingHistory();
      const history = ensureHistory(selectedObject);
      if (!canUndo(history)) return;
      historiesRef.current.set(
        selectedObjectKey,
        undoHistory(history, object, project)
      );
      setSelectedSourceId('object');
      notifyObjectChanged(selectedObject, true, false);
      forceRecomputeSchema();
    },
    [
      commitPendingHistory,
      ensureHistory,
      forceRecomputeSchema,
      notifyObjectChanged,
      object,
      project,
      selectedObject,
      selectedObjectKey,
    ]
  );

  const redo = React.useCallback(
    () => {
      commitPendingHistory();
      const history = ensureHistory(selectedObject);
      if (!canRedo(history)) return;
      historiesRef.current.set(
        selectedObjectKey,
        redoHistory(history, object, project)
      );
      setSelectedSourceId('object');
      notifyObjectChanged(selectedObject, true, false);
      forceRecomputeSchema();
    },
    [
      commitPendingHistory,
      ensureHistory,
      forceRecomputeSchema,
      notifyObjectChanged,
      object,
      project,
      selectedObject,
      selectedObjectKey,
    ]
  );

  const duplicateBehavior = React.useCallback(
    (behavior: gdBehavior) => {
      ensureHistory(selectedObject);
      const newName = newNameGenerator(
        behavior.getName(),
        name => object.hasBehaviorNamed(name),
        'Copy'
      );
      const serializedBehavior = serializeToJSObject(behavior);
      const duplicatedBehavior = object.addNewBehavior(
        project,
        behavior.getTypeName(),
        newName
      );
      if (!duplicatedBehavior) return;
      unserializeFromJSObject(
        duplicatedBehavior,
        serializedBehavior,
        'unserializeFrom',
        project
      );
      if (duplicatedBehavior.getName() !== newName) {
        duplicatedBehavior.setName(newName);
      }
      gd.WholeProjectRefactorer.addRequiredBehaviorsFor(
        project,
        object,
        newName
      );
      setSelectedSourceId(getBehaviorSourceId(newName));
      notifyObjectChanged(selectedObject, true);
    },
    [ensureHistory, notifyObjectChanged, object, project, selectedObject]
  );

  const applyBehaviorRename = React.useCallback(
    () => {
      if (!renamedBehavior) return;
      const oldName = renamedBehavior.getName();
      const nextName = newNameGenerator(
        gd.Project.getSafeName(renameValue),
        name => object.hasBehaviorNamed(name) && name !== oldName
      );
      if (nextName !== oldName) {
        ensureHistory(selectedObject);
        object.renameBehavior(oldName, nextName);
        setSelectedSourceId(getBehaviorSourceId(nextName));
        notifyObjectChanged(selectedObject, true);
      }
      setRenamedBehavior(null);
      setRenameValue('');
    },
    [
      ensureHistory,
      notifyObjectChanged,
      object,
      renameValue,
      renamedBehavior,
      selectedObject,
    ]
  );

  const onRenameObject = React.useCallback(
    (newName: string) => {
      const oldName = object.getName();
      const validatedName = getValidatedObjectName({
        project,
        item: selectedObject,
        value: newName,
      });
      if (validatedName === oldName) return;
      if (selectedObject.scope === 'global') {
        gd.WholeProjectRefactorer.globalObjectOrGroupRenamed(
          project,
          oldName,
          validatedName,
          false
        );
      } else if (selectedObject.scope === 'scene' && selectedObject.layout) {
        gd.WholeProjectRefactorer.objectOrGroupRenamedInScene(
          project,
          selectedObject.layout,
          oldName,
          validatedName,
          false
        );
      }
      object.setName(validatedName);
    },
    [object, project, selectedObject]
  );

  const closeRichEditor = React.useCallback(
    () => {
      setRichEditorOpen(false);
      onObjectsMayHaveChanged();
      forceRecomputeSchema();
      if (onRequestWindowFocus) {
        setTimeout(onRequestWindowFocus, 0);
      }
    },
    [forceRecomputeSchema, onObjectsMayHaveChanged, onRequestWindowFocus]
  );

  const onRootKeyDown = React.useCallback(
    (event: SyntheticKeyboardEvent<HTMLDivElement>) => {
      const commandKey = event.ctrlKey || event.metaKey;
      if (commandKey && event.key.toLocaleLowerCase() === 'f') {
        event.preventDefault();
        if (filterRef.current) filterRef.current.focus();
      } else if (commandKey && event.key.toLocaleLowerCase() === 'p') {
        event.preventDefault();
        setSwitcherOpenRequestId(requestId => requestId + 1);
      } else if (commandKey && event.key.toLocaleLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if (event.key === 'Escape' && filterQuery) {
        event.preventDefault();
        updateFilterQuery('');
        setTimeout(() => {
          const selectedSource = sourcesListRef.current
            ? sourcesListRef.current.querySelector('[aria-selected="true"]')
            : null;
          if (selectedSource && selectedSource instanceof HTMLElement) {
            selectedSource.focus();
          }
        }, 0);
      }
    },
    [filterQuery, redo, undo, updateFilterQuery]
  );

  const selectedBehavior = getBehaviorFromSourceId(object, selectedSourceId);
  const selectedBehaviorFilterResult = selectedBehavior
    ? behaviorFilterResults.get(selectedBehavior.getName())
    : null;
  const hasAnyFilterMatch =
    objectFilterResult.matchCount > 0 ||
    visibleBehaviors.some(behavior => {
      const result = behaviorFilterResults.get(behavior.getName());
      return result && result.matchCount > 0;
    });

  return (
    <I18n>
      {({ i18n }) => (
        <div
          className={classes.root}
          onKeyDown={onRootKeyDown}
          data-render-version={renderVersion}
        >
          <header className={classes.header}>
            <div className={classes.headerTitleRow}>
              <span className={classes.eyebrow}>
                <Trans>OBJECT SETTINGS</Trans>
              </span>
            </div>
            <div className={classes.headerControls}>
              <ObjectSwitcher
                project={project}
                objects={objects}
                selectedObject={selectedObject}
                onSelectObject={selectObject}
                openRequestId={switcherOpenRequestId}
              />
              <div className={classes.propertyFilter}>
                <CompactSearchBar
                  ref={filterRef}
                  id="object-settings-property-filter"
                  value={filterQuery}
                  onChange={updateFilterQuery}
                  placeholder={t`Filter properties`}
                />
              </div>
              <span className={classes.filterHelper}>
                {filterQuery ? (
                  <Trans>matches across sources &amp; fields</Trans>
                ) : (
                  <Trans>
                    filters sources &amp; fields for the current object
                  </Trans>
                )}
              </span>
            </div>
          </header>
          <div className={classes.body}>
            {sourcesDrawerOpen && (
              <button
                type="button"
                className={classes.drawerBackdrop}
                aria-label="Close sources"
                onClick={() => setSourcesDrawerOpen(false)}
              />
            )}
            <aside
              className={classNames(classes.sourcesPane, {
                [classes.sourcesPaneOpen]: sourcesDrawerOpen,
              })}
              aria-label="Property sources"
            >
              <div
                ref={sourcesListRef}
                className={classNames(classes.sourcesList, {
                  [classes.sourcesListFiltered]: !!filterQuery,
                })}
                role="listbox"
                aria-label="Property sources"
                onKeyDown={onSourcesListKeyDown}
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={selectedSourceId === 'object'}
                  className={classNames(classes.sourceRow, {
                    [classes.sourceRowSelected]: selectedSourceId === 'object',
                    [classes.sourceRowDimmed]:
                      !!filterQuery && !objectFilterResult.matchCount,
                  })}
                  onClick={() => selectSource('object')}
                >
                  <span className={classes.sourceRowContent}>
                    <ObjectIcon className={classes.sourceIcon} />
                    <span className={classes.sourceName}>
                      <Trans>Object</Trans>
                    </span>
                    {!!filterQuery && objectFilterResult.matchCount > 0 ? (
                      <span
                        className={classes.matchCount}
                        aria-label={`${
                          objectFilterResult.matchCount
                        } matching properties`}
                      >
                        {objectFilterResult.matchCount}
                      </span>
                    ) : (
                      <span className={classes.sourceType}>
                        {objectTypeLabel}
                      </span>
                    )}
                  </span>
                </button>
                <div className={classes.sourceSectionHeader}>
                  <span className={classes.sourceSectionLabel}>
                    <Trans>BEHAVIORS</Trans>
                  </span>
                  <button
                    type="button"
                    id="object-settings-add-behavior"
                    className={classes.addBehaviorButton}
                    aria-label={i18n._(t`Add a behavior`)}
                    title={i18n._(t`Add a behavior`)}
                    onClick={openNewBehaviorDialog}
                  >
                    <Add />
                  </button>
                </div>
                {!visibleBehaviors.length && (
                  <div className={classes.noBehaviors}>
                    <Trans>No behaviors yet</Trans>
                  </div>
                )}
                {visibleBehaviors.map(behavior => {
                  const sourceId = getBehaviorSourceId(behavior.getName());
                  const result = behaviorFilterResults.get(behavior.getName());
                  const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
                    project.getCurrentPlatform(),
                    behavior.getTypeName()
                  );
                  const isUnknown = gd.MetadataProvider.isBadBehaviorMetadata(
                    behaviorMetadata
                  );
                  const iconUrl = isUnknown
                    ? ''
                    : behaviorMetadata.getIconFilename();
                  return (
                    <div
                      key={behavior.ptr}
                      role="option"
                      tabIndex={0}
                      aria-selected={selectedSourceId === sourceId}
                      className={classNames(classes.sourceRow, {
                        [classes.sourceRowSelected]:
                          selectedSourceId === sourceId,
                        [classes.sourceRowDimmed]:
                          !!filterQuery && (!result || !result.matchCount),
                      })}
                      onClick={() => selectSource(sourceId)}
                      onKeyDown={event => {
                        if (
                          event.target === event.currentTarget &&
                          (event.key === 'Enter' || event.key === ' ')
                        ) {
                          event.preventDefault();
                          selectSource(sourceId);
                        }
                      }}
                    >
                      <span className={classes.sourceRowContent}>
                        {iconUrl ? (
                          <IconContainer src={iconUrl} alt="" size={18} />
                        ) : (
                          <BehaviorIcon className={classes.sourceIcon} />
                        )}
                        <span className={classes.sourceName}>
                          {behavior.getName()}
                        </span>
                        {!!filterQuery && result && result.matchCount > 0 && (
                          <span
                            className={classes.matchCount}
                            aria-label={`${
                              result.matchCount
                            } matching properties`}
                          >
                            {result.matchCount}
                          </span>
                        )}
                      </span>
                      <ElementWithMenu
                        element={
                          <IconButton
                            className={classes.behaviorMenu}
                            size="small"
                            tooltip={t`Behavior actions`}
                            onClick={event => event.stopPropagation()}
                          >
                            <ThreeDotsMenu />
                          </IconButton>
                        }
                        buildMenuTemplate={(menuI18n: I18nType) => [
                          {
                            label: menuI18n._(t`Rename`),
                            click: () => {
                              setRenamedBehavior(behavior);
                              setRenameValue(behavior.getName());
                            },
                            // No project refactoring path exists yet for
                            // renaming an attached behavior.
                            enabled: false,
                          },
                          {
                            label: menuI18n._(t`Duplicate`),
                            click: () => duplicateBehavior(behavior),
                            enabled: !isBehaviorInherited(behavior),
                          },
                          { type: 'separator' },
                          {
                            label: menuI18n._(t`Move up`),
                            click: () => {},
                            enabled: false,
                          },
                          {
                            label: menuI18n._(t`Move down`),
                            click: () => {},
                            enabled: false,
                          },
                          { type: 'separator' },
                          {
                            label: menuI18n._(t`Delete`),
                            click: () => {
                              deletedBehaviorIndexRef.current = visibleBehaviors.indexOf(
                                behavior
                              );
                              removeBehavior(behavior.getName());
                            },
                            enabled: !isBehaviorInherited(behavior),
                          },
                        ]}
                      />
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                className={classes.drawerCloseButton}
                aria-label="Close sources"
                onClick={() => setSourcesDrawerOpen(false)}
              >
                <ChevronArrowLeft />
              </button>
            </aside>
            <main className={classes.detailsPane}>
              <div className={classes.detailsHeader}>
                <div className={classes.detailsTitleRow}>
                  <div>
                    <h2 className={classes.detailsTitle}>
                      {selectedBehavior ? (
                        selectedBehavior.getName()
                      ) : (
                        <Trans>Object properties</Trans>
                      )}
                    </h2>
                    <div className={classes.detailsSubtitle}>
                      {selectedBehavior ? (
                        <React.Fragment>
                          {filterQuery && selectedBehaviorFilterResult ? (
                            <React.Fragment>
                              <Trans>
                                {selectedBehaviorFilterResult.matchCount}{' '}
                                matching properties
                              </Trans>{' '}
                              ·{' '}
                            </React.Fragment>
                          ) : (
                            ''
                          )}
                          {selectedBehavior.getTypeName()}
                        </React.Fragment>
                      ) : (
                        <React.Fragment>
                          {objectTypeLabel} ·{' '}
                          {getObjectOriginLabel(selectedObject)}
                        </React.Fragment>
                      )}
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      className={classes.sourcesDrawerButton}
                      onClick={() => setSourcesDrawerOpen(true)}
                    >
                      <Trans>Sources</Trans>
                    </button>
                  </div>
                </div>
              </div>
              <div
                className={classNames(classes.detailsContent, {
                  [classes.detailsContentFiltered]: !!filterQuery,
                })}
                ref={detailsContentRef}
              >
                <div className={classes.detailsContentInner}>
                  {!!filterQuery && !hasAnyFilterMatch ? (
                    <div className={classes.emptyDetails}>
                      <span>
                        <Trans>No properties match “{filterQuery}”</Trans>
                      </span>
                      <button
                        type="button"
                        className={classes.clearFilterButton}
                        onClick={() => updateFilterQuery('')}
                      >
                        <Trans>Clear filter</Trans>
                      </button>
                    </div>
                  ) : selectedBehavior ? (
                    selectedBehaviorFilterResult &&
                    (!filterQuery ||
                      selectedBehaviorFilterResult.matchCount) ? (
                      <React.Fragment>
                        {isBehaviorInherited(selectedBehavior) && (
                          <div className={classes.readOnlyNotice} role="status">
                            <Trans>
                              This behavior is inherited from the object type
                              and is read-only here.
                            </Trans>
                          </div>
                        )}
                        <div
                          className={classNames({
                            [classes.readOnlyEditor]: isBehaviorInherited(
                              selectedBehavior
                            ),
                          })}
                          aria-disabled={isBehaviorInherited(selectedBehavior)}
                          onKeyDownCapture={event => {
                            if (isBehaviorInherited(selectedBehavior)) {
                              event.preventDefault();
                            }
                          }}
                        >
                          <SingleBehaviorHost
                            key={selectedBehavior.ptr}
                            project={project}
                            behavior={selectedBehavior}
                            object={object}
                            layersContainer={layersContainer}
                            onBehaviorUpdated={() =>
                              notifyObjectChanged(selectedObject)
                            }
                            resourceManagementProps={resourceManagementProps}
                            onOpenFullEditor={() => setRichEditorOpen(true)}
                            propertiesSchema={
                              filterQuery
                                ? selectedBehaviorFilterResult.filteredSchema
                                : behaviorSchemas.get(
                                    selectedBehavior.getName()
                                  )
                            }
                            isAdvancedSectionInitiallyUncollapsed={
                              !!filterQuery
                            }
                          />
                        </div>
                      </React.Fragment>
                    ) : null
                  ) : !filterQuery || objectFilterResult.matchCount ? (
                    <React.Fragment>
                      <CompactPropertiesEditorByVisibility
                        project={project}
                        object={object}
                        schema={
                          filterQuery
                            ? objectFilterResult.filteredSchema
                            : objectSchema
                        }
                        instances={objectInstances}
                        onInstancesModified={() =>
                          notifyObjectChanged(selectedObject)
                        }
                        resourceManagementProps={resourceManagementProps}
                        placeholder={
                          <Trans>This object has no inline properties.</Trans>
                        }
                        onRefreshAllFields={forceRecomputeSchema}
                        isAdvancedSectionInitiallyUncollapsed={!!filterQuery}
                      />
                      {fullEditorLabel && (
                        <div className={classes.richEditorNotice}>
                          <ShareExternal />
                          <div className={classes.richEditorNoticeText}>
                            <div className={classes.richEditorNoticeTitle}>
                              <Trans>
                                Rich editor opens in a separate window
                              </Trans>
                            </div>
                            <div className={classes.richEditorNoticeSubtitle}>
                              <Trans>
                                The Object Settings workbench stays open behind
                                it.
                              </Trans>
                            </div>
                          </div>
                          <RaisedButton
                            primary
                            label={fullEditorLabel}
                            onClick={() => {
                              commitPendingHistory();
                              setRichEditorOpen(true);
                            }}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  ) : null}
                </div>
              </div>
            </main>
          </div>
          {newBehaviorDialog}
          {!!renamedBehavior && (
            <Dialog
              open
              title={<Trans>Rename behavior</Trans>}
              actions={[
                <FlatButton
                  key="cancel"
                  label={<Trans>Cancel</Trans>}
                  onClick={() => setRenamedBehavior(null)}
                />,
                <DialogPrimaryButton
                  key="rename"
                  primary
                  label={<Trans>Rename</Trans>}
                  onClick={applyBehaviorRename}
                />,
              ]}
              onRequestClose={() => setRenamedBehavior(null)}
              onApply={applyBehaviorRename}
            >
              <SemiControlledTextField
                fullWidth
                autoFocus="desktop"
                value={renameValue}
                onChange={setRenameValue}
                floatingLabelText={<Trans>Behavior name</Trans>}
              />
            </Dialog>
          )}
          {richEditorOpen && layersContainer && (
            <RichObjectEditorWindow
              object={object}
              project={project}
              layout={editorLayout}
              eventsFunctionsExtension={selectedObject.eventsFunctionsExtension}
              eventsBasedObject={selectedObject.eventsBasedObject}
              projectScopedContainersAccessor={projectScopedContainersAccessor}
              resourceManagementProps={resourceManagementProps}
              unsavedChanges={unsavedChanges}
              objectTypeLabel={objectTypeLabel}
              originLabel={getObjectOriginLabel(selectedObject)}
              getValidatedObjectName={value =>
                getValidatedObjectName({
                  project,
                  item: selectedObject,
                  value,
                })
              }
              onRenameObject={onRenameObject}
              onObjectUpdated={() => notifyObjectChanged(selectedObject)}
              onOpenEventBasedObjectEditor={onOpenEventBasedObjectEditor}
              onOpenEventBasedObjectVariantEditor={
                onOpenEventBasedObjectVariantEditor
              }
              onDeleteEventsBasedObjectVariant={
                onDeleteEventsBasedObjectVariant
              }
              onClose={closeRichEditor}
            />
          )}
        </div>
      )}
    </I18n>
  );
};

const ObjectSettingsWorkbench: React.ComponentType<{
  ...ObjectSettingsWorkbenchProps,
  +ref?: React.RefSetter<ObjectSettingsWorkbenchInterface>,
}> = React.forwardRef<
  ObjectSettingsWorkbenchProps,
  ObjectSettingsWorkbenchInterface
>((props, ref) => {
  const { project } = props;
  const [objectsVersion, setObjectsVersion] = React.useState(0);
  const objects = React.useMemo(
    () => {
      if (objectsVersion) {
        // Re-enumerate after edits made in another project editor.
      }
      return enumerateWorkbenchObjects(project);
    },
    [project, objectsVersion]
  );
  const [selectedObjectKey, setSelectedObjectKey] = React.useState<?string>(
    () => (objects[0] ? getWorkbenchObjectKey(objects[0]) : null)
  );
  const lastSelectedIndexRef = React.useRef(0);
  const selectedIndex = selectedObjectKey
    ? objects.findIndex(
        item => getWorkbenchObjectKey(item) === selectedObjectKey
      )
    : -1;
  if (selectedIndex >= 0) lastSelectedIndexRef.current = selectedIndex;
  const nearestRemainingIndex = Math.min(
    lastSelectedIndexRef.current,
    Math.max(0, objects.length - 1)
  );
  const selectedObject =
    selectedIndex >= 0
      ? objects[selectedIndex]
      : objects[nearestRemainingIndex] || null;

  const forceRefresh = React.useCallback(() => {
    setObjectsVersion(version => version + 1);
  }, []);
  React.useImperativeHandle(ref, () => ({ forceRefresh }));

  React.useEffect(
    () => {
      if (!selectedObject && selectedObjectKey) setSelectedObjectKey(null);
      else if (
        selectedObject &&
        getWorkbenchObjectKey(selectedObject) !== selectedObjectKey
      ) {
        setSelectedObjectKey(getWorkbenchObjectKey(selectedObject));
      }
    },
    [selectedObject, selectedObjectKey]
  );

  const onSelectObject = React.useCallback(
    (item: WorkbenchObject) => {
      const itemKey = getWorkbenchObjectKey(item);
      const itemIndex = objects.findIndex(
        candidate => getWorkbenchObjectKey(candidate) === itemKey
      );
      if (itemIndex >= 0) lastSelectedIndexRef.current = itemIndex;
      setSelectedObjectKey(itemKey);
      // Native object definitions can be replaced by project/extension
      // refreshes while the switcher is open. Re-enumerate in the same React
      // update as the selection so the workspace never receives the wrapper
      // retained by the switcher row.
      setObjectsVersion(version => version + 1);
    },
    [objects]
  );

  if (!selectedObject) {
    return (
      <ObjectSettingsEmpty
        project={project}
        objects={objects}
        onSelectObject={onSelectObject}
      />
    );
  }

  return (
    <SelectedObjectWorkspace
      {...props}
      objects={objects}
      selectedObject={selectedObject}
      onSelectObject={onSelectObject}
      onObjectsMayHaveChanged={forceRefresh}
    />
  );
});

export default ObjectSettingsWorkbench;
