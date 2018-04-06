// @flow
import * as React from 'react';
import ReactJsonView from 'react-json-view';
import { type GameData } from './GDJSInspectorDescriptions';

type Props = {|
  gameData: GameData,
|};

const styles = {
  container: {
    flex: 1,
    overflowY: 'scroll',
  },
};

export default ({ gameData }: Props) => (
  <div style={styles.container}>
    <ReactJsonView
      collapsed={1}
      name={false}
      src={gameData}
      onEdit={edit => {
        console.log(edit);
        return false;
      }}
      groupArraysAfterLength={50}
      theme="monokai"
    />
  </div>
);
