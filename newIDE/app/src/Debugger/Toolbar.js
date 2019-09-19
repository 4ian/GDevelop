// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import { ToolbarGroup } from '../UI/Toolbar';
import ToolbarIcon from '../UI/ToolbarIcon';
import ToolbarSeparator from '../UI/ToolbarSeparator';

type Props = {|
  onPlay: () => void,
  canPlay: boolean,
  onPause: () => void,
  canPause: boolean,
  onOpenProfiler: () => void,
|};

export class Toolbar extends React.PureComponent<Props> {
  render() {
    const { onPlay, onPause, canPlay, canPause, onOpenProfiler } = this.props;

    return (
      <ToolbarGroup lastChild>
        <ToolbarIcon
          onClick={onPlay}
          src="res/ribbon_default/preview32.png"
          disabled={!canPlay}
          tooltip={t`Play the game`}
        />
        <ToolbarIcon
          onClick={onPause}
          src="res/ribbon_default/pause32.png"
          disabled={!canPause}
          tooltip={t`Pause the game`}
        />
        <ToolbarSeparator />
        <ToolbarIcon
          onClick={onOpenProfiler}
          src="res/ribbon_default/profiler32.png"
          tooltip={t`Open the performance profiler`}
        />
      </ToolbarGroup>
    );
  }
}

export default Toolbar;
