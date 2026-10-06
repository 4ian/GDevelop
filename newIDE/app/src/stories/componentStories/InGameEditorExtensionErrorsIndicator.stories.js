// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../PaperDecorator';
import FixedHeightFlexContainer from '../FixedHeightFlexContainer';
import InGameEditorExtensionErrorsIndicator from '../../InGameEditorExtensionErrors/InGameEditorExtensionErrorsIndicator';
import { type InGameEditorExtensionError } from '../../InGameEditorExtensionErrors';

export default {
  title: 'InGameEditorExtensionErrorsIndicator',
  component: InGameEditorExtensionErrorsIndicator,
  decorators: [paperDecorator],
};

const createFakeError = (
  overrides: Partial<InGameEditorExtensionError>
): InGameEditorExtensionError => ({
  id: 1,
  key: 'key',
  extensionName: 'Terrain3DFork',
  phase: 'doStepPostEvents',
  type: 'Terrain3DFork::Terrain3D',
  message: 'object._getLayer4Color is not a function',
  stack: '',
  count: 1240,
  ...overrides,
});

const errors = [
  createFakeError({ id: 1 }),
  createFakeError({
    id: 2,
    extensionName: 'Terrain3D',
    phase: 'editorCallback',
    type: null,
    message:
      "TypeError: Cannot read properties of undefined (reading 'getHeightAt')",
    count: 3,
  }),
];

const IndicatorStory = ({
  shownErrors,
}: {|
  shownErrors: Array<InGameEditorExtensionError>,
|}) => (
  <FixedHeightFlexContainer
    height={500}
    justifyContent="center"
    alignItems="center"
  >
    <InGameEditorExtensionErrorsIndicator
      errors={shownErrors}
      isFromStore={error => error.extensionName === 'Terrain3D'}
      onAskAiToFix={action('onAskAiToFix')}
      onDismiss={action('onDismiss')}
    />
  </FixedHeightFlexContainer>
);

export const OneError = (): React.Node => (
  <IndicatorStory shownErrors={[createFakeError({ count: 1 })]} />
);

export const SeveralErrorsIncludingAStoreExtension = (): React.Node => (
  <IndicatorStory shownErrors={errors} />
);
