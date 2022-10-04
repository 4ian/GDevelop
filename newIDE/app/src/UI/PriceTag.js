// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';

import Text from './Text';
import { makeStyles } from '@material-ui/core';

type Props = {|
  value: number,
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

function PriceTag({ value, withOverlay }: Props) {
  const classes = useStyles({ withOverlay });
  return (
    <I18n>
      {({ i18n }) => (
        <div className={classes.container}>
          <Text noMargin size="sub-title" color="inherit">
            €
            {i18n
              .number(value / 100, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
              .replace(/\D00$/, '')}
          </Text>
        </div>
      )}
    </I18n>
  );
}

export default PriceTag;
