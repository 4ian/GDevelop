// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import themeDecorator from '../../ThemeDecorator';
import { testProject } from '../../GDevelopJsInitializerDecorator';
import EffectsList from '../../../EffectsList';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import fakeResourceManagementProps from '../../FakeResourceManagement';

export const withSomeEffectsForALayer = () => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={600}>
      <EffectsList
        target="layer"
        project={testProject.project}
        resourceManagementProps={fakeResourceManagementProps}
        effectsContainer={testProject.layerWithEffects.getEffects()}
        onEffectsRenamed={action('effects renamed')}
        onEffectsUpdated={action('effects updated')}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);

export const withSomeEffectsForAnObject = () => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={600}>
      <EffectsList
        target="object"
        project={testProject.project}
        resourceManagementProps={fakeResourceManagementProps}
        effectsContainer={testProject.spriteObjectWithEffects.getEffects()}
        onEffectsRenamed={action('effects renamed')}
        onEffectsUpdated={action('effects updated')}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);

export const withAnEffectWithoutEffectTypeForALayer = () => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={600}>
      <EffectsList
        target="layer"
        project={testProject.project}
        resourceManagementProps={fakeResourceManagementProps}
        effectsContainer={testProject.layerWithEffectWithoutEffectType.getEffects()}
        onEffectsRenamed={action('effects renamed')}
        onEffectsUpdated={action('effects updated')}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);

export const withoutEffectsForALayer = () => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={600}>
      <EffectsList
        target="layer"
        project={testProject.project}
        resourceManagementProps={fakeResourceManagementProps}
        effectsContainer={testProject.layerWithoutEffects.getEffects()}
        onEffectsRenamed={action('effects renamed')}
        onEffectsUpdated={action('effects updated')}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);

export const withoutEffectsForAnObject = () => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={600}>
      <EffectsList
        target="object"
        project={testProject.project}
        resourceManagementProps={fakeResourceManagementProps}
        effectsContainer={testProject.spriteObjectWithoutEffects.getEffects()}
        onEffectsRenamed={action('effects renamed')}
        onEffectsUpdated={action('effects updated')}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);

export default {
  title: 'ObjectEditor/EffectsList',
  component: EffectsList,
  decorators: [paperDecorator, muiDecorator, themeDecorator],
};
