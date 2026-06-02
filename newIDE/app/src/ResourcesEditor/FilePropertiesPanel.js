// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Background from '../UI/Background';
import Text from '../UI/Text';
import EmptyMessage from '../UI/EmptyMessage';
import ScrollView from '../UI/ScrollView';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import optionalRequire from '../Utils/OptionalRequire';
import {
  isAudioFile,
  isImageFile,
  isMarkdownFile,
  isTextLikeFile,
  isVideoFile,
  type ProjectFileSelection,
} from './ProjectFilesPanel';

const fs = optionalRequire('fs');

type Props = {|
  selectedItem: ?ProjectFileSelection,
|};

type FileStats = {|
  size: number,
  mtimeMs: number,
  birthtimeMs: number,
|};

const styles = {
  section: {
    padding: 12,
  },
  table: {
    display: 'grid',
    gridTemplateColumns: 'minmax(92px, auto) minmax(0, 1fr)',
    gap: '8px 12px',
    alignItems: 'start',
  },
  value: {
    minWidth: 0,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 20,
    padding: '1px 6px',
    borderRadius: 4,
    fontSize: 12,
  },
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[unitIndex]}`;
};

const getKindLabel = (selectedItem: ProjectFileSelection): React.Node => {
  const { node } = selectedItem;
  if (node.type === 'folder') return <Trans>Folder</Trans>;
  if (isImageFile(node)) return <Trans>Image</Trans>;
  if (isAudioFile(node)) return <Trans>Audio</Trans>;
  if (isVideoFile(node)) return <Trans>Video</Trans>;
  if (isMarkdownFile(node)) return <Trans>Markdown</Trans>;
  if (isTextLikeFile(node)) return <Trans>Text</Trans>;
  return <Trans>File</Trans>;
};

const formatDate = (timestamp: number): string => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString();
};

const PropertyRow = ({
  label,
  value,
}: {|
  label: React.Node,
  value: React.Node,
|}) => (
  <>
    <Text noMargin color="secondary">
      {label}
    </Text>
    <div style={styles.value}>
      <Text noMargin allowSelection style={{ overflowWrap: 'anywhere' }}>
        {value}
      </Text>
    </div>
  </>
);

const FilePropertiesPanel = ({ selectedItem }: Props): React.Node => {
  const theme = React.useContext(GDevelopThemeContext);
  const [stats, setStats] = React.useState<?FileStats>(null);
  const [error, setError] = React.useState<?string>(null);

  React.useEffect(
    () => {
      let isMounted = true;
      setStats(null);
      setError(null);

      if (!fs || !selectedItem) return;

      fs.promises
        .stat(selectedItem.node.absolutePath)
        .then(stat => {
          if (!isMounted) return;
          setStats({
            size: stat.size,
            mtimeMs: stat.mtimeMs,
            birthtimeMs: stat.birthtimeMs,
          });
        })
        .catch(error => {
          if (!isMounted) return;
          setError(error.message);
        });

      return () => {
        isMounted = false;
      };
    },
    [selectedItem]
  );

  if (!selectedItem) {
    return (
      <Background>
        <EmptyMessage>
          <Trans>Select a project file to display its properties.</Trans>
        </EmptyMessage>
      </Background>
    );
  }

  const { node, resource } = selectedItem;
  const directChildrenCount = node.children ? node.children.length : null;

  return (
    <Background>
      <ScrollView>
        <div style={styles.section}>
          <Text size="block-title">{node.name}</Text>
          <div style={styles.table}>
            <PropertyRow
              label={<Trans>Kind</Trans>}
              value={getKindLabel(selectedItem)}
            />
            <PropertyRow
              label={<Trans>Path</Trans>}
              value={node.absolutePath}
            />
            {!!node.relativePath && (
              <PropertyRow
                label={<Trans>Project path</Trans>}
                value={node.relativePath}
              />
            )}
            {node.type === 'file' && (
              <PropertyRow
                label={<Trans>Extension</Trans>}
                value={node.extension || <Trans>None</Trans>}
              />
            )}
            {stats && node.type === 'file' && (
              <PropertyRow
                label={<Trans>Size</Trans>}
                value={formatBytes(stats.size)}
              />
            )}
            {directChildrenCount !== null && (
              <PropertyRow
                label={<Trans>Items</Trans>}
                value={directChildrenCount}
              />
            )}
            {stats && (
              <PropertyRow
                label={<Trans>Modified</Trans>}
                value={formatDate(stats.mtimeMs)}
              />
            )}
            {stats && (
              <PropertyRow
                label={<Trans>Created</Trans>}
                value={formatDate(stats.birthtimeMs)}
              />
            )}
            <PropertyRow
              label={<Trans>Resource</Trans>}
              value={
                resource ? (
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: theme.palette.secondary,
                      color: theme.text.color.primary,
                    }}
                  >
                    {resource.getKind()}
                  </span>
                ) : (
                  <Trans>Not registered</Trans>
                )
              }
            />
            {resource && (
              <PropertyRow
                label={<Trans>Resource name</Trans>}
                value={resource.getName()}
              />
            )}
            {!!error && (
              <PropertyRow label={<Trans>Error</Trans>} value={error} />
            )}
          </div>
        </div>
      </ScrollView>
    </Background>
  );
};

export default FilePropertiesPanel;
