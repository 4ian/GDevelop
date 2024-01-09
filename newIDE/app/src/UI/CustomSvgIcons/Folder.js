import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon {...props} width="24" height="24" viewBox="0 0 24 24">
    <path
      d="m19.25 17.25v-7.5c0-1.1046-0.8954-2-2-2h-12.5v9.5c0 1.1046 0.89543 2 2 2h10.5c1.1046 0 2-0.8954 2-2z"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1.5"
      fill="none"
    />
    <path
      d="m13.5 7.5-0.9315-1.7077c-0.3504-0.64253-1.0239-1.0423-1.7558-1.0423h-4.0627c-1.1046 0-2 0.89543-2 2v4.25"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1.5"
      fill="none"
    />
  </SvgIcon>
));
