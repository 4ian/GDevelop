// @flow
import { t } from '@lingui/macro';
import React, { PureComponent } from 'react';
import FolderIcon from '../UI/CustomSvgIcons/Folder';
import TrashIcon from '../UI/CustomSvgIcons/Trash';
import PropertiesPanelIcon from '../UI/CustomSvgIcons/PropertiesPanel';
import { ToolbarGroup } from '../UI/Toolbar';
import ToolbarSeparator from '../UI/ToolbarSeparator';
import IconButton from '../UI/IconButton';

type Props = {|
  onOpenProjectFolder: () => void,
  onDeleteSelection: () => void,
  canDelete: boolean,
  onOpenProperties: () => void,
|};

type State = {||};

export class Toolbar extends PureComponent<Props, State> {
  render() {
    const { canDelete } = this.props;

    return (
      <ToolbarGroup lastChild>
        <IconButton
          size="small"
          color="default"
          onClick={this.props.onOpenProjectFolder}
          tooltip={t`Open the project folder`}
        >
          <FolderIcon />
        </IconButton>
        <ToolbarSeparator />
        <IconButton
          size="small"
          color="default"
          onClick={this.props.onOpenProperties}
          tooltip={t`Open the properties panel`}
        >
          <PropertiesPanelIcon />
        </IconButton>
        <IconButton
          size="small"
          color="default"
          onClick={this.props.onDeleteSelection}
          disabled={!canDelete}
          tooltip={t`Delete the selected resource`}
        >
          <TrashIcon />
        </IconButton>
      </ToolbarGroup>
    );
  }
}

export default Toolbar;
