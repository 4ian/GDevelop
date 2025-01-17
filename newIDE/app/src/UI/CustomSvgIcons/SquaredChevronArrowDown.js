import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon {...props} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect
      x="0.5"
      y="0.5"
      width="15"
      height="15"
      rx="3.5"
      stroke="currentColor"
      fill="none"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M5.49303 6.80026C5.69538 6.61236 6.01175 6.62408 6.19965 6.82643L7.99992 8.76519L9.80019 6.82643C9.98809 6.62408 10.3045 6.61236 10.5068 6.80026C10.7092 6.98816 10.7209 7.30453 10.533 7.50688L8.36632 9.84022C8.27171 9.9421 8.13896 9.99999 7.99992 9.99999C7.86089 9.99999 7.72813 9.9421 7.63352 9.84022L5.46686 7.50688C5.27896 7.30453 5.29067 6.98816 5.49303 6.80026Z"
      fill="currentColor"
    />
  </SvgIcon>
));
