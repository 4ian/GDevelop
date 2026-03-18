import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon
    {...props}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    style={{ fill: 'none' }}
  >
    <path
      d="m12.75 10.25v-6.5l-7 10h5.5v6.5l7-10z"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1.5"
    />
  </SvgIcon>
));
