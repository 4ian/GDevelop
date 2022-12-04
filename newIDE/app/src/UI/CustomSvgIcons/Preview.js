import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon {...props} width="24" height="24" viewBox="4 4 16 16" fill="none">
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M9.37829 8.09859C9.61219 7.96512 9.8997 7.9673 10.1315 8.10431L15.6315 11.3543C15.8599 11.4892 16 11.7348 16 12C16 12.2652 15.8599 12.5108 15.6315 12.6457L10.1315 15.8957C9.8997 16.0327 9.61219 16.0349 9.37829 15.9014C9.14439 15.7679 9 15.5193 9 15.25V8.75C9 8.4807 9.14439 8.23207 9.37829 8.09859ZM10.5 10.0643V13.9357L13.7757 12L10.5 10.0643Z"
      fill="currentColor"
    />
  </SvgIcon>
));
