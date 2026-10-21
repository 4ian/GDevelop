// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import { testProject } from '../GDevelopJsInitializerDecorator';
import { action } from 'storybook/actions';
import ObjectSelector from '../../ObjectsList/ObjectSelector';
import paperDecorator from '../PaperDecorator';
import ValueStateHolder from '../ValueStateHolder';
import '../../UI/Theme/Global/Scrollbar.css';
import '../../UI/Theme/Global/Animation.css';

export default {
  title: 'ObjectSelector',
  decorators: [paperDecorator],
};

export const WithoutGroups = (): React.Node => (
  <ValueStateHolder
    initialValue={''}
    render={(value, onChange) => (
      <ObjectSelector
        project={testProject.project}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
        value={value}
        onChange={onChange}
        onChoose={action('onChoose in ObjectSelector')}
        noGroups
        hintText="Choose an object to add to the group"
        fullWidth
        openOnFocus
      />
    )}
  />
);
WithoutGroups.storyName = 'without groups';

export const WithGroups = (): React.Node => (
  <ValueStateHolder
    initialValue={''}
    render={(value, onChange) => (
      <ObjectSelector
        project={testProject.project}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
        value={value}
        onChange={onChange}
        onChoose={action('onChoose in ObjectSelector')}
        hintText="Choose an object or a group"
        fullWidth
        openOnFocus
      />
    )}
  />
);
WithGroups.storyName = 'with groups';
