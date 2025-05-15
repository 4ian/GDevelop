// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../PaperDecorator';
import { ExtensionLoadErrorDialog } from '../../Utils/UseExtensionLoadErrorDialog';

export default {
  title: 'UI Building Blocks/ExtensionLoadErrorDialog',
  component: ExtensionLoadErrorDialog,
  decorators: [paperDecorator],
};

export const WithSingleExtensionError = () => {
  const erroredExtensionLoadingResults = [
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
    <ExtensionLoadErrorDialog
      erroredExtensionLoadingResults={erroredExtensionLoadingResults}
      genericError={null}
      onClose={action('On close')}
    />
  );
};

export const WithMultipleExtensionErrors = () => {
  const erroredExtensionLoadingResults = [
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
    <ExtensionLoadErrorDialog
      erroredExtensionLoadingResults={erroredExtensionLoadingResults}
      genericError={null}
      onClose={action('On close')}
    />
  );
};

export const WithGenericError = () => {
  const erroredExtensionLoadingResults = [];
  const genericError = new Error(
    'Some extension modules could not be loaded. Please check the console for more details.'
  );

  return (
    <ExtensionLoadErrorDialog
      erroredExtensionLoadingResults={erroredExtensionLoadingResults}
      genericError={genericError}
      onClose={action('On close')}
    />
  );
};

export const WithBothExtensionAndGenericErrors = () => {
  const erroredExtensionLoadingResults = [
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
    <ExtensionLoadErrorDialog
      erroredExtensionLoadingResults={erroredExtensionLoadingResults}
      genericError={genericError}
      onClose={action('On close')}
    />
  );
};
