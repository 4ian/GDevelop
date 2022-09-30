// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';

import Text from './Text';

type Props = {| value: number |};

const styles = {
  container: {
    backdropFilter: 'brightness(80%)',
    borderRadius: 4,
    padding: '2px 4px',
  },
};

function PriceTag(props: Props) {
  return (
    <I18n>
      {({ i18n }) => (
        <div style={styles.container}>
          <Text noMargin size="sub-title">
            {i18n
              .number(props.value / 100, {
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
