// @flow
import * as React from 'react';
import { ToolbarGroup } from 'material-ui/Toolbar';
import ToolbarIcon from '../UI/ToolbarIcon';
import ToolbarSeparator from '../UI/ToolbarSeparator';
import { I18n } from '@lingui/react';
import { t } from '@lingui/macro';

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
      <I18n>
        {({ i18n }) => (
          <ToolbarGroup lastChild>
            <ToolbarIcon
              onClick={onPlay}
              src="res/ribbon_default/preview32.png"
              disabled={!canPlay}
              tooltip={i18n._(t`Play the game`)}
            />
            <ToolbarIcon
              onClick={onPause}
              src="res/ribbon_default/pause32.png"
              disabled={!canPause}
              tooltip={i18n._(t`Pause the game`)}
            />
            <ToolbarSeparator />
            <ToolbarIcon
              onClick={onOpenProfiler}
              src="res/ribbon_default/profiler32.png"
              tooltip={i18n._(t`Open the performance profiler`)}
            />
          </ToolbarGroup>
        )}
      </I18n>
    );
  }
}

export default Toolbar;
