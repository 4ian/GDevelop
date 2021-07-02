// @flow
import React from 'react';

import { List, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import MUIList from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

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

export const DebuggerConsole = ({ logs }: { logs: Array<Logs> }) => {
  const sizeMeasurer = React.useRef(null);
  const cache = React.useRef(
    new CellMeasurerCache({
      defaultHeight: 45,
      minHeight: 30,
      fixedWidth: true,
    })
  ).current;

  const [showGroup, _setShowGroup] = React.useState(true);
  const setShowGroup = (show: boolean) => {
    _setShowGroup(show);
    cache.clearAll();
  };

  return (
    <>
      <Checkbox
        style={{ margin: 10 }}
        checked={showGroup}
        label="Show group names"
        onCheck={(_, value) => setShowGroup(value)}
      />

      <div
        style={{
          position: 'absolute',
          top: 45,
          bottom: 0,
          width: '100%',
        }}
        ref={sizeMeasurer}
      >
        <MUIList dense={true} style={{ padding: 0 }}>
          <List
            autoContainerWidth
            deferredMeasurementCache={cache}
            height={
              sizeMeasurer.current ? sizeMeasurer.current.offsetHeight : 0
            }
            width={sizeMeasurer.current ? sizeMeasurer.current.offsetWidth : 0}
            rowCount={logs.length}
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
                      {iconMap[logs[index].type] || iconMap['info']}
                    </ListItemIcon>
                    <ListItemText
                      primary={logs[index].message}
                      secondary={
                        showGroup ? logs[index].group || 'Default' : undefined
                      }
                    />
                  </ListItem>
                )}
              </CellMeasurer>
            )}
          />
        </MUIList>
      </div>
    </>
  );
};
