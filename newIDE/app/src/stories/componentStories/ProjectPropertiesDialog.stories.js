// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import { testProject } from '../GDevelopJsInitializerDecorator';
import { action } from 'storybook/actions';
import { I18n } from '@lingui/react';
import paperDecorator from '../PaperDecorator';
import '../../UI/Theme/Global/Scrollbar.css';
import '../../UI/Theme/Global/Animation.css';
import ProjectPropertiesDialog from '../../ProjectManager/ProjectPropertiesDialog';
import fakeResourceManagementProps from '../FakeResourceManagement';

export default {
  title: 'ProjectPropertiesDialog',
  decorators: [paperDecorator],
};

const Default = (): React.Node => (
  <I18n>
    {({ i18n }) => (
      <ProjectPropertiesDialog
        open
        initialTab="properties"
        project={testProject.project}
        onClose={action('onClose')}
        onApply={async () => true}
        onPropertiesApplied={action('onPropertiesApplied')}
        resourceManagementProps={fakeResourceManagementProps}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
        i18n={i18n}
      />
    )}
  </I18n>
);

export { Default as ______________________Default };
Default.storyName = 'default';
