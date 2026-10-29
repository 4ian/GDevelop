import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon {...props} width="24" height="24" viewBox="0 0 24 24">
    <path
      d="M12 11.2C11.1 9.45 8.6 6.18 6.3 4.55C4.1 3 3.25 3.27 2.7 3.52C2.06 3.8 1.95 4.77 1.95 5.34C1.95 5.91 2.26 10.02 2.47 10.71C3.15 12.97 5.55 13.74 7.76 13.49C4.52 13.97 1.64 15.15 5.42 19.36C9.57 23.66 11.11 18.44 12 15.6C12.89 18.44 13.91 23.43 18.6 19.36C22.13 15.86 19.57 13.97 16.24 13.49C18.45 13.74 20.85 12.97 21.53 10.71C21.74 10.02 22.05 5.91 22.05 5.34C22.05 4.77 21.94 3.8 21.3 3.52C20.75 3.27 19.9 3 17.7 4.55C15.4 6.18 12.9 9.45 12 11.2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill="none"
    />
  </SvgIcon>
));
