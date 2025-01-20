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
      d="M6.80035 5.49309C6.98825 5.29073 7.30462 5.27902 7.50698 5.46692L9.84031 7.63359C9.94219 7.72819 10.0001 7.86095 10.0001 7.99998C10.0001 8.13902 9.94219 8.27177 9.84031 8.36638L7.50698 10.533C7.30462 10.7209 6.98825 10.7092 6.80035 10.5069C6.61245 10.3045 6.62417 9.98815 6.82652 9.80025L8.76528 7.99998L6.82652 6.19971C6.62417 6.01181 6.61245 5.69544 6.80035 5.49309Z"
      fill="currentColor"
    />
  </SvgIcon>
));
