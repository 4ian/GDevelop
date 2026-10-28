// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import BehaviorsEditor from '../../../BehaviorsEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import fakeResourceManagementProps from '../../FakeResourceManagement';
import { loadExtension } from '../../../JsExtensionsLoader';

export default {
  title: 'ObjectEditor/BehaviorsEditor',
  component: BehaviorsEditor,
  decorators: [paperDecorator],
};

const loadMultiplayerExtension = () => {
  const gd: libGDevelop = global.gd;
  const platform = gd.JsPlatform.get();
  if (platform.isExtensionLoaded('Multiplayer')) return;

  const result = loadExtension(
    str => str,
    gd,
    platform,
    // $FlowFixMe[cannot-resolve-module]
    require('GDJS-for-web-app-only/Runtime/Extensions/Multiplayer/JsExtension.js')
  );
  if (result.error) {
    console.error(
      'Unable to load the Multiplayer extension for the stories:',
      result.message,
      result.rawError
    );
  }
};

/**
 * Create (once) an object with a behavior synchronized over the network
 * and another one not synchronized.
 */
const getOrCreateObjectWithNotSynchronizedBehavior = ({
  name,
  hasMultiplayerBehavior,
}: {|
  name: string,
  hasMultiplayerBehavior: boolean,
|}): gdObject => {
  loadMultiplayerExtension();
  const { project, testLayout } = testProject;
  const objects = testLayout.getObjects();
  if (objects.hasObjectNamed(name)) return objects.getObject(name);

  const object = objects.insertNewObject(project, 'Sprite', name, 0);
  if (hasMultiplayerBehavior) {
    object.addNewBehavior(
      project,
      'Multiplayer::MultiplayerObjectBehavior',
      'MultiplayerObject'
    );
  }
  object.addNewBehavior(
    project,
    'PlatformBehavior::PlatformerObjectBehavior',
    'PlatformerObject'
  );
  object
    .addNewBehavior(project, 'DraggableBehavior::Draggable', 'Draggable')
    .setSynchronizedOverNetwork(false);
  return object;
};

const BehaviorsEditorForObject = ({ object }: {| object: gdObject |}) => (
  <SerializedObjectDisplay object={object}>
    <BehaviorsEditor
      project={testProject.project}
      eventsFunctionsExtension={null}
      objects={[object]}
      layersContainer={testProject.testLayout.getLayers()}
      isChildObject={false}
      resourceManagementProps={fakeResourceManagementProps}
      projectScopedContainersAccessor={
        testProject.testSceneProjectScopedContainersAccessor
      }
      onUpdateBehaviorsSharedData={() => {}}
      openBehaviorEvents={() => action('Open behavior events')}
      onBehaviorsUpdated={action('onBehaviorsUpdated')}
      onWillInstallExtension={action('extension will be installed')}
      onExtensionInstalled={action('extension installed')}
      onCreateNewExtensionWithBehavior={action(
        'onCreateNewExtensionWithBehavior'
      )}
      isListLocked={false}
    />
  </SerializedObjectDisplay>
);

export const Default = (): React.Node => (
  <SerializedObjectDisplay object={testProject.spriteObjectWithBehaviors}>
    <BehaviorsEditor
      project={testProject.project}
      eventsFunctionsExtension={null}
      objects={[testProject.spriteObjectWithBehaviors]}
      layersContainer={testProject.testLayout.getLayers()}
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
      onCreateNewExtensionWithBehavior={action(
        'onCreateNewExtensionWithBehavior'
      )}
      isListLocked={false}
    />
  </SerializedObjectDisplay>
);

export const WithoutAnyBehaviors = (): React.Node => (
  <SerializedObjectDisplay object={testProject.spriteObjectWithoutBehaviors}>
    <BehaviorsEditor
      project={testProject.project}
      eventsFunctionsExtension={null}
      objects={[testProject.spriteObjectWithoutBehaviors]}
      layersContainer={testProject.testLayout.getLayers()}
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
      onCreateNewExtensionWithBehavior={action(
        'onCreateNewExtensionWithBehavior'
      )}
      isListLocked={false}
    />
  </SerializedObjectDisplay>
);

export const Locked = (): React.Node => (
  <SerializedObjectDisplay object={testProject.spriteObjectWithBehaviors}>
    <BehaviorsEditor
      project={testProject.project}
      eventsFunctionsExtension={null}
      objects={[testProject.spriteObjectWithBehaviors]}
      layersContainer={testProject.testLayout.getLayers()}
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
      onCreateNewExtensionWithBehavior={action(
        'onCreateNewExtensionWithBehavior'
      )}
      isListLocked={true}
    />
  </SerializedObjectDisplay>
);

export const LockedWithoutAnyBehaviors = (): React.Node => (
  <SerializedObjectDisplay object={testProject.spriteObjectWithoutBehaviors}>
    <BehaviorsEditor
      project={testProject.project}
      eventsFunctionsExtension={null}
      objects={[testProject.spriteObjectWithoutBehaviors]}
      layersContainer={testProject.testLayout.getLayers()}
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
      onCreateNewExtensionWithBehavior={action(
        'onCreateNewExtensionWithBehavior'
      )}
      isListLocked={true}
    />
  </SerializedObjectDisplay>
);

export const WithMultiplayerBehavior = (): React.Node => (
  <BehaviorsEditorForObject
    object={getOrCreateObjectWithNotSynchronizedBehavior({
      name: 'MyMultiplayerObject',
      hasMultiplayerBehavior: true,
    })}
  />
);

export const WithoutMultiplayerBehavior = (): React.Node => (
  <BehaviorsEditorForObject
    object={getOrCreateObjectWithNotSynchronizedBehavior({
      name: 'MyObjectWithoutMultiplayerBehavior',
      hasMultiplayerBehavior: false,
    })}
  />
);
