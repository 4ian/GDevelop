// @flow
import * as React from 'react';

import paperDecorator from '../../PaperDecorator';

import LinearProgress from '../../../UI/LinearProgress';
import { ColumnStackLayout } from '../../../UI/Layout';
import Text from '../../../UI/Text';
import { Line } from '../../../UI/Grid';
import { useTimeout } from '../../../Utils/UseTimeout';

export default {
  title: 'UI Building Blocks/LinearProgress',
  component: LinearProgress,
  decorators: [paperDecorator],
};

const STEP_COUNT = 10;

export const Default = () => {
  const [step, setStep] = React.useState<number>(0);
  useTimeout(() => {
    if (step < STEP_COUNT) setStep(step + 1);
  }, 1000);
  return (
    <ColumnStackLayout expand>
      <Text>Indeterminate (default)</Text>
      <Line expand noMargin>
        <LinearProgress />
      </Line>
      <Text>Determinate</Text>
      <Line expand noMargin>
        <LinearProgress
          variant="determinate"
          value={(step / STEP_COUNT) * 100}
        />
      </Line>
    </ColumnStackLayout>
  );
};
