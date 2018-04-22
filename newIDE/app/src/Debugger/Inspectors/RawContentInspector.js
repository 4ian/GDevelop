// @flow
import * as React from 'react';
import ReactJsonView from 'react-json-view';
import { type GameData } from '../GDJSInspectorDescriptions';

type Props = {|
  gameData: GameData,
  onEdit: (path: Array<string>, newValue: any) => boolean,
|};

const styles = {
  container: {
    flex: 1,
    overflowY: 'scroll',
  },
};

export default ({ gameData, onEdit }: Props) => (
  <div style={styles.container}>
    <ReactJsonView
      collapsed={1}
      name={false}
      src={gameData}
      onEdit={edit => {
        console.log(edit);
        return onEdit(edit.namespace.concat(edit.name), edit.new_value);
      }}
      groupArraysAfterLength={50}
      theme="monokai"
    />
  </div>
);
