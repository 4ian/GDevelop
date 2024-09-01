// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import { allResourceKindsAndMetadata } from '../../ResourcesList/ResourceSource';

type Props = {|
  value: number | string,
  // event and index should not be used, and be removed eventually
  onChange?: (
    event: {| target: {| value: string |} |},
    index: number,
    text: string
  ) => void,
  fullWidth?: boolean,
|};

export default function ResourceTypeSelectField({
  value,
  onChange,
  fullWidth,
}: Props) {
  return (
    <I18n>
      {({ i18n }) => (
        <SelectField
          floatingLabelText={<Trans>Resource type</Trans>}
          value={value}
          onChange={onChange}
          fullWidth={fullWidth}
        >
          {allResourceKindsAndMetadata.map(({ kind, displayName }) => (
            <SelectOption key={kind} value={kind} label={displayName} />
          ))}
        </SelectField>
      )}
    </I18n>
  );
}
