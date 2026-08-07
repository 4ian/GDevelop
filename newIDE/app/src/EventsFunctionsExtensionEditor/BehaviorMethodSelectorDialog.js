// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import { type EventsFunctionCreationParameters } from '../EventsFunctionsList/EventsFunctionTreeViewItemContent';
import FlatButton from '../UI/FlatButton';
import Subheader from '../UI/Subheader';
import { List } from '../UI/List';
import Dialog from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import { Line } from '../UI/Grid';
import Visibility from '../UI/CustomSvgIcons/Visibility';
import VisibilityOff from '../UI/CustomSvgIcons/VisibilityOff';
import { FunctionListItem } from './ExtensionFunctionSelectorDialog';

const gd: libGDevelop = global.gd;

type Props = {|
  eventsBasedBehavior: gdEventsBasedBehavior,
  onCancel: () => void,
  onChoose: (parameters: EventsFunctionCreationParameters) => void,
|};

export default function BehaviorMethodSelectorDialog({
  eventsBasedBehavior,
  onChoose,
  onCancel,
}: Props): React.Node {
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
      maxWidth="sm"
    >
      <List>
        <FunctionListItem
          functionType={gd.EventsFunction.Action}
          functionName={null}
          name={<Trans>Action</Trans>}
          description={
            <Trans>
              An action that can be used on objects with the behavior. You can
              define the action parameters: objects, texts, numbers, layers,
              etc...
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
              A condition that can be used on objects with the behavior. You can
              define the condition parameters: objects, texts, numbers, layers,
              etc...
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
              An expression that can be used on objects with the behavior. Can
              either return a number or a string, and take some parameters.
            </Trans>
          }
          onChoose={onChoose}
        />
        <Subheader>
          <Trans>Lifecycle methods</Trans>
        </Subheader>
        <FunctionListItem
          functionType={gd.EventsFunction.Action}
          functionName="onCreated"
          disabled={eventsFunctions.hasEventsFunctionNamed('onCreated')}
          onChoose={onChoose}
          description={
            <Trans>
              Events that will be run once, when an object is created with this
              behavior being attached to it.
            </Trans>
          }
        />
        <FunctionListItem
          functionType={gd.EventsFunction.Action}
          functionName="doStepPreEvents"
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
        <FunctionListItem
          functionType={gd.EventsFunction.Action}
          functionName="onDestroy"
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
            <FunctionListItem
              functionType={gd.EventsFunction.Action}
              functionName="onDeActivate"
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
            <FunctionListItem
              functionType={gd.EventsFunction.Action}
              functionName="onActivate"
              disabled={eventsFunctions.hasEventsFunctionNamed('onActivate')}
              onChoose={onChoose}
              description={
                <Trans>
                  Events that will be run once when the behavior is re-activated
                  on an object (after it was previously deactivated).
                </Trans>
              }
            />
            <FunctionListItem
              functionType={gd.EventsFunction.Action}
              functionName="doStepPostEvents"
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
