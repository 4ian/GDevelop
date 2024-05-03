import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon {...props} width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M3 22v-2h3.5v-4.5H11V11h4.5V6.5H20V3h2v5.5h-4.5V13H13v4.5H8.5V22Z" />
  </SvgIcon>
));
