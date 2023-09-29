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
import { type SearchableBehaviorMetadata } from '../AssetStore/BehaviorStore/BehaviorStoreContext';
import { type BehaviorShortHeader } from '../Utils/GDevelopServices/Extension';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import { installExtension } from '../AssetStore/ExtensionStore/InstallExtension';
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
  eventsFunctionsExtension?: gdEventsFunctionsExtension,
  objectType: string,
  objectBehaviorsTypes: Array<string>,
  open: boolean,
  onClose: () => void,
  onChoose: (type: string, defaultName: string) => void,
|};

export default function NewBehaviorDialog({
  project,
  eventsFunctionsExtension,
  open,
  onClose,
  onChoose,
  objectType,
  objectBehaviorsTypes,
}: Props) {
  const [isInstalling, setIsInstalling] = React.useState(false);
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );
  const authenticatedUser = React.useContext(AuthenticatedUserContext);

  const installDisplayedExtension = addCreateBadgePreHookIfNotClaimed(
    authenticatedUser,
    TRIVIAL_FIRST_EXTENSION,
    installExtension
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

  const allInstalledBehaviorMetadataList: Array<SearchableBehaviorMetadata> = React.useMemo(
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
        }));
    },
    [project, eventsFunctionsExtension, getAllRequiredBehaviorTypes]
  );

  const installedBehaviorMetadataList: Array<SearchableBehaviorMetadata> = React.useMemo(
    () =>
      allInstalledBehaviorMetadataList.filter(
        behavior => !deprecatedBehaviorsInformation[behavior.type]
      ),
    [allInstalledBehaviorMetadataList, deprecatedBehaviorsInformation]
  );

  const deprecatedBehaviorMetadataList: Array<SearchableBehaviorMetadata> = React.useMemo(
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
      const wasExtensionInstalled = await installDisplayedExtension(
        i18n,
        project,
        eventsFunctionsExtensionsState,
        behaviorShortHeader
      );
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
