// @flow
import React from 'react';
import { Trans, t } from '@lingui/macro';

import { List, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import useForceUpdate from '../Utils/UseForceUpdate';

import MUIList from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

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

const iconMap = {
  info: <InfoIcon color="primary" />,
  warning: <WarningIcon color="secondary" />,
  error: <ErrorIcon color="error" />,
};

export const DebuggerConsole = ({ logs }: { logs: Array<Log> }) => {
  const [sizeMeasurer, setSizeMeasurer] = React.useState(null);
  const cache = React.useMemo(
    () =>
      new CellMeasurerCache({
        defaultHeight: 45,
        minHeight: 30,
        fixedWidth: true,
      }),
    []
  );

  // If tabs are switched, the element is not visible and its height is 0 when rendered again.
  // If this is the case, trigger a rerender after rendering has finished (thanks to useEffect).
  const rerenderNeeded = sizeMeasurer && sizeMeasurer.offsetHeight === 0;
  const forceUpdate = useForceUpdate();
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
  const groups = [...new Set(logs.map(({ group }) => group))];

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
                      <ListItem key={key} style={style} ref={registerChild}>
                        <ListItemIcon>
                          {iconMap[filteredLogs[index].type] || iconMap['info']}
                        </ListItemIcon>
                        <ListItemText
                          primary={filteredLogs[index].message}
                          secondary={
                            maximized
                              ? filteredLogs[index].group || 'Default'
                              : undefined
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

      <Dialog
        open={editingHiddenGroups}
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
          {groups.map(group => (
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
          ))}
        </Column>
      </Dialog>
    </>
  );
};
