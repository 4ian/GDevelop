import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon {...props} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.57046 3.408C3.71787 3.3169 3.90194 3.30862 4.05694 3.38612L12.3903 7.55278C12.5597 7.63748 12.6667 7.81061 12.6667 8C12.6667 8.18938 12.5597 8.36251 12.3903 8.44721L4.05694 12.6139C3.90194 12.6914 3.71787 12.6831 3.57046 12.592C3.42305 12.5009 3.33333 12.34 3.33333 12.1667V3.83333C3.33333 3.66004 3.42305 3.49911 3.57046 3.408ZM4.33333 4.64235V11.3576L11.0486 8L4.33333 4.64235Z"
      fill="currentColor"
    />
  </SvgIcon>
));
