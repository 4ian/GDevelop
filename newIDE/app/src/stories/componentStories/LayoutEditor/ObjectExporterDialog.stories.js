// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import ObjectExporterDialog from '../../../ObjectEditor/ObjectExporterDialog';
import { mapFor } from '../../../Utils/MapFor';

export default {
  title: 'LayoutEditor/ObjectExporterDialog',
  component: ObjectExporterDialog,
};

export const AllObjectsOfAScene = (): React.Node => {
  const rootFolder = testProject.testLayout.getObjects().getRootFolder();
  return (
    <ObjectExporterDialog
      project={testProject.project}
      packName={testProject.testLayout.getName()}
      objectFolderOrObjects={mapFor(0, rootFolder.getChildrenCount(), i =>
        rootFolder.getChildAt(i)
      )}
      shouldSkipObjectsUnsupportedByTheAssetStore
      onClose={() => action('Close the dialog')}
    />
  );
};

export const OneObject = (): React.Node => {
  const rootFolder = testProject.testLayout.getObjects().getRootFolder();
  return (
    <ObjectExporterDialog
      project={testProject.project}
      packName="MySpriteObject"
      objectFolderOrObjects={[rootFolder.getObjectNamed('MySpriteObject')]}
      shouldSkipObjectsUnsupportedByTheAssetStore={false}
      onClose={() => action('Close the dialog')}
    />
  );
};
