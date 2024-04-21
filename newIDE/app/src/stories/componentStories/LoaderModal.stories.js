// @flow

import * as React from 'react';

import { useTimeout } from '../../Utils/UseTimeout';
import LoaderModal from '../../UI/LoaderModal';

export default {
  title: 'UI Building Blocks/LoaderModal',
  component: LoaderModal,
};

export const Default = () => <LoaderModal show />;

const STEP_COUNT = 4;

export const WithProgress = () => {
  const [step, setStep] = React.useState<number>(0);
  useTimeout(() => {
    if (step < STEP_COUNT) setStep(step + 1);
  }, 2000);
  const messages = [
    'Hello',
    "it's gonna be fun!",
    'Just wait a bit',
    'Drumrolls',
  ];
  return (
    <LoaderModal
      show
      message={messages[Math.min(step, messages.length - 1)]}
      progress={(step / STEP_COUNT) * 100}
    />
  );
};
