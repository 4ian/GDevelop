import React from 'react';
import {List, ListItem} from 'material-ui/List';
import ContentInbox from 'material-ui/svg-icons/content/inbox';
import ContentSend from 'material-ui/svg-icons/content/send';
import mapFor from '../Utils/MapFor';

export default class ProjectManager extends React.Component {
  state = {};

  render() {
    const { project } = this.props;

    return (
      <List>
        <ListItem primaryText="Resources" leftIcon={<ContentSend />} />
        <ListItem
          primaryText="Scenes"
          leftIcon={<ContentInbox />}
          initiallyOpen={true}
          primaryTogglesNestedList={true}
          autoGenerateNestedIndicator={true}
          nestedItems={mapFor(0, project.getLayoutsCount(), (i) => {
            const layout = project.getLayoutAt(i);
            const name = layout.getName();
            return (
              <ListItem
                key={i}
                primaryText={name}
                leftIcon={<ContentInbox />}
                onTouchTap={() => this.props.onOpenLayout(name)}
              />
            );
          })}
        />
        <ListItem
          primaryText="External events"
          leftIcon={<ContentInbox />}
          initiallyOpen={true}
          primaryTogglesNestedList={true}
          autoGenerateNestedIndicator={true}
          nestedItems={mapFor(0, project.getExternalEventsCount(), (i) => {
            const externalEvents = project.getExternalEventsAt(i);
            const name = externalEvents.getName();
            return (
              <ListItem
                key={i}
                primaryText={name}
                leftIcon={<ContentInbox />}
                onTouchTap={() => this.props.onOpenExternalEvents(name)}
              />
            );
          })}
        />
      </List>
    );
  }
}
