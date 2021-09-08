// @flow
import React from 'react';
import { Trans, t } from '@lingui/macro';

import { List, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import useForceUpdate from '../Utils/UseForceUpdate';

import MUIList from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Chip from '@material-ui/core/Chip';

import { Line, Column, Spacer } from '../UI/Grid';
import Dialog from '../UI/Dialog';
import MiniToolbar from '../UI/MiniToolbar';
import IconButton from '../UI/IconButton';
import FlatButton from '../UI/FlatButton';
import Checkbox from '../UI/Checkbox';

import InfoIcon from '@material-ui/icons/Info';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';
import MinimizeIcon from '@material-ui/icons/PhotoSizeSelectSmall';
import ExpandIcon from '@material-ui/icons/AspectRatio';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import FilterIcon from '@material-ui/icons/FilterList';

export type Log = {
  message: string,
  type: 'info' | 'warning' | 'error',
  group: string,
  internal: boolean,
};

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
      setTimeout(this._commitLogs.bind(this), 1000);
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

const iconMap = {
  info: <InfoIcon color="primary" />,
  warning: <WarningIcon color="secondary" />,
  error: <ErrorIcon color="error" />,
};

const ConsoleText = ({ children }: { children: React$Node }) => (
  <span
    style={{
      userSelect: 'text',
      cursor: 'text',
      wordBreak: 'break-word',
    }}
  >
    {children}
  </span>
);

export const DebuggerConsole = ({
  logsManager,
}: {
  logsManager: LogsManager,
}) => {
  const forceUpdate = useForceUpdate();

  const { logs, groups } = logsManager;
  const virtualListRef = React.useRef<null | List>(null);
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
    [forceUpdate, logsManager, virtualListRef]
  );

  const [sizeMeasurer, setSizeMeasurer] = React.useState(null);
  const cache = React.useMemo(
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

  // If tabs are switched, the element is not visible and its height is 0 when rendered again.
  // If this is the case, trigger a rerender after rendering has finished (thanks to useEffect).
  const rerenderNeeded = sizeMeasurer && sizeMeasurer.offsetHeight === 0;
  React.useEffect(() => {
    if (rerenderNeeded) forceUpdate();
  });

  const [hideInternal, setHideInternal] = React.useState(false);
  const [maximized, _setMaximized] = React.useState(true);
  const setMaximized = (show: boolean) => {
    _setMaximized(show);
    // As the size of the cells have changed, clear the measurer cache to allow remeasuring them.
    cache.clearAll();
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
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Spacer />
        <Spacer />
        <div
          style={{
            width: '100%',
            height: '100%',
          }}
          ref={setSizeMeasurer}
        >
          {sizeMeasurer && (
            <MUIList dense={true} style={{ padding: 0 }}>
              <List
                ref={virtualListRef}
                autoContainerWidth
                deferredMeasurementCache={cache}
                height={sizeMeasurer.offsetHeight}
                width={sizeMeasurer.offsetWidth}
                rowCount={filteredLogs.length}
                rowHeight={cache.rowHeight}
                rowRenderer={({ index, key, parent, style }) => (
                  <CellMeasurer
                    cache={cache}
                    columnIndex={0}
                    key={key}
                    parent={parent}
                    rowIndex={index}
                  >
                    {({ registerChild }) => (
                      <ListItem
                        dense
                        key={key}
                        style={style}
                        ref={registerChild}
                      >
                        <ListItemIcon>
                          {iconMap[filteredLogs[index].type] || iconMap['info']}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <div
                              style={{
                                backgroundColor: 'black',
                                borderRadius: '4px',
                                border: '1px solid slategray',
                                color: 'white',
                                fontFamily: "'Courier New', monospace",
                                padding: 5,
                                marginBottom: 5,
                              }}
                            >
                              <ConsoleText>
                                {filteredLogs[index].message}
                              </ConsoleText>
                            </div>
                          }
                          secondary={
                            maximized && filteredLogs[index].group ? (
                              <Chip
                                label={
                                  <ConsoleText>
                                    {filteredLogs[index].group}
                                  </ConsoleText>
                                }
                              />
                            ) : (
                              undefined
                            )
                          }
                        />
                      </ListItem>
                    )}
                  </CellMeasurer>
                )}
              />
            </MUIList>
          )}
        </div>
        <MiniToolbar>
          <Line justifyContent="space-between" alignItems="center" noMargin>
            <Checkbox
              label={
                maximized ? <Trans>Minimize</Trans> : <Trans>Maximize</Trans>
              }
              checkedIcon={<MinimizeIcon />}
              uncheckedIcon={<ExpandIcon />}
              checked={maximized}
              onCheck={(_, enabled) => setMaximized(enabled)}
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
            >
              <FilterIcon />
            </IconButton>
          </Line>
        </MiniToolbar>
      </div>

      {editingHiddenGroups && (
        <Dialog
          open
          title={<Trans>Select log groups to display</Trans>}
          onRequestClose={() => setEditingHiddenGroups(false)}
          actions={[
            <FlatButton
              key="close"
              label={<Trans>Close</Trans>}
              primary={false}
              onClick={() => setEditingHiddenGroups(false)}
            />,
          ]}
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
    </>
  );
};
