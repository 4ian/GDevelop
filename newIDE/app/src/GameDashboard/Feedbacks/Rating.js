// @flow

import * as React from 'react';

import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';
import LinearProgress from '../../UI/LinearProgress';
import { roundTo } from '../../Utils/Mathematics';

type Props = {
  value: number,
  label: React.Node,
};

/* Display a rating between 1 and 10. */
const Rating = ({ value, label }: Props) => {
  return (
    <Column expand noMargin>
      <Line justifyContent="space-between">
        <Text size="body2">{label}</Text>
        <Text size="body2">{roundTo(value, 1)}</Text>
      </Line>
      <Line noMargin expand>
        <LinearProgress
          variant="determinate"
          value={value * 10}
          style={{ height: 8, borderRadius: 8 }}
        />
      </Line>
    </Column>
  );
};

export default Rating;
