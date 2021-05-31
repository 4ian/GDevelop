// @flow
import type { Node } from 'React';
import { t } from '@lingui/macro';
import React, { PureComponent } from 'react';
import { ToolbarGroup } from '../UI/Toolbar';
import ToolbarIcon from '../UI/ToolbarIcon';
import ToolbarSeparator from '../UI/ToolbarSeparator';

type Props = {|
  onOpenProjectFolder: () => void,
  onDeleteSelection: () => void,
  canDelete: boolean,
  onOpenProperties: () => void,
|};

type State = {||};

export class Toolbar extends PureComponent<Props, State> {
  render(): Node {
    const { canDelete } = this.props;

    return (
      <ToolbarGroup lastChild>
        <ToolbarIcon
          onClick={this.props.onOpenProjectFolder}
          src="res/ribbon_default/open32.png"
          tooltip={t`Open the project folder`}
        />
        <ToolbarSeparator />
        <ToolbarIcon
          onClick={this.props.onOpenProperties}
          src="res/ribbon_default/editprop32.png"
          tooltip={t`Open the properties panel`}
        />
        <ToolbarSeparator />
        <ToolbarIcon
          onClick={this.props.onDeleteSelection}
          src="res/ribbon_default/deleteselected32.png"
          disabled={!canDelete}
          tooltip={t`Delete the selected resource`}
        />
      </ToolbarGroup>
    );
  }
}

export default Toolbar;
