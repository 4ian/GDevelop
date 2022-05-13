// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import { ExtensionStore } from '../../../../AssetStore/ExtensionStore';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';
import { ExtensionStoreStateProvider } from '../../../../AssetStore/ExtensionStore/ExtensionStoreContext';
import { testProject } from '../../../GDevelopJsInitializerDecorator';

export default {
  title: 'AssetStore/ExtensionStore',
  component: ExtensionStore,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <FixedHeightFlexContainer height={400}>
    <ExtensionStoreStateProvider>
      <ExtensionStore
        project={testProject.project}
        isInstalling={false}
        onInstall={action('onInstall')}
        showOnlyWithBehaviors={false}
      />
    </ExtensionStoreStateProvider>
  </FixedHeightFlexContainer>
);

export const BeingInstalled = () => (
  <FixedHeightFlexContainer height={400}>
    <ExtensionStoreStateProvider>
      <ExtensionStore
        project={testProject.project}
        isInstalling={true}
        onInstall={action('onInstall')}
        showOnlyWithBehaviors={false}
      />
    </ExtensionStoreStateProvider>
  </FixedHeightFlexContainer>
);

export const OnlyWithBehaviors = () => (
  <FixedHeightFlexContainer height={400}>
    <ExtensionStoreStateProvider>
      <ExtensionStore
        project={testProject.project}
        isInstalling={false}
        onInstall={action('onInstall')}
        showOnlyWithBehaviors={true}
      />
    </ExtensionStoreStateProvider>
  </FixedHeightFlexContainer>
);
