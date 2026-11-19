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

const rootFolder = testProject.testLayout.getObjects().getRootFolder();

export const AllObjectsOfAScene = (): React.Node => (
  <ObjectExporterDialog
    project={testProject.project}
    packName={testProject.testLayout.getName()}
    objectFolderOrObjects={mapFor(0, rootFolder.getChildrenCount(), i =>
      rootFolder.getChildAt(i)
    )}
    onClose={() => action('Close the dialog')}
  />
);

export const OneObject = (): React.Node => (
  <ObjectExporterDialog
    project={testProject.project}
    packName="MySpriteObject"
    objectFolderOrObjects={[rootFolder.getObjectNamed('MySpriteObject')]}
    onClose={() => action('Close the dialog')}
  />
);
