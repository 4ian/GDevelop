// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { ToolbarGroup } from '../UI/Toolbar';
import RaisedButton from '../UI/RaisedButton';
import FlatButton from '../UI/FlatButton';
import PlayIcon from '../UI/CustomSvgIcons/Preview';

type Props = {|
  onRunTest: () => void | Promise<void>,
  onStopTest: () => void,
  isRunning: boolean,
  canRun: boolean,
|};

export class Toolbar extends React.PureComponent<Props> {
  render(): any {
    const { onRunTest, onStopTest, isRunning, canRun } = this.props;

    return (
      <ToolbarGroup lastChild>
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
