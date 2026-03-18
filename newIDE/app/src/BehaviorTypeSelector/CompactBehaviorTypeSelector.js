// @flow
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import CompactSelectField from '../UI/CompactSelectField';
import SelectOption from '../UI/SelectOption';
import {
  type EnumeratedBehaviorMetadata,
  enumerateBehaviorsMetadata,
} from '../BehaviorsEditor/EnumerateBehaviorsMetadata';
import CompactPropertiesEditorRowField from '../CompactPropertiesEditor/CompactPropertiesEditorRowField';
import ListIcon from '../UI/ListIcon';
import ExtensionIcon from '../UI/CustomSvgIcons/Extension';

type Props = {|
  project: gdProject,
  objectType: string,
  value: string,
  onChange: string => void,
  disabled?: boolean,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
|};

export default function CompactBehaviorTypeSelector({
  project,
  eventsFunctionsExtension,
  disabled,
  value,
  onChange,
  objectType,
}: Props): React.Node {
  const behaviorMetadataList: Array<EnumeratedBehaviorMetadata> = React.useMemo(
    () =>
      enumerateBehaviorsMetadata(
        project.getCurrentPlatform(),
        project,
        eventsFunctionsExtension
      ),
    [eventsFunctionsExtension, project]
  );

  const behaviorMetadata = React.useMemo(
    () => behaviorMetadataList.find(({ type }) => type === value),
    [behaviorMetadataList, value]
  );
  // If the behavior type is not in the list, we'll still
  // add a menu item for it so that the value is displayed
  // on screen.
  const valueIsListed = !!behaviorMetadata;

  return (
    <I18n>
      {({ i18n }) => (
        <CompactPropertiesEditorRowField
          label={i18n._(t`Behavior type`)}
          field={
            <CompactSelectField
              value={value}
              onChange={value => {
                onChange(value);
              }}
              disabled={disabled}
              renderOptionIcon={className =>
                behaviorMetadata ? (
                  <ListIcon
                    src={behaviorMetadata.previewIconUrl}
                    iconSize={16}
                    brightness={disabled ? 0.5 : null}
                  />
                ) : (
                  <ExtensionIcon className={className} />
                )
              }
            >
              {behaviorMetadataList.map(
                (metadata: EnumeratedBehaviorMetadata) => (
                  <SelectOption
                    key={metadata.type}
                    value={metadata.type}
                    label={metadata.fullName}
                    disabled={
                      metadata.objectType !== '' &&
                      metadata.objectType !== objectType
                    }
                  />
                )
              )}
              {!valueIsListed && value && (
                <SelectOption value={value} label={value} />
              )}
            </CompactSelectField>
          }
        />
      )}
    </I18n>
  );
}
