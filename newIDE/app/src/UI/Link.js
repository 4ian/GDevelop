// @flow
import * as React from 'react';
import MuiLink from '@material-ui/core/Link';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';
import { type GDevelopTheme } from './Theme';
import { makeStyles } from '@material-ui/core/styles';

type Props = {|
  children: React.Node,
  href: string,
  /**
   * Should be defined if not using Link to open email client with mailto href.
   */
  onClick?: () => void | Promise<void>,
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

const Link = ({ onClick, href, children, disabled }: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const linkStyles = useLinkStyles(gdevelopTheme, !!disabled);
  const onClickLink = onClick
    ? (event: MouseEvent) => {
        event.preventDefault(); // Avoid triggering the href (avoids a warning on mobile in case of unsaved changes).
        if (!disabled) {
          onClick();
        }
      }
    : undefined;
  return (
    <MuiLink
      color="secondary"
      href={href}
      onClick={onClickLink}
      classes={linkStyles}
    >
      {children}
    </MuiLink>
  );
};

export default Link;
