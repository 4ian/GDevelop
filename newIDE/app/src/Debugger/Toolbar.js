// @flow
import * as React from 'react';
import { translate, type TranslatorProps } from 'react-i18next';
import { ToolbarGroup } from 'material-ui/Toolbar';
import ToolbarIcon from '../UI/ToolbarIcon';
import ToolbarSeparator from '../UI/ToolbarSeparator';

type Props = {|
  onPlay: () => void,
  canPlay: boolean,
  onPause: () => void,
  canPause: boolean,
  onOpenProfiler: () => void,
|};

export class Toolbar extends React.PureComponent<Props & TranslatorProps> {
  render() {
    const {
      t,
      onPlay,
      onPause,
      canPlay,
      canPause,
      onOpenProfiler,
    } = this.props;

    return (
      <ToolbarGroup lastChild>
        <ToolbarIcon
          onClick={onPlay}
          src="res/ribbon_default/preview32.png"
          disabled={!canPlay}
          tooltip={t('Play the game')}
        />
        <ToolbarIcon
          onClick={onPause}
          src="res/ribbon_default/pause32.png"
          disabled={!canPause}
          tooltip={t('Pause the game')}
        />
        <ToolbarSeparator />
        <ToolbarIcon
          onClick={onOpenProfiler}
          src="res/ribbon_default/profiler32.png"
          tooltip={t('Open the performance profiler')}
        />
      </ToolbarGroup>
    );
  }
}

export default translate()(Toolbar);
