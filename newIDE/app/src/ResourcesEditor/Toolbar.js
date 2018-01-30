// @flow
import React, { PureComponent } from 'react';
import { translate, type TranslatorProps } from 'react-i18next';
import { ToolbarGroup } from 'material-ui/Toolbar';
import ToolbarIcon from '../UI/ToolbarIcon';
import ToolbarSeparator from '../UI/ToolbarSeparator';

type Props = {|
  onDeleteSelection: () => void,
  canDelete: boolean,
  onOpenProperties: () => void,
|} & TranslatorProps;

type State = {||};

export class Toolbar extends PureComponent<Props, State> {
  render() {
    const { t, canDelete } = this.props;

    return (
      <ToolbarGroup lastChild>
        <ToolbarIcon
          onClick={this.props.onOpenProperties}
          src="res/ribbon_default/editprop32.png"
          tooltip={t('Open the properties panel')}
        />
        <ToolbarSeparator />
        <ToolbarIcon
          onClick={this.props.onDeleteSelection}
          src="res/ribbon_default/deleteselected32.png"
          disabled={!canDelete}
          tooltip={t('Delete the selected resource')}
        />
      </ToolbarGroup>
    );
  }
}

export default translate()(Toolbar);
