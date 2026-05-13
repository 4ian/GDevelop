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
  onFocus?: (event: SyntheticFocusEvent<HTMLInputElement>) => void,
  disabled?: boolean,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
|};

export default function BehaviorTypeSelector({
  project,
  eventsFunctionsExtension,
  disabled,
  value,
  onChange,
  onFocus,
  objectType,
}: Props): React.Node {
  const behaviorMetadata: Array<EnumeratedBehaviorMetadata> = React.useMemo(
    () =>
      enumerateBehaviorsMetadata(
        project.getCurrentPlatform(),
        project,
        eventsFunctionsExtension
      ),
    [eventsFunctionsExtension, project]
  );

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
      onFocus={onFocus}
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
      {!valueIsListed && value && <SelectOption value={value} label={value} />}
    </SelectField>
  );
}
