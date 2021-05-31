// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import { type EventsFunctionCreationParameters } from '../EventsFunctionsList';
import FlatButton from '../UI/FlatButton';
import Subheader from '../UI/Subheader';
import { List, ListItem } from '../UI/List';
import Dialog from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import Create from '../UI/CustomSvgIcons/Behaviors/Create';
import Step from '../UI/CustomSvgIcons/Behaviors/Step';
import Destroy from '../UI/CustomSvgIcons/Behaviors/Destroy';
import Function from '../UI/CustomSvgIcons/Behaviors/Function';
import Activate from '../UI/CustomSvgIcons/Behaviors/Activate';
import Deactivate from '../UI/CustomSvgIcons/Behaviors/Deactivate';
const gd: libGDevelop = global.gd;

type Props = {|
  eventsBasedBehavior: gdEventsBasedBehavior,
  onCancel: () => void,
  onChoose: (parameters: EventsFunctionCreationParameters) => void,
|};
type State = {||};

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

export default class BehaviorMethodSelectorDialog extends React.Component<
  Props,
  State
> {
  render(): React.Node {
    const actions = [
      <FlatButton
        label={<Trans>Cancel</Trans>}
        keyboardFocused={true}
        onClick={() => this.props.onCancel()}
        key={'close'}
      />,
    ];

    const { eventsBasedBehavior, onChoose } = this.props;
    const eventsFunctions = eventsBasedBehavior.getEventsFunctions();

    return (
      <Dialog
        secondaryActions={[
          <HelpButton
            key="help"
            helpPagePath="/behaviors/events-based-behaviors"
          />,
        ]}
        actions={actions}
        cannotBeDismissed={false}
        open
        noMargin
        title={<Trans>Choose a new behavior function ("method")</Trans>}
        onRequestClose={this.props.onCancel}
      >
        <List>
          <Subheader>
            <Trans>Main lifecycle methods</Trans>
          </Subheader>
          <MethodListItem
            icon={<Create style={styles.icon} />}
            name={'onCreated'}
            disabled={eventsFunctions.hasEventsFunctionNamed('onCreated')}
            onChoose={onChoose}
            description={
              <Trans>
                Events that will be run once, when an object is created with
                this behavior being attached to it.
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
              eventsFunctions.hasEventsFunctionNamed(
                'onOwnerRemovedFromScene'
              ) || eventsFunctions.hasEventsFunctionNamed('onDestroy')
            }
            onChoose={onChoose}
            description={
              <Trans>
                Events that will be run once, after the object is removed from
                the scene and before it is entirely removed from memory.
              </Trans>
            }
          />
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
                Events that will be run once when the behavior is deactivated on
                an object (step events won't be run until the behavior is
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
                second), for every object that has the behavior attached, after
                the events from the events sheet.
              </Trans>
            }
          />
          <Subheader>
            <Trans>Custom</Trans>
          </Subheader>
          <ListItem
            leftIcon={<Function style={styles.icon} />}
            primaryText={
              <Trans>Custom (action, condition or expression)</Trans>
            }
            secondaryText={
              <Trans>
                An action, condition or expression that can be used on objects
                that have the behavior attached to them. Use it from the events
                sheet as any other action/condition/expression.
              </Trans>
            }
            secondaryTextLines={2}
            onClick={() =>
              onChoose({
                functionType: gd.EventsFunction.Action,
                name: null,
              })
            }
          />
        </List>
      </Dialog>
    );
  }
}
