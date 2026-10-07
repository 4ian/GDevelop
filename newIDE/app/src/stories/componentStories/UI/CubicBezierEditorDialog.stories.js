// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import AlertProvider from '../../../UI/Alert/AlertProvider';
import CubicBezierEditorDialog from '../../../UI/CubicBezierEditor/CubicBezierEditorDialog';
import { getBuiltInEasingApproximation } from '../../../UI/CubicBezierEditor/CubicBezierPresets';
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
  const easeInQuad = getBuiltInEasingApproximation('easeInQuad') || [
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

export const NamedMode = (): React.Node => (
  <AlertProvider>
    <CubicBezierEditorDialog
      initialPoints={[0.34, 1.56, 0.64, 1]}
      onApply={action('apply')}
      onClose={action('close')}
      existingNamedEasingNames={['PopupOpen', 'ButtonPress']}
      namedEasing={{
        name: 'PopupOpen',
        onApplyNamedEasing: action('apply-named-easing'),
        onDeleteNamedEasing: action('delete-named-easing'),
        onDetachAsCustomCurve: action('detach-as-custom-curve'),
      }}
    />
  </AlertProvider>
);

export const SaveAsNamedEasing = (): React.Node => (
  <AlertProvider>
    <CubicBezierEditorDialog
      initialPoints={[0.91, 0.17, 0.08, 0.88]}
      onApply={action('apply')}
      onClose={action('close')}
      existingNamedEasingNames={['PopupOpen']}
      existingNamedEasingPointsByName={{
        PopupOpen: [0.34, 1.56, 0.64, 1],
      }}
      onSaveAsNamedEasing={action('save-as-named-easing')}
    />
  </AlertProvider>
);

export const SaveAsDuplicateCurve = (): React.Node => (
  <AlertProvider>
    <CubicBezierEditorDialog
      initialPoints={[0.08, 3.35, 0.95, -1.08]}
      onApply={action('apply')}
      onClose={action('close')}
      existingNamedEasingNames={['Wheel']}
      existingNamedEasingPointsByName={{
        Wheel: [0.08, 3.35, 0.95, -1.08],
      }}
      onSaveAsNamedEasing={action('save-as-named-easing')}
    />
  </AlertProvider>
);
