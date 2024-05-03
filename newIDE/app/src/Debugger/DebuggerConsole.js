// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';

import {
  List,
  CellMeasurer,
  CellMeasurerCache,
  AutoSizer,
} from 'react-virtualized';
import useForceUpdate from '../Utils/UseForceUpdate';

import Chip from '../UI/Chip';

import { Line, Column, Spacer } from '../UI/Grid';
import Dialog from '../UI/Dialog';
import MiniToolbar from '../UI/MiniToolbar';
import IconButton from '../UI/IconButton';
import FlatButton from '../UI/FlatButton';
import Checkbox from '../UI/Checkbox';

import TimerIcon from '@material-ui/icons/Timer';

import InfoIcon from '../UI/CustomSvgIcons/SquaredInfo';
import WarningIcon from '../UI/CustomSvgIcons/Warning';
import ErrorIcon from '../UI/CustomSvgIcons/Error';
import FilterIcon from '../UI/CustomSvgIcons/Filter';
import FolderIcon from '../UI/CustomSvgIcons/Folder';
import VisibilityIcon from '../UI/CustomSvgIcons/Visibility';
import VisibilityOffIcon from '../UI/CustomSvgIcons/VisibilityOff';
import MaximizeIcon from '../UI/CustomSvgIcons/Maximize';
import MinimizeIcon from '../UI/CustomSvgIcons/Minimize';

export type Log = {
  message: string,
  type: 'info' | 'warning' | 'error',
  group: string,
  internal?: boolean,
  timestamp: number,
};

/**
 * Store logs and groups that are received, batch the logs and allow to register callbacks called when a batch of log is received.
 * This helps avoiding too much re-render on React side when a lot of logs are received.
 */
export class LogsManager {
  logs: Array<Log> = [];
  groups: Set<string> = new Set();
  _onNewLog: Set<() => void> = new Set();
  _onNewGroup: Set<() => void> = new Set();
  _pendingLogs: Array<Log> = [];
  _pendingCommit: boolean = false;

  _commitLogs() {
    this.logs.unshift(...this._pendingLogs);
    this._pendingLogs.length = 0;
    this._pendingCommit = false;
    this._onNewLog.forEach(f => f());
  }

  addLog(log: Log) {
    this._pendingLogs.unshift(log);
    if (!this.groups.has(log.group)) {
      this.groups.add(log.group);
      this._onNewGroup.forEach(f => f());
    }
    if (!this._pendingCommit) {
      setTimeout(this._commitLogs.bind(this), 200);
      this._pendingCommit = true;
    }
  }

  on(event: 'group' | 'log', handler: () => void) {
    if (event === 'group') this._onNewGroup.add(handler);
    if (event === 'log') this._onNewLog.add(handler);
  }

  off(event: 'group' | 'log', handler: () => void) {
    if (event === 'group') this._onNewGroup.delete(handler);
    if (event === 'log') this._onNewLog.delete(handler);
  }
}

const selectableTextStyle = {
  userSelect: 'text',
  cursor: 'text',
  wordBreak: 'break-word',
};

const styles = {
  list: {
    // While in theory it should not happen, be sure there is never a horizontal scrollbar:
    overflowX: 'hidden',
    // Always show the vertical scrollbar to avoid rendering issues:
    overflowY: 'scroll',
  },
  tag: { marginRight: 2 },
  consoleTextArea: {
    ...selectableTextStyle,
    width: '100%',
    backgroundColor: '#292929',
    borderRadius: '4px',
    border: '1px solid slategray',
    color: 'white',
    fontFamily: "'Courier New', monospace",
    fontSize: 11,
    padding: 3,
  },
};

const Tag = ({ icon, label }: {| icon: React.Node, label: React.Node |}) => (
  <Chip
    icon={icon}
    style={styles.tag}
    size="small"
    label={<span style={selectableTextStyle}>{label}</span>}
  />
);

const iconMap = {
  info: <InfoIcon color="primary" fontSize="small" />,
  warning: <WarningIcon color="secondary" fontSize="small" />,
  error: <ErrorIcon color="error" fontSize="small" />,
};

export const DebuggerConsole = ({
  logsManager,
}: {
  logsManager: LogsManager,
}) => {
  const forceUpdate = useForceUpdate();

  const { logs, groups } = logsManager;
  React.useEffect(
    () => {
      // Rerender when the logs are updated
      const onUpdate = () => {
        forceUpdate();
      };
      logsManager.on('log', onUpdate);
      return () => {
        logsManager.off('log', onUpdate);
      };
    },
    [forceUpdate, logsManager]
  );

  const cachedHeightsForWidth = React.useRef(0);
  const cellMeasurerCache = React.useMemo(
    () =>
      new CellMeasurerCache({
        defaultHeight: 45,
        minHeight: 25,
        fixedWidth: true,
        // Inverse index so that each log always
        // get assigned the same ID despite all indices
        // shifting when a log is added.
        keyMapper: index => logs.length - index,
      }),
    [logs]
  );

  const [hideInternal, setHideInternal] = React.useState(false);
  const [showDetails, _setShowDetails] = React.useState(true);
  const setShowDetails = (show: boolean) => {
    _setShowDetails(show);
    // As the size of the cells have changed, clear the measurer cache to allow remeasuring them.
    cellMeasurerCache.clearAll();
  };

  const [editingHiddenGroups, setEditingHiddenGroups] = React.useState(false);
  const hiddenGroups = React.useRef(new Set()).current;
  React.useEffect(
    () => {
      // Do not register for group updates to avoid rerendering when the groups are not displayed.
      if (!editingHiddenGroups) return;

      // Rerender when the groups are updated
      const onUpdate = () => forceUpdate();
      logsManager.on('group', onUpdate);
      return () => {
        logsManager.off('group', onUpdate);
      };
    },
    [editingHiddenGroups, forceUpdate, logsManager]
  );

  const filteredLogs = logs
    .filter(({ internal }) => !(hideInternal && internal))
    .filter(({ group }) => !hiddenGroups.has(group));

  return (
    <Column noMargin noOverflowParent expand>
      <Line noMargin expand>
        <AutoSizer>
          {({ width, height }) => {
            if (!width || !height) return null;

            // Reset the cached heights in case the width changed.
            if (cachedHeightsForWidth.current !== width) {
              cellMeasurerCache.clearAll();
              cachedHeightsForWidth.current = width;
            }

            return (
              <List
                deferredMeasurementCache={cellMeasurerCache}
                height={height}
                width={width}
                style={styles.list}
                rowCount={filteredLogs.length}
                rowHeight={cellMeasurerCache.rowHeight}
                rowRenderer={({ index, key, parent, style }) => (
                  <CellMeasurer
                    cache={cellMeasurerCache}
                    columnIndex={0}
                    key={key}
                    parent={parent}
                    rowIndex={index}
                  >
                    {({ registerChild }) => (
                      <div
                        key={key}
                        style={{
                          ...style,
                          padding: 2,
                          display: 'flex',
                          alignItems: 'flex-start',
                        }}
                        ref={registerChild}
                      >
                        <Column noMargin>
                          {iconMap[filteredLogs[index].type] || iconMap['info']}
                        </Column>
                        <Spacer />
                        <Column noMargin expand>
                          <Line noMargin>
                            <div style={styles.consoleTextArea}>
                              {filteredLogs[index].message}
                            </div>
                          </Line>
                          {showDetails && (
                            <>
                              <Spacer />
                              <Line noMargin>
                                {filteredLogs[index].group ? (
                                  <Tag
                                    icon={<FolderIcon />}
                                    label={
                                      <Trans>
                                        Group: {filteredLogs[index].group}
                                      </Trans>
                                    }
                                  />
                                ) : null}
                                <Tag
                                  icon={<TimerIcon />}
                                  label={
                                    <Trans>
                                      Timestamp:{' '}
                                      {Math.round(
                                        filteredLogs[index].timestamp * 1000
                                      ) /
                                        1000000 +
                                        's'}
                                    </Trans>
                                  }
                                />
                              </Line>
                            </>
                          )}
                        </Column>
                      </div>
                    )}
                  </CellMeasurer>
                )}
              />
            );
          }}
        </AutoSizer>
      </Line>
      <MiniToolbar>
        <Line justifyContent="space-between" alignItems="center" noMargin>
          <Checkbox
            label={
              showDetails ? (
                <Trans>Hide details</Trans>
              ) : (
                <Trans>Show details</Trans>
              )
            }
            checkedIcon={<MinimizeIcon />}
            uncheckedIcon={<MaximizeIcon />}
            checked={showDetails}
            onCheck={(_, enabled) => setShowDetails(enabled)}
          />
          <Checkbox
            label={<Trans>Show internal</Trans>}
            checkedIcon={<VisibilityIcon />}
            uncheckedIcon={<VisibilityOffIcon />}
            checked={!hideInternal}
            onCheck={(_, value) => setHideInternal(!value)}
          />
          <IconButton
            tooltip={t`Filter the logs by group`}
            onClick={() => setEditingHiddenGroups(true)}
            edge="start"
            size="small"
          >
            <FilterIcon />
          </IconButton>
        </Line>
      </MiniToolbar>

      {editingHiddenGroups && (
        <Dialog
          title={<Trans>Select log groups to display</Trans>}
          maxWidth="sm"
          open
          actions={[
            <FlatButton
              key="close"
              label={<Trans>Close</Trans>}
              primary={false}
              onClick={() => setEditingHiddenGroups(false)}
            />,
          ]}
          onRequestClose={() => setEditingHiddenGroups(false)}
          onApply={() => setEditingHiddenGroups(false)}
        >
          <Column>
            {(() => {
              const list = [];
              for (const group of groups.values())
                list.push(
                  <Line key={group}>
                    <Checkbox
                      label={group}
                      checked={!hiddenGroups.has(group)}
                      onCheck={(_, checked) => {
                        if (checked) hiddenGroups.delete(group);
                        else hiddenGroups.add(group);
                        // Since hiddenGroups is a ref, not a state, we need to manually update.
                        forceUpdate();
                      }}
                    />
                  </Line>
                );
              return list;
            })()}
          </Column>
        </Dialog>
      )}
    </Column>
  );
};
