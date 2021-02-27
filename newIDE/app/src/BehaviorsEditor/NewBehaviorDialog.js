// @flow
import { Trans } from '@lingui/macro';
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
import SearchBar, { useShouldAutofocusSearchbar } from '../UI/SearchBar';
import EmptyMessage from '../UI/EmptyMessage';
import { ExtensionStore } from '../AssetStore/ExtensionStore';
import Window from '../Utils/Window';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import { installExtension } from '../AssetStore/ExtensionStore/InstallExtension';
import InfoBar from '../UI/Messages/InfoBar';
import ScrollView, { type ScrollViewInterface } from '../UI/ScrollView';

const styles = {
  disabledItem: { opacity: 0.6 },
};

const BehaviorListItem = ({
  behaviorMetadata,
  onClick,
  disabled,
}: {|
  behaviorMetadata: EnumeratedBehaviorMetadata,
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
    primaryText={behaviorMetadata.fullName}
    secondaryText={behaviorMetadata.description}
    secondaryTextLines={2}
    onClick={onClick}
    style={disabled ? styles.disabledItem : undefined}
    disabled={disabled}
  />
);

type Props = {|
  project: gdProject,
  objectType: string,
  open: boolean,
  onClose: () => void,
  onChoose: (type: string, defaultName: string) => void,
|};

export default function NewBehaviorDialog({
  project,
  open,
  onClose,
  onChoose,
  objectType,
}: Props) {
  const [showDeprecated, setShowDeprecated] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const [currentTab, setCurrentTab] = React.useState('installed');
  const searchBar = React.useRef<?SearchBar>(null);
  const scrollView = React.useRef((null: ?ScrollViewInterface));

  const [isInstalling, setIsInstalling] = React.useState(false);
  const [extensionInstallTime, setExtensionInstallTime] = React.useState(0);
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );

  const platform = project.getCurrentPlatform();
  const behaviorMetadata: Array<EnumeratedBehaviorMetadata> = React.useMemo(
    () => {
      return project && platform
        ? enumerateBehaviorsMetadata(platform, project)
        : [];
    },
    [project, platform, extensionInstallTime] // eslint-disable-line react-hooks/exhaustive-deps
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
    behaviorMetadata,
    searchText
  );
  const behaviors = filteredBehaviorMetadata.filter(
    ({ type }) => !deprecatedBehaviorsInformation[type]
  );
  const deprecatedBehaviors = filteredBehaviorMetadata.filter(
    ({ type }) => !!deprecatedBehaviorsInformation[type]
  );

  const chooseBehavior = (
    i18n: I18nType,
    { type, defaultName }: EnumeratedBehaviorMetadata
  ) => {
    if (deprecatedBehaviorsInformation[type]) {
      showMessageBox(i18n._(deprecatedBehaviorsInformation[type].warning));
    }

    return onChoose(type, defaultName);
  };

  const canBehaviorBeUsed = (behaviorMetadata: EnumeratedBehaviorMetadata) => {
    // An empty object type means the base object, i.e: any object.
    return (
      behaviorMetadata.objectType === '' ||
      behaviorMetadata.objectType === objectType
    );
  };

  const hasSearchNoResult =
    !!searchText && !behaviors.length && !deprecatedBehaviors.length;

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
          secondaryActions={<HelpButton helpPagePath="/behaviors" />}
          open
          cannotBeDismissed={false}
          flexBody
          noMargin
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
                <SearchBar
                  value={searchText}
                  onRequestSearch={() => {
                    if (behaviors.length) {
                      chooseBehavior(i18n, behaviors[0]);
                    } else if (showDeprecated && deprecatedBehaviors.length) {
                      chooseBehavior(i18n, deprecatedBehaviors[0]);
                    }
                  }}
                  onChange={setSearchText}
                  ref={searchBar}
                />
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
                        key={index}
                        behaviorMetadata={behaviorMetadata}
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
                          key={index}
                          behaviorMetadata={behaviorMetadata}
                          onClick={() => chooseBehavior(i18n, behaviorMetadata)}
                          disabled={!canBehaviorBeUsed(behaviorMetadata)}
                        />
                      ))}
                  </List>
                  <Line justifyContent="center" alignItems="center">
                    {!showDeprecated ? (
                      <FlatButton
                        key="toggle-experimental"
                        icon={<Visibility />}
                        primary={false}
                        onClick={() => {
                          setShowDeprecated(true);
                        }}
                        label={<Trans>Show deprecated (old) behaviors</Trans>}
                      />
                    ) : (
                      <FlatButton
                        key="toggle-experimental"
                        icon={<VisibilityOff />}
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
                      icon={<Create />}
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
              <ExtensionStore // TODO
                project={project}
                isInstalling={isInstalling}
                onInstall={async extensionShortHeader => {
                  setIsInstalling(true);
                  const wasExtensionInstalled = await installExtension(
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
                  }
                  setIsInstalling(false);
                }}
                showOnlyWithBehaviors
              />
            )}
          </Column>
          <InfoBar
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
