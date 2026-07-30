// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import { ToolbarGroup } from '../UI/Toolbar';
import RaisedButton from '../UI/RaisedButton';
import FlatButton from '../UI/FlatButton';
import IconButton from '../UI/IconButton';
import PlayIcon from '../UI/CustomSvgIcons/Preview';
import EditIcon from '../UI/CustomSvgIcons/Edit';

type Props = {|
  onRunTest: () => void | Promise<void>,
  onStopTest: () => void,
  isRunning: boolean,
  canRun: boolean,
  onToggleProperties: () => void,
  isPropertiesShown: boolean,
|};

export class Toolbar extends React.PureComponent<Props> {
  render(): any {
    const {
      onRunTest,
      onStopTest,
      isRunning,
      canRun,
      onToggleProperties,
      isPropertiesShown,
    } = this.props;

    return (
      <ToolbarGroup lastChild>
        <IconButton
          size="small"
          color="default"
          onClick={onToggleProperties}
          selected={isPropertiesShown}
          tooltip={
            isPropertiesShown
              ? t`Close Properties Panel`
              : t`Open Properties Panel`
          }
        >
          <EditIcon />
        </IconButton>
        {isRunning ? (
          <FlatButton
            primary
            onClick={onStopTest}
            label={<Trans>Stop the test</Trans>}
          />
        ) : (
          <RaisedButton
            primary
            onClick={onRunTest}
            icon={<PlayIcon />}
            label={<Trans>Run the test</Trans>}
            disabled={!canRun}
          />
        )}
      </ToolbarGroup>
    );
  }
}

export default Toolbar;
