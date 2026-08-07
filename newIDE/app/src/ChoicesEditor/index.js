// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import {
  ResponsiveLineStackLayout,
  LineStackLayout,
  ColumnStackLayout,
} from '../UI/Layout';
import { Line } from '../UI/Grid';
import { IconButton } from '@material-ui/core';
import RaisedButton from '../UI/RaisedButton';
import Add from '../UI/CustomSvgIcons/Add';
import Trash from '../UI/CustomSvgIcons/Trash';
import CompactPropertiesEditorRowField from '../CompactPropertiesEditor/CompactPropertiesEditorRowField';
import CompactSemiControlledTextField from '../UI/CompactSemiControlledTextField';

export type Choice = {|
  value: string,
  label: string,
|};

type ChoicesEditorProps = {|
  choices: Array<Choice>,
  setChoices: (Array<Choice>) => void,
  disabled?: boolean,
  hideLabels?: boolean,
  isNumber: boolean,
|};

const ChoicesEditor = ({
  choices,
  setChoices,
  disabled,
  hideLabels,
  isNumber,
}: ChoicesEditorProps): React.Node => {
  const updateChoices = () => setChoices(choices);

  return (
    <I18n>
      {({ i18n }) => (
        <ResponsiveLineStackLayout noOverflowParent>
          <ColumnStackLayout
            justifyContent="flex-end"
            expand
            noOverflowParent
            noMargin
          >
            {choices.map((item, index) => (
              <LineStackLayout
                key={index}
                justifyContent="flex-end"
                expand
                alignItems="center"
                noMargin
              >
                <CompactPropertiesEditorRowField
                  label={i18n._(t`Value`)}
                  labelMaxWidth={60}
                  field={
                    <CompactSemiControlledTextField
                      disabled={disabled}
                      commitOnBlur
                      value={item.value}
                      onChange={text => {
                        choices[index].value = text;
                        updateChoices();
                      }}
                    />
                  }
                />
                {!hideLabels && (
                  <CompactPropertiesEditorRowField
                    label={i18n._(t`Label`)}
                    labelMaxWidth={60}
                    field={
                      <CompactSemiControlledTextField
                        disabled={disabled}
                        commitOnBlur
                        placeholder={i18n._(t`Label displayed in editor`)}
                        value={item.label}
                        onChange={text => {
                          choices[index].label = text;
                          updateChoices();
                        }}
                      />
                    }
                  />
                )}
                <IconButton
                  disabled={disabled}
                  tooltip={t`Delete option`}
                  onClick={() => {
                    choices.splice(index, 1);
                    updateChoices();
                  }}
                  size="small"
                >
                  <Trash />
                </IconButton>
              </LineStackLayout>
            ))}

            <Line justifyContent="flex-end" expand>
              <RaisedButton
                disabled={disabled}
                primary
                onClick={() => {
                  choices.push(
                    isNumber
                      ? {
                          value: choices.length.toString(),
                          label: 'New Option',
                        }
                      : { value: 'New Option', label: '' }
                  );
                  updateChoices();
                }}
                label={<Trans>Add a new option</Trans>}
                icon={<Add />}
              />
            </Line>
          </ColumnStackLayout>
        </ResponsiveLineStackLayout>
      )}
    </I18n>
  );
};

export default ChoicesEditor;
