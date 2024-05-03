// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import {
  type EnumeratedBehaviorMetadata,
  enumerateBehaviorsMetadata,
} from '../BehaviorsEditor/EnumerateBehaviorsMetadata';

type Props = {|
  project: gdProject,
  objectType: string,
  value: string,
  onChange: string => void,
  disabled?: boolean,
  eventsFunctionsExtension?: gdEventsFunctionsExtension,
|};
type State = {|
  behaviorMetadata: Array<EnumeratedBehaviorMetadata>,
|};

export default class BehaviorTypeSelector extends React.Component<
  Props,
  State
> {
  state = {
    behaviorMetadata: enumerateBehaviorsMetadata(
      this.props.project.getCurrentPlatform(),
      this.props.project,
      this.props.eventsFunctionsExtension
    ),
  };

  render() {
    const { disabled, objectType, value, onChange } = this.props;
    const { behaviorMetadata } = this.state;

    // If the behavior type is not in the list, we'll still
    // add a menu item for it so that the value is displayed
    // on screen.
    const valueIsListed = !!behaviorMetadata.find(({ type }) => type === value);

    return (
      <SelectField
        floatingLabelText={<Trans>Behavior type</Trans>}
        value={value}
        onChange={(e, i, value: string) => {
          onChange(value);
        }}
        disabled={disabled}
        fullWidth
      >
        {behaviorMetadata.map((metadata: EnumeratedBehaviorMetadata) => (
          <SelectOption
            key={metadata.type}
            value={metadata.type}
            label={metadata.fullName}
            disabled={
              metadata.objectType !== '' && metadata.objectType !== objectType
            }
          />
        ))}
        {!valueIsListed && value && (
          <SelectOption value={value} label={value} />
        )}
      </SelectField>
    );
  }
}
