// @flow
import React from 'react';

import { Trans } from '@lingui/macro';
import RaisedButton from './RaisedButton';
import { Line, Column } from './Grid';

const buttonStyle = {
  margin: 5,
};

type Props = {|
  value: boolean,
  onChange: (newValue: boolean) => void,
  disabled: boolean,
|};

const BooleanField = ({ value, onChange, disabled }: Props) => {
  return (
    <Line>
      <Column noMargin>
        <RaisedButton
          style={buttonStyle}
          label={<Trans>True</Trans>}
          primary={value && !disabled}
          onClick={() => {
            if (!value && !disabled) onChange(true);
          }}
        />
      </Column>
      <Column noMargin>
        <RaisedButton
          style={buttonStyle}
          label={<Trans>False</Trans>}
          primary={!value && !disabled}
          onClick={() => {
            if (value && !disabled) onChange(false);
          }}
        />
      </Column>
    </Line>
  );
};

export default BooleanField;
