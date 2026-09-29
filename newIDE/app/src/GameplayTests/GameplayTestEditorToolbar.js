// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import { ToolbarGroup } from '../UI/Toolbar';
import { Spacer } from '../UI/Grid';
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

/**
 * The run speed choices shared by every "Run the test" split button.
 */
export const buildRunTestSpeedMenuTemplate = (
  i18n: I18nType,
  onRunTest: (options: GameplayTestRunSpeedOptions) => void | Promise<void>
): Array<MenuItemTemplate> => [
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
];

type Props = {|
  onRunTest: (options: GameplayTestRunSpeedOptions) => void | Promise<void>,
  onStopTest: () => void,
  isRunning: boolean,
  canRun: boolean,
  onToggleProperties: () => void,
  isPropertiesShown: boolean,
|};

export const Toolbar = ({
  onRunTest,
  onStopTest,
  isRunning,
  canRun,
  onToggleProperties,
  isPropertiesShown,
}: Props): React.Node => {
  return (
    <>
      {/* Centered in the toolbar, like the preview button of the other editors. */}
      <ToolbarGroup>
        <Spacer />
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
            buildMenuTemplate={(i18n: I18nType) =>
              buildRunTestSpeedMenuTemplate(i18n, onRunTest)
            }
          />
        )}
        <Spacer />
      </ToolbarGroup>
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
      </ToolbarGroup>
    </>
  );
};

export default Toolbar;
