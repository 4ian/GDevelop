// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import muiDecorator from '../../ThemeDecorator';
import { testProject } from '../../GDevelopJsInitializerDecorator';
import ResourcesList from '../../../ResourcesList';
import ValueStateHolder from '../../ValueStateHolder';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';

export default {
  title: 'ResourcesList/ResourcesList',
  component: ResourcesList,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <DragAndDropContextProvider>
    <div style={{ height: 200 }}>
      <ValueStateHolder
        initialValue={null}
        render={(value, onChange) => (
          <ResourcesList
            onSelectResource={onChange}
            selectedResource={value}
            onDeleteResource={action('onDeleteResource')}
            onRenameResource={action('onRenameResource')}
            project={testProject.project}
            onRemoveUnusedResources={action('onRemoveUnusedResources')}
            onRemoveAllResourcesWithInvalidPath={action(
              'onRemoveAllResourcesWithInvalidPath'
            )}
          />
        )}
      />
    </div>
  </DragAndDropContextProvider>
);
