// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import { ColumnStackLayout } from '../UI/Layout';
import { mapFor } from '../Utils/MapFor';

export type ProjectGlobalsDialogKind = 'objects' | 'groups';

type GlobalObjectRow = {|
  name: string,
  type: string,
|};

type GlobalGroupRow = {|
  name: string,
  objectNames: Array<string>,
|};

type Props = {|
  project: gdProject,
  kind: ProjectGlobalsDialogKind,
  onClose: () => void,
|};

const styles = {
  list: {
    width: 'min(420px, 100%)',
    maxWidth: '100%',
    maxHeight: '65vh',
    overflowY: 'auto',
  },
  row: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '10px 0',
    borderBottom: '1px solid rgba(128, 128, 128, 0.24)',
  },
  rowHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 16,
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
  },
  objectBadge: {
    border: '1px solid rgba(128, 128, 128, 0.35)',
    borderRadius: 4,
    padding: '2px 6px',
    fontSize: 12,
    lineHeight: '18px',
    overflowWrap: 'anywhere',
  },
};

const enumerateGlobalObjects = (project: gdProject): Array<GlobalObjectRow> => {
  const globalObjects = project.getObjects();
  return mapFor(0, globalObjects.getObjectsCount(), index => {
    const object = globalObjects.getObjectAt(index);
    return {
      name: object.getName(),
      type: object.getType(),
    };
  });
};

const enumerateGlobalGroups = (project: gdProject): Array<GlobalGroupRow> => {
  const globalGroups = project.getObjects().getObjectGroups();
  return mapFor(0, globalGroups.count(), index => {
    const group = globalGroups.getAt(index);
    return {
      name: group.getName(),
      objectNames: group.getAllObjectsNames().toJSArray(),
    };
  });
};

const ProjectGlobalsDialog = ({
  project,
  kind,
  onClose,
}: Props): React.Node => {
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
      title={
        kind === 'objects' ? (
          <Trans>Global objects</Trans>
        ) : (
          <Trans>Global groups</Trans>
        )
      }
      actions={actions}
      onRequestClose={onClose}
      maxWidth="sm"
    >
      <div style={styles.list}>
        {kind === 'objects' ? (
          globalObjects.length ? (
            <ColumnStackLayout noMargin>
              {globalObjects.map(object => (
                <div key={object.name} style={styles.row}>
                  <div style={styles.rowHeader}>
                    <Text noMargin>{object.name}</Text>
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
            </ColumnStackLayout>
          ) : (
            <Text noMargin color="secondary">
              <Trans>There are no global objects yet.</Trans>
            </Text>
          )
        ) : globalGroups.length ? (
          <ColumnStackLayout noMargin>
            {globalGroups.map(group => (
              <div key={group.name} style={styles.row}>
                <Text noMargin>{group.name}</Text>
                {group.objectNames.length ? (
                  <div style={styles.objects}>
                    {group.objectNames.map(objectName => (
                      <span key={objectName} style={styles.objectBadge}>
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
            ))}
          </ColumnStackLayout>
        ) : (
          <Text noMargin color="secondary">
            <Trans>There are no global groups yet.</Trans>
          </Text>
        )}
      </div>
    </Dialog>
  );
};

export default ProjectGlobalsDialog;
