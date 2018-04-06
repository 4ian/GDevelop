// @flow
import * as React from 'react';
import { List, ListItem } from 'material-ui/List';
import Paper from 'material-ui/Paper';
import get from 'lodash/get';
import {
  type InspectorDescription,
  type InspectorDescriptionsGetter,
  type GameData,
} from './GDJSInspectorDescriptions';
import EmptyMessage from '../UI/EmptyMessage';

type Props = {|
  gameData: GameData,
  getInspectorDescriptions: InspectorDescriptionsGetter,
  onChooseInspector: (
    InspectorDescription,
    fullInspectorPath: Array<string>
  ) => void,
|};

const styles = {
  container: {
    flex: 1,
    display: 'flex',
  },
  list: {
    overflowY: 'scroll',
    flex: 1,
  },
};

export default class InspectorsList extends React.Component<Props, void> {
  _renderInspectorList(
    gameData: GameData,
    getInspectorDescriptions: InspectorDescriptionsGetter,
    path: Array<string>
  ) {
    return getInspectorDescriptions(gameData).map(inspectorDescription => {
      const fullInspectorPath = path.concat(inspectorDescription.key);

      const getSubInspectors = inspectorDescription.getSubInspectors;
      const nestedItems = getSubInspectors
        ? this._renderInspectorList(
            get(gameData, inspectorDescription.key, null),
            getSubInspectors,
            fullInspectorPath
          )
        : undefined;

      return (
        <ListItem
          key={fullInspectorPath.join('.')}
          primaryText={inspectorDescription.label}
          onClick={() =>
            this.props.onChooseInspector(
              inspectorDescription,
              fullInspectorPath
            )}
          nestedItems={nestedItems}
          primaryTogglesNestedList
        />
      );
    });
  }

  render() {
    return (
      <Paper style={styles.container}>
        {this.props.gameData ? (
          <List style={styles.list}>
            {this._renderInspectorList(
              this.props.gameData,
              this.props.getInspectorDescriptions,
              []
            )}
          </List>
        ) : (
          <EmptyMessage>Pause the game to inspect its content</EmptyMessage>
        )}
      </Paper>
    );
  }
}
