import React from 'react';
import { List, ListItem } from 'material-ui/List';
import { mapFor } from '../Utils/MapFor';
import ListIcon from './ListIcon';
import { makeAddItem } from './AddItem';
import Window from '../Utils/Window';
import IconMenu from '../UI/Menu/IconMenu';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconButton from 'material-ui/IconButton';

const styles = {
  projectStructureItem: {},
  itemName: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
};

const ProjectStructureItem = props => (
  <ListItem style={styles.projectStructureItem} {...props} />
);

const Item = props => {
  const rightIconButton = props.rightIconButton ||
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
          click: () => props.onEdit(),
        },
        {
          label: 'Rename',
          click: () => props.onEditName(),
        },
        {
          label: 'Delete',
          click: () => props.onDelete(),
        },
      ]}
    />;

  return (
    <ListItem
      style={props.style}
      primaryText={<div style={styles.itemName}>{props.primaryText}</div>}
      rightIconButton={rightIconButton}
      onTouchTap={props.onEdit}
    />
  );
};

const AddItem = makeAddItem(Item);

export default class ProjectManager extends React.Component {
  state = {};

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

  render() {
    const { project } = this.props;

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
                onEdit={() => this.props.onOpenLayout(name)}
                onDelete={() => this.props.onDeleteLayout(layout)}
              />
            );
          }).concat(
            <AddItem key={'add-scene'} onClick={this.props.onAddLayout} primaryText="Click to add a scene" />
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
                onEdit={() => this.props.onOpenExternalEvents(name)}
                onDelete={() => this.props.onDeleteExternalEvents(externalEvents)}
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
                onEdit={() => this.props.onOpenExternalLayout(name)}
                onDelete={() => this.props.onDeleteExternalLayout(externalLayout)}
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
