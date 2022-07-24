// @flow
import * as React from 'react';

import MuiLinearProgress from '@material-ui/core/LinearProgress';

type Props = {|
  expand?: boolean,
  variant?: 'indeterminate' | 'determinate',
  value?: ?number,
  style?: {| height?: number, borderRadius?: number |},
|};

function LinearProgress(props: Props) {
  return (
    <MuiLinearProgress
      color="secondary"
      style={{ flex: 1, ...props.style }}
      variant={props.variant}
      value={props.value}
    />
  );
}

export default LinearProgress;
