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
   * This component should logically be invariant to selected theme
   * when this option is activated
   */
  withOverlay?: boolean,
|};

const useStyles = makeStyles(theme => {
  return {
    container: {
      borderRadius: 4,
      padding: '2px 4px',
      backdropFilter: props =>
        props.withOverlay ? 'brightness(40%)' : undefined,
      backgroundColor: props =>
        props.withOverlay
          ? undefined
          : theme.palette.background.alternate,
      color: props => (props.withOverlay ? '#FAFAFA' : undefined),
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
            {i18n
              .number(value / 100, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
              .replace(/\D00$/, '')}
            EUR
          </Text>
        </div>
      )}
    </I18n>
  );
}

export default PriceTag;
