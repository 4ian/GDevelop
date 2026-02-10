// @flow
import * as React from 'react';
import IconButton from '../UI/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { tooltipEnterDelay } from '../UI/Tooltip';

export type ToolbarButtonConfig = {|
  name: string,
  icon: string,
  npmScript: string,
|};

type Props = {|
  name: string,
  icon: string,
  onClick: () => void,
|};

const iconContainerStyle = {
  width: 24,
  height: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 16,
};

const CustomToolbarButton = ({ name, icon, onClick }: Props) => {
  return (
    <Tooltip title={name} placement="bottom" enterDelay={tooltipEnterDelay}>
      <IconButton size="small" onClick={onClick} color="default">
        <span style={iconContainerStyle}>{icon}</span>
      </IconButton>
    </Tooltip>
  );
};

export default CustomToolbarButton;
