// @flow
import * as React from 'react';
import MuiLink from '@material-ui/core/Link';

type Props = {|
  children: React.Node,
  href: string,
  onClick: () => void,
|};

function Link(props: Props) {
  const onClick = (event: MouseEvent) => {
    event.preventDefault();
    props.onClick();
  };
  return (
    <MuiLink color="secondary" href={props.href} onClick={onClick}>
      {props.children}
    </MuiLink>
  );
}

export default Link;
