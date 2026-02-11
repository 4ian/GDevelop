// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import BehaviorsEditor from '../../../BehaviorsEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import fakeResourceManagementProps from '../../FakeResourceManagement';

export default {
  title: 'ObjectEditor/BehaviorsEditor',
  component: BehaviorsEditor,
  decorators: [paperDecorator],
};

export const Default = (): React.Node => (
  <SerializedObjectDisplay object={testProject.spriteObjectWithBehaviors}>
    <BehaviorsEditor
      project={testProject.project}
      eventsFunctionsExtension={null}
      object={testProject.spriteObjectWithBehaviors}
      isChildObject={false}
      resourceManagementProps={fakeResourceManagementProps}
      projectScopedContainersAccessor={
        testProject.testSceneProjectScopedContainersAccessor
      }
      onUpdateBehaviorsSharedData={() => {}}
      openBehaviorEvents={() => action('Open behavior events')}
      onBehaviorsUpdated={() => {}}
      onWillInstallExtension={action('extension will be installed')}
      onExtensionInstalled={action('extension installed')}
      isListLocked={false}
    />
  </SerializedObjectDisplay>
);

export const WithoutAnyBehaviors = (): React.Node => (
  <SerializedObjectDisplay object={testProject.spriteObjectWithoutBehaviors}>
    <BehaviorsEditor
      project={testProject.project}
      eventsFunctionsExtension={null}
      object={testProject.spriteObjectWithoutBehaviors}
      isChildObject={false}
      resourceManagementProps={fakeResourceManagementProps}
      projectScopedContainersAccessor={
        testProject.testSceneProjectScopedContainersAccessor
      }
      onUpdateBehaviorsSharedData={() => {}}
      openBehaviorEvents={() => action('Open behavior events')}
      onBehaviorsUpdated={() => {}}
      onWillInstallExtension={action('extension will be installed')}
      onExtensionInstalled={action('extension installed')}
      isListLocked={false}
    />
  </SerializedObjectDisplay>
);

export const Locked = (): React.Node => (
  <SerializedObjectDisplay object={testProject.spriteObjectWithBehaviors}>
    <BehaviorsEditor
      project={testProject.project}
      eventsFunctionsExtension={null}
      object={testProject.spriteObjectWithBehaviors}
      isChildObject={false}
      resourceManagementProps={fakeResourceManagementProps}
      projectScopedContainersAccessor={
        testProject.testSceneProjectScopedContainersAccessor
      }
      onUpdateBehaviorsSharedData={() => {}}
      openBehaviorEvents={() => action('Open behavior events')}
      onBehaviorsUpdated={() => {}}
      onWillInstallExtension={action('extension will be installed')}
      onExtensionInstalled={action('extension installed')}
      isListLocked={true}
    />
  </SerializedObjectDisplay>
);

export const LockedWithoutAnyBehaviors = (): React.Node => (
  <SerializedObjectDisplay object={testProject.spriteObjectWithoutBehaviors}>
    <BehaviorsEditor
      project={testProject.project}
      eventsFunctionsExtension={null}
      object={testProject.spriteObjectWithoutBehaviors}
      isChildObject={false}
      resourceManagementProps={fakeResourceManagementProps}
      projectScopedContainersAccessor={
        testProject.testSceneProjectScopedContainersAccessor
      }
      onUpdateBehaviorsSharedData={() => {}}
      openBehaviorEvents={() => action('Open behavior events')}
      onBehaviorsUpdated={() => {}}
      onWillInstallExtension={action('extension will be installed')}
      onExtensionInstalled={action('extension installed')}
      isListLocked={true}
    />
  </SerializedObjectDisplay>
);
