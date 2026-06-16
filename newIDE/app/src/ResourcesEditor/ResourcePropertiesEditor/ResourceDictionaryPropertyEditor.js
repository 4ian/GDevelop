// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';

import { type ResourcePropertyConfig } from '../../Utils/ProjectSettingsReader';
import {
  getResourceCustomDictionary,
  setResourceCustomDictionaryValue,
  removeResourceCustomDictionaryValue,
} from '../../ResourcesList/ResourceUtils';
import { Column, Line, Spacer } from '../../UI/Grid';
import { LineStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import IconButton from '../../UI/IconButton';
import Trash from '../../UI/CustomSvgIcons/Trash';

type Props = {|
  resource: gdResource,
  config: ResourcePropertyConfig,
  onUpdated: () => void,
|};

const ADD_PLACEHOLDER_VALUE = '';

/**
 * Editor for a "dictionary" custom resource property: a dynamic list of
 * key/number-value entries. Keys can be picked from a configured enum (or
 * entered freely when no `keys` enum is provided). The dictionary is empty by
 * default; entries can be added and removed.
 */
const ResourceDictionaryPropertyEditor = ({
  resource,
  config,
  onUpdated,
}: Props): React.Node => {
  const dictionary = getResourceCustomDictionary(resource, config.name);
  const usedKeys = Object.keys(dictionary);

  const allowedKeys = config.keys || null;
  const availableKeysToAdd = allowedKeys
    ? allowedKeys.filter(key => !usedKeys.includes(key.value))
    : null;

  const getKeyLabel = (key: string): string => {
    if (!allowedKeys) return key;
    const found = allowedKeys.find(allowedKey => allowedKey.value === key);
    return found ? found.label : key;
  };

  const onChangeValue = (key: string, newValue: string) => {
    const numberValue = parseFloat(newValue);
    setResourceCustomDictionaryValue(
      resource,
      config.name,
      key,
      Number.isNaN(numberValue) ? 0 : numberValue
    );
    onUpdated();
  };

  const onRemove = (key: string) => {
    removeResourceCustomDictionaryValue(resource, config.name, key);
    onUpdated();
  };

  const onAddKey = (key: string) => {
    if (!key) return;
    if (usedKeys.includes(key)) return;
    setResourceCustomDictionaryValue(resource, config.name, key, 0);
    onUpdated();
  };

  return (
    <Column noMargin>
      <Text size="block-title">{config.label}</Text>
      {config.description ? (
        <Text size="body-small" color="secondary" noMargin>
          {config.description}
        </Text>
      ) : null}
      {usedKeys.length === 0 ? (
        <Text size="body-small" color="secondary">
          <Trans>No entries yet.</Trans>
        </Text>
      ) : (
        usedKeys.map(key => (
          <LineStackLayout key={key} alignItems="center" noMargin>
            <div style={{ minWidth: 80, flexShrink: 0 }}>
              <Text noMargin>{getKeyLabel(key)}</Text>
            </div>
            <SemiControlledTextField
              commitOnBlur
              type="number"
              value={String(dictionary[key])}
              onChange={newValue => onChangeValue(key, newValue)}
              fullWidth
            />
            <IconButton
              size="small"
              tooltip={t`Remove`}
              onClick={() => onRemove(key)}
            >
              <Trash />
            </IconButton>
          </LineStackLayout>
        ))
      )}
      <Spacer />
      {allowedKeys ? (
        availableKeysToAdd && availableKeysToAdd.length > 0 ? (
          <SelectField
            value={ADD_PLACEHOLDER_VALUE}
            floatingLabelText={<Trans>Add an entry</Trans>}
            onChange={(event, index, value) => onAddKey(value)}
            fullWidth
          >
            <SelectOption
              value={ADD_PLACEHOLDER_VALUE}
              label={t`Choose a key to add…`}
              disabled
            />
            {availableKeysToAdd.map(key => (
              <SelectOption
                key={key.value}
                value={key.value}
                label={key.label}
                shouldNotTranslate
              />
            ))}
          </SelectField>
        ) : (
          <Text size="body-small" color="secondary">
            <Trans>All available keys have been added.</Trans>
          </Text>
        )
      ) : (
        <Line noMargin>
          <SemiControlledTextField
            commitOnBlur
            value=""
            floatingLabelText={<Trans>Add a key</Trans>}
            onChange={newKey => onAddKey(newKey.trim())}
            fullWidth
          />
        </Line>
      )}
    </Column>
  );
};

export default ResourceDictionaryPropertyEditor;
