// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import NewEffectDialog from '../../../EffectsList/NewEffectDialog';
import {
  AssetStoreContext,
  AssetStoreStateProvider,
} from '../../../AssetStore/AssetStoreContext';
import { AssetStoreNavigatorStateProvider } from '../../../AssetStore/AssetStoreNavigator';
import fakeResourceManagementProps from '../../FakeResourceManagement';
import {
  loadExtension,
  type TranslationFunction,
} from '../../../JsExtensionsLoader';
import { declareFakeEffects } from '../../../fixtures/TestExtensions';

export default {
  title: 'ObjectEditor/NewEffectDialog',
  component: NewEffectDialog,
  decorators: [paperDecorator],
};

/**
 * Load the real extensions declaring effects, so that the dialog lists the
 * actual effects and the effects of the store (tints, skyboxes...) are
 * recognized.
 * The test extensions already have an "Effects" extension, with fake effects:
 * it is replaced by the real one, still declaring the fake effects used by the
 * other stories.
 */
const loadRealEffectExtensions = () => {
  const gd: libGDevelop = global.gd;
  const platform = gd.JsPlatform.get();
  const extensions = [
    {
      name: 'Effects',
      isLoaded: () =>
        !gd.MetadataProvider.isBadEffectMetadata(
          gd.MetadataProvider.getEffectMetadata(platform, 'HslAdjustment')
        ),
      module: () => {
        // $FlowFixMe[cannot-resolve-module]
        const realModule = require('GDJS-for-web-app-only/Runtime/Extensions/Effects/JsExtension.js');
        return {
          ...realModule,
          createExtension: (_: TranslationFunction, gd: libGDevelop) => {
            const extension = realModule.createExtension(_, gd);
            declareFakeEffects(extension);
            return extension;
          },
        };
      },
    },
    {
      name: 'Scene3D',
      isLoaded: () => platform.isExtensionLoaded('Scene3D'),
      module: () =>
        // $FlowFixMe[cannot-resolve-module]
        require('GDJS-for-web-app-only/Runtime/Extensions/3D/JsExtension.js'),
    },
  ];
  for (const { name, isLoaded, module } of extensions) {
    if (isLoaded()) continue;
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

/**
 * Use the store deployed on staging, to see effects of the store before they
 * are deployed on the live one.
 */
const UseStagingStore = ({ children }: {| children: () => React.Node |}) => {
  const { environment, setEnvironment } = React.useContext(AssetStoreContext);
  React.useEffect(
    () => {
      if (environment !== 'staging') setEnvironment('staging');
    },
    [environment, setEnvironment]
  );
  return environment === 'staging' ? children() : null;
};

const Wrapper = ({
  children,
  useStagingStore,
}: {|
  children: () => React.Node,
  useStagingStore?: boolean,
|}) => {
  loadRealEffectExtensions();
  return (
    <AssetStoreNavigatorStateProvider>
      <AssetStoreStateProvider>
        {useStagingStore ? (
          <UseStagingStore>{children}</UseStagingStore>
        ) : (
          children()
        )}
      </AssetStoreStateProvider>
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

export const ForA2DLayer = (): React.Node => (
  <Wrapper>
    {() => (
      <NewEffectDialog
        project={testProject.project}
        effectsContainer={testProject.layerWithEffects.getEffects()}
        target="layer"
        layerRenderingType="2d"
        resourceManagementProps={fakeResourceManagementProps}
        onClose={action('onClose')}
        onChooseEffectType={action('onChooseEffectType')}
        onEffectAddedFromStore={action('onEffectAddedFromStore')}
      />
    )}
  </Wrapper>
);

export const ForA2DLayerWithStagingStore = (): React.Node => (
  <Wrapper useStagingStore>
    {() => (
      <NewEffectDialog
        project={testProject.project}
        effectsContainer={testProject.layerWithEffects.getEffects()}
        target="layer"
        layerRenderingType="2d"
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

export const ForAnObjectWithStagingStore = (): React.Node => (
  <Wrapper useStagingStore>
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
