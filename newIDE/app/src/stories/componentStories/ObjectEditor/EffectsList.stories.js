// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import themeDecorator from '../../ThemeDecorator';
import GDevelopJsInitializerDecorator, {
  testProject,
} from '../../GDevelopJsInitializerDecorator';
import EffectsList from '../../../EffectsList';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import fakeResourceExternalEditors from '../../FakeResourceExternalEditors';

export const withSomeEffectsForALayer = () => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={600}>
      <EffectsList
        target="layer"
        project={testProject.project}
        resourceExternalEditors={fakeResourceExternalEditors}
        onChooseResource={() => {
          action('onChooseResource');
          return Promise.reject();
        }}
        resourceSources={[]}
        effectsContainer={testProject.layerWithEffects.getEffects()}
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
        resourceExternalEditors={fakeResourceExternalEditors}
        onChooseResource={() => {
          action('onChooseResource');
          return Promise.reject();
        }}
        resourceSources={[]}
        effectsContainer={testProject.spriteObjectWithEffects.getEffects()}
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
        resourceExternalEditors={fakeResourceExternalEditors}
        onChooseResource={() => {
          action('onChooseResource');
          return Promise.reject();
        }}
        resourceSources={[]}
        effectsContainer={testProject.layerWithEffectWithoutEffectType.getEffects()}
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
        resourceExternalEditors={fakeResourceExternalEditors}
        onChooseResource={() => {
          action('onChooseResource');
          return Promise.reject();
        }}
        resourceSources={[]}
        effectsContainer={testProject.layerWithoutEffects.getEffects()}
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
        resourceExternalEditors={fakeResourceExternalEditors}
        onChooseResource={() => {
          action('onChooseResource');
          return Promise.reject();
        }}
        resourceSources={[]}
        effectsContainer={testProject.spriteObjectWithoutEffects.getEffects()}
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
