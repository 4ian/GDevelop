// @flow
import { t } from '@lingui/macro';
import React, { PureComponent } from 'react';
import FolderIcon from '../UI/CustomSvgIcons/Folder';
import TrashIcon from '../UI/CustomSvgIcons/Trash';
import EditIcon from '../UI/CustomSvgIcons/Edit';
import { ToolbarGroup } from '../UI/Toolbar';
import ToolbarSeparator from '../UI/ToolbarSeparator';
import IconButton from '../UI/IconButton';

type Props = {|
  onOpenProjectFolder: () => void,
  canOpenProjectFolder: boolean,
  onDeleteSelection: () => void,
  canDelete: boolean,
  onToggleProperties: () => void,
  isPropertiesShown: boolean,
|};

type State = {||};

export class Toolbar extends PureComponent<Props, State> {
  render() {
    const { canDelete, isPropertiesShown } = this.props;

    return (
      <ToolbarGroup lastChild>
        {this.props.canOpenProjectFolder && (
          <>
            <IconButton
              size="small"
              color="default"
              onClick={this.props.onOpenProjectFolder}
              tooltip={t`Open the project folder`}
            >
              <FolderIcon />
            </IconButton>
            <ToolbarSeparator />
          </>
        )}
        <IconButton
          size="small"
          color="default"
          onClick={this.props.onToggleProperties}
          tooltip={t`Open the properties panel`}
          selected={isPropertiesShown}
        >
          <EditIcon />
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
