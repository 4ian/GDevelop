// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import { testProject } from '../../GDevelopJsInitializerDecorator';
import ResourcesList from '../../../ResourcesList';
import ValueStateHolder from '../../ValueStateHolder';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';

export default {
  title: 'ResourcesList/ResourcesList',
  component: ResourcesList,
  decorators: [paperDecorator],
};

export const Default = (): React.Node => (
  <DragAndDropContextProvider>
    <div style={{ height: 200 }}>
      <ValueStateHolder
        initialValue={[]}
        render={(value, onChange) => (
          <ResourcesList
            onSelectResources={onChange}
            selectedResources={value}
            onDeleteResources={action('onDeleteResources')}
            onRenameResource={action('onRenameResource')}
            project={testProject.project}
            onRemoveUnusedResources={action('onRemoveUnusedResources')}
            onRemoveAllResourcesWithInvalidPath={action(
              'onRemoveAllResourcesWithInvalidPath'
            )}
            fileMetadata={null}
          />
        )}
      />
    </div>
  </DragAndDropContextProvider>
);
