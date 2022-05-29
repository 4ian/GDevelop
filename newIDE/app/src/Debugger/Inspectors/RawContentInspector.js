// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import ReactJsonView from 'react-json-view';
import { type GameData } from '../GDJSInspectorDescriptions';
import EmptyMessage from '../../UI/EmptyMessage';

type Props = {|
  gameData: GameData,
  onEdit: (path: Array<string>, newValue: any) => boolean,
|};

/**
 * A very simple inspector that display the raw information given by the gameData
 * object.
 */
const RawContentInspector = ({ gameData, onEdit }: Props) => (
  <React.Fragment>
    <EmptyMessage>
      <Trans>
        You are in raw mode. You can edit the fields, but be aware that this can
        lead to unexpected results or even crash the debugged game!
      </Trans>
    </EmptyMessage>
    <ReactJsonView
      collapsed={1}
      name={false}
      src={gameData}
      onEdit={edit => {
        return onEdit(edit.namespace.concat(edit.name), edit.new_value);
      }}
      groupArraysAfterLength={50}
      theme="monokai"
    />
  </React.Fragment>
);

export default RawContentInspector;
