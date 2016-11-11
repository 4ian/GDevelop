import React from 'react';
import {List, ListItem} from 'material-ui/List';
import ContentInbox from 'material-ui/svg-icons/content/inbox';
import ContentSend from 'material-ui/svg-icons/content/send';

const loop = (start, end, func) => { //TODO: move me in utils/package
  const result = [];
  for(let i = start; i < end; i++) {
    result.push(func(i));
  }
  return result;
}

export default class ProjectManager extends React.Component {
  state = {
  };

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
          nestedItems={loop(0, project.getLayoutsCount(), (i) => {
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
          nestedItems={loop(0, project.getExternalEventsCount(), (i) => {
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
