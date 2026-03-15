// @flow
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import CompactSelectField from '../UI/CompactSelectField';
import SelectOption from '../UI/SelectOption';
import {
  enumerateObjectTypes,
  type EnumeratedObjectMetadata,
} from '../ObjectsList/EnumerateObjects';
import CompactPropertiesEditorRowField from '../CompactPropertiesEditor/CompactPropertiesEditorRowField';

type Props = {|
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  label?: string,
  value: string,
  onChange: string => void,
  disabled?: boolean,
  allowedObjectTypes?: ?Array<string>,
|};

export default function CompactObjectTypeSelector({
  project,
  eventsFunctionsExtension,
  disabled,
  value,
  onChange,
  label,
  allowedObjectTypes,
}: Props): React.Node {
  const objectMetadata: Array<EnumeratedObjectMetadata> = React.useMemo(
    () => enumerateObjectTypes(project, eventsFunctionsExtension),
    [eventsFunctionsExtension, project]
  );

  const isDisabled = React.useCallback(
    (type: string) => {
      if (!allowedObjectTypes) return false;

      return allowedObjectTypes.indexOf(type) === -1;
    },
    [allowedObjectTypes]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <CompactPropertiesEditorRowField
          label={label || i18n._(t`Object type`)}
          field={
            <CompactSelectField
              value={value}
              onChange={value => {
                onChange(value);
              }}
              disabled={disabled}
            >
              <SelectOption
                value=""
                label={t`Any object`}
                disabled={isDisabled('')}
              />
              {objectMetadata.map((metadata: EnumeratedObjectMetadata) => {
                if (metadata.name === '') {
                  // Base object is an "abstract" object
                  return null;
                }
                return (
                  <SelectOption
                    key={metadata.name}
                    value={metadata.name}
                    label={metadata.fullName}
                    disabled={isDisabled(metadata.name)}
                  />
                );
              })}
            </CompactSelectField>
          }
        />
      )}
    </I18n>
  );
}
