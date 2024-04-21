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
  eventsBasedBehavior: gdEventsBasedBehavior,
  onCancel: () => void,
  onChoose: (parameters: EventsFunctionCreationParameters) => void,
|};

const styles = {
  icon: { width: 40, height: 40 },
  disabledItem: { opacity: 0.6 },
};

const MethodListItem = ({
  icon,
  disabled,
  onChoose,
  name,
  description,
}: {|
  icon: React.Node,
  disabled: boolean,
  onChoose: EventsFunctionCreationParameters => void,
  name: string,
  description: React.Node,
|}) => {
  return (
    <ListItem
      leftIcon={icon}
      primaryText={name}
      secondaryText={description}
      secondaryTextLines={2}
      onClick={() =>
        onChoose({
          functionType: gd.EventsFunction.Action,
          name,
        })
      }
      style={disabled ? styles.disabledItem : undefined}
      disabled={disabled}
    />
  );
};

export default function BehaviorMethodSelectorDialog({
  eventsBasedBehavior,
  onChoose,
  onCancel,
}: Props) {
  const eventsFunctions = eventsBasedBehavior.getEventsFunctions();
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  return (
    <Dialog
      title={<Trans>Choose a new behavior function ("method")</Trans>}
      secondaryActions={[
        <HelpButton
          key="help"
          helpPagePath="/behaviors/events-based-behaviors"
        />,
      ]}
      actions={[
        <FlatButton
          label={<Trans>Cancel</Trans>}
          keyboardFocused={true}
          onClick={onCancel}
          key={'close'}
        />,
      ]}
      open
      onRequestClose={onCancel}
    >
      <List>
        <ListItem
          leftIcon={<Action style={styles.icon} />}
          primaryText={<Trans>Action</Trans>}
          secondaryText={
            <Trans>
              An action that can be used on objects with the behavior. You can
              define the action parameters: objects, texts, numbers, layers,
              etc...
            </Trans>
          }
          onClick={() =>
            onChoose({
              functionType: gd.EventsFunction.Action,
              name: null,
            })
          }
        />
        <ListItem
          leftIcon={<Condition style={styles.icon} />}
          primaryText={<Trans>Condition</Trans>}
          secondaryText={
            <Trans>
              A condition that can be used on objects with the behavior. You can
              define the condition parameters: objects, texts, numbers, layers,
              etc...
            </Trans>
          }
          onClick={() =>
            onChoose({
              functionType: gd.EventsFunction.Condition,
              name: null,
            })
          }
        />
        <ListItem
          leftIcon={<Expression style={styles.icon} />}
          primaryText={<Trans>Expression</Trans>}
          secondaryText={
            <Trans>
              An expression that can be used on objects with the behavior. Can
              either return a number or a string, and take some parameters.
            </Trans>
          }
          onClick={() =>
            onChoose({
              functionType: gd.EventsFunction.Expression,
              name: null,
            })
          }
        />
        <Subheader>
          <Trans>Lifecycle methods</Trans>
        </Subheader>
        <MethodListItem
          icon={<Create style={styles.icon} />}
          name={'onCreated'}
          disabled={eventsFunctions.hasEventsFunctionNamed('onCreated')}
          onChoose={onChoose}
          description={
            <Trans>
              Events that will be run once, when an object is created with this
              behavior being attached to it.
            </Trans>
          }
        />
        <MethodListItem
          icon={<Step style={styles.icon} />}
          name={'doStepPreEvents'}
          disabled={eventsFunctions.hasEventsFunctionNamed('doStepPreEvents')}
          onChoose={onChoose}
          description={
            <Trans>
              Events that will be run at every frame (roughly 60 times per
              second), for every object that has the behavior attached, before
              the events from the events sheet are launched.
            </Trans>
          }
        />
        <MethodListItem
          icon={<Destroy style={styles.icon} />}
          name={'onDestroy'}
          disabled={
            eventsFunctions.hasEventsFunctionNamed('onOwnerRemovedFromScene') ||
            eventsFunctions.hasEventsFunctionNamed('onDestroy')
          }
          onChoose={onChoose}
          description={
            <Trans>
              Events that will be run once, after the object is removed from the
              scene and before it is entirely removed from memory.
            </Trans>
          }
        />
        {showAdvanced && (
          <>
            <Subheader>
              <Trans>Other lifecycle methods</Trans>
            </Subheader>
            <MethodListItem
              icon={<Deactivate style={styles.icon} />}
              name={'onDeActivate'}
              disabled={eventsFunctions.hasEventsFunctionNamed('onDeActivate')}
              onChoose={onChoose}
              description={
                <Trans>
                  Events that will be run once when the behavior is deactivated
                  on an object (step events won't be run until the behavior is
                  activated again).
                </Trans>
              }
            />
            <MethodListItem
              icon={<Activate style={styles.icon} />}
              name={'onActivate'}
              disabled={eventsFunctions.hasEventsFunctionNamed('onActivate')}
              onChoose={onChoose}
              description={
                <Trans>
                  Events that will be run once when the behavior is re-activated
                  on an object (after it was previously deactivated).
                </Trans>
              }
            />
            <MethodListItem
              icon={<Step style={styles.icon} />}
              name={'doStepPostEvents'}
              disabled={eventsFunctions.hasEventsFunctionNamed(
                'doStepPostEvents'
              )}
              onChoose={onChoose}
              description={
                <Trans>
                  Events that will be run at every frame (roughly 60 times per
                  second), for every object that has the behavior attached,
                  after the events from the events sheet.
                </Trans>
              }
            />
          </>
        )}
      </List>
      <Line justifyContent="center" alignItems="center">
        {!showAdvanced ? (
          <FlatButton
            leftIcon={<Visibility />}
            primary={false}
            onClick={() => setShowAdvanced(true)}
            label={<Trans>Show other lifecycle functions (advanced)</Trans>}
          />
        ) : (
          <FlatButton
            leftIcon={<VisibilityOff />}
            primary={false}
            onClick={() => setShowAdvanced(false)}
            label={<Trans>Hide other lifecycle functions (advanced)</Trans>}
          />
        )}
      </Line>
    </Dialog>
  );
}
