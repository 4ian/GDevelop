// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import InspectorTreeView from './InspectorTreeView';
import { type GameData } from '../GDJSInspectorDescriptions';
import EmptyMessage from '../../UI/EmptyMessage';

type Props = {|
  gameData: GameData,
  onEdit: (path: Array<string>, newValue: any) => boolean,
|};

/**
 * A very simple inspector that display the raw information given by the gameData
 * object. Every number, text and boolean can be changed in the running game.
 */
const RawContentInspector = ({ gameData, onEdit }: Props): React.Node => (
  <React.Fragment>
    <EmptyMessage>
      <Trans>
        You are in raw mode: everything the game sent about this element is
        shown as is.
      </Trans>
    </EmptyMessage>
    <InspectorTreeView src={gameData} onEditSrc={onEdit} />
  </React.Fragment>
);

export default RawContentInspector;
