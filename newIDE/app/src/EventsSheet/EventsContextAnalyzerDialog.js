// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';

export type EventsContextResult = {|
  objectsNames: Array<string>,
  objectOrGroupNames: Array<string>,
  objectOrGroupBehaviorNames: {
    [string]: Array<string>,
  },
|};

// Store in a EventsContextResult the content of a gd.EventsContext.
// In theory not necessary, but easier than storing,
// passing around, and properly delete a gd.EventsContext.
export const toEventsContextResult = (
  eventsContext: gdEventsContext
): EventsContextResult => {
  const objectsNames = eventsContext
    .getObjectNames()
    .toNewVectorString()
    .toJSArray();
  const objectOrGroupNames = eventsContext
    .getReferencedObjectOrGroupNames()
    .toNewVectorString()
    .toJSArray();

  const objectOrGroupBehaviorNames = {};
  objectOrGroupNames.forEach(objectOrGroupName => {
    const behaviorNames = eventsContext
      .getBehaviorNamesOfObjectOrGroup(objectOrGroupName)
      .toNewVectorString()
      .toJSArray();

    if (behaviorNames.length) {
      objectOrGroupBehaviorNames[objectOrGroupName] = behaviorNames;
    }
  });

  return {
    objectsNames,
    objectOrGroupNames,
    objectOrGroupBehaviorNames,
  };
};

type Props = {|
  onClose: () => void,
  eventsContextResult: EventsContextResult,
|};

export default class EventsContextAnalyzerDialog extends React.Component<
  Props,
  {}
> {
  render() {
    const { onClose, eventsContextResult } = this.props;
    const actions = [
      <FlatButton
        key="close"
        label={<Trans>Close</Trans>}
        primary={true}
        onClick={this.props.onClose}
      />,
    ];

    return (
      <Dialog
        title={<Trans>Events analysis</Trans>}
        actions={actions}
        open
        onRequestClose={onClose}
      >
        <Text>
          <Trans>
            Objects or groups being directly referenced in the events:{' '}
            {eventsContextResult.objectOrGroupNames.join(', ')}
          </Trans>
        </Text>
        <Text>
          <Trans>
            All objects potentially used in events:{' '}
            {eventsContextResult.objectsNames.join(', ')}
          </Trans>
        </Text>
        <Text>
          <Trans>All behaviors being directly referenced in the events:</Trans>{' '}
          {Object.keys(eventsContextResult.objectOrGroupBehaviorNames).map(
            objectOrGroupName => {
              return (
                <Trans key={objectOrGroupName}>
                  Behaviors of {objectOrGroupName}:{' '}
                  {eventsContextResult.objectOrGroupBehaviorNames[
                    objectOrGroupName
                  ].join(', ')}
                  ;{' '}
                </Trans>
              );
            }
          )}
        </Text>
      </Dialog>
    );
  }
}
