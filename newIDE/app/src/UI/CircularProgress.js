// @flow
import * as React from 'react';

import MuiCircularProgress from '@material-ui/core/CircularProgress';

type Props = {|
  variant?: 'indeterminate' | 'determinate',
  value?: ?number,
  size?: number,
  disableShrink?: boolean,
  style?: {|
    height?: number,
    width?: number,
    marginLeft?: number,
    marginRight?: number,
    verticalAlign?: 'middle',
  |},
|};

function CircularProgress(props: Props) {
  return (
    <MuiCircularProgress
      color="secondary"
      style={props.style}
      size={props.size}
      disableShrink={props.disableShrink}
      variant={props.variant === 'determinate' ? 'static' : props.variant}
      value={props.value}
    />
  );
}

export default CircularProgress;
