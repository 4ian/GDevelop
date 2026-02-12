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
import Reload from '../UI/CustomSvgIcons/Behaviors/Reload';
import Step from '../UI/CustomSvgIcons/Behaviors/Step';
import Destroy from '../UI/CustomSvgIcons/Behaviors/Destroy';
import Action from '../UI/CustomSvgIcons/Behaviors/Action';
import Condition from '../UI/CustomSvgIcons/Behaviors/Condition';
import Expression from '../UI/CustomSvgIcons/Behaviors/Expression';
import { Line } from '../UI/Grid';
import Visibility from '../UI/CustomSvgIcons/Visibility';
import VisibilityOff from '../UI/CustomSvgIcons/VisibilityOff';
const gd: libGDevelop = global.gd;

type Props = {|
  eventsBasedObject: gdEventsBasedObject,
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

export default function ObjectMethodSelectorDialog({
  eventsBasedObject,
  onChoose,
  onCancel,
}: Props) {
  const eventsFunctions = eventsBasedObject.getEventsFunctions();
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  return (
    <Dialog
      title={<Trans>Choose a new object function ("method")</Trans>}
      secondaryActions={[
        <HelpButton
          key="help"
          // TODO EBO Replace it with a new page about objects.
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
              An action that can be used on the object. You can define the
              action parameters: objects, texts, numbers, layers, etc...
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
              A condition that can be used on the object. You can define the
              condition parameters: objects, texts, numbers, layers, etc...
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
              An expression that can be used on the object. Can either return a
              number or a string, and take some parameters.
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
              Events that will be run once, when an object is created.
            </Trans>
          }
        />
        <MethodListItem
          icon={<Step style={styles.icon} />}
          name={'doStepPostEvents'}
          disabled={eventsFunctions.hasEventsFunctionNamed('doStepPostEvents')}
          onChoose={onChoose}
          description={
            <Trans>
              Events that will be run at every frame (roughly 60 times per
              second), for every object, after the events from the events sheet.
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
              icon={<Reload style={styles.icon} />}
              name={'onHotReloading'}
              disabled={eventsFunctions.hasEventsFunctionNamed(
                'onHotReloading'
              )}
              onChoose={onChoose}
              description={
                <Trans>
                  Events that will be run when the preview is being
                  hot-reloaded.
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
