// @flow
import * as React from 'react';
import { List, ListItem } from 'material-ui/List';
import get from 'lodash/get';
import {
  type InspectorDescription,
  type InspectorDescriptionsGetter,
  type GameData,
} from './GDJSInspectorDescriptions';

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

/**
 * Generate a visual list of inspectors, using gameData and getInspectorDescriptions
 */
export default class InspectorsList extends React.Component<Props, void> {
  _renderInspectorList(
    gameData: GameData,
    getInspectorDescriptions: InspectorDescriptionsGetter,
    path: Array<string>
  ): Array<React.Node> {
    return getInspectorDescriptions(gameData).map(inspectorDescription => {
      if (!inspectorDescription) return null;
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
          initiallyOpen={!!inspectorDescription.initiallyOpen}
          onClick={() =>
            this.props.onChooseInspector(
              inspectorDescription,
              fullInspectorPath
            )
          }
          nestedItems={nestedItems}
          primaryTogglesNestedList
        />
      );
    });
  }

  render() {
    return this.props.gameData ? (
      <List style={styles.list}>
        {this._renderInspectorList(
          this.props.gameData,
          this.props.getInspectorDescriptions,
          []
        )}
      </List>
    ) : null;
  }
}
