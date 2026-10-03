// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import CubicBezierEditorDialog from '../../../UI/CubicBezierEditor/CubicBezierEditorDialog';
import { getNamedEasingApproximation } from '../../../UI/CubicBezierEditor/CubicBezierPresets';
import { type CubicBezierPoints } from '../../../Utils/Easings';

export default {
  title: 'UI Building Blocks/CubicBezierEditorDialog',
  component: CubicBezierEditorDialog,
  decorators: [paperDecorator],
};

const DialogStory = ({
  initialPoints,
}: {|
  initialPoints: CubicBezierPoints,
|}) => (
  <CubicBezierEditorDialog
    initialPoints={initialPoints}
    onApply={action('apply')}
    onClose={action('close')}
  />
);

export const FromCustomValue = (): React.Node => (
  <DialogStory initialPoints={[0.91, 0.17, 0.08, 0.88]} />
);

export const FromNamedEasing = (): React.Node => {
  const easeInQuad = getNamedEasingApproximation('easeInQuad') || [
    0.11,
    0,
    0.5,
    0,
  ];
  return <DialogStory initialPoints={easeInQuad} />;
};

export const PastTheTarget = (): React.Node => (
  <DialogStory initialPoints={[0.34, 1.56, 0.64, 1]} />
);
