// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import Dialog from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import FlatButton from '../UI/FlatButton';
import { showMessageBox } from '../UI/Messages/MessageBox';
import { getDeprecatedBehaviorsInformation } from '../Hints';
import { enumerateBehaviorsMetadata } from './EnumerateBehaviorsMetadata';
import { BehaviorStore } from '../AssetStore/BehaviorStore';
import { ExtensionStoreContext } from '../AssetStore/ExtensionStore/ExtensionStoreContext';
import { type BehaviorShortHeader } from '../Utils/GDevelopServices/Extension';
import {
  checkRequiredExtensionsUpdate,
  getRequiredExtensions,
  useInstallExtension,
} from '../AssetStore/ExtensionStore/InstallExtension';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import {
  addCreateBadgePreHookIfNotClaimed,
  TRIVIAL_FIRST_BEHAVIOR,
  TRIVIAL_FIRST_EXTENSION,
} from '../Utils/GDevelopServices/Badge';
import { mapVector } from '../Utils/MapFor';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  objectType: string,
  objectBehaviorsTypes: Array<string>,
  isChildObject: boolean,
  open: boolean,
  onClose: () => void,
  onChoose: (type: string, defaultName: string) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
|};

export default function NewBehaviorDialog({
  project,
  eventsFunctionsExtension,
  open,
  onClose,
  onChoose,
  objectType,
  objectBehaviorsTypes,
  isChildObject,
  onExtensionInstalled,
}: Props) {
  const [isInstalling, setIsInstalling] = React.useState(false);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const {
    translatedExtensionShortHeadersByName: extensionShortHeadersByName,
  } = React.useContext(ExtensionStoreContext);
  const installExtension = useInstallExtension();

  const createBadgeFistExtension = addCreateBadgePreHookIfNotClaimed(
    authenticatedUser,
    TRIVIAL_FIRST_EXTENSION,
    () => {}
  );

  const deprecatedBehaviorsInformation = React.useMemo(
    () => getDeprecatedBehaviorsInformation(),
    []
  );

  const getAllRequiredBehaviorTypes = React.useCallback(
    (
      behaviorMetadata: gdBehaviorMetadata,
      allRequiredBehaviorTypes: Array<string> = []
    ): Array<string> => {
      mapVector(
        behaviorMetadata.getRequiredBehaviorTypes(),
        requiredBehaviorType => {
          if (allRequiredBehaviorTypes.includes(requiredBehaviorType)) {
            return;
          }
          allRequiredBehaviorTypes.push(requiredBehaviorType);
          const requiredBehaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
            project.getCurrentPlatform(),
            requiredBehaviorType
          );
          getAllRequiredBehaviorTypes(
            requiredBehaviorMetadata,
            allRequiredBehaviorTypes
          );
        }
      );
      return allRequiredBehaviorTypes;
    },
    [project]
  );

  const allInstalledBehaviorMetadataList: Array<BehaviorShortHeader> = React.useMemo(
    () => {
      const platform = project.getCurrentPlatform();
      const behaviorMetadataList =
        project && platform
          ? enumerateBehaviorsMetadata(
              platform,
              project,
              eventsFunctionsExtension
            )
          : [];

      return behaviorMetadataList
        .filter(behavior => !behavior.behaviorMetadata.isHidden())
        .map(behavior => ({
          type: behavior.type,
          fullName: behavior.fullName,
          description: behavior.description,
          previewIconUrl: behavior.previewIconUrl,
          objectType: behavior.objectType,
          category: behavior.category,
          allRequiredBehaviorTypes: getAllRequiredBehaviorTypes(
            behavior.behaviorMetadata
          ),
          tags: behavior.tags,
          name: gd.PlatformExtension.getBehaviorNameFromFullBehaviorType(
            behavior.type
          ),
          extensionName: gd.PlatformExtension.getExtensionFromFullBehaviorType(
            behavior.type
          ),

          isInstalled: true,
          // The tier will be overridden with repository data.
          // Only the built-in and user extensions will keep this value.
          tier: 'installed',
          // Not relevant for `installed` extensions
          version: '',
          url: '',
          headerUrl: '',
          extensionNamespace: '',
          authorIds: [],
        }));
    },
    [project, eventsFunctionsExtension, getAllRequiredBehaviorTypes]
  );

  const installedBehaviorMetadataList: Array<BehaviorShortHeader> = React.useMemo(
    () =>
      allInstalledBehaviorMetadataList.filter(
        behavior => !deprecatedBehaviorsInformation[behavior.type]
      ),
    [allInstalledBehaviorMetadataList, deprecatedBehaviorsInformation]
  );

  const deprecatedBehaviorMetadataList: Array<BehaviorShortHeader> = React.useMemo(
    () => {
      const deprecatedBehaviors = allInstalledBehaviorMetadataList.filter(
        behavior => deprecatedBehaviorsInformation[behavior.type]
      );
      deprecatedBehaviors.forEach(behavior => (behavior.isDeprecated = true));
      return deprecatedBehaviors;
    },
    [allInstalledBehaviorMetadataList, deprecatedBehaviorsInformation]
  );

  if (!open || !project) return null;

  const _chooseBehavior = (i18n: I18nType, behaviorType: string) => {
    if (deprecatedBehaviorsInformation[behaviorType]) {
      showMessageBox(
        i18n._(deprecatedBehaviorsInformation[behaviorType].warning)
      );
    }

    const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
      project.getCurrentPlatform(),
      behaviorType
    );

    return onChoose(behaviorType, behaviorMetadata.getDefaultName());
  };
  const chooseBehavior = addCreateBadgePreHookIfNotClaimed(
    authenticatedUser,
    TRIVIAL_FIRST_BEHAVIOR,
    _chooseBehavior
  );

  const onInstallExtension = async (
    i18n: I18nType,
    behaviorShortHeader: BehaviorShortHeader
  ) => {
    setIsInstalling(true);
    try {
      const behaviorShortHeaders: Array<BehaviorShortHeader> = [
        behaviorShortHeader,
      ];
      const requiredExtensions = getRequiredExtensions(behaviorShortHeaders);
      requiredExtensions.push({
        extensionName: behaviorShortHeader.extensionName,
        extensionVersion: behaviorShortHeader.version,
      });
      const requiredExtensionInstallation = await checkRequiredExtensionsUpdate(
        {
          requiredExtensions,
          project,
          extensionShortHeadersByName,
        }
      );
      const wasExtensionInstalled = await installExtension({
        project,
        requiredExtensionInstallation,
        userSelectedExtensionNames: [behaviorShortHeader.extensionName],
        importedSerializedExtensions: [],
        onExtensionInstalled,
        updateMode: 'all',
      });
      if (wasExtensionInstalled) {
        createBadgeFistExtension();
        onExtensionInstalled([behaviorShortHeader.extensionName]);
      }
      return wasExtensionInstalled;
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Add a new behavior to the object</Trans>}
          actions={[
            <FlatButton
              key="close"
              label={<Trans>Close</Trans>}
              primary={false}
              onClick={onClose}
            />,
          ]}
          secondaryActions={[
            <HelpButton helpPagePath="/behaviors" key="help" />,
          ]}
          open
          onRequestClose={onClose}
          flexBody
          fullHeight
          id="new-behavior-dialog"
        >
          <BehaviorStore
            project={project}
            objectType={objectType}
            objectBehaviorsTypes={objectBehaviorsTypes}
            isChildObject={isChildObject}
            isInstalling={isInstalling}
            onInstall={async shortHeader =>
              onInstallExtension(i18n, shortHeader)
            }
            onChoose={behaviorType => chooseBehavior(i18n, behaviorType)}
            installedBehaviorMetadataList={installedBehaviorMetadataList}
            deprecatedBehaviorMetadataList={deprecatedBehaviorMetadataList}
          />
        </Dialog>
      )}
    </I18n>
  );
}
