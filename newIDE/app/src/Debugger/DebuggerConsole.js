// @flow
import React from 'react';
import { Trans } from '@lingui/macro';

import { List, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import useForceUpdate from '../Utils/UseForceUpdate';

import MUIList from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '../UI/RaisedButton';
import { TransferList } from '../UI/TransferList';
import Popover from '@material-ui/core/Popover';
import { usePopoverState } from '../Utils/UsePopoverState';

import Checkbox from '../UI/Checkbox';

import InfoIcon from '@material-ui/icons/Info';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';

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
  const [showGroup, _setShowGroup] = React.useState(true);
  const setShowGroup = (show: boolean) => {
    _setShowGroup(show);
    cache.clearAll();
  };

  const { popoverProps, handleEvent } = usePopoverState();
  const [hiddenGroups, setHiddenGroups] = React.useState([]);

  const filteredLogs = logs
    .filter(({ internal }) => !(hideInternal && internal))
    .filter(({ group }) => !hiddenGroups.includes(group));
  const visibleGroups = [...new Set(filteredLogs.map(({ group }) => group))];

  return (
    <>
      <div style={{ display: 'flex', flexFlow: 'row' }}>
        <Checkbox
          style={{ margin: 10 }}
          checked={showGroup}
          label={<Trans>Show group names</Trans>}
          onCheck={(_, value) => setShowGroup(value)}
        />
        <Checkbox
          style={{ margin: 10 }}
          checked={!hideInternal}
          label={<Trans>Show internal logs</Trans>}
          onCheck={(_, value) => setHideInternal(!value)}
        />
        <Button
          label={<Trans>Filter by group</Trans>}
          onClick={handleEvent}
          style={{ marginTop: 5, marginBottom: 5 }}
        />
        <Popover
          id="debugger-console-filters"
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          {...popoverProps}
        >
          <TransferList
            leftLabel={<Trans>Visible groups</Trans>}
            left={visibleGroups}
            onChangeLeft={
              _ => {} /* Left is being recalculated on each render, no need or way to set it. */
            }
            rightLabel={<Trans>Hidden groups</Trans>}
            right={hiddenGroups}
            onChangeRight={setHiddenGroups}
          />
        </Popover>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 45,
          bottom: 0,
          width: '100%',
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
                          showGroup
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
    </>
  );
};
