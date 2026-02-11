// @flow
import * as React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

type Props = {};

export default React.memo<Props>(props => (
  <SvgIcon {...props} viewBox="0 0 17 7">
    <path
      fill="none"
      d="M9.5 3.5L11.8824 6L16 1"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      fill="none"
      d="M1 1L6 6M6 1L1 6"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
));
