// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import NewEffectDialog from '../../../EffectsList/NewEffectDialog';
import { AssetStoreStateProvider } from '../../../AssetStore/AssetStoreContext';
import { AssetStoreNavigatorStateProvider } from '../../../AssetStore/AssetStoreNavigator';
import fakeResourceManagementProps from '../../FakeResourceManagement';
import { loadExtension } from '../../../JsExtensionsLoader';

export default {
  title: 'ObjectEditor/NewEffectDialog',
  component: NewEffectDialog,
  decorators: [paperDecorator],
};

/**
 * Load the real extensions declaring effects, so that the dialog lists the
 * actual effects and the effects of the store (skyboxes) are recognized.
 */
const loadRealEffectExtensions = () => {
  const gd: libGDevelop = global.gd;
  const platform = gd.JsPlatform.get();
  const extensions = [
    {
      name: 'Effects',
      module: () =>
        // $FlowFixMe[cannot-resolve-module]
        require('GDJS-for-web-app-only/Runtime/Extensions/Effects/JsExtension.js'),
    },
    {
      name: 'Scene3D',
      module: () =>
        // $FlowFixMe[cannot-resolve-module]
        require('GDJS-for-web-app-only/Runtime/Extensions/3D/JsExtension.js'),
    },
  ];
  for (const { name, module } of extensions) {
    if (platform.isExtensionLoaded(name)) continue;
    const result = loadExtension(str => str, gd, platform, module());
    if (result.error) {
      console.error(
        `Unable to load the ${name} extension for the stories:`,
        result.message,
        result.rawError
      );
    }
  }
};

const Wrapper = ({ children }: {| children: () => React.Node |}) => {
  loadRealEffectExtensions();
  return (
    <AssetStoreNavigatorStateProvider>
      <AssetStoreStateProvider>{children()}</AssetStoreStateProvider>
    </AssetStoreNavigatorStateProvider>
  );
};

export const ForAMixedLayer = (): React.Node => (
  <Wrapper>
    {() => (
      <NewEffectDialog
        project={testProject.project}
        effectsContainer={testProject.layerWithEffects.getEffects()}
        target="layer"
        layerRenderingType="2d+3d"
        resourceManagementProps={fakeResourceManagementProps}
        onClose={action('onClose')}
        onChooseEffectType={action('onChooseEffectType')}
        onEffectAddedFromStore={action('onEffectAddedFromStore')}
      />
    )}
  </Wrapper>
);

export const ForA3DLayer = (): React.Node => (
  <Wrapper>
    {() => (
      <NewEffectDialog
        project={testProject.project}
        effectsContainer={testProject.layerWith3DEffects.getEffects()}
        target="layer"
        layerRenderingType="3d"
        resourceManagementProps={fakeResourceManagementProps}
        onClose={action('onClose')}
        onChooseEffectType={action('onChooseEffectType')}
        onEffectAddedFromStore={action('onEffectAddedFromStore')}
      />
    )}
  </Wrapper>
);

export const ForAnObject = (): React.Node => (
  <Wrapper>
    {() => (
      <NewEffectDialog
        project={testProject.project}
        effectsContainer={testProject.spriteObjectWithEffects.getEffects()}
        target="object"
        layerRenderingType="2d"
        resourceManagementProps={fakeResourceManagementProps}
        onClose={action('onClose')}
        onChooseEffectType={action('onChooseEffectType')}
        onEffectAddedFromStore={action('onEffectAddedFromStore')}
      />
    )}
  </Wrapper>
);
