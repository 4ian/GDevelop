// @flow
import * as React from 'react';
import { type SerializedExtension } from '../../../Utils/GDevelopServices/Extension';

export type ChooseExtensionChangesToKeep = ({|
  project: gdProject,
  serializedExtensions: Array<SerializedExtension>,
|}) => Promise<Array<SerializedExtension> | null>;

export type ExtensionChangesToKeepState = {|
  /**
   * When enabled in the preferences, let users choose the changes to keep
   * from the extensions of the project replaced by the given extensions.
   * @returns the extensions to install, or null if users cancelled.
   */
  chooseExtensionChangesToKeep: ChooseExtensionChangesToKeep,
|};

const ExtensionChangesToKeepContext: React.Context<ExtensionChangesToKeepState> = React.createContext<ExtensionChangesToKeepState>(
  {
    chooseExtensionChangesToKeep: async ({ serializedExtensions }) =>
      serializedExtensions,
  }
);

export default ExtensionChangesToKeepContext;
