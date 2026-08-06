// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { ToolbarGroup } from '../UI/Toolbar';
import RaisedButtonWithSplitMenu from '../UI/RaisedButtonWithSplitMenu';
import FlatButton from '../UI/FlatButton';
import IconButton from '../UI/IconButton';
import PlayIcon from '../UI/CustomSvgIcons/Preview';
import StopIcon from '../UI/CustomSvgIcons/Stop';
import PropertiesPanelIcon from '../UI/CustomSvgIcons/Edit';

export type GameplayTestRunSpeedOptions = {|
  // Game seconds simulated per real second (1 = normal speed, 4 = 4x...).
  // null: run as fast as possible.
  speedFactor: number | null,
|};

type Props = {|
  onRunTest: (options: GameplayTestRunSpeedOptions) => void | Promise<void>,
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
          <PropertiesPanelIcon />
        </IconButton>
        {isRunning ? (
          <FlatButton
            primary
            onClick={onStopTest}
            leftIcon={<StopIcon />}
            label={<Trans>Stop the test</Trans>}
          />
        ) : (
          <RaisedButtonWithSplitMenu
            primary
            onClick={() => onRunTest({ speedFactor: null })}
            icon={<PlayIcon />}
            label={<Trans>Run the test</Trans>}
            disabled={!canRun}
            buildMenuTemplate={(i18n: I18nType) => [
              {
                label: i18n._(t`Run as quickly as possible`),
                click: () => onRunTest({ speedFactor: null }),
              },
              {
                label: i18n._(t`Run at 4x speed`),
                click: () => onRunTest({ speedFactor: 4 }),
              },
              {
                label: i18n._(t`Run at normal speed`),
                click: () => onRunTest({ speedFactor: 1 }),
              },
            ]}
          />
        )}
      </ToolbarGroup>
    );
  }
}

export default Toolbar;
