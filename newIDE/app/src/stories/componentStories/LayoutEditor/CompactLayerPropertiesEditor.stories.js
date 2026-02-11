// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { I18n } from '@lingui/react';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import { CompactLayerPropertiesEditor } from '../../../LayersList/CompactLayerPropertiesEditor';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import fakeResourceManagementProps from '../../FakeResourceManagement';

export default {
  title: 'LayoutEditor/CompactLayerPropertiesEditor',
  component: CompactLayerPropertiesEditor,
  decorators: [paperDecorator],
};

export const Layer = () => (
  <DragAndDropContextProvider>
    <I18n>
      {({ i18n }) => (
        <CompactLayerPropertiesEditor
          i18n={i18n}
          project={testProject.project}
          layersContainer={testProject.testLayout.getLayers()}
          projectScopedContainersAccessor={
            testProject.testSceneProjectScopedContainersAccessor
          }
          resourceManagementProps={fakeResourceManagementProps}
          layer={testProject.layerWithEffects}
          onEditLayer={action('onEditLayer')}
          onEditLayerEffects={action('onEditLayerEffects')}
          onLayersModified={action('onLayersModified')}
          onEffectAdded={action('onEffectAdded')}
        />
      )}
    </I18n>
  </DragAndDropContextProvider>
);

export const LightingLayer = () => (
  <DragAndDropContextProvider>
    <I18n>
      {({ i18n }) => (
        <CompactLayerPropertiesEditor
          i18n={i18n}
          project={testProject.project}
          layersContainer={testProject.testLayout.getLayers()}
          projectScopedContainersAccessor={
            testProject.testSceneProjectScopedContainersAccessor
          }
          resourceManagementProps={fakeResourceManagementProps}
          layer={testProject.lightingLayer}
          onEditLayer={action('onEditLayer')}
          onEditLayerEffects={action('onEditLayerEffects')}
          onLayersModified={action('onLayersModified')}
          onEffectAdded={action('onEffectAdded')}
        />
      )}
    </I18n>
  </DragAndDropContextProvider>
);
