// @flow
import * as React from 'react';
import { type StoryDecorator } from '@storybook/react';
// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';
import { action } from 'storybook/actions';
import { getPaperDecorator } from '../../PaperDecorator';
import '../../../UI/Theme/Global/Scrollbar.css';
import '../../../UI/Theme/Global/Animation.css';
import { LoadingScreenEditor } from '../../../ProjectManager/LoadingScreenEditor';
import fakeResourceManagementProps from '../../FakeResourceManagement';

export default {
  title: 'ProjectPropertiesDialog/LoadingScreenEditor',
  decorators: [(getPaperDecorator('medium'): StoryDecorator)],
};

const Default = (): React.Node => (
  <LoadingScreenEditor
    loadingScreen={testProject.project.getLoadingScreen()}
    watermark={testProject.project.getWatermark()}
    onLoadingScreenUpdated={action('onLoadingscreenUpdated')}
    onChangeSubscription={action('onChangeSubscription')}
    project={testProject.project}
    resourceManagementProps={fakeResourceManagementProps}
    projectScopedContainersAccessor={
      testProject.testSceneProjectScopedContainersAccessor
    }
  />
);

export { Default as _______________________Default };
Default.storyName = 'default';
