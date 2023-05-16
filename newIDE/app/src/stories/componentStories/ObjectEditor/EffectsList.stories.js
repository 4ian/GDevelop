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
import { emptyStorageProvider } from '../../../ProjectsStorage/ProjectStorageProviders';
import fakeResourceExternalEditors from '../../FakeResourceExternalEditors';

export const withSomeEffectsForALayer = () => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={600}>
      <EffectsList
        target="layer"
        layerRenderingType="2d"
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
        layerRenderingType="2d"
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
        layerRenderingType="2d"
        project={testProject.project}
        resourceManagementProps={fakeResourceManagementProps}
        effectsContainer={testProject.layerWithEffectWithoutEffectType.getEffects()}
        onEffectsRenamed={action('effects renamed')}
        onEffectsUpdated={action('effects updated')}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);

export const withoutEffectsForALayer2D = () => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={600}>
      <EffectsList
        target="layer"
        layerRenderingType="2d"
        project={testProject.project}
        resourceManagementProps={{
          getStorageProvider: () => emptyStorageProvider,
          getStorageProviderResourceOperations: () => null,
          onFetchNewlyAddedResources: async () => {},
          resourceSources: [],
          onChooseResource: () => Promise.reject('Unimplemented'),
          resourceExternalEditors: fakeResourceExternalEditors,
        }}
        effectsContainer={testProject.layerWithoutEffects.getEffects()}
        onEffectsRenamed={action('effects renamed')}
        onEffectsUpdated={action('effects updated')}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);

export const withoutEffectsForALayer3D = () => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={600}>
      <EffectsList
        target="layer"
        layerRenderingType="3d"
        project={testProject.project}
        resourceManagementProps={{
          getStorageProvider: () => emptyStorageProvider,
          getStorageProviderResourceOperations: () => null,
          onFetchNewlyAddedResources: async () => {},
          resourceSources: [],
          onChooseResource: () => Promise.reject('Unimplemented'),
          resourceExternalEditors: fakeResourceExternalEditors,
        }}
        effectsContainer={testProject.layerWithoutEffects.getEffects()}
        onEffectsRenamed={action('effects renamed')}
        onEffectsUpdated={action('effects updated')}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);

// TODO Add a story with 2 effects of the same type that should be unique.

export const withoutEffectsForAMixedLayer = () => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={600}>
      <EffectsList
        target="layer"
        layerRenderingType="2d+3d"
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
        layerRenderingType="2d"
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
