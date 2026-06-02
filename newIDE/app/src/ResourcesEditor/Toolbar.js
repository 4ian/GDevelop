// @flow
import { t } from '@lingui/macro';
import React, { PureComponent } from 'react';
import EditIcon from '../UI/CustomSvgIcons/Edit';
import { ToolbarGroup } from '../UI/Toolbar';
import IconButton from '../UI/IconButton';

type Props = {|
  onToggleProperties: () => void,
  isPropertiesShown: boolean,
|};

type State = {||};

export class Toolbar extends PureComponent<Props, State> {
  render(): any {
    const { isPropertiesShown } = this.props;

    return (
      <ToolbarGroup lastChild>
        <IconButton
          size="small"
          color="default"
          onClick={this.props.onToggleProperties}
          tooltip={t`Open the tools panel`}
          selected={isPropertiesShown}
        >
          <EditIcon />
        </IconButton>
      </ToolbarGroup>
    );
  }
}

export default Toolbar;
