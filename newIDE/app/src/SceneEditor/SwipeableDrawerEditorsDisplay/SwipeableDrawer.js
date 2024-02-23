// @flow

import * as React from 'react';
import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';
import { getBackgroundColor } from '../../UI/Paper';
import { ColumnStackLayout } from '../../UI/Layout';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import useSwipeGesture from './UseSwipeGesture';

const topMargin = 52; // This is equal to the height of the bottom bar.

const styles = {
  container: {
    flexDirection: 'column',
    overflow: 'hidden',
  },
  childrenContainer: {
    display: 'flex',
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  topBarContainer: {
    borderRadius: '8px 8px 0 0',
    padding: 4,
  },
  topBarHandleContainer: {
    height: 4,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarHandle: {
    height: 4,
    width: '40%',
    borderRadius: 2,
  },
};

type SwipeableDrawerTopBarProps = {|
  title: React.Node,
  onClick: () => void,
  onSwipeUp: () => void,
  onSwipeDown: () => void,
  controls: ?React.Node,
|};

const SwipeableDrawerTopBar = (props: SwipeableDrawerTopBarProps) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { onTouchStart, onTouchEnd } = useSwipeGesture({
    onSwipeUp: props.onSwipeUp,
    onSwipeDown: props.onSwipeDown,
  });

  return (
    <div
      style={{
        ...styles.topBarContainer,
        backgroundColor: getBackgroundColor(gdevelopTheme, 'light'),
      }}
      onClick={props.onClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <ColumnStackLayout noMargin>
        <div style={styles.topBarHandleContainer}>
          <span
            style={{
              ...styles.topBarHandle,
              backgroundColor: gdevelopTheme.swipeableDrawer.topBar.pillColor,
            }}
          />
        </div>
        <Column>
          <Line
            noMargin
            justifyContent={props.controls ? 'space-between' : 'flex-start'}
            alignItems="center"
          >
            <Text size="sub-title" noMargin>
              {props.title}
            </Text>
            {props.controls}
          </Line>
        </Column>
      </ColumnStackLayout>
    </div>
  );
};

type DrawerOpeningState = 'closed' | 'halfOpen' | 'open';

type Props = {|
  maxHeight: number,
  children: React.Node,
  title: React.Node,
  openingState: DrawerOpeningState,
  setOpeningState: DrawerOpeningState => void,
  topBarControls?: ?React.Node,
|};

const SwipeableDrawer = (props: Props) => {
  const { openingState, setOpeningState } = props;
  const height =
    openingState === 'closed'
      ? 0
      : openingState === 'halfOpen'
      ? props.maxHeight * 0.42 // Empirical value that leaves space in both editor and canvas.
      : props.maxHeight - topMargin;
  const display = openingState === 'closed' ? 'none' : 'flex';
  return (
    <div style={{ ...styles.container, height, display }}>
      <SwipeableDrawerTopBar
        title={props.title}
        onClick={() => setOpeningState('closed')}
        onSwipeUp={() => {
          if (openingState === 'halfOpen') setOpeningState('open');
        }}
        onSwipeDown={() => {
          if (openingState === 'halfOpen') setOpeningState('closed');
          else if (openingState === 'open') setOpeningState('halfOpen');
        }}
        controls={props.topBarControls}
      />
      <div style={styles.childrenContainer}>{props.children}</div>
    </div>
  );
};

export default SwipeableDrawer;
