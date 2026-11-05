// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import Text from '../../UI/Text';
import IconButton from '../../UI/IconButton';
import InlineCheckbox from '../../UI/InlineCheckbox';
import ElementWithMenu from '../../UI/Menu/ElementWithMenu';
import CompactSemiControlledTextField from '../../UI/CompactSemiControlledTextField';
import CompactSemiControlledNumberField from '../../UI/CompactSemiControlledNumberField';
import Add from '../../UI/CustomSvgIcons/Add';
import Trash from '../../UI/CustomSvgIcons/Trash';
import { type Parameter, type ParameterType } from './StateMachineUtils';

type Props = {|
  parameters: Array<Parameter>,
  onAddParameter: (type: ParameterType) => void,
  onRenameParameter: (oldName: string, newName: string) => void,
  onUpdateParameter: (
    parameterName: string,
    changes: $Shape<Parameter>
  ) => void,
  onDeleteParameter: (parameterName: string) => void,
|};

const parameterTypeColors = {
  number: '#4a90d9',
  boolean: '#e8a33d',
  trigger: '#e2574c',
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    padding: 8,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  typeBadge: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },
  nameField: {
    flex: 1,
    minWidth: 0,
  },
  defaultValueField: {
    width: 62,
    flexShrink: 0,
  },
};

const StateMachineParameters = ({
  parameters,
  onAddParameter,
  onRenameParameter,
  onUpdateParameter,
  onDeleteParameter,
}: Props): React.Node => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Text size="sub-title" noMargin>
          <Trans>Parameters</Trans>
        </Text>
        <ElementWithMenu
          element={
            <IconButton size="small" tooltip={'Add a parameter'}>
              <Add />
            </IconButton>
          }
          buildMenuTemplate={(i18n: I18nType) => [
            {
              label: i18n._('Number parameter'),
              click: () => onAddParameter('number'),
            },
            {
              label: i18n._('Boolean parameter'),
              click: () => onAddParameter('boolean'),
            },
            {
              label: i18n._('Trigger parameter'),
              click: () => onAddParameter('trigger'),
            },
          ]}
        />
      </div>
      {parameters.length === 0 ? (
        <Text size="body" color="secondary" noMargin>
          <Trans>
            Parameters are values changed from the events sheet. Transitions use
            them as conditions.
          </Trans>
        </Text>
      ) : null}
      {parameters.map(parameter => (
        <div key={parameter.name} style={styles.row}>
          <div
            style={{
              ...styles.typeBadge,
              backgroundColor: parameterTypeColors[parameter.type],
            }}
            title={parameter.type}
          />
          <div style={styles.nameField}>
            <CompactSemiControlledTextField
              value={parameter.name}
              commitOnBlur
              onChange={newName => {
                const trimmedName = newName.trim();
                if (!trimmedName || trimmedName === parameter.name) return;
                onRenameParameter(parameter.name, trimmedName);
              }}
            />
          </div>
          <div style={styles.defaultValueField}>
            {parameter.type === 'number' ? (
              <CompactSemiControlledNumberField
                value={
                  typeof parameter.defaultValue === 'number'
                    ? parameter.defaultValue
                    : 0
                }
                commitOnBlur
                onChange={value =>
                  onUpdateParameter(parameter.name, { defaultValue: value })
                }
              />
            ) : parameter.type === 'boolean' ? (
              <InlineCheckbox
                checked={!!parameter.defaultValue}
                onCheck={(e, checked) =>
                  onUpdateParameter(parameter.name, { defaultValue: checked })
                }
              />
            ) : (
              <Text size="body" color="secondary" noMargin align="center">
                —
              </Text>
            )}
          </div>
          <IconButton
            size="small"
            tooltip={'Delete this parameter'}
            onClick={() => onDeleteParameter(parameter.name)}
          >
            <Trash />
          </IconButton>
        </div>
      ))}
      {parameters.length > 0 ? (
        <Text size="body" color="secondary" noMargin>
          <Trans>
            Use the parameters from the events sheet to drive the transitions.
          </Trans>
        </Text>
      ) : null}
    </div>
  );
};

export default StateMachineParameters;
