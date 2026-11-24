// @flow
import * as React from 'react';
import PreferencesContext from '../../../MainFrame/Preferences/PreferencesContext';
import { type SerializedExtension } from '../../../Utils/GDevelopServices/Extension';
import { serializeToJSObject } from '../../../Utils/Serializer';
import { getExtensionMemberDifferences } from '../../../Utils/Extension/ExtensionChangesToKeep';
import Window from '../../../Utils/Window';
import ExtensionChangesToKeepDialog from './ExtensionChangesToKeepDialog';
import ExtensionChangesToKeepContext, {
  type ChooseExtensionChangesToKeep,
  type ExtensionChangesToKeepState,
} from './ExtensionChangesToKeepContext';

type DialogRequest = {|
  projectSerializedExtension: SerializedExtension,
  newSerializedExtension: SerializedExtension,
  resolve: (mergedSerializedExtension: SerializedExtension | null) => void,
|};

type Props = {| children: React.Node |};

const ExtensionChangesToKeepProvider = ({ children }: Props): React.Node => {
  const { values } = React.useContext(PreferencesContext);
  const { showExtensionChangesToKeepOnUpdate } = values;
  const [
    dialogRequest,
    setDialogRequest,
  ] = React.useState<DialogRequest | null>(null);

  const chooseExtensionChangesToKeep = React.useCallback<ChooseExtensionChangesToKeep>(
    async ({ project, serializedExtensions }) => {
      if (
        !showExtensionChangesToKeepOnUpdate ||
        Window.isRunningCommandFromCli()
      ) {
        return serializedExtensions;
      }
      const mergedSerializedExtensions: Array<SerializedExtension> = [];
      for (const newSerializedExtension of serializedExtensions) {
        if (
          !project.hasEventsFunctionsExtensionNamed(newSerializedExtension.name)
        ) {
          mergedSerializedExtensions.push(newSerializedExtension);
          continue;
        }
        const projectSerializedExtension = serializeToJSObject(
          project.getEventsFunctionsExtension(newSerializedExtension.name),
          'serializeToExternal'
        );
        if (
          getExtensionMemberDifferences(
            projectSerializedExtension,
            newSerializedExtension
          ).length === 0
        ) {
          mergedSerializedExtensions.push(newSerializedExtension);
          continue;
        }
        const mergedSerializedExtension = await new Promise<SerializedExtension | null>(
          resolve => {
            setDialogRequest({
              projectSerializedExtension,
              newSerializedExtension,
              resolve,
            });
          }
        );
        setDialogRequest(null);
        if (!mergedSerializedExtension) return null;
        mergedSerializedExtensions.push(mergedSerializedExtension);
      }
      return mergedSerializedExtensions;
    },
    [showExtensionChangesToKeepOnUpdate]
  );

  const state = React.useMemo<ExtensionChangesToKeepState>(
    () => ({ chooseExtensionChangesToKeep }),
    [chooseExtensionChangesToKeep]
  );

  return (
    <ExtensionChangesToKeepContext.Provider value={state}>
      {children}
      {dialogRequest && (
        <ExtensionChangesToKeepDialog
          projectSerializedExtension={dialogRequest.projectSerializedExtension}
          newSerializedExtension={dialogRequest.newSerializedExtension}
          onApply={dialogRequest.resolve}
          onCancel={() => dialogRequest.resolve(null)}
        />
      )}
    </ExtensionChangesToKeepContext.Provider>
  );
};

export default ExtensionChangesToKeepProvider;
