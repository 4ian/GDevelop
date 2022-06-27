// @flow

import * as React from 'react';

import LinearProgress from '@material-ui/core/LinearProgress';

import Text from '../../UI/Text';
import { Column } from '../../UI/Grid';

type Props = {
  value: number,
  label: React.Node,
};

/* Display a rating between 1 and 10. */
const Rating = ({ value, label }: Props) => {
  return (
    <Column expand noMargin>
      <Text size="body2">{label}</Text>
      <LinearProgress
        variant="determinate"
        value={value * 10}
        style={{ height: 8, borderRadius: 8 }}
      />
    </Column>
  );
};

export default Rating;
