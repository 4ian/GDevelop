// @flow
import * as React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

type Props = {};

export default React.memo<Props>(props => (
  <SvgIcon {...props} viewBox="0 0 13 7">
    <path
      d="M9.55956 0H3.44041C1.54335 0 0 1.57012 0 3.5C0 5.42988 1.54335 7 3.44041 7H9.55956C11.4566 7 13 5.42991 13 3.5C13 1.57009 11.4566 0 9.55956 0ZM3.44041 6.22512C1.96336 6.22512 0.76172 5.00262 0.76172 3.5C0.76172 1.99738 1.96336 0.774908 3.44041 0.774908C4.91746 0.774908 6.11913 1.99738 6.11913 3.5C6.11913 5.00262 4.91746 6.22512 3.44041 6.22512Z"
    />
  </SvgIcon>
));
