import React from 'react';
import { List, ListItem } from 'material-ui/List';
import { mapFor } from '../Utils/MapFor';
import ListIcon from './ListIcon';

export default class ProjectManager extends React.Component {
  state = {};

  render() {
    const { project } = this.props;

    return (
      <List>
        <ListItem
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
              leftIcon={<ListIcon src="res/ribbon_default/close32.png" />}
              onTouchTap={() => this.props.onExportProject()}
            />,
          ]}
        />
        <ListItem
          primaryText="Resources"
          leftIcon={<ListIcon src="res/ribbon_default/image32.png" />}
        />
        <ListItem
          primaryText="Scenes"
          leftIcon={<ListIcon src="res/ribbon_default/sceneadd32.png" />}
          initiallyOpen={true}
          primaryTogglesNestedList={true}
          autoGenerateNestedIndicator={true}
          nestedItems={mapFor(0, project.getLayoutsCount(), i => {
            const layout = project.getLayoutAt(i);
            const name = layout.getName();
            return (
              <ListItem
                key={i}
                primaryText={name}
                leftIcon={<ListIcon src="res/ribbon_default/sceneadd32.png" />}
                onTouchTap={() => this.props.onOpenLayout(name)}
              />
            );
          })}
        />
        <ListItem
          primaryText="External events"
          leftIcon={<ListIcon src="res/ribbon_default/externalevents32.png" />}
          initiallyOpen={false}
          primaryTogglesNestedList={true}
          autoGenerateNestedIndicator={true}
          nestedItems={mapFor(0, project.getExternalEventsCount(), i => {
            const externalEvents = project.getExternalEventsAt(i);
            const name = externalEvents.getName();
            return (
              <ListItem
                key={i}
                primaryText={name}
                leftIcon={<ListIcon src="res/ribbon_default/externalevents32.png" />}
                onTouchTap={() => this.props.onOpenExternalEvents(name)}
              />
            );
          })}
        />
        <ListItem
          primaryText="External layouts"
          leftIcon={<ListIcon src="res/ribbon_default/externallayout32.png" />}
          initiallyOpen={false}
          primaryTogglesNestedList={true}
          autoGenerateNestedIndicator={true}
          nestedItems={mapFor(0, project.getExternalLayoutsCount(), i => {
            const externalLayout = project.getExternalLayoutAt(i);
            const name = externalLayout.getName();
            return (
              <ListItem
                key={i}
                primaryText={name}
                leftIcon={<ListIcon src="res/ribbon_default/externallayout32.png" />}
                onTouchTap={() => this.props.onOpenExternalLayout(name)}
              />
            );
          })}
        />
      </List>
    );
  }
}
