// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import ChooseEventsFunctionsExtensionEditor from '../../../EventsFunctionsExtensionEditor/ChooseEventsFunctionsExtensionEditor';

export default {
  title: 'EventsFunctionsExtensionEditor/ChooseEventsFunctionsExtensionEditor',
  component: ChooseEventsFunctionsExtensionEditor,
  decorators: [muiDecorator],
};

export const Default = () => (
  <FixedHeightFlexContainer height={500}>
    <ChooseEventsFunctionsExtensionEditor
      eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
      onEditBehaviors={action('edit behaviors')}
      onEditFreeFunctions={action('edit free functions')}
      onEditExtensionOptions={action('edit extension options')}
    />
  </FixedHeightFlexContainer>
);
