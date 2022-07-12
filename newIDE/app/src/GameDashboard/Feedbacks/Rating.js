// @flow

import * as React from 'react';

import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';
import LinearProgress from '../../UI/LinearProgress';

type Props = {
  value: number,
  label: React.Node,
};

/* Display a rating between 1 and 10. */
const Rating = ({ value, label }: Props) => {
  return (
    <Column expand noMargin>
      <Text size="body2">{label}</Text>
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
