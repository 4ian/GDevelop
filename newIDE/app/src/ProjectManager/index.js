import React, { Component } from 'react';
import { List, ListItem } from 'material-ui/List';
import TextField from 'material-ui/TextField';
import { mapFor } from '../Utils/MapFor';
import ListIcon from '../UI/ListIcon';
import { makeAddItem } from './AddItem';
import Window from '../Utils/Window';
import IconMenu from '../UI/Menu/IconMenu';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconButton from 'material-ui/IconButton';

const styles = {
  projectStructureItem: {
    borderTop: '1px solid #e0e0e0', //TODO: Use theme color instead
  },
  projectStructureItemNestedList: {
    padding: 0,
  },
  itemName: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  itemTextField: {
    top: -16,
  },
};

const ProjectStructureItem = props => (
  <ListItem
    style={styles.projectStructureItem}
    nestedListStyle={styles.projectStructureItemNestedList}
    {...props}
  />
);

class Item extends Component {
  componentDidUpdate(prevProps) {
    if (!prevProps.editingName && this.props.editingName) {
      setTimeout(
        () => {
          if (this.textField) this.textField.focus();
        },
        100
      );
    }
  }

  render() {
    const rightIconButton = this.props.rightIconButton ||
      <IconMenu
        iconButtonElement={
          <IconButton
            onTouchTap={e =>
              e.preventDefault() /*Prevent bubbling the event to ListItem*/}
          >
            <MoreVertIcon />
          </IconButton>
        }
        menuTemplate={[
          {
            label: 'Edit',
            click: () => this.props.onEdit(),
          },
          {
            label: 'Rename',
            click: () => this.props.onEditName(),
          },
          {
            label: 'Delete',
            click: () => this.props.onDelete(),
          },
        ]}
      />;
    const label = this.props.editingName
      ? <TextField
          id="rename-item-field"
          ref={textField => this.textField = textField}
          defaultValue={this.props.primaryText}
          onBlur={e => this.props.onRename(e.target.value)}
          onKeyPress={event => {
            if (event.charCode === 13) {
              // enter key pressed
              this.textField.blur();
            }
          }}
          fullWidth
          style={styles.itemTextField}
        />
      : <div style={styles.itemName}>{this.props.primaryText}</div>;

    return (
      <ListItem
        style={this.props.style}
        primaryText={label}
        rightIconButton={rightIconButton}
        onTouchTap={this.props.onEdit}
      />
    );
  }
}

const AddItem = makeAddItem(Item);

export default class ProjectManager extends React.Component {
  state = {
    renamedItemKind: null,
    renamedItemName: '',
  };

  _renderMenu() {
    // If there is already a main menu (as the native one made with
    // Electron), don't show it in the Project Manager.
    if (Window.hasMainMenu()) return null;

    return (
      <ProjectStructureItem
        primaryText="Options"
        leftIcon={<ListIcon src="res/ribbon_default/new32.png" />}
        initiallyOpen={true}
        primaryTogglesNestedList={true}
        autoGenerateNestedIndicator={true}
        nestedItems={[
          <ListItem
            key="save"
            primaryText="Save"
            leftIcon={<ListIcon src="res/ribbon_default/save32.png" />}
            onTouchTap={() => this.props.onSaveProject()}
          />,
          <ListItem
            key="close"
            primaryText="Close"
            leftIcon={<ListIcon src="res/ribbon_default/close32.png" />}
            onTouchTap={() => this.props.onCloseProject()}
          />,
          <ListItem
            key="export"
            primaryText="Export"
            leftIcon={<ListIcon src="res/ribbon_default/export32.png" />}
            onTouchTap={() => this.props.onExportProject()}
          />,
        ]}
      />
    );
  }

  _onEditName = (kind, name) => {
    this.setState({
      renamedItemKind: kind,
      renamedItemName: name,
    });
  };

  render() {
    const { project } = this.props;
    const {
      renamedItemKind,
      renamedItemName,
    } = this.state;

    return (
      <List>
        {this._renderMenu()}
        <ProjectStructureItem
          primaryText="Resources"
          leftIcon={<ListIcon src="res/ribbon_default/image32.png" />}
        />
        <ProjectStructureItem
          primaryText="Scenes"
          leftIcon={<ListIcon src="res/ribbon_default/sceneadd32.png" />}
          initiallyOpen={true}
          primaryTogglesNestedList={true}
          autoGenerateNestedIndicator={true}
          nestedItems={mapFor(0, project.getLayoutsCount(), i => {
            const layout = project.getLayoutAt(i);
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
                onRename={newName => this.props.onRenameLayout(name, newName)}
                onEditName={() => this._onEditName('layout', name)}
              />
            );
          }).concat(
            <AddItem
              key={'add-scene'}
              onClick={this.props.onAddLayout}
              primaryText="Click to add a scene"
            />
          )}
        />
        <ProjectStructureItem
          primaryText="External events"
          leftIcon={<ListIcon src="res/ribbon_default/externalevents32.png" />}
          initiallyOpen={false}
          primaryTogglesNestedList={true}
          autoGenerateNestedIndicator={true}
          nestedItems={mapFor(0, project.getExternalEventsCount(), i => {
            const externalEvents = project.getExternalEventsAt(i);
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
                  this.props.onDeleteExternalEvents(externalEvents)}
                onRename={newName =>
                  this.props.onRenameExternalEvents(name, newName)}
                onEditName={() => this._onEditName('external-events', name)}
              />
            );
          }).concat(
            <AddItem
              key={'add-external-events'}
              primaryText="Click to add external events"
              onClick={this.props.onAddExternalEvents}
            />
          )}
        />
        <ProjectStructureItem
          primaryText="External layouts"
          leftIcon={<ListIcon src="res/ribbon_default/externallayout32.png" />}
          initiallyOpen={false}
          primaryTogglesNestedList={true}
          autoGenerateNestedIndicator={true}
          nestedItems={mapFor(0, project.getExternalLayoutsCount(), i => {
            const externalLayout = project.getExternalLayoutAt(i);
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
                  this.props.onDeleteExternalLayout(externalLayout)}
                onRename={newName =>
                  this.props.onRenameExternalLayout(name, newName)}
                onEditName={() => this._onEditName('external-layout', name)}
              />
            );
          }).concat(
            <AddItem
              key={'add-external-layout'}
              primaryText="Click to add an external layout"
              onClick={this.props.onAddExternalLayout}
            />
          )}
        />
      </List>
    );
  }
}
