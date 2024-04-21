// @flow
import * as React from 'react';
import { type WindowSizeType } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import {
  actionsContainer,
  conditionsContainer,
  smallWidthContainer,
} from './ClassNames';

type Props = {|
  renderConditionsList: ({ style: Object, className: string }) => React.Node,
  renderActionsList: ({ className: string }) => React.Node,
  windowSize: WindowSizeType,
  className?: string,
  leftIndentWidth: number,
|};

const styles = {
  oneColumnContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  twoColumnsContainer: {
    display: 'flex',
  },
};

/**
 * Display the lists of instructions (conditions and actions),
 * next to each other on a big screen (with proper sizing for the conditions column),
 * and stacked on a small one.
 */
const ConditionsActionsColumns = (props: Props) => {
  const isMobile = props.windowSize === 'small';
  if (isMobile) {
    return (
      <div style={styles.oneColumnContainer} className={props.className}>
        {props.renderConditionsList({
          style: {},
          className: `${conditionsContainer} ${smallWidthContainer}`,
        })}
        {props.renderActionsList({
          style: {},
          className: `${actionsContainer} ${smallWidthContainer}`,
        })}
      </div>
    );
  }

  return (
    <div style={styles.twoColumnsContainer} className={props.className}>
      {props.renderConditionsList({
        style: {
          width: `calc(35vw - ${props.leftIndentWidth}px)`,
        },
        className: conditionsContainer,
      })}
      {props.renderActionsList({ className: actionsContainer })}
    </div>
  );
};

export default ConditionsActionsColumns;
