// @flow
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import CompactSelectField from '../../UI/CompactSelectField';
import SelectOption from '../../UI/SelectOption';
import { allResourceKindsAndMetadata } from '../../ResourcesList/ResourceSource';
import CompactPropertiesEditorRowField from '../../CompactPropertiesEditor/CompactPropertiesEditorRowField';

type Props = {|
  value: string,
  onChange: (value: string) => void,
  onFocus?: (event: SyntheticFocusEvent<HTMLInputElement>) => void,
|};

export default function CompactResourceTypeSelectField({
  value,
  onChange,
  onFocus,
}: Props): React.Node {
  return (
    <I18n>
      {({ i18n }) => (
        <CompactPropertiesEditorRowField
          label={i18n._(t`Resource kind`)}
          field={
            <CompactSelectField value={value} onChange={onChange}>
              {allResourceKindsAndMetadata.map(({ kind, displayName }) => (
                <SelectOption key={kind} value={kind} label={displayName} />
              ))}
            </CompactSelectField>
          }
        />
      )}
    </I18n>
  );
}
