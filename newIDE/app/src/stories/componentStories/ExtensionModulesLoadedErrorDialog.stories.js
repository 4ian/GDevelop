// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../PaperDecorator';
import { ExtensionModulesLoadedErrorDialog } from '../../Utils/UseExtensionModulesLoadedErrorDialog';

export default {
  title: 'UI Building Blocks/ExtensionModulesLoadedErrorDialog',
  component: ExtensionModulesLoadedErrorDialog,
  decorators: [paperDecorator],
};

export const WithSingleExtensionError = () => {
  const erroredExtensionModulesLoaded = [
    {
      extensionModulePath: 'Physics2Behavior/Physics2Tools.js',
      result: {
        error: true,
        message: 'Failed to parse the extension module file',
        rawError: new Error('Unexpected token in JSON at position 423'),
      },
    },
  ];

  return (
    <ExtensionModulesLoadedErrorDialog
      erroredExtensionModulesLoaded={erroredExtensionModulesLoaded}
      genericError={null}
      onClose={action('On close')}
    />
  );
};

export const WithMultipleExtensionErrors = () => {
  const erroredExtensionModulesLoaded = [
    {
      extensionModulePath: 'Physics2Behavior/Physics2Tools.js',
      result: {
        error: true,
        message: 'Failed to parse the extension module file',
        rawError: new Error('Unexpected token in JSON at position 423'),
      },
    },
    {
      extensionModulePath: 'Multiplayer/MultiplayerTools.js',
      result: {
        error: true,
        message: 'Failed to load the extension module',
        rawError: new Error('Cannot find module "./peerjs.min.js"'),
      },
    },
    {
      extensionModulePath: '3D/Scene3DTools.js',
      result: {
        error: true,
        message: 'Failed to initialize extension module',
        rawError: new Error('THREE is not defined'),
      },
    },
  ];

  return (
    <ExtensionModulesLoadedErrorDialog
      erroredExtensionModulesLoaded={erroredExtensionModulesLoaded}
      genericError={null}
      onClose={action('On close')}
    />
  );
};

export const WithGenericError = () => {
  const erroredExtensionModulesLoaded = [];
  const genericError = new Error(
    'Some extension modules could not be loaded. Please check the console for more details.'
  );

  return (
    <ExtensionModulesLoadedErrorDialog
      erroredExtensionModulesLoaded={erroredExtensionModulesLoaded}
      genericError={genericError}
      onClose={action('On close')}
    />
  );
};

export const WithBothExtensionAndGenericErrors = () => {
  const erroredExtensionModulesLoaded = [
    {
      extensionModulePath: 'Physics2Behavior/Physics2Tools.js',
      result: {
        error: true,
        message: 'Failed to parse the extension module file',
        rawError: new Error('Unexpected token in JSON at position 423'),
      },
    },
  ];
  const genericError = new Error(
    'Some extension modules could not be loaded. Please check the console for more details.'
  );

  return (
    <ExtensionModulesLoadedErrorDialog
      erroredExtensionModulesLoaded={erroredExtensionModulesLoaded}
      genericError={genericError}
      onClose={action('On close')}
    />
  );
};
