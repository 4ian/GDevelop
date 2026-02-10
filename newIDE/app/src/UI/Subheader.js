// @flow
import * as React from 'react';
import Typography from '@material-ui/core/Typography';

type Props = {|
  children: ?React.Node,
|};

const style = {
  paddingLeft: 8,
};

// A Subheader to be displayed in a List.
// $FlowFixMe[signature-verification-failure]
const Subheader = ({ children }: Props) =>
  children ? (
    <Typography variant={'overline'} style={style}>
      {children}
    </Typography>
  ) : null;

export default Subheader;
