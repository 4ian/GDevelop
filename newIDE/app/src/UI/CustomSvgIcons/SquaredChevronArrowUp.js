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
      d="M7.99992 6.66669C8.13896 6.66669 8.27171 6.72458 8.36632 6.82646L10.533 9.15979C10.7209 9.36215 10.7092 9.67852 10.5068 9.86642C10.3045 10.0543 9.98809 10.0426 9.80019 9.84025L7.99992 7.90149L6.19965 9.84025C6.01175 10.0426 5.69538 10.0543 5.49303 9.86642C5.29067 9.67852 5.27896 9.36215 5.46686 9.15979L7.63352 6.82646C7.72813 6.72458 7.86089 6.66669 7.99992 6.66669Z"
      fill="currentColor"
    />
  </SvgIcon>
));
