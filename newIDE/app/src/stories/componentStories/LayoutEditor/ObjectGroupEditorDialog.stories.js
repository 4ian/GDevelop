// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import ObjectGroupEditorDialog from '../../../ObjectGroupEditor/ObjectGroupEditorDialog';

export default {
  title: 'LayoutEditor/ObjectGroupEditorDialog',
  component: ObjectGroupEditorDialog,
};

export const Default = () => (
  <ObjectGroupEditorDialog
    project={testProject.project}
    projectScopedContainersAccessor={
      testProject.testSceneProjectScopedContainersAccessor
    }
    globalObjectsContainer={testProject.project.getObjects()}
    objectsContainer={testProject.testLayout.getObjects()}
    group={testProject.group2}
    onApply={action('onApply')}
    onCancel={action('onCancel')}
    onObjectGroupAdded={action('onObjectGroupAdded')}
  />
);

export const WithLongObjectNames = () => (
  <ObjectGroupEditorDialog
    project={testProject.project}
    projectScopedContainersAccessor={
      testProject.testSceneProjectScopedContainersAccessor
    }
    globalObjectsContainer={testProject.project.getObjects()}
    objectsContainer={testProject.testLayout.getObjects()}
    group={testProject.group4WithLongsNames}
    onApply={action('onApply')}
    onCancel={action('onCancel')}
    onObjectGroupAdded={action('onObjectGroupAdded')}
  />
);

export const Empty = () => (
  <ObjectGroupEditorDialog
    project={testProject.project}
    projectScopedContainersAccessor={
      testProject.testSceneProjectScopedContainersAccessor
    }
    globalObjectsContainer={testProject.project.getObjects()}
    objectsContainer={testProject.testLayout.getObjects()}
    group={null}
    onApply={action('onApply')}
    onCancel={action('onCancel')}
    onObjectGroupAdded={action('onObjectGroupAdded')}
  />
);
