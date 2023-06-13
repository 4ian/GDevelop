// @flow

import * as React from 'react';
import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';
import { getBackgroundColor } from '../../UI/Paper';
import { ColumnStackLayout } from '../../UI/Layout';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import useSwipeGesture from './UseSwipeGesture';

const topMargin = 52; // This is equal to the height of the bottom bar.
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
        borderRadius: '8px 8px 0 0',
        padding: 4,
        backgroundColor: getBackgroundColor(gdevelopTheme, 'light'),
      }}
      onClick={props.onClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <ColumnStackLayout noMargin>
        <div
          style={{
            height: 4,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              height: 4,
              width: '40%',
              backgroundColor: 'black',
              borderRadius: 2,
            }}
          />
        </div>
        <Column>
          <Line
            noMargin
            justifyContent={props.controls ? 'space-between' : 'flex-start'}
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

type DrawerOpeningState = 'closed' | 'half-opened' | 'opened';

type Props = {|
  maxHeight: number,
  children: React.Node,
  title: React.Node,
  openingState: DrawerOpeningState,
  setOpeningState: DrawerOpeningState => void,
  topBarControls: ?React.Node,
|};

const SwipeableDrawer = (props: Props) => {
  const { openingState, setOpeningState } = props;
  const height =
    openingState === 'closed'
      ? 0
      : openingState === 'half-opened'
      ? props.maxHeight / 2.4
      : props.maxHeight - topMargin;
  const display = openingState === 'closed' ? 'none' : 'flex';
  return (
    <div
      style={{ height, display, flexDirection: 'column', overflow: 'hidden' }}
    >
      <SwipeableDrawerTopBar
        title={props.title}
        onClick={() => setOpeningState('closed')}
        onSwipeUp={() => {
          if (openingState === 'half-opened') setOpeningState('opened');
        }}
        onSwipeDown={() => {
          if (openingState === 'half-opened') setOpeningState('closed');
          else if (openingState === 'opened') setOpeningState('half-opened');
        }}
        controls={props.topBarControls}
      />
      <div style={{ display: 'flex', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>{props.children}</div>
    </div>
  );
};

export default SwipeableDrawer;
