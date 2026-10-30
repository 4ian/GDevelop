// @flow
import { testProject } from './GDevelopJsInitializerDecorator';
import { loadExtension } from '../JsExtensionsLoader';

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
export const getOrCreateObjectWithNotSynchronizedBehavior = ({
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
