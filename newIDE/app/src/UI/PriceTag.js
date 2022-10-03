// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';

import Text from './Text';
import { makeStyles } from '@material-ui/core';

type Props = {| value: number, transparentBackground: boolean |};

const useStyles = makeStyles(theme => {
  return {
    container: {
      borderRadius: 4,
      padding: '2px 4px',
      backdropFilter: props =>
        props.transparentBackground ? 'brightness(40%)' : undefined,
      backgroundColor: props =>
        props.transparentBackground
          ? undefined
          : theme.palette.background.alternate,
    },
  };
});

function PriceTag({ value, transparentBackground }: Props) {
  const classes = useStyles({ transparentBackground });
  return (
    <I18n>
      {({ i18n }) => (
        <div className={classes.container}>
          <Text noMargin size="sub-title">
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
