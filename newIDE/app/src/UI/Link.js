// @flow
import * as React from 'react';
import MuiLink from '@material-ui/core/Link';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';
import { type GDevelopTheme } from './Theme';
import { makeStyles } from '@material-ui/core/styles';

type Props = {|
  children: React.Node,
  href: string,
  onClick: () => void | Promise<void>,
  disabled?: boolean,
|};

const useLinkStyles = (theme: GDevelopTheme, disabled: boolean) =>
  makeStyles({
    root: {
      color: theme.link.color.default,
      textDecoration: 'underline',
      '&:hover': {
        color: !disabled ? theme.link.color.hover : undefined,
        cursor: !disabled ? 'pointer' : 'default',
      },
      '&:focus': {
        color: !disabled ? theme.link.color.hover : undefined,
      },
    },
  })();

const Link = (props: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const linkStyles = useLinkStyles(gdevelopTheme, !!props.disabled);
  const onClick = (event: MouseEvent) => {
    event.preventDefault(); // Avoid triggering the href (avoids a warning on mobile in case of unsaved changes).
    if (!props.disabled) {
      props.onClick();
    }
  };
  return (
    <MuiLink
      color="secondary"
      href={props.href}
      onClick={onClick}
      classes={linkStyles}
    >
      {props.children}
    </MuiLink>
  );
};

export default Link;
