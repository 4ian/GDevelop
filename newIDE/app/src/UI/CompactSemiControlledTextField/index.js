// @flow

import * as React from 'react';
import CompactTextField, {
  type CompactTextFieldProps,
} from '../CompactTextField';

type Props = {|
  ...CompactTextFieldProps,
|};

const CompactSemiControlledTextField = ({
  value,
  onChange,
  ...otherProps
}: Props) => {
  const [temporaryValue, setTemporaryValue] = React.useState<string>(
    value.toString()
  );
  const onBlur = () => {
    onChange(temporaryValue);
  };
  console.log(value)

  return (
    <CompactTextField
      value={temporaryValue}
      onChange={setTemporaryValue}
      onBlur={onBlur}
      {...otherProps}
    />
  );
};

export default CompactSemiControlledTextField;
