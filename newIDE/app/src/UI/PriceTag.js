// @flow
import * as React from 'react';
import { makeStyles } from '@material-ui/core';

type Props = {|
  label: React.Node,
  /**
   * To be used when the component is over an element for which
   * we don't control the background (e.g. an image).
   */
  withOverlay?: boolean,
|};

const useStyles = makeStyles(theme => {
  /**
   * Customize component with overlay:
   * - for dark themes (light font color on dark background), theme values are used.
   * - for light themes, we want to keep the same principle (a light font color on
   *   a dark background) so we override Material UI behavior that would use a dark
   *   font on a light background.
   */
  return {
    container: {
      borderRadius: 4,
      padding: '2px 4px',
      backdropFilter: props =>
        props.withOverlay && theme.palette.type === 'light'
          ? 'brightness(40%)'
          : undefined,
      backgroundColor: props =>
        props.withOverlay && theme.palette.type === 'light'
          ? undefined
          : theme.palette.background.alternate.startsWith('#')
          ? theme.palette.background.alternate + 'BB' // manually add opacity to the background hex color
          : theme.palette.background.alternate,
      color: props =>
        props.withOverlay && theme.palette.type === 'light'
          ? '#FAFAFA'
          : undefined,
    },
  };
});

function PriceTag({ label, withOverlay }: Props) {
  const classes = useStyles({ withOverlay });

  return <div className={classes.container}>{label}</div>;
}

export default PriceTag;
