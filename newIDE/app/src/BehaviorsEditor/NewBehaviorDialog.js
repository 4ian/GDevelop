// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import React, { Component } from 'react';
import Dialog from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import FlatButton from 'material-ui/FlatButton';
import Subheader from 'material-ui/Subheader';
import Avatar from 'material-ui/Avatar';
import { Tabs, Tab } from 'material-ui/Tabs';
import { List, ListItem } from 'material-ui/List';
import Visibility from 'material-ui/svg-icons/action/visibility';
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off';
import { Line } from '../UI/Grid';
import { showMessageBox } from '../UI/Messages/MessageBox';
import { getDeprecatedBehaviorsInformation } from '../Hints';
import {
  type EnumeratedBehaviorMetadata,
  enumerateBehaviorsMetadata,
  filterEnumeratedBehaviorMetadata,
} from './EnumerateBehaviorsMetadata';
import SearchBar from 'material-ui-search-bar';
import EmptyMessage from '../UI/EmptyMessage';
import ExtensionsSearch from '../ExtensionsSearch';

const styles = {
  icon: { borderRadius: 0 },
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
    leftAvatar={
      <Avatar src={behaviorMetadata.iconFilename} style={styles.icon} />
    }
    key={behaviorMetadata.type}
    primaryText={behaviorMetadata.fullName}
    secondaryText={<p>{behaviorMetadata.description}</p>}
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
type State = {|
  behaviorMetadata: Array<EnumeratedBehaviorMetadata>,
  showDeprecated: boolean,
  searchText: string,
|};

export default class NewBehaviorDialog extends Component<Props, State> {
  state = {
    ...this._loadFrom(this.props.project),
    showDeprecated: false,
    searchText: '',
  };
  _searchBar = React.createRef<SearchBar>();

  componentDidMount() {
    setTimeout(() => {
      if (this._searchBar.current) this._searchBar.current.focus();
    }, 20 /* Be sure that the search bar is shown */);
  }

  _loadFrom(
    project: gdProject
  ): {| behaviorMetadata: Array<EnumeratedBehaviorMetadata> |} {
    const platform = project.getCurrentPlatform();
    return {
      behaviorMetadata:
        project && platform
          ? enumerateBehaviorsMetadata(platform, project)
          : [],
    };
  }

  componentWillReceiveProps(newProps: Props) {
    if (
      (!this.props.open && newProps.open) ||
      (newProps.open && this.props.project !== newProps.project)
    ) {
      this.setState(this._loadFrom(newProps.project));
    }
  }

  _showDeprecated = (showDeprecated: boolean = true) => {
    this.setState({
      showDeprecated,
    });
  };

  _onNewExtensionInstalled = () => {
    // Reload behaviors
    this.setState(this._loadFrom(this.props.project));

    // TODO: Go back to the first tab.
    // TODO: Display snackbar?
  };

  render() {
    const { project, open, onClose, objectType } = this.props;
    const { showDeprecated, behaviorMetadata, searchText } = this.state;
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

      return this.props.onChoose(type, defaultName);
    };

    const canBehaviorBeUsed = (
      behaviorMetadata: EnumeratedBehaviorMetadata
    ) => {
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
            open={open}
            noMargin
            autoScrollBodyContent
          >
            <Tabs>
              <Tab label={<Trans>Installed Behaviors</Trans>} value="installed">
                <SearchBar
                  value={searchText}
                  onRequestSearch={() => {
                    if (behaviors.length) {
                      chooseBehavior(i18n, behaviors[0]);
                    } else if (showDeprecated && deprecatedBehaviors.length) {
                      chooseBehavior(i18n, deprecatedBehaviors[0]);
                    }
                  }}
                  onChange={text =>
                    this.setState({
                      searchText: text,
                    })
                  }
                  ref={this._searchBar}
                />
                {hasSearchNoResult && (
                  <EmptyMessage>
                    <Trans>
                      No behavior found for your search. Try another search, or
                      search for new behaviors to install.
                    </Trans>
                  </EmptyMessage>
                )
                // TODO: Button to search behaviors
                }
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
                      onClick={() => this._showDeprecated(true)}
                      label={<Trans>Show deprecated (old) behaviors</Trans>}
                    />
                  ) : (
                    <FlatButton
                      key="toggle-experimental"
                      icon={<VisibilityOff />}
                      primary={false}
                      onClick={() => this._showDeprecated(false)}
                      label={<Trans>Show deprecated (old) behaviors</Trans>}
                    />
                  )}
                </Line>
              </Tab>
              <Tab label={<Trans>Search New Behaviors</Trans>} value="search">
                <ExtensionsSearch
                  project={project}
                  onNewExtensionInstalled={this._onNewExtensionInstalled}
                />
              </Tab>
            </Tabs>
          </Dialog>
        )}
      </I18n>
    );
  }
}
