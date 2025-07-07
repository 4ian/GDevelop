// @flow

import * as React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import classNames from 'classnames';
import classes from './CompactToggleButtons.module.css';
import { tooltipEnterDelay } from '../Tooltip';

type CompactToggleButton = {|
  id: string,
  renderIcon: (className?: string) => React.Node,
  tooltip: React.Node,
  onClick: () => void,
  isActive: boolean,
  label?: string,
|};
export type CompactToggleButtonsProps = {|
  id: string,
  noSeparator?: boolean,
  buttons: CompactToggleButton[],
|};

const CompactToggleButtons = ({
  id,
  noSeparator,
  buttons,
}: CompactToggleButtonsProps) => {
  return (
    <div
      id={id}
      className={classNames({
        [classes.container]: true,
      })}
    >
      {buttons.map((button, index) => (
        <React.Fragment key={button.id}>
          <Tooltip
            title={button.tooltip}
            enterDelay={tooltipEnterDelay}
            placement="top"
          >
            <button
              className={classNames({
                [classes.compactToggleButton]: true,
                [classes.active]: button.isActive,
              })}
              onClick={button.onClick}
            >
              {button.renderIcon(classes.icon)}
              {button.label && (
                <span className={classes.label}>{button.label}</span>
              )}
            </button>
          </Tooltip>
          {index < buttons.length - 1 && !noSeparator && (
            <div
              key={`spacer-${index}`}
              className={classNames({
                [classes.separator]: true,
              })}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CompactToggleButtons;
