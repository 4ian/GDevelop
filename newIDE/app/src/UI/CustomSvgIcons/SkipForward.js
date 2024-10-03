import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon width="17" height="16" viewBox="0 0 24 24" fill="none" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.41141 5.08078C5.66376 4.95311 5.96646 4.97824 6.19429 5.14577L14.6943 11.3958C14.8865 11.5371 15 11.7614 15 12C15 12.2386 14.8865 12.4629 14.6943 12.6042L6.19429 18.8542C5.96646 19.0218 5.66376 19.0469 5.41141 18.9192C5.15907 18.7916 5 18.5328 5 18.25V5.75C5 5.4672 5.15907 5.20845 5.41141 5.08078ZM6.5 7.2324V16.7676L12.9839 12L6.5 7.2324Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18.25 5C18.6642 5 19 5.33579 19 5.75V18.25C19 18.6642 18.6642 19 18.25 19C17.8358 19 17.5 18.6642 17.5 18.25V5.75C17.5 5.33579 17.8358 5 18.25 5Z"
      fill="currentColor"
    />
  </SvgIcon>
));
