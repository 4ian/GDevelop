// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import Dialog from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import FlatButton from '../UI/FlatButton';
import Subheader from '../UI/Subheader';
import ListIcon from '../UI/ListIcon';
import { Tabs } from '../UI/Tabs';
import { List, ListItem } from '../UI/List';
import { Column, Line } from '../UI/Grid';
import { showMessageBox } from '../UI/Messages/MessageBox';
import { getDeprecatedBehaviorsInformation } from '../Hints';
import { getHelpLink } from '../Utils/HelpLink';
import {
  type EnumeratedBehaviorMetadata,
  enumerateBehaviorsMetadata,
  filterEnumeratedBehaviorMetadata,
} from './EnumerateBehaviorsMetadata';
import SearchBar, { type SearchBarInterface } from '../UI/SearchBar';
import EmptyMessage from '../UI/EmptyMessage';
import { BehaviorStore } from '../AssetStore/BehaviorStore';
import { type SearchableBehaviorMetadata } from '../AssetStore/BehaviorStore/BehaviorStoreContext';
import Window from '../Utils/Window';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import { installExtension } from '../AssetStore/ExtensionStore/InstallExtension';
import DismissableInfoBar from '../UI/Messages/DismissableInfoBar';
import ScrollView, { type ScrollViewInterface } from '../UI/ScrollView';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import {
  addCreateBadgePreHookIfNotClaimed,
  TRIVIAL_FIRST_BEHAVIOR,
  TRIVIAL_FIRST_EXTENSION,
} from '../Utils/GDevelopServices/Badge';
import { type ExtensionShortHeader } from '../Utils/GDevelopServices/Extension';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import { useShouldAutofocusInput } from '../UI/Reponsive/ScreenTypeMeasurer';
import Visibility from '../UI/CustomSvgIcons/Visibility';
import VisibilityOff from '../UI/CustomSvgIcons/VisibilityOff';
import Edit from '../UI/CustomSvgIcons/Edit';

const gd: libGDevelop = global.gd;

const styles = {
  disabledItem: { opacity: 0.6 },
};

const BehaviorListItem = ({
  i18n,
  behaviorMetadata,
  alreadyInstalled,
  onClick,
  disabled,
}: {|
  i18n: I18nType,
  behaviorMetadata: EnumeratedBehaviorMetadata,
  alreadyInstalled: boolean,
  onClick: () => void,
  disabled: boolean,
|}) => (
  <ListItem
    leftIcon={
      <ListIcon
        src={behaviorMetadata.previewIconUrl}
        iconSize={40}
        isGDevelopIcon
      />
    }
    key={behaviorMetadata.type}
    primaryText={`${behaviorMetadata.fullName} ${
      alreadyInstalled ? i18n._(t`(already added to this object)`) : ''
    }`}
    secondaryText={behaviorMetadata.description}
    secondaryTextLines={2}
    onClick={onClick}
    style={disabled ? styles.disabledItem : undefined}
    disabled={disabled}
    id={'behavior-item-' + behaviorMetadata.type.replace(/:/g, '-')}
  />
);

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
  const [extensionInstallTime, setExtensionInstallTime] = React.useState(0);
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );
  const authenticatedUser = React.useContext(AuthenticatedUserContext);

  const installDisplayedExtension = addCreateBadgePreHookIfNotClaimed(
    authenticatedUser,
    TRIVIAL_FIRST_EXTENSION,
    installExtension
  );

  const deprecatedBehaviorsInformation = getDeprecatedBehaviorsInformation();

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
      return behaviorMetadataList.map(behavior => ({
        type: behavior.type,
        fullName: behavior.fullName,
        description: behavior.description,
        previewIconUrl: behavior.previewIconUrl,
        objectType: behavior.objectType,
        category: behavior.category,
        // TODO Add the tags of the extension.
        tags: [],
      }));
    },
    [project, eventsFunctionsExtension, extensionInstallTime] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const installedBehaviorMetadataList: Array<SearchableBehaviorMetadata> = React.useMemo(
    () =>
      allInstalledBehaviorMetadataList.filter(
        behavior => !deprecatedBehaviorsInformation[behavior.type]
      ),
    [allInstalledBehaviorMetadataList, deprecatedBehaviorsInformation]
  );

  const deprecatedBehaviorMetadataList: Array<SearchableBehaviorMetadata> = React.useMemo(
    () =>
      allInstalledBehaviorMetadataList.filter(
        behavior => deprecatedBehaviorsInformation[behavior.type]
      ),
    [allInstalledBehaviorMetadataList, deprecatedBehaviorsInformation]
  );

  if (!open || !project) return null;

  // const behaviors = filteredBehaviorMetadata.filter(
  //   ({ type }) => !deprecatedBehaviorsInformation[type]
  // );
  // const deprecatedBehaviors = filteredBehaviorMetadata.filter(
  //   ({ type }) => !!deprecatedBehaviorsInformation[type]
  // );

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

  const isAmongObjectBehaviors = (
    behaviorMetadata: EnumeratedBehaviorMetadata
  ) => objectBehaviorsTypes.includes(behaviorMetadata.type);

  const canBehaviorBeUsed = (behaviorMetadata: EnumeratedBehaviorMetadata) => {
    // An empty object type means the base object, i.e: any object.
    return (
      (behaviorMetadata.objectType === '' ||
        behaviorMetadata.objectType === objectType) &&
      !isAmongObjectBehaviors(behaviorMetadata)
    );
  };

  const onInstallExtension = async (
    i18n: I18nType,
    extensionShortHeader: { url: string }
  ) => {
    setIsInstalling(true);
    try {
      const wasExtensionInstalled = await installDisplayedExtension(
        i18n,
        project,
        eventsFunctionsExtensionsState,
        extensionShortHeader
      );

      if (wasExtensionInstalled) {
        // Setting the extension install time will force a reload of
        // the behavior metadata, and so the list of behaviors.
        setExtensionInstallTime(Date.now());
        return true;
      }
      return false;
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
            onInstall={async extensionShortHeader =>
              onInstallExtension(i18n, extensionShortHeader)
            }
            onChoose={behaviorType => chooseBehavior(i18n, behaviorType)}
            installedBehaviorMetadataList={installedBehaviorMetadataList}
            deprecatedBehaviorMetadataList={deprecatedBehaviorMetadataList}
          />
          <DismissableInfoBar
            identifier="extension-installed-explanation"
            message={
              <Trans>
                The behavior was added to the project. You can now add it to
                your object.
              </Trans>
            }
            show={extensionInstallTime !== 0}
          />
        </Dialog>
      )}
    </I18n>
  );
}
