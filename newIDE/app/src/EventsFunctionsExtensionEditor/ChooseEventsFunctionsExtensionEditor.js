// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import Background from '../UI/Background';
import { Column, Spacer } from '../UI/Grid';
import Text from '../UI/Text';
import RaisedButton from '../UI/RaisedButton';
import FlatButton from '../UI/FlatButton';

type Props = {|
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  onEditFreeFunctions: () => void,
  onEditBehaviors: () => void,
  onEditExtensionOptions: () => void,
|};

const ChooseEventsFunctionsExtensionEditor = (props: Props) => {
  const eventsFunctionsCount = props.eventsFunctionsExtension.getEventsFunctionsCount();
  const eventsBasedBehaviorsCount = props.eventsFunctionsExtension
    .getEventsBasedBehaviors()
    .getCount();

  return (
    <I18n>
      {({ i18n }) => (
        <Background>
          <Column>
            <Text>
              <Trans>
                Extensions can provide functions (which can be actions,
                conditions or expressions) or new behaviors.
              </Trans>
            </Text>
            <RaisedButton
              label={i18n._(
                t`Edit functions (not attached to behaviors) (${eventsFunctionsCount})`
              )}
              onClick={props.onEditFreeFunctions}
              primary
            />
            <Spacer />
            <RaisedButton
              label={i18n._(t`Edit behaviors (${eventsBasedBehaviorsCount})`)}
              onClick={props.onEditBehaviors}
              primary
            />
            <Spacer />
            <FlatButton
              label={<Trans>Edit extension options</Trans>}
              onClick={props.onEditExtensionOptions}
            />
          </Column>
        </Background>
      )}
    </I18n>
  );
};

export default ChooseEventsFunctionsExtensionEditor;
