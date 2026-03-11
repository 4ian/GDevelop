// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { Tabs } from '../UI/Tabs';
import Text from '../UI/Text';
import TextField from '../UI/TextField';
import ColorField from '../UI/ColorField';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import { LineStackLayout, ColumnStackLayout } from '../UI/Layout';
import { Column, Line } from '../UI/Grid';
import IconButton from '../UI/IconButton';
import Add from '../UI/CustomSvgIcons/Add';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Delete from '@material-ui/icons/Delete';
import { mapFor } from '../Utils/MapFor';
import { makeDropTarget } from '../UI/DragAndDrop/DropTarget';
import { makeDragSourceAndDropTarget } from '../UI/DragAndDrop/DragSourceAndDropTarget';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { rgbStringToHexString } from '../Utils/ColorTransformer';
import type { SceneWorkflowMetadata, SceneWorkflowColumn } from './SceneWorkflowMetadata';

const SCENE_CARD_DND_TYPE = 'SCENE_WORKFLOW_CARD';
const SceneCardDragSourceAndDropTarget = makeDragSourceAndDropTarget(
  SCENE_CARD_DND_TYPE
);
const SceneColumnDropTarget = makeDropTarget(SCENE_CARD_DND_TYPE);

const styles = {
  dialogBody: {
    height: '70vh',
    minHeight: 360,
  },
  board: {
    display: 'flex',
    gap: 12,
    overflowX: 'auto',
    padding: 12,
    alignItems: 'flex-start',
    height: '100%',
    boxSizing: 'border-box',
  },
  column: {
    minWidth: 240,
    borderRadius: 6,
    border: '1px solid',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '100%',
  },
  columnHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 10px',
    borderBottom: '1px solid',
  },
  columnBody: {
    padding: 8,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  columnColor: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },
  card: {
    padding: '8px 10px',
    borderRadius: 6,
    cursor: 'grab',
    border: '1px solid',
  },
  settingsRow: {
    alignItems: 'center',
  },
};

type Props = {|
  open: boolean,
  project: gdProject,
  metadata: SceneWorkflowMetadata,
  onUpdateMetadata: (
    updater: SceneWorkflowMetadata => SceneWorkflowMetadata
  ) => void,
  onOpenScene: (sceneName: string) => void,
  onClose: () => void,
|};

const SceneWorkflowDialog = ({
  open,
  project,
  metadata,
  onUpdateMetadata,
  onOpenScene,
  onClose,
}: Props): React.Node => {
  const [currentTab, setCurrentTab] = React.useState<'board' | 'settings'>(
    'board'
  );
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const columns = React.useMemo(() => {
    return [...metadata.workflow.columns].sort((a, b) => a.order - b.order);
  }, [metadata.workflow.columns]);

  const sceneNames = React.useMemo(
    () =>
      mapFor(0, project.getLayoutsCount(), i =>
        project.getLayoutAt(i).getName()
      ),
    [project]
  );

  const getSceneColumnId = React.useCallback(
    (sceneName: string): string =>
      (metadata.sceneStatus[sceneName] &&
        metadata.sceneStatus[sceneName].columnId) ||
      metadata.workflow.defaultColumnId ||
      (columns.length ? columns[0].id : ''),
    [metadata.sceneStatus, metadata.workflow.defaultColumnId, columns]
  );

  const scenesByColumn = React.useMemo(() => {
    const grouped = {};
    columns.forEach(column => {
      grouped[column.id] = [];
    });
    sceneNames.forEach(sceneName => {
      const columnId = getSceneColumnId(sceneName);
      if (!grouped[columnId]) grouped[columnId] = [];
      grouped[columnId].push(sceneName);
    });
    return grouped;
  }, [columns, sceneNames, getSceneColumnId]);

  const updateColumn = React.useCallback(
    (columnId: string, changes: $Shape<SceneWorkflowColumn>) => {
      onUpdateMetadata(previous => ({
        ...previous,
        workflow: {
          ...previous.workflow,
          columns: previous.workflow.columns.map(column =>
            column.id === columnId ? { ...column, ...changes } : column
          ),
        },
      }));
    },
    [onUpdateMetadata]
  );

  const moveColumn = React.useCallback(
    (columnId: string, direction: number) => {
      onUpdateMetadata(previous => {
        const ordered = [...previous.workflow.columns].sort(
          (a, b) => a.order - b.order
        );
        const index = ordered.findIndex(column => column.id === columnId);
        if (index === -1) return previous;
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= ordered.length) return previous;
        const reordered = [...ordered];
        const [moved] = reordered.splice(index, 1);
        reordered.splice(newIndex, 0, moved);
        const updated = reordered.map((column, idx) => ({
          ...column,
          order: idx,
        }));
        return {
          ...previous,
          workflow: {
            ...previous.workflow,
            columns: updated,
          },
        };
      });
    },
    [onUpdateMetadata]
  );

  const deleteColumn = React.useCallback(
    (columnId: string) => {
      if (columns.length <= 1) return;
      onUpdateMetadata(previous => {
        const remainingColumns = previous.workflow.columns.filter(
          column => column.id !== columnId
        );
        const fallbackColumnId =
          previous.workflow.defaultColumnId === columnId &&
          remainingColumns.length
            ? remainingColumns[0].id
            : previous.workflow.defaultColumnId;
        const updatedSceneStatus = {};
        Object.keys(previous.sceneStatus).forEach(sceneName => {
          const status = previous.sceneStatus[sceneName];
          if (!status || status.columnId !== columnId) {
            updatedSceneStatus[sceneName] = status;
          } else if (fallbackColumnId) {
            updatedSceneStatus[sceneName] = { columnId: fallbackColumnId };
          }
        });
        return {
          ...previous,
          workflow: {
            ...previous.workflow,
            columns: remainingColumns.map((column, index) => ({
              ...column,
              order: index,
            })),
            defaultColumnId: fallbackColumnId,
          },
          sceneStatus: updatedSceneStatus,
        };
      });
    },
    [columns.length, onUpdateMetadata]
  );

  const addColumn = React.useCallback(
    () => {
      onUpdateMetadata(previous => {
        const newColumnId = `column-${Date.now().toString(36)}`;
        const newColumn = {
          id: newColumnId,
          name: 'New column',
          color: '120;120;120',
          order: previous.workflow.columns.length,
        };
        return {
          ...previous,
          workflow: {
            ...previous.workflow,
            columns: [...previous.workflow.columns, newColumn],
          },
        };
      });
    },
    [onUpdateMetadata]
  );

  const setDefaultColumn = React.useCallback(
    (columnId: string) => {
      onUpdateMetadata(previous => ({
        ...previous,
        workflow: {
          ...previous.workflow,
          defaultColumnId: columnId,
        },
      }));
    },
    [onUpdateMetadata]
  );

  const moveSceneToColumn = React.useCallback(
    (sceneName: string, columnId: string) => {
      onUpdateMetadata(previous => ({
        ...previous,
        sceneStatus: {
          ...previous.sceneStatus,
          [sceneName]: { columnId },
        },
      }));
    },
    [onUpdateMetadata]
  );

  const renderBoard = () => (
    <div style={styles.board}>
      {columns.map(column => {
        const columnColor = rgbStringToHexString(column.color);
        return (
          <SceneColumnDropTarget
            key={column.id}
            canDrop={() => true}
            drop={monitor => {
              const item = monitor.getItem();
              if (!item || !item.sceneName) return;
              if (getSceneColumnId(item.sceneName) === column.id) return;
              moveSceneToColumn(item.sceneName, column.id);
            }}
          >
            {({ connectDropTarget, isOver }) =>
              connectDropTarget(
                <div
                  style={{
                    ...styles.column,
                    borderColor: isOver
                      ? gdevelopTheme.listItem.separatorColor
                      : gdevelopTheme.listItem.separatorColor,
                    backgroundColor: gdevelopTheme.paper.backgroundColor.light,
                    boxShadow: isOver
                      ? `0 0 0 2px ${gdevelopTheme.listItem.separatorColor}`
                      : undefined,
                  }}
                >
                  <div
                    style={{
                      ...styles.columnHeader,
                      borderBottomColor: gdevelopTheme.listItem.separatorColor,
                    }}
                  >
                    <div
                      style={{
                        ...styles.columnColor,
                        backgroundColor: columnColor,
                      }}
                    />
                    <Text size="block-title">{column.name}</Text>
                  </div>
                  <div style={styles.columnBody}>
                    {(scenesByColumn[column.id] || []).map(sceneName => (
                      <SceneCardDragSourceAndDropTarget
                        key={sceneName}
                        beginDrag={() => ({ sceneName })}
                        canDrop={() => false}
                        drop={() => {}}
                      >
                        {({ connectDragSource, isDragging }) =>
                          connectDragSource(
                            <div
                              style={{
                                ...styles.card,
                                borderColor:
                                  gdevelopTheme.listItem.separatorColor,
                                backgroundColor:
                                  gdevelopTheme.paper.backgroundColor.dark,
                                opacity: isDragging ? 0.6 : 1,
                              }}
                              onClick={() => onOpenScene(sceneName)}
                            >
                              <Text noMargin>{sceneName}</Text>
                            </div>
                          )
                        }
                      </SceneCardDragSourceAndDropTarget>
                    ))}
                    {scenesByColumn[column.id] &&
                      scenesByColumn[column.id].length === 0 && (
                        <Text noMargin color="secondary">
                          <Trans>No scenes</Trans>
                        </Text>
                      )}
                  </div>
                </div>
              )
            }
          </SceneColumnDropTarget>
        );
      })}
    </div>
  );

  const renderSettings = () => (
    <ColumnStackLayout noMargin expand>
      <LineStackLayout alignItems="center" noMargin>
        <Text size="block-title">
          <Trans>Default column</Trans>
        </Text>
        <SelectField
          value={metadata.workflow.defaultColumnId}
          onChange={(e, index, value) => setDefaultColumn(value)}
          fullWidth
        >
          {columns.map(column => (
            <SelectOption
              key={column.id}
              value={column.id}
              label={column.name}
            />
          ))}
        </SelectField>
      </LineStackLayout>
      <Line noMargin>
        <Column expand>
          <Text size="block-title">
            <Trans>Columns</Trans>
          </Text>
        </Column>
        <IconButton size="small" onClick={addColumn} tooltip={t`Add column`}>
          <Add />
        </IconButton>
      </Line>
      <ColumnStackLayout noMargin>
        {columns.map((column, index) => (
          <LineStackLayout key={column.id} noMargin style={styles.settingsRow}>
            <TextField
              value={column.name}
              onChange={(event, value) =>
                updateColumn(column.id, { name: value })
              }
              fullWidth
            />
            <ColorField
              color={column.color}
              onChange={newColor => updateColumn(column.id, { color: newColor })}
              disableAlpha
            />
            <IconButton
              size="small"
              onClick={() => moveColumn(column.id, -1)}
              disabled={index === 0}
              tooltip={t`Move up`}
            >
              <ArrowUpward />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => moveColumn(column.id, 1)}
              disabled={index === columns.length - 1}
              tooltip={t`Move down`}
            >
              <ArrowDownward />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => deleteColumn(column.id)}
              disabled={columns.length <= 1}
              tooltip={t`Delete column`}
            >
              <Delete />
            </IconButton>
          </LineStackLayout>
        ))}
      </ColumnStackLayout>
    </ColumnStackLayout>
  );

  return (
    <Dialog
      title={<Trans>Scene workflow</Trans>}
      open={open}
      onRequestClose={onClose}
      maxWidth="lg"
      fullHeight
      actions={[
        <DialogPrimaryButton
          key="close"
          label={<Trans>Close</Trans>}
          onClick={onClose}
        />,
      ]}
    >
      <ColumnStackLayout noMargin expand style={styles.dialogBody}>
        <Tabs
          value={currentTab}
          onChange={setCurrentTab}
          options={[
            { value: 'board', label: <Trans>Board</Trans> },
            { value: 'settings', label: <Trans>Settings</Trans> },
          ]}
        />
        {currentTab === 'board' ? renderBoard() : renderSettings()}
      </ColumnStackLayout>
    </Dialog>
  );
};

export default SceneWorkflowDialog;
