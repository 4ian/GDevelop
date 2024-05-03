// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import { ToolbarGroup } from '../UI/Toolbar';
import RaisedButton from '../UI/RaisedButton';
import FlatButton from '../UI/FlatButton';
import ProfilerIcon from '../UI/CustomSvgIcons/Profiler';
import ConsoleIcon from '../UI/CustomSvgIcons/Console';
import PlayIcon from '../UI/CustomSvgIcons/Preview';
import PauseIcon from '../UI/CustomSvgIcons/Pause';
import IconButton from '../UI/IconButton';

type Props = {|
  onPlay: () => void,
  canPlay: boolean,
  onPause: () => void,
  canPause: boolean,
  isProfilerShown: boolean,
  onToggleProfiler: () => void,
  canOpenProfiler: boolean,
  isConsoleShown: boolean,
  onToggleConsole: () => void,
  canOpenConsole: boolean,
|};

export class Toolbar extends React.PureComponent<Props> {
  render() {
    const {
      onPlay,
      onPause,
      canPlay,
      canPause,
      onToggleProfiler,
      canOpenProfiler,
      onToggleConsole,
      canOpenConsole,
      isProfilerShown,
      isConsoleShown,
    } = this.props;

    return (
      <ToolbarGroup lastChild>
        <IconButton
          size="small"
          color="default"
          onClick={onToggleProfiler}
          disabled={!canOpenProfiler}
          selected={isProfilerShown}
          tooltip={t`Open the performance profiler`}
        >
          <ProfilerIcon />
        </IconButton>
        <IconButton
          size="small"
          color="default"
          onClick={onToggleConsole}
          disabled={!canOpenConsole}
          selected={isConsoleShown}
          tooltip={t`Open the console`}
        >
          <ConsoleIcon />
        </IconButton>

        {canPause ? (
          <FlatButton
            primary
            onClick={onPause}
            leftIcon={<PauseIcon />}
            label={<Trans>Pause</Trans>}
          />
        ) : (
          <RaisedButton
            primary
            onClick={onPlay}
            icon={<PlayIcon />}
            label={<Trans>Play</Trans>}
            disabled={!canPlay}
          />
        )}
      </ToolbarGroup>
    );
  }
}

export default Toolbar;
