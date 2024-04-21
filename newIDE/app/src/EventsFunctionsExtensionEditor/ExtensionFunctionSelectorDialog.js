// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import { type EventsFunctionCreationParameters } from '../EventsFunctionsList/EventsFunctionTreeViewItemContent';
import FlatButton from '../UI/FlatButton';
import Subheader from '../UI/Subheader';
import { List, ListItem } from '../UI/List';
import Dialog from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import Create from '../UI/CustomSvgIcons/Behaviors/Create';
import Step from '../UI/CustomSvgIcons/Behaviors/Step';
import Destroy from '../UI/CustomSvgIcons/Behaviors/Destroy';
import Action from '../UI/CustomSvgIcons/Behaviors/Action';
import Condition from '../UI/CustomSvgIcons/Behaviors/Condition';
import Expression from '../UI/CustomSvgIcons/Behaviors/Expression';
import Activate from '../UI/CustomSvgIcons/Behaviors/Activate';
import Deactivate from '../UI/CustomSvgIcons/Behaviors/Deactivate';
import { Line } from '../UI/Grid';
import Visibility from '../UI/CustomSvgIcons/Visibility';
import VisibilityOff from '../UI/CustomSvgIcons/VisibilityOff';
const gd: libGDevelop = global.gd;

type Props = {|
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  onCancel: () => void,
  onChoose: (parameters: EventsFunctionCreationParameters) => void,
|};

const styles = {
  icon: { width: 40, height: 40 },
  disabledItem: { opacity: 0.6 },
};

const FunctionListItem = ({
  icon,
  disabled,
  onChoose,
  name,
  description,
}: {|
  icon: React.Node,
  disabled?: boolean,
  onChoose: () => void,
  name: React.Node,
  description: React.Node,
|}) => {
  return (
    <ListItem
      leftIcon={icon}
      primaryText={name}
      secondaryText={description}
      secondaryTextLines={2}
      onClick={onChoose}
      style={disabled ? styles.disabledItem : undefined}
      disabled={disabled}
    />
  );
};

export default function BehaviorMethodSelectorDialog({
  eventsFunctionsExtension,
  onChoose,
  onCancel,
}: Props) {
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
    >
      <List>
        <FunctionListItem
          icon={<Action style={styles.icon} />}
          name={<Trans>Action</Trans>}
          onChoose={() =>
            onChoose({
              functionType: gd.EventsFunction.Action,
              name: null,
            })
          }
          description={
            <Trans>
              An action that can be used in other events sheet. You can define
              the action parameters: objects, texts, numbers, layers, etc...
            </Trans>
          }
        />
        <FunctionListItem
          icon={<Condition style={styles.icon} />}
          name={<Trans>Condition</Trans>}
          onChoose={() =>
            onChoose({
              functionType: gd.EventsFunction.Condition,
              name: null,
            })
          }
          description={
            <Trans>
              A condition that can be used in other events sheet. You can define
              the condition parameters: objects, texts, numbers, layers, etc...
            </Trans>
          }
        />
        <FunctionListItem
          icon={<Expression style={styles.icon} />}
          name={<Trans>Expression</Trans>}
          onChoose={() =>
            onChoose({
              functionType: gd.EventsFunction.Expression,
              name: null,
            })
          }
          description={
            <Trans>
              An expression that can be used in formulas. Can either return a
              number or a string, and take some parameters.
            </Trans>
          }
        />
        {showAdvanced && (
          <React.Fragment>
            <Subheader>
              <Trans>Lifecycle functions (advanced)</Trans>
            </Subheader>
            <FunctionListItem
              icon={<Create style={styles.icon} />}
              name={'onFirstSceneLoaded'}
              disabled={eventsFunctionsExtension.hasEventsFunctionNamed(
                'onFirstSceneLoaded'
              )}
              onChoose={() =>
                onChoose({
                  functionType: gd.EventsFunction.Action,
                  name: 'onFirstSceneLoaded',
                })
              }
              description={
                <Trans>
                  Events that will be run once when the first scene of the game
                  is loaded, before any other events.
                </Trans>
              }
            />
            <FunctionListItem
              icon={<Create style={styles.icon} />}
              name={'onSceneLoaded'}
              disabled={eventsFunctionsExtension.hasEventsFunctionNamed(
                'onSceneLoaded'
              )}
              onChoose={() =>
                onChoose({
                  functionType: gd.EventsFunction.Action,
                  name: 'onSceneLoaded',
                })
              }
              description={
                <Trans>
                  Events that will be run once when a scene of the game is
                  loaded, before the scene events.
                </Trans>
              }
            />
            <FunctionListItem
              icon={<Step style={styles.icon} />}
              name={'onScenePreEvents'}
              disabled={eventsFunctionsExtension.hasEventsFunctionNamed(
                'onScenePreEvents'
              )}
              onChoose={() =>
                onChoose({
                  functionType: gd.EventsFunction.Action,
                  name: 'onScenePreEvents',
                })
              }
              description={
                <Trans>
                  Events that will be run at every frame (roughly 60 times per
                  second), before the events from the events sheet of the scene.
                </Trans>
              }
            />
            <FunctionListItem
              icon={<Step style={styles.icon} />}
              name={'onScenePostEvents'}
              disabled={eventsFunctionsExtension.hasEventsFunctionNamed(
                'onScenePostEvents'
              )}
              onChoose={() =>
                onChoose({
                  functionType: gd.EventsFunction.Action,
                  name: 'onScenePostEvents',
                })
              }
              description={
                <Trans>
                  Events that will be run at every frame (roughly 60 times per
                  second), after the events from the events sheet of the scene.
                </Trans>
              }
            />
            <FunctionListItem
              icon={<Deactivate style={styles.icon} />}
              name={'onScenePaused'}
              disabled={eventsFunctionsExtension.hasEventsFunctionNamed(
                'onScenePaused'
              )}
              onChoose={() =>
                onChoose({
                  functionType: gd.EventsFunction.Action,
                  name: 'onScenePaused',
                })
              }
              description={
                <Trans>
                  Events that will be run once when a scene is paused (another
                  scene is run on top of it).
                </Trans>
              }
            />
            <FunctionListItem
              icon={<Activate style={styles.icon} />}
              name={'onSceneResumed'}
              disabled={eventsFunctionsExtension.hasEventsFunctionNamed(
                'onSceneResumed'
              )}
              onChoose={() =>
                onChoose({
                  functionType: gd.EventsFunction.Action,
                  name: 'onSceneResumed',
                })
              }
              description={
                <Trans>
                  Events that will be run once when a scene is resumed (after it
                  was previously paused).
                </Trans>
              }
            />
            <FunctionListItem
              icon={<Destroy style={styles.icon} />}
              name={'onSceneUnloading'}
              disabled={eventsFunctionsExtension.hasEventsFunctionNamed(
                'onSceneUnloading'
              )}
              onChoose={() =>
                onChoose({
                  functionType: gd.EventsFunction.Action,
                  name: 'onSceneUnloading',
                })
              }
              description={
                <Trans>
                  Events that will be run once when a scene is about to be
                  unloaded from memory. The previous scene that was paused will
                  be resumed after this.
                </Trans>
              }
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
