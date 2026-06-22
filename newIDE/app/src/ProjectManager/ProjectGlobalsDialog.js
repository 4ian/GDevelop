// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import { ColumnStackLayout } from '../UI/Layout';
import { mapFor } from '../Utils/MapFor';
import ObjectsRenderingService from '../ObjectsRendering/ObjectsRenderingService';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import ListIcon from '../UI/ListIcon';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';

const globalObjectFallbackIcon = 'res/icons_default/global_object24_black.svg';
const globalGroupFallbackIcon = 'res/icons_default/global_group24_black.svg';

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
  objectNames: Array<string>,
  objectPreviews: Array<GlobalGroupObjectPreview>,
|};

type Props = {|
  project: gdProject,
  onClose: () => void,
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
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 10,
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
    lineHeight: '18px',
    overflowWrap: 'anywhere',
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
}: {|
  title: React.Node,
  count: number,
|}) => (
  <div style={styles.sectionHeader}>
    <Text noMargin size="block-title">
      {title}
    </Text>
    <Text noMargin size="body-small" color="secondary">
      {count}
    </Text>
  </div>
);

const ProjectGlobalsDialog = ({ project, onClose }: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const globalObjects = React.useMemo(() => enumerateGlobalObjects(project), [
    project,
  ]);
  const globalGroups = React.useMemo(() => enumerateGlobalGroups(project), [
    project,
  ]);

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
                  <div
                    key={object.name}
                    style={{
                      ...styles.card,
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
                      <Text
                        noMargin
                        size="body-small"
                        color="secondary"
                        allowSelection
                      >
                        <span style={styles.typeText}>{object.type}</span>
                      </Text>
                    </div>
                  </div>
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
            />
            {globalGroups.length ? (
              <div style={styles.list}>
                {globalGroups.map(group => (
                  <div
                    key={group.name}
                    style={{
                      ...styles.card,
                      ...styles.groupCard,
                      backgroundColor: gdevelopTheme.list.itemsBackgroundColor,
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
                            <span
                              key={objectName}
                              style={{
                                ...styles.objectBadge,
                                border: `1px solid ${
                                  gdevelopTheme.listItem.separatorColor
                                }`,
                              }}
                            >
                              {objectName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <Text noMargin size="body-small" color="secondary">
                          <Trans>No objects in this group.</Trans>
                        </Text>
                      )}
                    </div>
                  </div>
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
