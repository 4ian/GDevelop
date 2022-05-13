// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import { AssetDetails } from '../../../../AssetStore/AssetDetails';
import { fakeAssetShortHeader1 } from '../../../../fixtures/GDevelopServicesTestData';
import { testProject } from '../../../GDevelopJsInitializerDecorator';
import fakeResourceExternalEditors from '../../../FakeResourceExternalEditors';
const gd: libGDevelop = global.gd;

export default {
  title: 'AssetStore/AssetStore/AssetDetails',
  component: AssetDetails,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <AssetDetails
    canInstall={true}
    isBeingInstalled={false}
    onAdd={action('onAdd')}
    onClose={action('onClose')}
    assetShortHeader={fakeAssetShortHeader1}
    project={testProject.project}
    objectsContainer={testProject.testLayout}
    layout={testProject.testLayout}
    resourceExternalEditors={fakeResourceExternalEditors}
    onChooseResource={() => {
      action('onChooseResource');
      return Promise.reject();
    }}
    resourceSources={[]}
  />
);

export const BeingInstalled = () => (
  <AssetDetails
    canInstall={false}
    isBeingInstalled={true}
    onAdd={action('onAdd')}
    onClose={action('onClose')}
    assetShortHeader={fakeAssetShortHeader1}
    project={testProject.project}
    objectsContainer={testProject.testLayout}
    layout={testProject.testLayout}
    resourceExternalEditors={fakeResourceExternalEditors}
    onChooseResource={() => {
      action('onChooseResource');
      return Promise.reject();
    }}
    resourceSources={[]}
  />
);
