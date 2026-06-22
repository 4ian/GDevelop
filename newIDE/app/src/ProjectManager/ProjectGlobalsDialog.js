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
import Cross from '../UI/CustomSvgIcons/Cross';

const globalObjectFallbackIcon = 'res/icons_default/global_object24_black.svg';
const globalGroupFallbackIcon = 'res/icons_default/global_group24_black.svg';
const globalObjectCardReactDndType = 'GLOBAL_OBJECT_CARD';

type GlobalObjectRow = {|
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
    const objectNames = group.getAllObjectsNames().toJSArray();
    return {
      name: group.getName(),
      group,
      objectNames,
      objectPreviews: objectNames
        .filter(objectName => globalObjects.hasObjectNamed(objectName))
        .map(objectName => {
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
  name: string
): boolean => {
  const globalObjects = project.getObjects();
  if (
    globalObjects.hasObjectNamed(name) ||
    globalObjects.getObjectGroups().has(name) ||
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

const ObjectCard = ({ object }: {| object: GlobalObjectRow |}) => {
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
                  style={{ overflowWrap: 'anywhere' }}
                >
                  {object.name}
                </Text>
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
}: {|
  group: GlobalGroupRow,
  onAddObjectToGroup: (objectName: string, group: GlobalGroupRow) => void,
  onRemoveObjectFromGroup: (objectName: string, group: GlobalGroupRow) => void,
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
              <Text
                noMargin
                allowSelection
                style={{ overflowWrap: 'anywhere' }}
              >
                {group.name}
              </Text>
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
}: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const [, forceRefresh] = React.useState(0);
  const globalObjects = enumerateGlobalObjects(project);
  const globalGroups = enumerateGlobalGroups(project);

  const onAddObjectToGroup = React.useCallback(
    (objectName: string, group: GlobalGroupRow) => {
      if (group.objectNames.includes(objectName)) return;

      group.group.addObject(objectName);
      onChange();
      forceRefresh(key => key + 1);
    },
    [onChange]
  );

  const onRemoveObjectFromGroup = React.useCallback(
    (objectName: string, group: GlobalGroupRow) => {
      if (!group.objectNames.includes(objectName)) return;

      group.group.removeObject(objectName);
      onChange();
      forceRefresh(key => key + 1);
    },
    [onChange]
  );

  const onCreateGroup = React.useCallback(
    () => {
      const globalObjectsContainer = project.getObjects();
      const globalGroups = globalObjectsContainer.getObjectGroups();
      const newGroupName = newNameGenerator('NewGroup', name =>
        hasProjectObjectGroupOrVariableNamed(project, name)
      );

      globalGroups.insertNew(newGroupName, globalGroups.count());
      onChange();
      forceRefresh(key => key + 1);
    },
    [project, onChange]
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
                  <ObjectCard key={object.name} object={object} />
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
    </Dialog>
  );
};

export default ProjectGlobalsDialog;
