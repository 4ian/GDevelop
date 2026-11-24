// @flow
import { testProject } from './GDevelopJsInitializerDecorator';
import { loadExtension } from '../JsExtensionsLoader';

/**
 * Return a 3D box of the real 3D extension (and not the fake one of the test
 * extensions), to display its actual properties.
 */
export const getRealCube3dObject = (): gdObject => {
  const gd: libGDevelop = global.gd;
  const platform = gd.JsPlatform.get();
  if (!platform.isExtensionLoaded('Scene3D')) {
    const result = loadExtension(
      str => str,
      gd,
      platform,
      // $FlowFixMe[cannot-resolve-module]
      require('GDJS-for-web-app-only/Runtime/Extensions/3D/JsExtension.js')
    );
    if (result.error) {
      console.error(
        'Unable to load the 3D extension for the stories:',
        result.message,
        result.rawError
      );
    }
  }
  const objects = testProject.testLayout.getObjects();
  if (!objects.hasObjectNamed('RealCubeObject')) {
    objects.insertNewObject(
      testProject.project,
      'Scene3D::Cube3DObject',
      'RealCubeObject',
      0
    );
  }
  return objects.getObject('RealCubeObject');
};
