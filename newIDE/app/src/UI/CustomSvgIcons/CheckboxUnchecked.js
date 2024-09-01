import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    <rect
      x="2.5"
      y="2.5"
      width="15"
      height="15"
      rx="1.5"
      stroke="currentColor"
      fill="none"
    />
  </SvgIcon>
));
