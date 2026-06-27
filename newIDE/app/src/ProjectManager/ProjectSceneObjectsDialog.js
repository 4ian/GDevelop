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
import {
  type GroupWithContext,
  type ObjectWithContext,
} from '../ObjectsList/EnumerateObjects';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';

const gd: libGDevelop = global.gd;
const sceneObjectFallbackIcon = 'res/functions/object_black.svg';
const sceneGroupFallbackIcon = 'res/icons_default/group24.png';
const sceneObjectCardReactDndType = 'SCENE_OBJECT_CARD';

type SceneObjectRow = {|
  object: gdObject,
  name: string,
  type: string,
  thumbnail: ?string,
|};

type SceneGroupObjectPreview = {|
  name: string,
  thumbnail: ?string,
|};

type SceneGroupRow = {|
  name: string,
  group: gdObjectGroup,
  objectNames: Array<string>,
  objectPreviews: Array<SceneGroupObjectPreview>,
|};

type Props = {|
  project: gdProject,
  layout: gdLayout,
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
  onSceneObjectEdited: (
    scene: gdLayout,
    objectWithContext: ObjectWithContext
  ) => void,
  onEffectAdded: () => void,
  onObjectGroupsModifiedOutsideEditor: (
    changes: ObjectGroupsOutsideEditorChanges
  ) => void,
  onObjectListsModified: ({ isNewObjectTypeUsed: boolean }) => void,
  triggerHotReloadInGameEditorIfNeeded: () => void,
|};

type DraggedSceneObject = {|
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

const DraggableSceneObjectCard = makeDragSourceAndDropTarget<DraggedSceneObject>(
  sceneObjectCardReactDndType,
  { vibrate: 30 }
);

const SceneGroupDropTarget = makeDropTarget<DraggedSceneObject>(
  sceneObjectCardReactDndType
);

const getObjectForPreview = (
  project: gdProject,
  layout: gdLayout,
  objectName: string
): ?gdObject => {
  const sceneObjects = layout.getObjects();
  if (sceneObjects.hasObjectNamed(objectName)) {
    return sceneObjects.getObject(objectName);
  }

  const globalObjects = project.getObjects();
  if (globalObjects.hasObjectNamed(objectName)) {
    return globalObjects.getObject(objectName);
  }

  return null;
};

const enumerateSceneObjects = (
  project: gdProject,
  layout: gdLayout
): Array<SceneObjectRow> => {
  const sceneObjects = layout.getObjects();
  return mapFor(0, sceneObjects.getObjectsCount(), index => {
    const object = sceneObjects.getObjectAt(index);
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

const enumerateSceneGroups = (
  project: gdProject,
  layout: gdLayout
): Array<SceneGroupRow> => {
  const sceneGroups = layout.getObjects().getObjectGroups();
  return mapFor(0, sceneGroups.count(), index => {
    const group = sceneGroups.getAt(index);
    const objectNames = group
      .getAllObjectsNames()
      .toJSArray()
      .filter(objectName => !!getObjectForPreview(project, layout, objectName));

    return {
      name: group.getName(),
      group,
      objectNames,
      objectPreviews: objectNames.map(objectName => {
        const object = getObjectForPreview(project, layout, objectName);
        return {
          name: objectName,
          thumbnail: object
            ? ObjectsRenderingService.getThumbnail(
                project,
                object.getConfiguration()
              )
            : null,
        };
      }),
    };
  });
};

const hasSceneObjectGroupOrVariableNamed = (
  project: gdProject,
  layout: gdLayout,
  name: string,
  ignoredSceneGroupName?: ?string,
  ignoredSceneObjectName?: ?string
): boolean => {
  const globalObjects = project.getObjects();
  const sceneObjects = layout.getObjects();

  return (
    project.getVariables().has(name) ||
    layout.getVariables().has(name) ||
    globalObjects.hasObjectNamed(name) ||
    globalObjects.getObjectGroups().has(name) ||
    (sceneObjects.hasObjectNamed(name) && name !== ignoredSceneObjectName) ||
    (sceneObjects.getObjectGroups().has(name) && name !== ignoredSceneGroupName)
  );
};

const getValidatedSceneObjectName = (
  project: gdProject,
  layout: gdLayout,
  newName: string,
  currentName?: ?string
): string =>
  newNameGenerator(gd.Project.getSafeName(newName), name =>
    hasSceneObjectGroupOrVariableNamed(project, layout, name, null, currentName)
  );

const getValidatedSceneGroupName = (
  project: gdProject,
  layout: gdLayout,
  newName: string,
  currentName?: ?string
): string =>
  newNameGenerator(gd.Project.getSafeName(newName), name =>
    hasSceneObjectGroupOrVariableNamed(project, layout, name, currentName)
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

const ObjectPreview = ({ object }: {| object: SceneObjectRow |}) => (
  <PreviewFrame>
    <PreviewImage
      thumbnail={object.thumbnail}
      alt={object.name}
      fallbackIcon={sceneObjectFallbackIcon}
      imageStyle={styles.previewImage}
    />
  </PreviewFrame>
);

const GroupPreview = ({ group }: {| group: SceneGroupRow |}) => {
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
                fallbackIcon={sceneObjectFallbackIcon}
                imageStyle={styles.groupPreviewImage}
              />
            </div>
          ))}
        </div>
      ) : (
        <ListIcon iconSize={24} src={sceneGroupFallbackIcon} />
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
  object: SceneObjectRow,
  onEditObject: gdObject => void,
  onDuplicateObject: gdObject => void,
|}) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  return (
    <DraggableSceneObjectCard
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
    </DraggableSceneObjectCard>
  );
};

const GroupCard = ({
  group,
  onAddObjectToGroup,
  onRemoveObjectFromGroup,
  onEditGroup,
  onDeleteGroup,
}: {|
  group: SceneGroupRow,
  onAddObjectToGroup: (objectName: string, group: SceneGroupRow) => void,
  onRemoveObjectFromGroup: (objectName: string, group: SceneGroupRow) => void,
  onEditGroup: (group: SceneGroupRow) => void,
  onDeleteGroup: (group: SceneGroupRow) => Promise<void> | void,
|}) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  return (
    <SceneGroupDropTarget
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
    </SceneGroupDropTarget>
  );
};

const ProjectSceneObjectsDialog = ({
  project,
  layout,
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
  onSceneObjectEdited,
  onEffectAdded,
  onObjectGroupsModifiedOutsideEditor,
  onObjectListsModified,
  triggerHotReloadInGameEditorIfNeeded,
}: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { showDeleteConfirmation } = useAlertDialog();
  const [, forceRefresh] = React.useState(0);
  const [editedGroup, setEditedGroup] = React.useState<?SceneGroupRow>(null);
  const [editedObject, setEditedObject] = React.useState<?gdObject>(null);
  const sceneObjects = enumerateSceneObjects(project, layout);
  const sceneGroups = enumerateSceneGroups(project, layout);
  const sceneObjectsContainer = layout.getObjects();
  const projectScopedContainersAccessor = React.useMemo(
    () =>
      new ProjectScopedContainersAccessor({
        project,
        layout,
      }),
    [project, layout]
  );

  const notifySceneObjectGroupsModified = React.useCallback(
    () => {
      onObjectGroupsModifiedOutsideEditor({ scene: layout });
    },
    [layout, onObjectGroupsModifiedOutsideEditor]
  );

  const onAddObjectToGroup = React.useCallback(
    (objectName: string, group: SceneGroupRow) => {
      if (!getObjectForPreview(project, layout, objectName)) return;
      if (group.objectNames.includes(objectName)) return;

      group.group.addObject(objectName);
      notifySceneObjectGroupsModified();
      onChange();
      forceRefresh(key => key + 1);
    },
    [layout, notifySceneObjectGroupsModified, onChange, project]
  );

  const onRemoveObjectFromGroup = React.useCallback(
    (objectName: string, group: SceneGroupRow) => {
      if (!group.objectNames.includes(objectName)) return;

      group.group.removeObject(objectName);
      notifySceneObjectGroupsModified();
      onChange();
      forceRefresh(key => key + 1);
    },
    [notifySceneObjectGroupsModified, onChange]
  );

  const onCreateGroup = React.useCallback(
    () => {
      const sceneGroupsContainer = sceneObjectsContainer.getObjectGroups();
      const newGroupName = newNameGenerator('NewGroup', name =>
        hasSceneObjectGroupOrVariableNamed(project, layout, name)
      );

      sceneGroupsContainer.insertNew(
        newGroupName,
        sceneGroupsContainer.count()
      );
      notifySceneObjectGroupsModified();
      onChange();
      forceRefresh(key => key + 1);
    },
    [
      layout,
      notifySceneObjectGroupsModified,
      onChange,
      project,
      sceneObjectsContainer,
    ]
  );

  const onEditGroup = React.useCallback((group: SceneGroupRow) => {
    setEditedGroup(group);
  }, []);

  const onEditObject = React.useCallback((object: gdObject) => {
    setEditedObject(object);
  }, []);

  const onDuplicateObject = React.useCallback(
    (object: gdObject) => {
      const newName = getValidatedSceneObjectName(
        project,
        layout,
        object.getName()
      );
      const serializedObject = serializeToJSObject(object);
      const newObject = sceneObjectsContainer.insertNewObject(
        project,
        object.getType(),
        newName,
        sceneObjectsContainer.getObjectPosition(object.getName()) + 1
      );

      unserializeFromJSObject(
        newObject,
        serializedObject,
        'unserializeFrom',
        project
      );
      newObject.setName(newName);
      newObject.resetPersistentUuid();

      onSceneObjectEdited(layout, { object: newObject, global: false });
      onObjectListsModified({ isNewObjectTypeUsed: false });
      onChange();
      forceRefresh(key => key + 1);
    },
    [
      layout,
      onChange,
      onObjectListsModified,
      onSceneObjectEdited,
      project,
      sceneObjectsContainer,
    ]
  );

  const onRenameEditedObject = React.useCallback(
    (newName: string) => {
      if (!editedObject) return;

      const currentName = editedObject.getName();
      if (newName === currentName) return;

      const validatedName = getValidatedSceneObjectName(
        project,
        layout,
        newName,
        currentName
      );
      if (currentName === validatedName) return;

      gd.WholeProjectRefactorer.objectOrGroupRenamedInScene(
        project,
        layout,
        currentName,
        validatedName,
        /* isObjectGroup= */ false
      );
      editedObject.setName(validatedName);
    },
    [editedObject, layout, project]
  );

  const finishEditingObject = React.useCallback(
    (
      object: gdObject,
      hasResourceChanged: boolean,
      hasAnyEffectBeenAdded: boolean
    ) => {
      Promise.resolve().then(() => {
        gd.WholeProjectRefactorer.behaviorsAddedToObjectInScene(
          project,
          layout,
          object.getName()
        );
        gd.WholeProjectRefactorer.updateBehaviorsSharedData(project);

        onSceneObjectEdited(layout, { object, global: false });
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
      layout,
      onChange,
      onEffectAdded,
      onObjectListsModified,
      onSceneObjectEdited,
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
        gd.WholeProjectRefactorer.objectOrGroupRenamedInScene(
          project,
          layout,
          currentName,
          newName,
          /* isObjectGroup= */ true
        );
      }

      done(true);
    },
    [layout, project]
  );

  const finishEditingGroup = React.useCallback(
    () => {
      Promise.resolve().then(() => {
        notifySceneObjectGroupsModified();
        onChange();
        forceRefresh(key => key + 1);
      });
    },
    [notifySceneObjectGroupsModified, onChange]
  );

  const onDeleteGroup = React.useCallback(
    async (group: SceneGroupRow) => {
      const answer = await showDeleteConfirmation({
        title: t`Remove group`,
        message: t`Are you sure you want to remove this group? This can't be undone.`,
      });
      if (!answer) return;

      sceneObjectsContainer.getObjectGroups().remove(group.group.getName());
      if (editedGroup && editedGroup.group.ptr === group.group.ptr) {
        setEditedGroup(null);
      }
      notifySceneObjectGroupsModified();
      onChange();
      forceRefresh(key => key + 1);
    },
    [
      editedGroup,
      notifySceneObjectGroupsModified,
      onChange,
      sceneObjectsContainer,
      showDeleteConfirmation,
    ]
  );

  const actions: Array<?React.Node> = [
    <FlatButton key="close" label={<Trans>Close</Trans>} onClick={onClose} />,
  ];

  return (
    <Dialog
      open
      title={<Trans>Objects and groups</Trans>}
      subtitle={layout.getName()}
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
              {sceneObjects.length}
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
              {sceneGroups.length}
            </Text>
          </div>
        </div>
        <ColumnStackLayout noMargin useLargeSpacer>
          <div>
            <SectionHeader
              title={<Trans>Scene objects</Trans>}
              count={sceneObjects.length}
            />
            {sceneObjects.length ? (
              <div style={styles.list}>
                {sceneObjects.map(object => (
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
                  <Trans>There are no scene objects yet.</Trans>
                </Text>
              </div>
            )}
          </div>
          <div>
            <SectionHeader
              title={<Trans>Scene groups</Trans>}
              count={sceneGroups.length}
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
            {sceneGroups.length ? (
              <div style={styles.list}>
                {sceneGroups.map(group => (
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
                  <Trans>There are no scene groups yet.</Trans>
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
          objectsContainer={sceneObjectsContainer}
          initialInstances={layout.getInitialInstances()}
          initialTab={'objects'}
          objectNameFilter={objectName =>
            sceneObjectsContainer.hasObjectNamed(objectName)
          }
          onComputeAllVariableNames={() =>
            EventsRootVariablesFinder.findAllObjectVariables(
              project.getCurrentPlatform(),
              project,
              layout,
              editedGroup.group.getName()
            )
          }
          isVariableListLocked={false}
          isObjectListLocked={false}
          isGroupGlobal={false}
          onRenameGroup={onRenameEditedGroup}
          getValidatedObjectOrGroupName={newName =>
            getValidatedSceneGroupName(
              project,
              layout,
              newName,
              editedGroup.group.getName()
            )
          }
        />
      )}
      {editedObject && (
        <ObjectEditorDialog
          open
          object={editedObject}
          initialTab={null}
          project={project}
          layout={layout}
          eventsFunctionsExtension={null}
          eventsBasedObject={null}
          layersContainer={layout.getLayers()}
          projectScopedContainersAccessor={projectScopedContainersAccessor}
          resourceManagementProps={resourceManagementProps}
          onComputeAllVariableNames={() =>
            EventsRootVariablesFinder.findAllObjectVariables(
              project.getCurrentPlatform(),
              project,
              layout,
              editedObject.getName()
            )
          }
          onCancel={() => {
            const object = editedObject;
            setEditedObject(null);
            if (object) {
              onSceneObjectEdited(layout, { object, global: false });
              triggerHotReloadInGameEditorIfNeeded();
              forceRefresh(key => key + 1);
            }
          }}
          getValidatedObjectOrGroupName={newName =>
            getValidatedSceneObjectName(
              project,
              layout,
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

export default ProjectSceneObjectsDialog;
