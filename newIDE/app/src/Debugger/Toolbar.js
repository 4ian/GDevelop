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
  canOpenProfiler: boolean,
  onOpenConsole: () => void,
  canOpenConsole: boolean,
|};

export class Toolbar extends React.PureComponent<Props> {
  render() {
    const {
      onPlay,
      onPause,
      canPlay,
      canPause,
      onOpenProfiler,
      canOpenProfiler,
      onOpenConsole,
      canOpenConsole,
    } = this.props;

    return (
      <ToolbarGroup lastChild>
        <ToolbarIcon
          onClick={onPlay}
          src="res/ribbon_default/preview64.png"
          disabled={!canPlay}
          tooltip={t`Play the game`}
        />
        <ToolbarIcon
          onClick={onPause}
          src="res/ribbon_default/pause64.png"
          disabled={!canPause}
          tooltip={t`Pause the game`}
        />
        <ToolbarSeparator />
        <ToolbarIcon
          onClick={onOpenProfiler}
          src="res/ribbon_default/profiler32.png"
          disabled={!canOpenProfiler}
          tooltip={t`Open the performance profiler`}
        />
        <ToolbarIcon
          onClick={onOpenConsole}
          src="res/ribbon_default/source_cpp32.png"
          disabled={!canOpenConsole}
          tooltip={t`Open the console`}
        />
      </ToolbarGroup>
    );
  }
}

export default Toolbar;
