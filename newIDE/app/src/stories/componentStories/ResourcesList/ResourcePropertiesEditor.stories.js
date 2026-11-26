// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import { testProject } from '../../GDevelopJsInitializerDecorator';
import ResourcesLoader from '../../../ResourcesLoader';
import ResourcePropertiesEditor from '../../../ResourcesEditor/ResourcePropertiesEditor';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import fakeResourceManagementProps from '../../FakeResourceManagement';

export default {
  title: 'ResourcesList/ResourcePropertiesEditor',
  component: ResourcePropertiesEditor,
  decorators: [paperDecorator],
};

export const UsedImageResource = (): React.Node => (
  <I18n>
    {({ i18n }) => (
      <FixedHeightFlexContainer height={600}>
        <ResourcePropertiesEditor
          i18n={i18n}
          project={testProject.project}
          resources={[
            testProject.project
              .getResourcesManager()
              .getResource('icon128.png'),
          ]}
          resourcesLoader={ResourcesLoader}
          onResourcePathUpdated={action('onResourcePathUpdated')}
          resourceManagementProps={fakeResourceManagementProps}
          onOpenLayout={action('onOpenLayout')}
          onOpenCustomObjectEditor={action('onOpenCustomObjectEditor')}
        />
      </FixedHeightFlexContainer>
    )}
  </I18n>
);

export const UnusedImageResource = (): React.Node => (
  <I18n>
    {({ i18n }) => (
      <FixedHeightFlexContainer height={600}>
        <ResourcePropertiesEditor
          i18n={i18n}
          project={testProject.project}
          resources={[
            testProject.project
              .getResourcesManager()
              .getResource('fake-image2.png'),
          ]}
          resourcesLoader={ResourcesLoader}
          onResourcePathUpdated={action('onResourcePathUpdated')}
          resourceManagementProps={fakeResourceManagementProps}
          onOpenLayout={action('onOpenLayout')}
          onOpenCustomObjectEditor={action('onOpenCustomObjectEditor')}
        />
      </FixedHeightFlexContainer>
    )}
  </I18n>
);

export const Empty = (): React.Node => (
  <I18n>
    {({ i18n }) => (
      <FixedHeightFlexContainer height={600}>
        <ResourcePropertiesEditor
          i18n={i18n}
          project={testProject.project}
          resources={[]}
          resourcesLoader={ResourcesLoader}
          onResourcePathUpdated={action('onResourcePathUpdated')}
          resourceManagementProps={fakeResourceManagementProps}
          onOpenLayout={action('onOpenLayout')}
          onOpenCustomObjectEditor={action('onOpenCustomObjectEditor')}
        />
      </FixedHeightFlexContainer>
    )}
  </I18n>
);
