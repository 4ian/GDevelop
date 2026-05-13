// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import { type EventsFunctionCreationParameters } from '../EventsFunctionsList/EventsFunctionTreeViewItemContent';
import FlatButton from '../UI/FlatButton';
import Subheader from '../UI/Subheader';
import { List, ListItem } from '../UI/List';
import Dialog from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import { Line } from '../UI/Grid';
import Visibility from '../UI/CustomSvgIcons/Visibility';
import VisibilityOff from '../UI/CustomSvgIcons/VisibilityOff';
import ListIcon from '../UI/ListIcon';
import { getFunctionIconUrl } from '../EventsFunctionsList/EventsFunctionTreeViewItemContent';

const gd: libGDevelop = global.gd;

type Props = {|
  eventsFunctionsContainer: gdEventsFunctionsContainer,
  onCancel: () => void,
  onChoose: (parameters: EventsFunctionCreationParameters) => void,
|};

const styles = {
  icon: { width: 40, height: 40 },
  disabledItem: { opacity: 0.6 },
};

export const FunctionListItem = ({
  functionType,
  functionName,
  disabled,
  onChoose,
  name,
  description,
}: {|
  functionType: EventsFunction_FunctionType,
  functionName: string | null,
  disabled?: boolean,
  onChoose: EventsFunctionCreationParameters => void,
  name?: React.Node,
  description: React.Node,
|}): React.Node => {
  return (
    // $FlowFixMe[incompatible-type]
    <ListItem
      leftIcon={
        <ListIcon
          src={getFunctionIconUrl(functionType, functionName)}
          iconSize={32}
          padding={4}
          useExactIconSize
        />
      }
      primaryText={name || functionName}
      secondaryText={description}
      secondaryTextLines={2}
      onClick={() =>
        onChoose({
          functionType: functionType,
          name: functionName,
        })
      }
      style={disabled ? styles.disabledItem : undefined}
      disabled={disabled}
    />
  );
};

export default function ExtensionFunctionSelectorDialog({
  eventsFunctionsContainer,
  onChoose,
  onCancel,
}: Props): React.Node {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  return (
    <Dialog
      title={<Trans>Choose a new extension function</Trans>}
      actions={[
        <FlatButton
          label={<Trans>Cancel</Trans>}
          keyboardFocused={true}
          onClick={onCancel}
          key={'close'}
        />,
      ]}
      secondaryActions={[
        <HelpButton key="help" helpPagePath="/events/functions" />,
      ]}
      open
      onRequestClose={onCancel}
      maxWidth="sm"
    >
      <List>
        <FunctionListItem
          functionType={gd.EventsFunction.Action}
          functionName={null}
          name={<Trans>Action</Trans>}
          description={
            <Trans>
              An action that can be used in other events sheet. You can define
              the action parameters: objects, texts, numbers, layers, etc...
            </Trans>
          }
          onChoose={onChoose}
        />
        <FunctionListItem
          functionType={gd.EventsFunction.Condition}
          functionName={null}
          name={<Trans>Condition</Trans>}
          description={
            <Trans>
              A condition that can be used in other events sheet. You can define
              the condition parameters: objects, texts, numbers, layers, etc...
            </Trans>
          }
          onChoose={onChoose}
        />
        <FunctionListItem
          functionType={gd.EventsFunction.Expression}
          functionName={null}
          name={<Trans>Expression</Trans>}
          description={
            <Trans>
              An expression that can be used in formulas. Can either return a
              number or a string, and take some parameters.
            </Trans>
          }
          onChoose={onChoose}
        />
        {showAdvanced && (
          <React.Fragment>
            <Subheader>
              <Trans>Lifecycle functions (advanced)</Trans>
            </Subheader>
            <FunctionListItem
              functionType={gd.EventsFunction.Action}
              functionName="onFirstSceneLoaded"
              disabled={eventsFunctionsContainer.hasEventsFunctionNamed(
                'onFirstSceneLoaded'
              )}
              description={
                <Trans>
                  Events that will be run once when the first scene of the game
                  is loaded, before any other events.
                </Trans>
              }
              onChoose={onChoose}
            />
            <FunctionListItem
              functionType={gd.EventsFunction.Action}
              functionName="onSceneLoaded"
              disabled={eventsFunctionsContainer.hasEventsFunctionNamed(
                'onSceneLoaded'
              )}
              description={
                <Trans>
                  Events that will be run once when a scene of the game is
                  loaded, before the scene events.
                </Trans>
              }
              onChoose={onChoose}
            />
            <FunctionListItem
              functionType={gd.EventsFunction.Action}
              functionName="onScenePreEvents"
              disabled={eventsFunctionsContainer.hasEventsFunctionNamed(
                'onScenePreEvents'
              )}
              description={
                <Trans>
                  Events that will be run at every frame (roughly 60 times per
                  second), before the events from the events sheet of the scene.
                </Trans>
              }
              onChoose={onChoose}
            />
            <FunctionListItem
              functionType={gd.EventsFunction.Action}
              functionName="onScenePostEvents"
              disabled={eventsFunctionsContainer.hasEventsFunctionNamed(
                'onScenePostEvents'
              )}
              description={
                <Trans>
                  Events that will be run at every frame (roughly 60 times per
                  second), after the events from the events sheet of the scene.
                </Trans>
              }
              onChoose={onChoose}
            />
            <FunctionListItem
              functionType={gd.EventsFunction.Action}
              functionName="onScenePaused"
              disabled={eventsFunctionsContainer.hasEventsFunctionNamed(
                'onScenePaused'
              )}
              description={
                <Trans>
                  Events that will be run once when a scene is paused (another
                  scene is run on top of it).
                </Trans>
              }
              onChoose={onChoose}
            />
            <FunctionListItem
              functionType={gd.EventsFunction.Action}
              functionName="onSceneResumed"
              disabled={eventsFunctionsContainer.hasEventsFunctionNamed(
                'onSceneResumed'
              )}
              description={
                <Trans>
                  Events that will be run once when a scene is resumed (after it
                  was previously paused).
                </Trans>
              }
              onChoose={onChoose}
            />
            <FunctionListItem
              functionType={gd.EventsFunction.Action}
              functionName="onSceneUnloading"
              disabled={eventsFunctionsContainer.hasEventsFunctionNamed(
                'onSceneUnloading'
              )}
              description={
                <Trans>
                  Events that will be run once when a scene is about to be
                  unloaded from memory. The previous scene that was paused will
                  be resumed after this.
                </Trans>
              }
              onChoose={onChoose}
            />
          </React.Fragment>
        )}
      </List>
      <Line justifyContent="center" alignItems="center">
        {!showAdvanced ? (
          <FlatButton
            leftIcon={<Visibility />}
            primary={false}
            onClick={() => setShowAdvanced(true)}
            label={<Trans>Show lifecycle functions (advanced)</Trans>}
          />
        ) : (
          <FlatButton
            leftIcon={<VisibilityOff />}
            primary={false}
            onClick={() => setShowAdvanced(false)}
            label={<Trans>Hide lifecycle functions (advanced)</Trans>}
          />
        )}
      </Line>
    </Dialog>
  );
}
