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
import { Tabs, Tab } from '../UI/Tabs';
import { List, ListItem } from '../UI/List';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Create from '@material-ui/icons/Create';
import { Column, Line } from '../UI/Grid';
import { showMessageBox } from '../UI/Messages/MessageBox';
import { getDeprecatedBehaviorsInformation } from '../Hints';
import { getHelpLink } from '../Utils/HelpLink';
import {
  type EnumeratedBehaviorMetadata,
  enumerateBehaviorsMetadata,
  filterEnumeratedBehaviorMetadata,
} from './EnumerateBehaviorsMetadata';
import SearchBar, {
  useShouldAutofocusSearchbar,
  type SearchBarInterface,
} from '../UI/SearchBar';
import EmptyMessage from '../UI/EmptyMessage';
import { ExtensionStore } from '../AssetStore/ExtensionStore';
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
        src={behaviorMetadata.iconFilename}
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
  const [showDeprecated, setShowDeprecated] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const [currentTab, setCurrentTab] = React.useState<'installed' | 'search'>(
    'installed'
  );
  const searchBar = React.useRef<?SearchBarInterface>(null);
  const scrollView = React.useRef((null: ?ScrollViewInterface));

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

  const platform = project.getCurrentPlatform();
  const behaviorsMetadata: Array<EnumeratedBehaviorMetadata> = React.useMemo(
    () => {
      return project && platform
        ? enumerateBehaviorsMetadata(
            platform,
            project,
            eventsFunctionsExtension
          )
        : [];
    },
    [project, platform, eventsFunctionsExtension, extensionInstallTime] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const shouldAutofocusSearchbar = useShouldAutofocusSearchbar();
  React.useEffect(
    () => {
      setTimeout(() => {
        if (shouldAutofocusSearchbar && searchBar.current)
          searchBar.current.focus();
      }, 20 /* Be sure that the search bar is shown */);
    },
    [shouldAutofocusSearchbar]
  );

  if (!open || !project) return null;

  const deprecatedBehaviorsInformation = getDeprecatedBehaviorsInformation();

  const filteredBehaviorMetadata = filterEnumeratedBehaviorMetadata(
    behaviorsMetadata,
    searchText
  );
  const behaviors = filteredBehaviorMetadata.filter(
    ({ type }) => !deprecatedBehaviorsInformation[type]
  );
  const deprecatedBehaviors = filteredBehaviorMetadata.filter(
    ({ type }) => !!deprecatedBehaviorsInformation[type]
  );

  const _chooseBehavior = (
    i18n: I18nType,
    { type, defaultName }: EnumeratedBehaviorMetadata
  ) => {
    if (deprecatedBehaviorsInformation[type]) {
      showMessageBox(i18n._(deprecatedBehaviorsInformation[type].warning));
    }

    return onChoose(type, defaultName);
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

  const hasSearchNoResult =
    !!searchText && !behaviors.length && !deprecatedBehaviors.length;

  const onInstallExtension = async (
    i18n: I18nType,
    extensionShortHeader: ExtensionShortHeader
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
        setCurrentTab('installed');
        if (scrollView.current) scrollView.current.scrollToBottom();
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
          noMargin
          fullHeight
          id="new-behavior-dialog"
        >
          <Column expand noMargin>
            <Tabs value={currentTab} onChange={setCurrentTab}>
              <Tab
                label={<Trans>Installed Behaviors</Trans>}
                value="installed"
              />
              <Tab label={<Trans>Search New Behaviors</Trans>} value="search" />
            </Tabs>
            {currentTab === 'installed' && (
              <React.Fragment>
                <Line>
                  <Column expand>
                    <SearchBar
                      value={searchText}
                      onRequestSearch={() => {
                        if (behaviors.length) {
                          chooseBehavior(i18n, behaviors[0]);
                        } else if (
                          showDeprecated &&
                          deprecatedBehaviors.length
                        ) {
                          chooseBehavior(i18n, deprecatedBehaviors[0]);
                        }
                      }}
                      onChange={setSearchText}
                      ref={searchBar}
                      placeholder={t`Search installed behaviors`}
                    />
                  </Column>
                </Line>
                {hasSearchNoResult && (
                  <EmptyMessage>
                    <Trans>
                      No behavior found for your search. Try another search, or
                      search for new behaviors to install.
                    </Trans>
                  </EmptyMessage>
                )}
                <ScrollView ref={scrollView}>
                  <List>
                    {behaviors.map((behaviorMetadata, index) => (
                      <BehaviorListItem
                        i18n={i18n}
                        key={index}
                        behaviorMetadata={behaviorMetadata}
                        alreadyInstalled={isAmongObjectBehaviors(
                          behaviorMetadata
                        )}
                        onClick={() => chooseBehavior(i18n, behaviorMetadata)}
                        disabled={!canBehaviorBeUsed(behaviorMetadata)}
                      />
                    ))}
                    {showDeprecated && !!deprecatedBehaviors.length && (
                      <Subheader>
                        Deprecated (old, prefer not to use anymore)
                      </Subheader>
                    )}
                    {showDeprecated &&
                      deprecatedBehaviors.map((behaviorMetadata, index) => (
                        <BehaviorListItem
                          i18n={i18n}
                          key={index}
                          behaviorMetadata={behaviorMetadata}
                          alreadyInstalled={isAmongObjectBehaviors(
                            behaviorMetadata
                          )}
                          onClick={() => chooseBehavior(i18n, behaviorMetadata)}
                          disabled={!canBehaviorBeUsed(behaviorMetadata)}
                        />
                      ))}
                  </List>
                  <Line justifyContent="center" alignItems="center">
                    {!showDeprecated ? (
                      <FlatButton
                        key="toggle-experimental"
                        leftIcon={<Visibility />}
                        primary={false}
                        onClick={() => {
                          setShowDeprecated(true);
                        }}
                        label={<Trans>Show deprecated (old) behaviors</Trans>}
                      />
                    ) : (
                      <FlatButton
                        key="toggle-experimental"
                        leftIcon={<VisibilityOff />}
                        primary={false}
                        onClick={() => {
                          setShowDeprecated(false);
                        }}
                        label={<Trans>Show deprecated (old) behaviors</Trans>}
                      />
                    )}
                  </Line>
                  <Line justifyContent="center" alignItems="center">
                    <FlatButton
                      leftIcon={<Create />}
                      primary={false}
                      onClick={() =>
                        Window.openExternalURL(
                          getHelpLink('/behaviors/events-based-behaviors')
                        )
                      }
                      label={<Trans>Create your own behavior</Trans>}
                    />
                  </Line>
                </ScrollView>
              </React.Fragment>
            )}
            {currentTab === 'search' && (
              <Line expand>
                <Column expand noMargin>
                  <ExtensionStore
                    project={project}
                    isInstalling={isInstalling}
                    onInstall={async extensionShortHeader =>
                      onInstallExtension(i18n, extensionShortHeader)
                    }
                    showOnlyWithBehaviors
                  />
                </Column>
              </Line>
            )}
          </Column>
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
