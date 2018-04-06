// @flow
import React, { PureComponent } from 'react';
import { translate, type TranslatorProps } from 'react-i18next';
import { ToolbarGroup } from 'material-ui/Toolbar';
import ToolbarIcon from '../UI/ToolbarIcon';
import ToolbarSeparator from '../UI/ToolbarSeparator';

type Props = {|
  onPlay: () => void,
  onPause: () => void,
|} & TranslatorProps;

type State = {||};

export class Toolbar extends PureComponent<Props, State> {
  render() {
    const { t, onPlay, onPause } = this.props;

    return (
      <ToolbarGroup lastChild>
        <ToolbarIcon
          onClick={onPlay}
          src="res/ribbon_default/preview32.png"
          tooltip={t('Play the game')}
        />
        <ToolbarSeparator />
        <ToolbarIcon
          onClick={onPause}
          src="res/ribbon_default/pause32.png"
          tooltip={t('Pause the game')}
        />
      </ToolbarGroup>
    );
  }
}

export default translate()(Toolbar);
