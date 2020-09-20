// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import { List, ListItem } from '../UI/List';
import TextField, {
  noMarginTextFieldInListItemTopOffset,
} from '../UI/TextField';
import SearchBar, { useShouldAutofocusSearchbar } from '../UI/SearchBar';
import WarningIcon from '@material-ui/icons/Warning';
import ListIcon from '../UI/ListIcon';
import { AddListItem, SearchListItem } from '../UI/ListCommonItem';
import Window from '../Utils/Window';
import VariablesEditorDialog from '../VariablesList/VariablesEditorDialog';
import ProjectPropertiesDialog from './ProjectPropertiesDialog';
import {
  enumerateLayouts,
  enumerateExternalEvents,
  enumerateExternalLayouts,
  enumerateEventsFunctionsExtensions,
  filterProjectItemsList,
} from './EnumerateProjectItems';
import newNameGenerator from '../Utils/NewNameGenerator';
import Clipboard from '../Utils/Clipboard';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import ThemeConsumer from '../UI/Theme/ThemeConsumer';
import ExtensionsSearchDialog from '../ExtensionsSearch/ExtensionsSearchDialog';
import Close from '@material-ui/icons/Close';
import SettingsApplications from '@material-ui/icons/SettingsApplications';
import PhotoLibrary from '@material-ui/icons/PhotoLibrary';
import Settings from '@material-ui/icons/Settings';
import Save from '@material-ui/icons/Save';
import VariableTree from '../UI/CustomSvgIcons/VariableTree';
import ArtTrack from '@material-ui/icons/ArtTrack';
import AddToHomeScreen from '@material-ui/icons/AddToHomeScreen';
import Fullscreen from '@material-ui/icons/Fullscreen';
import FileCopy from '@material-ui/icons/FileCopy';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ScenePropertiesDialog from '../SceneEditor/ScenePropertiesDialog';
import SceneVariablesDialog from '../SceneEditor/SceneVariablesDialog';
import { isExtensionNameTaken } from './EventFunctionExtensionNameVerifier';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import ProjectManagerCommands from './ProjectManagerCommands';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';

const LAYOUT_CLIPBOARD_KIND = 'Layout';
const EXTERNAL_LAYOUT_CLIPBOARD_KIND = 'External layout';
const EXTERNAL_EVENTS_CLIPBOARD_KIND = 'External events';
const EVENTS_FUNCTIONS_EXTENSION_CLIPBOARD_KIND = 'Events Functions Extension';

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'hidden',
  },
  list: {
    flex: 1,
    overflowY: 'scroll',
    padding: 0,
  },
  noIndentNestedList: {
    padding: 0,
  },
  itemName: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  itemTextField: {
    top: noMarginTextFieldInListItemTopOffset,
  },
};

type ProjectStructureItemProps = {|
  autoGenerateNestedIndicator?: boolean,
  initiallyOpen?: boolean,
  leftIcon?: React$Element<any>,
  indentNestedItems?: boolean,
  renderNestedItems: () => Array<React$Element<any> | null>,
  primaryText: React.Node,
  error?: ?Error,
  onRefresh?: () => void,
  open?: boolean,
|};

const ProjectStructureItem = (props: ProjectStructureItemProps) => (
  <ThemeConsumer>
    {muiTheme => {
      const {
        error,
        leftIcon,
        onRefresh,
        indentNestedItems,
        ...otherProps
      } = props;
      return (
        <ListItem
          style={{
            backgroundColor: muiTheme.listItem.groupBackgroundColor,
            borderBottom: `1px solid ${muiTheme.listItem.separatorColor}`,
          }}
          nestedListStyle={
            indentNestedItems ? undefined : styles.noIndentNestedList
          }
          {...otherProps}
          leftIcon={error ? <WarningIcon /> : leftIcon}
          displayReloadButton={!!error}
          onReload={onRefresh}
          reloadButtonTooltip={`An error has occured in functions. Click to reload them.`}
        />
      );
    }}
  </ThemeConsumer>
);

type ItemProps = {|
  primaryText: string,
  editingName: boolean,
  onEdit: () => void,
  onDelete: () => void,
  addLabel: string,
  onAdd: () => void,
  onRename: string => void,
  onEditName: () => void,
  onCopy: () => void,
  onCut: () => void,
  onPaste: () => void,
  onDuplicate: () => void,
  canPaste: () => boolean,
  canMoveUp: boolean,
  onMoveUp: () => void,
  canMoveDown: boolean,
  onMoveDown: () => void,
  buildExtraMenuTemplate?: (i18n: I18nType) => Array<MenuItemTemplate>,
  style?: ?Object,
|};

class Item extends React.Component<ItemProps, {||}> {
  textField: ?Object;

  componentDidUpdate(prevProps) {
    if (!prevProps.editingName && this.props.editingName) {
      setTimeout(() => {
        if (this.textField) this.textField.focus();
      }, 100);
    }
  }

  render() {
    const label = this.props.editingName ? (
      <TextField
        id="rename-item-field"
        margin="none"
        ref={textField => (this.textField = textField)}
        defaultValue={this.props.primaryText}
        onBlur={e => this.props.onRename(e.currentTarget.value)}
        onKeyPress={event => {
          if (event.charCode === 13) {
            // enter key pressed
            if (this.textField) this.textField.blur();
          }
        }}
        fullWidth
        style={styles.itemTextField}
      />
    ) : (
      <div style={styles.itemName}>{this.props.primaryText}</div>
    );

    return (
      <ThemeConsumer>
        {muiTheme => (
          <I18n>
            {({ i18n }) => (
              <ListItem
                style={{
                  borderBottom: `1px solid ${muiTheme.listItem.separatorColor}`,
                  ...this.props.style,
                }}
                primaryText={label}
                displayMenuButton
                buildMenuTemplate={(i18n: I18nType) => [
                  {
                    label: i18n._(t`Edit`),
                    click: () => this.props.onEdit(),
                  },
                  ...(this.props.buildExtraMenuTemplate
                    ? this.props.buildExtraMenuTemplate(i18n)
                    : []),
                  { type: 'separator' },
                  {
                    label: i18n._(t`Rename`),
                    click: () => this.props.onEditName(),
                  },
                  {
                    label: i18n._(t`Delete`),
                    click: () => this.props.onDelete(),
                  },
                  {
                    label: this.props.addLabel,
                    visible: !!this.props.onAdd,
                    click: () => this.props.onAdd(),
                  },
                  { type: 'separator' },
                  {
                    label: i18n._(t`Copy`),
                    click: () => this.props.onCopy(),
                  },
                  {
                    label: i18n._(t`Cut`),
                    click: () => this.props.onCut(),
                  },
                  {
                    label: i18n._(t`Paste`),
                    enabled: this.props.canPaste(),
                    click: () => this.props.onPaste(),
                  },
                  {
                    label: i18n._(t`Duplicate`),
                    click: () => this.props.onDuplicate(),
                  },
                  { type: 'separator' },
                  {
                    label: i18n._(t`Move up`),
                    enabled: this.props.canMoveUp,
                    click: () => this.props.onMoveUp(),
                  },
                  {
                    label: i18n._(t`Move down`),
                    enabled: this.props.canMoveDown,
                    click: () => this.props.onMoveDown(),
                  },
                ]}
                onClick={() => {
                  // It's essential to discard clicks when editing the name,
                  // to avoid weird opening of an editor (accompanied with a
                  // closing of the project manager) when clicking on the text
                  // field.
                  if (!this.props.editingName) this.props.onEdit();
                }}
              />
            )}
          </I18n>
        )}
      </ThemeConsumer>
    );
  }
}

type Props = {|
  project: gdProject,
  onDeleteLayout: gdLayout => void,
  onDeleteExternalEvents: gdExternalEvents => void,
  onDeleteExternalLayout: gdExternalLayout => void,
  onDeleteEventsFunctionsExtension: gdEventsFunctionsExtension => void,
  onRenameLayout: (string, string) => void,
  onRenameExternalEvents: (string, string) => void,
  onRenameExternalLayout: (string, string) => void,
  onRenameEventsFunctionsExtension: (string, string) => void,
  onOpenLayout: string => void,
  onOpenExternalEvents: string => void,
  onOpenExternalLayout: string => void,
  onOpenEventsFunctionsExtension: string => void,
  onSaveProject: () => void,
  onSaveProjectAs: () => void,
  onCloseProject: () => void,
  onExportProject: () => void,
  onOpenPreferences: () => void,
  onOpenProfile: () => void,
  onOpenResources: () => void,
  onAddLayout: () => void,
  onAddExternalEvents: () => void,
  onAddExternalLayout: () => void,
  onAddEventsFunctionsExtension: () => void,
  onOpenPlatformSpecificAssets: () => void,
  onChangeSubscription: () => void,
  eventsFunctionsExtensionsError: ?Error,
  onReloadEventsFunctionsExtensions: () => void,
  freezeUpdate: boolean,
  unsavedChanges?: UnsavedChanges,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
|};

type State = {|
  editedPropertiesLayout: ?gdLayout,
  editedVariablesLayout: ?gdLayout,
  renamedItemKind: ?string,
  renamedItemName: string,
  searchText: string,
  projectPropertiesDialogOpen: boolean,
  projectVariablesEditorOpen: boolean,
  extensionsSearchDialogOpen: boolean,
  layoutPropertiesDialogOpen: boolean,
  layoutVariablesDialogOpen: boolean,
|};

export default class ProjectManager extends React.Component<Props, State> {
  _searchBar: ?SearchBar;

  state = {
    editedPropertiesLayout: null,
    editedVariablesLayout: null,
    renamedItemKind: null,
    renamedItemName: '',
    searchText: '',
    projectPropertiesDialogOpen: false,
    projectVariablesEditorOpen: false,
    extensionsSearchDialogOpen: false,
    layoutPropertiesDialogOpen: false,
    layoutVariablesDialogOpen: false,
  };

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    if (
      nextState.projectPropertiesDialogOpen !==
      this.state.projectPropertiesDialogOpen
    )
      return true;
    if (
      nextState.projectVariablesEditorOpen !==
      this.state.projectVariablesEditorOpen
    )
      return true;
    // Rendering the component is (super) costly (~20ms) as it iterates over
    // every project layouts/external layouts/external events,
    // so the prop freezeUpdate allow to ask the component to stop
    // updating, for example when hidden.
    return !nextProps.freezeUpdate;
  }

  componentDidUpdate(prevProps: Props) {
    // Typical usage (don't forget to compare props):
    if (!this.props.freezeUpdate && prevProps.freezeUpdate) {
      if (useShouldAutofocusSearchbar() && this._searchBar)
        this._searchBar.focus();
    }
  }

  _openProjectProperties = () => {
    this.setState({
      projectPropertiesDialogOpen: true,
    });
  };

  _openProjectVariables = () => {
    this.setState({
      projectVariablesEditorOpen: true,
    });
  };

  _onEditName = (kind: ?string, name: string) => {
    this.setState({
      renamedItemKind: kind,
      renamedItemName: name,
    });
  };

  _copyLayout = (layout: gdLayout) => {
    Clipboard.set(LAYOUT_CLIPBOARD_KIND, {
      layout: serializeToJSObject(layout),
      name: layout.getName(),
    });
  };

  _cutLayout = (layout: gdLayout) => {
    this._copyLayout(layout);
    this.props.onDeleteLayout(layout);
  };

  _pasteLayout = (index: number) => {
    if (!Clipboard.has(LAYOUT_CLIPBOARD_KIND)) return;

    const { layout: copiedLayout, name } = Clipboard.get(LAYOUT_CLIPBOARD_KIND);
    const { project } = this.props;

    const newName = newNameGenerator(name, name =>
      project.hasLayoutNamed(name)
    );

    const newLayout = project.insertNewLayout(newName, index);

    unserializeFromJSObject(
      newLayout,
      copiedLayout,
      'unserializeFrom',
      project
    );
    newLayout.setName(newName); // Unserialization has overwritten the name.
    newLayout.updateBehaviorsSharedData(project);

    this._onProjectItemModified();
  };

  _duplicateLayout = (layout: gdLayout, index: number) => {
    this._copyLayout(layout);
    this._pasteLayout(index);
  };

  _addLayout = (index: number) => {
    const { project } = this.props;

    const newName = newNameGenerator('New scene', name =>
      project.hasLayoutNamed(name)
    );
    const newLayout = project.insertNewLayout(newName, index + 1);

    newLayout.setName(newName);
    newLayout.updateBehaviorsSharedData(project);

    this._onProjectItemModified();
  };

  _onOpenLayoutProperties = (layout: ?gdLayout) => {
    this.setState({ editedPropertiesLayout: layout });
  };

  _onOpenLayoutVariables = (layout: ?gdLayout) => {
    this.setState({ editedVariablesLayout: layout });
  };

  _addExternalEvents = (index: number) => {
    const { project } = this.props;

    const newName = newNameGenerator('NewExternalEvents', name =>
      project.hasExternalEventsNamed(name)
    );
    project.insertNewExternalEvents(newName, index + 1);
    this._onProjectItemModified();
  };

  _addExternalLayout = (index: number) => {
    const { project } = this.props;

    const newName = newNameGenerator('NewExternalLayout', name =>
      project.hasExternalLayoutNamed(name)
    );
    project.insertNewExternalLayout(newName, index + 1);
    this._onProjectItemModified();
  };

  _addEventsFunctionsExtension = (index: number) => {
    const { project } = this.props;

    const newName = newNameGenerator('NewExtension', name =>
      isExtensionNameTaken(name, project)
    );
    project.insertNewEventsFunctionsExtension(newName, index + 1);
    this._onProjectItemModified();
  };

  _moveUpLayout = (index: number) => {
    const { project } = this.props;
    if (index <= 0) return;

    project.swapLayouts(index, index - 1);
    this._onProjectItemModified();
  };

  _moveDownLayout = (index: number) => {
    const { project } = this.props;
    if (index >= project.getLayoutsCount() - 1) return;

    project.swapLayouts(index, index + 1);
    this._onProjectItemModified();
  };

  _copyExternalEvents = (externalEvents: gdExternalEvents) => {
    Clipboard.set(EXTERNAL_EVENTS_CLIPBOARD_KIND, {
      externalEvents: serializeToJSObject(externalEvents),
      name: externalEvents.getName(),
    });
  };

  _cutExternalEvents = (externalEvents: gdExternalEvents) => {
    this._copyExternalEvents(externalEvents);
    this.props.onDeleteExternalEvents(externalEvents);
  };

  _pasteExternalEvents = (index: number) => {
    if (!Clipboard.has(EXTERNAL_EVENTS_CLIPBOARD_KIND)) return;

    const { externalEvents: copiedExternalEvents, name } = Clipboard.get(
      EXTERNAL_EVENTS_CLIPBOARD_KIND
    );
    const { project } = this.props;

    const newName = newNameGenerator(name, name =>
      project.hasExternalEventsNamed(name)
    );

    const newExternalEvents = project.insertNewExternalEvents(newName, index);

    unserializeFromJSObject(
      newExternalEvents,
      copiedExternalEvents,
      'unserializeFrom',
      project
    );
    newExternalEvents.setName(newName); // Unserialization has overwritten the name.

    this._onProjectItemModified();
  };

  _duplicateExternalEvents = (
    externalEvents: gdExternalEvents,
    index: number
  ) => {
    this._copyExternalEvents(externalEvents);
    this._pasteExternalEvents(index);
  };

  _moveUpExternalEvents = (index: number) => {
    const { project } = this.props;
    if (index <= 0) return;

    project.swapExternalEvents(index, index - 1);
    this._onProjectItemModified();
  };

  _moveDownExternalEvents = (index: number) => {
    const { project } = this.props;
    if (index >= project.getExternalEventsCount() - 1) return;

    project.swapExternalEvents(index, index + 1);
    this._onProjectItemModified();
  };

  _copyExternalLayout = (externalLayout: gdExternalLayout) => {
    Clipboard.set(EXTERNAL_LAYOUT_CLIPBOARD_KIND, {
      externalLayout: serializeToJSObject(externalLayout),
      name: externalLayout.getName(),
    });
  };

  _cutExternalLayout = (externalLayout: gdExternalLayout) => {
    this._copyExternalLayout(externalLayout);
    this.props.onDeleteExternalLayout(externalLayout);
  };

  _pasteExternalLayout = (index: number) => {
    if (!Clipboard.has(EXTERNAL_LAYOUT_CLIPBOARD_KIND)) return;

    const { externalLayout: copiedExternalLayout, name } = Clipboard.get(
      EXTERNAL_LAYOUT_CLIPBOARD_KIND
    );
    const { project } = this.props;

    const newName = newNameGenerator(name, name =>
      project.hasExternalLayoutNamed(name)
    );

    const newExternalLayout = project.insertNewExternalLayout(newName, index);

    unserializeFromJSObject(newExternalLayout, copiedExternalLayout);
    newExternalLayout.setName(newName); // Unserialization has overwritten the name.
    this._onProjectItemModified();
  };

  _duplicateExternalLayout = (
    externalLayout: gdExternalLayout,
    index: number
  ) => {
    this._copyExternalLayout(externalLayout);
    this._pasteExternalLayout(index);
  };

  _moveUpExternalLayout = (index: number) => {
    const { project } = this.props;
    if (index <= 0) return;

    project.swapExternalLayouts(index, index - 1);
    this._onProjectItemModified();
  };

  _moveDownExternalLayout = (index: number) => {
    const { project } = this.props;
    if (index >= project.getExternalLayoutsCount() - 1) return;

    project.swapExternalLayouts(index, index + 1);
    this._onProjectItemModified();
  };

  _copyEventsFunctionsExtension = (
    eventsFunctionsExtension: gdEventsFunctionsExtension
  ) => {
    Clipboard.set(EVENTS_FUNCTIONS_EXTENSION_CLIPBOARD_KIND, {
      eventsFunctionsExtension: serializeToJSObject(eventsFunctionsExtension),
      name: eventsFunctionsExtension.getName(),
    });
  };

  _cutEventsFunctionsExtension = (
    eventsFunctionsExtension: gdEventsFunctionsExtension
  ) => {
    this._copyEventsFunctionsExtension(eventsFunctionsExtension);
    this.props.onDeleteEventsFunctionsExtension(eventsFunctionsExtension);
  };

  _duplicateEventsFunctionsExtension = (
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    index: number
  ) => {
    this._copyEventsFunctionsExtension(eventsFunctionsExtension);
    this._pasteEventsFunctionsExtension(index);
  };

  _pasteEventsFunctionsExtension = (index: number) => {
    if (!Clipboard.has(EVENTS_FUNCTIONS_EXTENSION_CLIPBOARD_KIND)) return;

    const {
      eventsFunctionsExtension: copiedEventsFunctionsExtension,
      name,
    } = Clipboard.get(EVENTS_FUNCTIONS_EXTENSION_CLIPBOARD_KIND);
    const { project } = this.props;

    const newName = newNameGenerator(name, name =>
      isExtensionNameTaken(name, project)
    );

    const newEventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      newName,
      index
    );

    unserializeFromJSObject(
      newEventsFunctionsExtension,
      copiedEventsFunctionsExtension,
      'unserializeFrom',
      project
    );
    newEventsFunctionsExtension.setName(newName); // Unserialization has overwritten the name.

    this._onProjectItemModified();
    this.props.onReloadEventsFunctionsExtensions();
  };

  _moveUpEventsFunctionsExtension = (index: number) => {
    const { project } = this.props;
    if (index <= 0) return;

    project.swapEventsFunctionsExtensions(index, index - 1);
    this._onProjectItemModified();
  };

  _moveDownEventsFunctionsExtension = (index: number) => {
    const { project } = this.props;
    if (index >= project.getEventsFunctionsExtensionsCount() - 1) return;

    project.swapEventsFunctionsExtensions(index, index + 1);
    this._onProjectItemModified();
  };

  _renderMenu() {
    // If there is already a main menu (as the native one made with
    // Electron), don't show it in the Project Manager.
    if (Window.hasMainMenu()) return null;

    return (
      <React.Fragment>
        <ListItem
          key="save"
          primaryText={<Trans>Save</Trans>}
          leftIcon={<Save />}
          onClick={() => this.props.onSaveProject()}
        />
        <ListItem
          key="save-as"
          primaryText={<Trans>Save as...</Trans>}
          leftIcon={<FileCopy />}
          onClick={() => this.props.onSaveProjectAs()}
        />
        <ListItem
          key="export"
          primaryText={<Trans>Export</Trans>}
          leftIcon={<AddToHomeScreen />}
          onClick={() => this.props.onExportProject()}
        />
        <ListItem
          key="close"
          primaryText={<Trans>Close</Trans>}
          leftIcon={<Close />}
          onClick={() => this.props.onCloseProject()}
        />
        <ListItem
          key="preferences"
          primaryText={<Trans>Preferences</Trans>}
          leftIcon={<Settings />}
          onClick={() => this.props.onOpenPreferences()}
        />
        <ListItem
          key="profile"
          primaryText={<Trans>My profile</Trans>}
          leftIcon={<AccountCircle />}
          onClick={() => this.props.onOpenProfile()}
        />
        {!Window.isFullscreen() && (
          <ListItem
            key="fullscreen"
            primaryText={<Trans>Turn on Fullscreen</Trans>}
            leftIcon={<Fullscreen />}
            onClick={() => Window.requestFullscreen()}
          />
        )}
      </React.Fragment>
    );
  }

  _onSearchChange = (text: string) =>
    this.setState({
      searchText: text,
    });

  _onRequestSearch = () => {
    /* Do nothing for now, but we could open the first result. */
  };

  _onProjectItemModified = () => {
    this.forceUpdate();
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
  };

  render() {
    const {
      project,
      eventsFunctionsExtensionsError,
      onReloadEventsFunctionsExtensions,
    } = this.props;
    const { renamedItemKind, renamedItemName, searchText } = this.state;

    const forceOpen = searchText !== '' ? true : undefined;

    return (
      <div style={styles.container}>
        <ProjectManagerCommands
          project={this.props.project}
          onOpenProjectProperties={this._openProjectProperties}
          onOpenProjectVariables={this._openProjectVariables}
          onOpenResourcesDialog={this.props.onOpenResources}
          onOpenPlatformSpecificAssetsDialog={
            this.props.onOpenPlatformSpecificAssets
          }
        />
        <List style={styles.list}>
          {this._renderMenu()}
          <ProjectStructureItem
            primaryText={<Trans>Game settings</Trans>}
            leftIcon={
              <ListIcon
                iconSize={24}
                isGDevelopIcon
                src="res/ribbon_default/projectManager32.png"
              />
            }
            initiallyOpen={false}
            autoGenerateNestedIndicator={true}
            indentNestedItems
            renderNestedItems={() => [
              <ListItem
                key="properties"
                primaryText={<Trans>Properties</Trans>}
                leftIcon={<SettingsApplications />}
                onClick={this._openProjectProperties}
              />,
              <ListItem
                key="global-variables"
                primaryText={<Trans>Global variables</Trans>}
                leftIcon={<VariableTree />}
                onClick={this._openProjectVariables}
              />,
              <ListItem
                key="icons"
                primaryText={<Trans>Icons</Trans>}
                leftIcon={<PhotoLibrary />}
                onClick={() => this.props.onOpenPlatformSpecificAssets()}
              />,
              <ListItem
                key="resources"
                primaryText={<Trans>Resources</Trans>}
                leftIcon={<ArtTrack />}
                onClick={() => {
                  this.props.onOpenResources();
                }}
              />,
            ]}
          />
          <ProjectStructureItem
            primaryText={<Trans>Scenes</Trans>}
            leftIcon={
              <ListIcon
                iconSize={24}
                isGDevelopIcon
                src="res/ribbon_default/sceneadd32.png"
              />
            }
            initiallyOpen={true}
            open={forceOpen}
            autoGenerateNestedIndicator={!forceOpen}
            renderNestedItems={() =>
              filterProjectItemsList(enumerateLayouts(project), searchText)
                .map((layout: gdLayout, i: number) => {
                  const name = layout.getName();
                  return (
                    <Item
                      key={i}
                      primaryText={name}
                      editingName={
                        renamedItemKind === 'layout' && renamedItemName === name
                      }
                      onEdit={() => this.props.onOpenLayout(name)}
                      onDelete={() => this.props.onDeleteLayout(layout)}
                      addLabel={'Add a New Scene'}
                      onAdd={() => this._addLayout(i)}
                      onRename={newName => {
                        this.props.onRenameLayout(name, newName);
                        this._onEditName(null, '');
                      }}
                      onEditName={() => this._onEditName('layout', name)}
                      onCopy={() => this._copyLayout(layout)}
                      onCut={() => this._cutLayout(layout)}
                      onPaste={() => this._pasteLayout(i)}
                      onDuplicate={() => this._duplicateLayout(layout, i)}
                      canPaste={() => Clipboard.has(LAYOUT_CLIPBOARD_KIND)}
                      canMoveUp={i !== 0}
                      onMoveUp={() => this._moveUpLayout(i)}
                      canMoveDown={i !== project.getLayoutsCount() - 1}
                      onMoveDown={() => this._moveDownLayout(i)}
                      buildExtraMenuTemplate={(i18n: I18nType) => [
                        {
                          label: i18n._(t`Edit Scene Properties`),
                          enabled: true,
                          click: () => this._onOpenLayoutProperties(layout),
                        },
                        {
                          label: i18n._(t`Edit Scene Variables`),
                          enabled: true,
                          click: () => this._onOpenLayoutVariables(layout),
                        },
                      ]}
                    />
                  );
                })
                .concat(
                  <AddListItem
                    key={'add-scene'}
                    onClick={this.props.onAddLayout}
                    primaryText={<Trans>Click to add a scene</Trans>}
                  />
                )
            }
          />
          <ProjectStructureItem
            primaryText={<Trans>External events</Trans>}
            leftIcon={
              <ListIcon
                iconSize={24}
                isGDevelopIcon
                src="res/ribbon_default/externalevents32.png"
              />
            }
            initiallyOpen={false}
            open={forceOpen}
            autoGenerateNestedIndicator={!forceOpen}
            renderNestedItems={() =>
              filterProjectItemsList(
                enumerateExternalEvents(project),
                searchText
              )
                .map((externalEvents, i) => {
                  const name = externalEvents.getName();
                  return (
                    <Item
                      key={i}
                      primaryText={name}
                      editingName={
                        renamedItemKind === 'external-events' &&
                        renamedItemName === name
                      }
                      onEdit={() => this.props.onOpenExternalEvents(name)}
                      onDelete={() =>
                        this.props.onDeleteExternalEvents(externalEvents)
                      }
                      addLabel={'Add New External Events'}
                      onAdd={() => this._addExternalEvents(i)}
                      onRename={newName => {
                        this.props.onRenameExternalEvents(name, newName);
                        this._onEditName(null, '');
                      }}
                      onEditName={() =>
                        this._onEditName('external-events', name)
                      }
                      onCopy={() => this._copyExternalEvents(externalEvents)}
                      onCut={() => this._cutExternalEvents(externalEvents)}
                      onPaste={() => this._pasteExternalEvents(i)}
                      onDuplicate={() =>
                        this._duplicateExternalEvents(externalEvents, i)
                      }
                      canPaste={() =>
                        Clipboard.has(EXTERNAL_EVENTS_CLIPBOARD_KIND)
                      }
                      canMoveUp={i !== 0}
                      onMoveUp={() => this._moveUpExternalEvents(i)}
                      canMoveDown={i !== project.getExternalEventsCount() - 1}
                      onMoveDown={() => this._moveDownExternalEvents(i)}
                    />
                  );
                })
                .concat(
                  <AddListItem
                    key={'add-external-events'}
                    primaryText={<Trans>Click to add external events</Trans>}
                    onClick={this.props.onAddExternalEvents}
                  />
                )
            }
          />
          <ProjectStructureItem
            primaryText={<Trans>External layouts</Trans>}
            leftIcon={
              <ListIcon
                iconSize={24}
                isGDevelopIcon
                src="res/ribbon_default/externallayout32.png"
              />
            }
            initiallyOpen={false}
            open={forceOpen}
            autoGenerateNestedIndicator={!forceOpen}
            renderNestedItems={() =>
              filterProjectItemsList(
                enumerateExternalLayouts(project),
                searchText
              )
                .map((externalLayout, i) => {
                  const name = externalLayout.getName();
                  return (
                    <Item
                      key={i}
                      primaryText={name}
                      editingName={
                        renamedItemKind === 'external-layout' &&
                        renamedItemName === name
                      }
                      onEdit={() => this.props.onOpenExternalLayout(name)}
                      onDelete={() =>
                        this.props.onDeleteExternalLayout(externalLayout)
                      }
                      addLabel={'Add a New External Layout'}
                      onAdd={() => this._addExternalLayout(i)}
                      onRename={newName => {
                        this.props.onRenameExternalLayout(name, newName);
                        this._onEditName(null, '');
                      }}
                      onEditName={() =>
                        this._onEditName('external-layout', name)
                      }
                      onCopy={() => this._copyExternalLayout(externalLayout)}
                      onCut={() => this._cutExternalLayout(externalLayout)}
                      onPaste={() => this._pasteExternalLayout(i)}
                      onDuplicate={() =>
                        this._duplicateExternalLayout(externalLayout, i)
                      }
                      canPaste={() =>
                        Clipboard.has(EXTERNAL_LAYOUT_CLIPBOARD_KIND)
                      }
                      canMoveUp={i !== 0}
                      onMoveUp={() => this._moveUpExternalLayout(i)}
                      canMoveDown={i !== project.getExternalLayoutsCount() - 1}
                      onMoveDown={() => this._moveDownExternalLayout(i)}
                    />
                  );
                })
                .concat(
                  <AddListItem
                    key={'add-external-layout'}
                    primaryText={<Trans>Click to add an external layout</Trans>}
                    onClick={this.props.onAddExternalLayout}
                  />
                )
            }
          />
          <ProjectStructureItem
            primaryText={<Trans>Functions/Behaviors</Trans>}
            error={eventsFunctionsExtensionsError}
            onRefresh={onReloadEventsFunctionsExtensions}
            leftIcon={
              <ListIcon
                iconSize={24}
                isGDevelopIcon
                src="res/ribbon_default/function32.png"
              />
            }
            initiallyOpen={false}
            open={forceOpen}
            autoGenerateNestedIndicator={
              !forceOpen && !eventsFunctionsExtensionsError
            }
            renderNestedItems={() =>
              filterProjectItemsList(
                enumerateEventsFunctionsExtensions(project),
                searchText
              )
                .map((eventsFunctionsExtension, i) => {
                  const name = eventsFunctionsExtension.getName();
                  return (
                    <Item
                      key={i}
                      primaryText={name}
                      editingName={
                        renamedItemKind === 'events-functions-extension' &&
                        renamedItemName === name
                      }
                      onEdit={() =>
                        this.props.onOpenEventsFunctionsExtension(name)
                      }
                      onDelete={() =>
                        this.props.onDeleteEventsFunctionsExtension(
                          eventsFunctionsExtension
                        )
                      }
                      addLabel={'Add a New Extension'}
                      onAdd={() => this._addEventsFunctionsExtension(i)}
                      onRename={newName => {
                        this.props.onRenameEventsFunctionsExtension(
                          name,
                          newName
                        );
                        this._onEditName(null, '');
                      }}
                      onEditName={() =>
                        this._onEditName('events-functions-extension', name)
                      }
                      onCopy={() =>
                        this._copyEventsFunctionsExtension(
                          eventsFunctionsExtension
                        )
                      }
                      onCut={() =>
                        this._cutEventsFunctionsExtension(
                          eventsFunctionsExtension
                        )
                      }
                      onPaste={() => this._pasteEventsFunctionsExtension(i)}
                      onDuplicate={() =>
                        this._duplicateEventsFunctionsExtension(
                          eventsFunctionsExtension,
                          i
                        )
                      }
                      canPaste={() =>
                        Clipboard.has(EVENTS_FUNCTIONS_EXTENSION_CLIPBOARD_KIND)
                      }
                      canMoveUp={i !== 0}
                      onMoveUp={() => this._moveUpEventsFunctionsExtension(i)}
                      canMoveDown={
                        i !== project.getEventsFunctionsExtensionsCount() - 1
                      }
                      onMoveDown={() =>
                        this._moveDownEventsFunctionsExtension(i)
                      }
                    />
                  );
                })
                .concat(
                  <AddListItem
                    key={'add-events-functions-extension'}
                    primaryText={
                      <Trans>Click to add functions and behaviors</Trans>
                    }
                    onClick={this.props.onAddEventsFunctionsExtension}
                  />
                )
                .concat(
                  <SearchListItem
                    key={'extensions-search'}
                    primaryText={<Trans>Search for new extensions</Trans>}
                    onClick={() =>
                      this.setState({ extensionsSearchDialogOpen: true })
                    }
                  />
                )
            }
          />
        </List>
        <SearchBar
          ref={searchBar => (this._searchBar = searchBar)}
          value={searchText}
          onRequestSearch={this._onRequestSearch}
          onChange={this._onSearchChange}
        />
        {this.state.projectVariablesEditorOpen && (
          <VariablesEditorDialog
            title={<Trans>Global Variables</Trans>}
            open
            variablesContainer={project.getVariables()}
            onCancel={() =>
              this.setState({ projectVariablesEditorOpen: false })
            }
            onApply={() => {
              if (this.props.unsavedChanges)
                this.props.unsavedChanges.triggerUnsavedChanges();
              this.setState({ projectVariablesEditorOpen: false });
            }}
            emptyExplanationMessage={
              <Trans>
                Global variables are variables that are shared amongst all the
                scenes of the game.
              </Trans>
            }
            emptyExplanationSecondMessage={
              <Trans>
                For example, you can have a variable called UnlockedLevelsCount
                representing the number of levels unlocked by the player.
              </Trans>
            }
            hotReloadPreviewButtonProps={this.props.hotReloadPreviewButtonProps}
          />
        )}
        {this.state.projectPropertiesDialogOpen && (
          <ProjectPropertiesDialog
            open={this.state.projectPropertiesDialogOpen}
            project={project}
            onClose={() =>
              this.setState({ projectPropertiesDialogOpen: false })
            }
            onApply={() => {
              if (this.props.unsavedChanges)
                this.props.unsavedChanges.triggerUnsavedChanges();
              this.setState({ projectPropertiesDialogOpen: false });
            }}
            onChangeSubscription={this.props.onChangeSubscription}
          />
        )}
        {!!this.state.editedPropertiesLayout && (
          <ScenePropertiesDialog
            open
            layout={this.state.editedPropertiesLayout}
            project={this.props.project}
            onApply={() => {
              if (this.props.unsavedChanges)
                this.props.unsavedChanges.triggerUnsavedChanges();
              this._onOpenLayoutProperties(null);
            }}
            onClose={() => this._onOpenLayoutProperties(null)}
            onEditVariables={() => {
              this._onOpenLayoutVariables(this.state.editedPropertiesLayout);
              this._onOpenLayoutProperties(null);
            }}
          />
        )}
        {!!this.state.editedVariablesLayout && (
          <SceneVariablesDialog
            open
            layout={this.state.editedVariablesLayout}
            onClose={() => this._onOpenLayoutVariables(null)}
            onApply={() => {
              if (this.props.unsavedChanges)
                this.props.unsavedChanges.triggerUnsavedChanges();
              this._onOpenLayoutVariables(null);
            }}
            hotReloadPreviewButtonProps={this.props.hotReloadPreviewButtonProps}
          />
        )}
        {this.state.extensionsSearchDialogOpen && (
          <ExtensionsSearchDialog
            project={project}
            onClose={() => this.setState({ extensionsSearchDialogOpen: false })}
          />
        )}
      </div>
    );
  }
}
