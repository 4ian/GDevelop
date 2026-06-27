// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import IconButton from '../UI/IconButton';
import Text from '../UI/Text';
import { ColumnStackLayout } from '../UI/Layout';
import { mapFor } from '../Utils/MapFor';
import newNameGenerator from '../Utils/NewNameGenerator';
import ObjectsRenderingService from '../ObjectsRendering/ObjectsRenderingService';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import ListIcon from '../UI/ListIcon';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { makeDragSourceAndDropTarget } from '../UI/DragAndDrop/DragSourceAndDropTarget';
import { makeDropTarget } from '../UI/DragAndDrop/DropTarget';
import Add from '../UI/CustomSvgIcons/Add';
import Copy from '../UI/CustomSvgIcons/Copy';
import Cross from '../UI/CustomSvgIcons/Cross';
import Edit from '../UI/CustomSvgIcons/Edit';
import Trash from '../UI/CustomSvgIcons/Trash';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import ObjectEditorDialog from '../ObjectEditor/ObjectEditorDialog';
import ObjectGroupEditorDialog from '../ObjectGroupEditor/ObjectGroupEditorDialog';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import EventsRootVariablesFinder from '../Utils/EventsRootVariablesFinder';
import { type ObjectGroupsOutsideEditorChanges } from '../MainFrame/EditorContainers/BaseEditor';
import { type GroupWithContext } from '../ObjectsList/EnumerateObjects';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';

const gd: libGDevelop = global.gd;
const globalObjectFallbackIcon = 'res/icons_default/global_object24_black.svg';
const globalGroupFallbackIcon = 'res/icons_default/global_group24_black.svg';
const globalObjectCardReactDndType = 'GLOBAL_OBJECT_CARD';

type GlobalObjectRow = {|
  object: gdObject,
  name: string,
  type: string,
  thumbnail: ?string,
|};

type GlobalGroupObjectPreview = {|
  name: string,
  thumbnail: ?string,
|};

type GlobalGroupRow = {|
  name: string,
  group: gdObjectGroup,
  objectNames: Array<string>,
  objectPreviews: Array<GlobalGroupObjectPreview>,
|};

type Props = {|
  project: gdProject,
  onChange: () => void,
  onClose: () => void,
  resourceManagementProps: ResourceManagementProps,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
  openBehaviorEvents: (extensionName: string, behaviorName: string) => void,
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
    eventBasedObject: gdEventsBasedObject,
    variant: gdEventsBasedObjectVariant
  ) => void,
  onGlobalObjectEdited: (object: gdObject) => void,
  onEffectAdded: () => void,
  onObjectGroupsModifiedOutsideEditor: (
    changes: ObjectGroupsOutsideEditorChanges
  ) => void,
  onObjectListsModified: ({ isNewObjectTypeUsed: boolean }) => void,
  triggerHotReloadInGameEditorIfNeeded: () => void,
|};

type DraggedGlobalObject = {|
  name: string,
  thumbnail?: string,
|};

const styles = {
  content: {
    width: 'min(1600px, 100%)',
    maxWidth: '100%',
    boxSizing: 'border-box',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  summary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
    marginBottom: 18,
  },
  summaryItem: {
    borderRadius: 8,
    padding: 12,
    minWidth: 0,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 12,
  },
  card: {
    display: 'grid',
    gridTemplateColumns: '64px minmax(0, 1fr)',
    gap: 12,
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
    minWidth: 0,
  },
  draggableCard: {
    cursor: 'grab',
  },
  groupCard: {
    alignItems: 'start',
  },
  previewFrame: {
    width: 56,
    height: 56,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  previewImage: {
    display: 'block',
    maxWidth: 48,
    maxHeight: 48,
    objectFit: 'contain',
  },
  groupPreviewGrid: {
    width: 56,
    height: 56,
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridTemplateRows: 'repeat(2, 1fr)',
    gap: 2,
  },
  groupPreviewCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 4,
  },
  groupPreviewImage: {
    display: 'block',
    maxWidth: 24,
    maxHeight: 24,
    objectFit: 'contain',
  },
  cardText: {
    minWidth: 0,
  },
  nameLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
    flexWrap: 'wrap',
  },
  groupNameLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  groupName: {
    flex: 1,
    minWidth: 0,
    overflowWrap: 'anywhere',
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  typeText: {
    fontFamily: 'Consolas, Monaco, monospace',
    overflowWrap: 'anywhere',
  },
  objects: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  objectBadge: {
    borderRadius: 4,
    padding: '2px 6px',
    fontSize: 12,
    fontFamily: 'inherit',
    lineHeight: '18px',
    overflowWrap: 'anywhere',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    margin: 0,
    textAlign: 'left',
  },
  objectBadgeIcon: {
    width: 14,
    height: 14,
    flexShrink: 0,
  },
  emptySection: {
    borderRadius: 8,
    padding: 16,
  },
};

const enumerateGlobalObjects = (project: gdProject): Array<GlobalObjectRow> => {
  const globalObjects = project.getObjects();
  return mapFor(0, globalObjects.getObjectsCount(), index => {
    const object = globalObjects.getObjectAt(index);
    return {
      object,
      name: object.getName(),
      type: object.getType(),
      thumbnail: ObjectsRenderingService.getThumbnail(
        project,
        object.getConfiguration()
      ),
    };
  });
};

const enumerateGlobalGroups = (project: gdProject): Array<GlobalGroupRow> => {
  const globalObjects = project.getObjects();
  const globalGroups = globalObjects.getObjectGroups();
  return mapFor(0, globalGroups.count(), index => {
    const group = globalGroups.getAt(index);
    const objectNames = group
      .getAllObjectsNames()
      .toJSArray()
      .filter(objectName => globalObjects.hasObjectNamed(objectName));
    return {
      name: group.getName(),
      group,
      objectNames,
      objectPreviews: objectNames.map(objectName => {
        const object = globalObjects.getObject(objectName);
        return {
          name: objectName,
          thumbnail: ObjectsRenderingService.getThumbnail(
            project,
            object.getConfiguration()
          ),
        };
      }),
    };
  });
};

const hasProjectObjectGroupOrVariableNamed = (
  project: gdProject,
  name: string,
  ignoredGlobalGroupName?: ?string,
  ignoredGlobalObjectName?: ?string
): boolean => {
  const globalObjects = project.getObjects();
  if (
    (globalObjects.hasObjectNamed(name) && name !== ignoredGlobalObjectName) ||
    (globalObjects.getObjectGroups().has(name) &&
      name !== ignoredGlobalGroupName) ||
    project.getVariables().has(name)
  ) {
    return true;
  }

  for (let index = 0; index < project.getLayoutsCount(); index++) {
    const layout = project.getLayoutAt(index);
    const layoutObjects = layout.getObjects();
    if (
      layoutObjects.hasObjectNamed(name) ||
      layoutObjects.getObjectGroups().has(name) ||
      layout.getVariables().has(name)
    ) {
      return true;
    }
  }

  return false;
};

const getValidatedGlobalGroupName = (
  project: gdProject,
  newName: string,
  currentName?: ?string
): string =>
  newNameGenerator(gd.Project.getSafeName(newName), name =>
    hasProjectObjectGroupOrVariableNamed(project, name, currentName)
  );

const getValidatedGlobalObjectName = (
  project: gdProject,
  newName: string,
  currentName?: ?string
): string =>
  newNameGenerator(gd.Project.getSafeName(newName), name =>
    hasProjectObjectGroupOrVariableNamed(project, name, null, currentName)
  );

const DraggableGlobalObjectCard = makeDragSourceAndDropTarget<DraggedGlobalObject>(
  globalObjectCardReactDndType,
  { vibrate: 30 }
);

const GlobalGroupDropTarget = makeDropTarget<DraggedGlobalObject>(
  globalObjectCardReactDndType
);

const PreviewImage = ({
  thumbnail,
  alt,
  fallbackIcon,
  imageStyle,
}: {|
  thumbnail: ?string,
  alt: string,
  fallbackIcon: string,
  imageStyle: Object,
|}) => {
  const [imageLoadFailed, setImageLoadFailed] = React.useState(false);

  React.useEffect(
    () => {
      setImageLoadFailed(false);
    },
    [thumbnail]
  );

  return thumbnail && !imageLoadFailed ? (
    <CorsAwareImage
      src={thumbnail}
      alt={alt}
      title={alt}
      style={imageStyle}
      onError={() => setImageLoadFailed(true)}
    />
  ) : (
    <ListIcon iconSize={24} src={fallbackIcon} />
  );
};

const PreviewFrame = ({ children }: {| children: React.Node |}) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  return (
    <div
      style={{
        ...styles.previewFrame,
        backgroundColor: gdevelopTheme.listItem.groupBackgroundColor,
        border: `1px solid ${gdevelopTheme.listItem.separatorColor}`,
      }}
    >
      {children}
    </div>
  );
};

const ObjectPreview = ({ object }: {| object: GlobalObjectRow |}) => (
  <PreviewFrame>
    <PreviewImage
      thumbnail={object.thumbnail}
      alt={object.name}
      fallbackIcon={globalObjectFallbackIcon}
      imageStyle={styles.previewImage}
    />
  </PreviewFrame>
);

const GroupPreview = ({ group }: {| group: GlobalGroupRow |}) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const previews = group.objectPreviews.slice(0, 4);

  return (
    <PreviewFrame>
      {previews.length ? (
        <div style={styles.groupPreviewGrid}>
          {previews.map(objectPreview => (
            <div
              key={objectPreview.name}
              style={{
                ...styles.groupPreviewCell,
                backgroundColor: gdevelopTheme.list.itemsBackgroundColor,
              }}
            >
              <PreviewImage
                thumbnail={objectPreview.thumbnail}
                alt={objectPreview.name}
                fallbackIcon={globalObjectFallbackIcon}
                imageStyle={styles.groupPreviewImage}
              />
            </div>
          ))}
        </div>
      ) : (
        <ListIcon iconSize={24} src={globalGroupFallbackIcon} />
      )}
    </PreviewFrame>
  );
};

const SectionHeader = ({
  title,
  count,
  action,
}: {|
  title: React.Node,
  count: number,
  action?: React.Node,
|}) => (
  <div style={styles.sectionHeader}>
    <div style={styles.sectionHeaderTitle}>
      <Text noMargin size="block-title">
        {title}
      </Text>
      {action}
    </div>
    <Text noMargin size="body-small" color="secondary">
      {count}
    </Text>
  </div>
);

const ObjectCard = ({
  object,
  onEditObject,
  onDuplicateObject,
}: {|
  object: GlobalObjectRow,
  onEditObject: gdObject => void,
  onDuplicateObject: gdObject => void,
|}) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  return (
    <DraggableGlobalObjectCard
      beginDrag={() => ({
        name: object.name,
        thumbnail: object.thumbnail || undefined,
      })}
      canDrop={() => false}
      drop={() => {}}
    >
      {({ connectDragSource }) =>
        connectDragSource(
          <div
            style={{
              ...styles.card,
              ...styles.draggableCard,
              backgroundColor: gdevelopTheme.list.itemsBackgroundColor,
            }}
          >
            <ObjectPreview object={object} />
            <div style={styles.cardText}>
              <div style={styles.nameLine}>
                <Text
                  noMargin
                  allowSelection
                  style={{
                    flex: 1,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {object.name}
                </Text>
                <div style={styles.cardActions}>
                  <IconButton
                    size="small"
                    tooltip={t`Edit object`}
                    aria-label="Edit object"
                    onClick={event => {
                      event.stopPropagation();
                      onEditObject(object.object);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    tooltip={t`Duplicate object`}
                    aria-label="Duplicate object"
                    onClick={event => {
                      event.stopPropagation();
                      onDuplicateObject(object.object);
                    }}
                  >
                    <Copy />
                  </IconButton>
                </div>
              </div>
              <Text noMargin size="body-small" color="secondary" allowSelection>
                <span style={styles.typeText}>{object.type}</span>
              </Text>
            </div>
          </div>
        )
      }
    </DraggableGlobalObjectCard>
  );
};

const GroupCard = ({
  group,
  onAddObjectToGroup,
  onRemoveObjectFromGroup,
  onEditGroup,
  onDeleteGroup,
}: {|
  group: GlobalGroupRow,
  onAddObjectToGroup: (objectName: string, group: GlobalGroupRow) => void,
  onRemoveObjectFromGroup: (objectName: string, group: GlobalGroupRow) => void,
  onEditGroup: (group: GlobalGroupRow) => void,
  onDeleteGroup: (group: GlobalGroupRow) => Promise<void> | void,
|}) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  return (
    <GlobalGroupDropTarget
      canDrop={draggedObject => !group.objectNames.includes(draggedObject.name)}
      drop={monitor => {
        const draggedObject = monitor.getItem();
        if (!draggedObject) return;
        onAddObjectToGroup(draggedObject.name, group);
      }}
    >
      {({ connectDropTarget, isOver, canDrop }) =>
        connectDropTarget(
          <div
            style={{
              ...styles.card,
              ...styles.groupCard,
              backgroundColor: gdevelopTheme.list.itemsBackgroundColor,
              outline:
                isOver && canDrop
                  ? `2px solid ${gdevelopTheme.dropIndicator.canDrop}`
                  : isOver
                  ? `2px solid ${gdevelopTheme.dropIndicator.cannotDrop}`
                  : undefined,
            }}
          >
            <GroupPreview group={group} />
            <div style={styles.cardText}>
              <div style={styles.groupNameLine}>
                <div style={styles.groupName}>
                  <Text
                    noMargin
                    allowSelection
                    style={{ overflowWrap: 'anywhere' }}
                  >
                    {group.name}
                  </Text>
                </div>
                <div style={styles.cardActions}>
                  <IconButton
                    size="small"
                    tooltip={t`Edit group`}
                    aria-label="Edit group"
                    onClick={event => {
                      event.stopPropagation();
                      onEditGroup(group);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    tooltip={t`Delete group`}
                    aria-label="Delete group"
                    onClick={event => {
                      event.stopPropagation();
                      onDeleteGroup(group);
                    }}
                  >
                    <Trash />
                  </IconButton>
                </div>
              </div>
              {group.objectNames.length ? (
                <div style={styles.objects}>
                  {group.objectNames.map(objectName => (
                    <button
                      type="button"
                      key={objectName}
                      title="Remove from group"
                      aria-label={`Remove ${objectName} from group`}
                      onClick={event => {
                        event.stopPropagation();
                        onRemoveObjectFromGroup(objectName, group);
                      }}
                      style={{
                        ...styles.objectBadge,
                        border: `1px solid ${
                          gdevelopTheme.listItem.separatorColor
                        }`,
                        color: gdevelopTheme.text.color.primary,
                      }}
                    >
                      {objectName}
                      <Cross style={styles.objectBadgeIcon} />
                    </button>
                  ))}
                </div>
              ) : (
                <Text noMargin size="body-small" color="secondary">
                  <Trans>No objects in this group.</Trans>
                </Text>
              )}
            </div>
          </div>
        )
      }
    </GlobalGroupDropTarget>
  );
};

const ProjectGlobalsDialog = ({
  project,
  onChange,
  onClose,
  resourceManagementProps,
  hotReloadPreviewButtonProps,
  openBehaviorEvents,
  onWillInstallExtension,
  onExtensionInstalled,
  onOpenEventBasedObjectEditor,
  onOpenEventBasedObjectVariantEditor,
  onDeleteEventsBasedObjectVariant,
  onGlobalObjectEdited,
  onEffectAdded,
  onObjectGroupsModifiedOutsideEditor,
  onObjectListsModified,
  triggerHotReloadInGameEditorIfNeeded,
}: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { showDeleteConfirmation } = useAlertDialog();
  const [, forceRefresh] = React.useState(0);
  const [editedGroup, setEditedGroup] = React.useState<?GlobalGroupRow>(null);
  const [editedObject, setEditedObject] = React.useState<?gdObject>(null);
  const globalObjects = enumerateGlobalObjects(project);
  const globalGroups = enumerateGlobalGroups(project);
  const layoutsCount = project.getLayoutsCount();
  const editorLayout = layoutsCount > 0 ? project.getLayoutAt(0) : null;
  const temporaryLayoutForLayers = React.useMemo(
    () => (layoutsCount === 0 ? new gd.Layout() : null),
    [layoutsCount]
  );
  React.useEffect(
    () => {
      return () => {
        if (temporaryLayoutForLayers) temporaryLayoutForLayers.delete();
      };
    },
    [temporaryLayoutForLayers]
  );
  const projectScopedContainersAccessor = React.useMemo(
    () =>
      new ProjectScopedContainersAccessor(
        editorLayout ? { project, layout: editorLayout } : { project }
      ),
    [project, editorLayout]
  );
  const editorLayersContainer = editorLayout
    ? editorLayout.getLayers()
    : temporaryLayoutForLayers
    ? temporaryLayoutForLayers.getLayers()
    : null;
  const editorLayoutName = editorLayout ? editorLayout.getName() : '';
  const objectEditorTitleSubtitle = editorLayout ? (
    <React.Fragment>
      <Trans>Global objects are edited with the first scene,</Trans>{' '}
      {editorLayoutName}
      <Trans>, as context. Layer dropdowns use this scene's layers.</Trans>
    </React.Fragment>
  ) : (
    <Trans>
      Global objects are edited without a scene context. Layer dropdowns use a
      temporary base layer.
    </Trans>
  );

  const notifyGlobalObjectGroupsModified = React.useCallback(
    () => {
      for (let index = 0; index < project.getLayoutsCount(); index++) {
        onObjectGroupsModifiedOutsideEditor({
          scene: project.getLayoutAt(index),
        });
      }
    },
    [onObjectGroupsModifiedOutsideEditor, project]
  );

  React.useEffect(
    () => {
      const globalObjectsContainer = project.getObjects();
      const globalGroups = globalObjectsContainer.getObjectGroups();
      let didUpdate = false;

      for (let index = 0; index < globalGroups.count(); index++) {
        const group = globalGroups.getAt(index);
        for (const objectName of group.getAllObjectsNames().toJSArray()) {
          if (!globalObjectsContainer.hasObjectNamed(objectName)) {
            group.removeObject(objectName);
            didUpdate = true;
          }
        }
      }

      if (!didUpdate) return;

      notifyGlobalObjectGroupsModified();
      onChange();
      forceRefresh(key => key + 1);
    },
    [notifyGlobalObjectGroupsModified, onChange, project]
  );

  const onAddObjectToGroup = React.useCallback(
    (objectName: string, group: GlobalGroupRow) => {
      if (!project.getObjects().hasObjectNamed(objectName)) return;
      if (group.objectNames.includes(objectName)) return;

      group.group.addObject(objectName);
      notifyGlobalObjectGroupsModified();
      onChange();
      forceRefresh(key => key + 1);
    },
    [notifyGlobalObjectGroupsModified, onChange, project]
  );

  const onRemoveObjectFromGroup = React.useCallback(
    (objectName: string, group: GlobalGroupRow) => {
      if (!group.objectNames.includes(objectName)) return;

      group.group.removeObject(objectName);
      notifyGlobalObjectGroupsModified();
      onChange();
      forceRefresh(key => key + 1);
    },
    [notifyGlobalObjectGroupsModified, onChange]
  );

  const onCreateGroup = React.useCallback(
    () => {
      const globalObjectsContainer = project.getObjects();
      const globalGroups = globalObjectsContainer.getObjectGroups();
      const newGroupName = newNameGenerator('NewGroup', name =>
        hasProjectObjectGroupOrVariableNamed(project, name)
      );

      globalGroups.insertNew(newGroupName, globalGroups.count());
      notifyGlobalObjectGroupsModified();
      onChange();
      forceRefresh(key => key + 1);
    },
    [notifyGlobalObjectGroupsModified, project, onChange]
  );

  const onEditGroup = React.useCallback((group: GlobalGroupRow) => {
    setEditedGroup(group);
  }, []);

  const onEditObject = React.useCallback((object: gdObject) => {
    setEditedObject(object);
  }, []);

  const onDuplicateObject = React.useCallback(
    (object: gdObject) => {
      const globalObjectsContainer = project.getObjects();
      const newName = getValidatedGlobalObjectName(project, object.getName());
      const serializedObject = serializeToJSObject(object);
      const newObject = globalObjectsContainer.insertNewObject(
        project,
        object.getType(),
        newName,
        globalObjectsContainer.getObjectPosition(object.getName()) + 1
      );

      unserializeFromJSObject(
        newObject,
        serializedObject,
        'unserializeFrom',
        project
      );
      newObject.setName(newName);
      newObject.resetPersistentUuid();

      onGlobalObjectEdited(newObject);
      onObjectListsModified({ isNewObjectTypeUsed: false });
      onChange();
      forceRefresh(key => key + 1);
    },
    [onChange, onGlobalObjectEdited, onObjectListsModified, project]
  );

  const onRenameEditedObject = React.useCallback(
    (newName: string) => {
      if (!editedObject) return;

      const currentName = editedObject.getName();
      if (newName === currentName) return;

      const validatedName = getValidatedGlobalObjectName(
        project,
        newName,
        currentName
      );
      if (currentName === validatedName) return;

      gd.WholeProjectRefactorer.globalObjectOrGroupRenamed(
        project,
        currentName,
        validatedName,
        /* isObjectGroup= */ false
      );
      editedObject.setName(validatedName);
    },
    [editedObject, project]
  );

  const finishEditingObject = React.useCallback(
    (
      object: gdObject,
      hasResourceChanged: boolean,
      hasAnyEffectBeenAdded: boolean
    ) => {
      // ObjectEditorDialog applies object variable refactoring and renaming
      // after calling onApply. Defer follow-up work so it sees the final name.
      Promise.resolve().then(() => {
        gd.WholeProjectRefactorer.behaviorsAddedToGlobalObject(
          project,
          object.getName()
        );
        gd.WholeProjectRefactorer.updateBehaviorsSharedData(project);

        onGlobalObjectEdited(object);
        onObjectListsModified({ isNewObjectTypeUsed: false });
        if (hasResourceChanged) {
          resourceManagementProps.onResourceUsageChanged();
        } else {
          triggerHotReloadInGameEditorIfNeeded();
        }
        if (hasAnyEffectBeenAdded) {
          onEffectAdded();
        }
        onChange();
        forceRefresh(key => key + 1);
      });
    },
    [
      onChange,
      onEffectAdded,
      onGlobalObjectEdited,
      onObjectListsModified,
      project,
      resourceManagementProps,
      triggerHotReloadInGameEditorIfNeeded,
    ]
  );

  const onRenameEditedGroup = React.useCallback(
    (
      groupWithContext: GroupWithContext,
      newName: string,
      done: boolean => void
    ) => {
      const currentName = groupWithContext.group.getName();
      if (newName !== currentName) {
        gd.WholeProjectRefactorer.globalObjectOrGroupRenamed(
          project,
          currentName,
          newName,
          /* isObjectGroup= */ true
        );
      }

      done(true);
    },
    [project]
  );

  const finishEditingGroup = React.useCallback(
    () => {
      Promise.resolve().then(() => {
        notifyGlobalObjectGroupsModified();
        onChange();
        forceRefresh(key => key + 1);
      });
    },
    [notifyGlobalObjectGroupsModified, onChange]
  );

  const onDeleteGroup = React.useCallback(
    async (group: GlobalGroupRow) => {
      const answer = await showDeleteConfirmation({
        title: t`Remove group`,
        message: t`Are you sure you want to remove this group? This can't be undone.`,
      });
      if (!answer) return;

      project
        .getObjects()
        .getObjectGroups()
        .remove(group.group.getName());
      if (editedGroup && editedGroup.group.ptr === group.group.ptr) {
        setEditedGroup(null);
      }
      notifyGlobalObjectGroupsModified();
      onChange();
      forceRefresh(key => key + 1);
    },
    [
      editedGroup,
      notifyGlobalObjectGroupsModified,
      onChange,
      project,
      showDeleteConfirmation,
    ]
  );

  const actions: Array<?React.Node> = [
    <FlatButton key="close" label={<Trans>Close</Trans>} onClick={onClose} />,
  ];

  return (
    <Dialog
      open
      title={<Trans>Global objects and groups</Trans>}
      actions={actions}
      onRequestClose={onClose}
      maxWidth="md"
      fullHeight
    >
      <div style={styles.content}>
        <div style={styles.summary}>
          <div
            style={{
              ...styles.summaryItem,
              backgroundColor: gdevelopTheme.list.itemsBackgroundColor,
            }}
          >
            <Text noMargin size="body-small" color="secondary">
              <Trans>Objects</Trans>
            </Text>
            <Text noMargin size="block-title">
              {globalObjects.length}
            </Text>
          </div>
          <div
            style={{
              ...styles.summaryItem,
              backgroundColor: gdevelopTheme.list.itemsBackgroundColor,
            }}
          >
            <Text noMargin size="body-small" color="secondary">
              <Trans>Groups</Trans>
            </Text>
            <Text noMargin size="block-title">
              {globalGroups.length}
            </Text>
          </div>
        </div>
        <ColumnStackLayout noMargin useLargeSpacer>
          <div>
            <SectionHeader
              title={<Trans>Global objects</Trans>}
              count={globalObjects.length}
            />
            {globalObjects.length ? (
              <div style={styles.list}>
                {globalObjects.map(object => (
                  <ObjectCard
                    key={object.name}
                    object={object}
                    onEditObject={onEditObject}
                    onDuplicateObject={onDuplicateObject}
                  />
                ))}
              </div>
            ) : (
              <div
                style={{
                  ...styles.emptySection,
                  backgroundColor: gdevelopTheme.list.itemsBackgroundColor,
                }}
              >
                <Text noMargin color="secondary">
                  <Trans>There are no global objects yet.</Trans>
                </Text>
              </div>
            )}
          </div>
          <div>
            <SectionHeader
              title={<Trans>Global groups</Trans>}
              count={globalGroups.length}
              action={
                <IconButton
                  size="small"
                  tooltip={t`Add a group`}
                  aria-label="Add a group"
                  onClick={onCreateGroup}
                >
                  <Add />
                </IconButton>
              }
            />
            {globalGroups.length ? (
              <div style={styles.list}>
                {globalGroups.map(group => (
                  <GroupCard
                    key={group.name}
                    group={group}
                    onAddObjectToGroup={onAddObjectToGroup}
                    onRemoveObjectFromGroup={onRemoveObjectFromGroup}
                    onEditGroup={onEditGroup}
                    onDeleteGroup={onDeleteGroup}
                  />
                ))}
              </div>
            ) : (
              <div
                style={{
                  ...styles.emptySection,
                  backgroundColor: gdevelopTheme.list.itemsBackgroundColor,
                }}
              >
                <Text noMargin color="secondary">
                  <Trans>There are no global groups yet.</Trans>
                </Text>
              </div>
            )}
          </div>
        </ColumnStackLayout>
      </div>
      {editedGroup && (
        <ObjectGroupEditorDialog
          project={project}
          projectScopedContainersAccessor={projectScopedContainersAccessor}
          group={editedGroup.group}
          onApply={() => {
            setEditedGroup(null);
            finishEditingGroup();
          }}
          onCancel={() => setEditedGroup(null)}
          onObjectGroupAdded={() => {}}
          globalObjectsContainer={project.getObjects()}
          objectsContainer={project.getObjects()}
          initialInstances={
            editorLayout ? editorLayout.getInitialInstances() : null
          }
          initialTab={'objects'}
          onComputeAllVariableNames={() => {
            if (!editorLayout || !editedGroup) return [];

            return EventsRootVariablesFinder.findAllObjectVariables(
              project.getCurrentPlatform(),
              project,
              editorLayout,
              editedGroup.group.getName()
            );
          }}
          isVariableListLocked={false}
          isObjectListLocked={false}
          isGroupGlobal
          onRenameGroup={onRenameEditedGroup}
          getValidatedObjectOrGroupName={newName =>
            getValidatedGlobalGroupName(
              project,
              newName,
              editedGroup.group.getName()
            )
          }
        />
      )}
      {editedObject && editorLayersContainer && (
        <ObjectEditorDialog
          open
          object={editedObject}
          initialTab={null}
          project={project}
          layout={editorLayout}
          eventsFunctionsExtension={null}
          eventsBasedObject={null}
          layersContainer={editorLayersContainer}
          titleSubtitle={objectEditorTitleSubtitle}
          projectScopedContainersAccessor={projectScopedContainersAccessor}
          resourceManagementProps={resourceManagementProps}
          onComputeAllVariableNames={() => {
            if (!editorLayout) return [];

            return EventsRootVariablesFinder.findAllObjectVariables(
              project.getCurrentPlatform(),
              project,
              editorLayout,
              editedObject.getName()
            );
          }}
          onCancel={() => {
            const object = editedObject;
            setEditedObject(null);
            if (object) {
              onGlobalObjectEdited(object);
              triggerHotReloadInGameEditorIfNeeded();
              forceRefresh(key => key + 1);
            }
          }}
          getValidatedObjectOrGroupName={newName =>
            getValidatedGlobalObjectName(
              project,
              newName,
              editedObject.getName()
            )
          }
          onRename={onRenameEditedObject}
          onApply={(hasResourceChanged, hasAnyEffectBeenAdded) => {
            const object = editedObject;
            setEditedObject(null);
            if (!object) return;

            finishEditingObject(
              object,
              hasResourceChanged,
              hasAnyEffectBeenAdded
            );
          }}
          hotReloadPreviewButtonProps={hotReloadPreviewButtonProps}
          onUpdateBehaviorsSharedData={() =>
            gd.WholeProjectRefactorer.updateBehaviorsSharedData(project)
          }
          openBehaviorEvents={openBehaviorEvents}
          onWillInstallExtension={onWillInstallExtension}
          onExtensionInstalled={onExtensionInstalled}
          onOpenEventBasedObjectEditor={onOpenEventBasedObjectEditor}
          onOpenEventBasedObjectVariantEditor={
            onOpenEventBasedObjectVariantEditor
          }
          onDeleteEventsBasedObjectVariant={onDeleteEventsBasedObjectVariant}
          isBehaviorListLocked={false}
          isVariableListLocked={false}
        />
      )}
    </Dialog>
  );
};

export default ProjectGlobalsDialog;
