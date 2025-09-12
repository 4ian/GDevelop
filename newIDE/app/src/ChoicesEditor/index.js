// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import * as React from 'react';
import {
  ResponsiveLineStackLayout,
  LineStackLayout,
  ColumnStackLayout,
} from '../UI/Layout';
import { Line } from '../UI/Grid';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { IconButton } from '@material-ui/core';
import RaisedButton from '../UI/RaisedButton';
import Add from '../UI/CustomSvgIcons/Add';
import Trash from '../UI/CustomSvgIcons/Trash';

export type Choice = { value: string, label: string };

type ChoicesEditorProps = {|
  choices: Array<Choice>,
  setChoices: (Array<Choice>) => void,
  disabled?: boolean,
  hideLabels?: boolean,
|};

const ChoicesEditor = ({
  choices,
  setChoices,
  disabled,
  hideLabels,
}: ChoicesEditorProps) => {
  const updateChoices = () => setChoices(choices);

  return (
    <ResponsiveLineStackLayout>
      <ColumnStackLayout justifyContent="flex-end" expand noMargin>
        {choices.map((item, index) => (
          <LineStackLayout
            key={index}
            justifyContent="flex-end"
            expand
            alignItems="center"
            noMargin
          >
            <SemiControlledTextField
              disabled={disabled}
              commitOnBlur
              floatingLabelText={<Trans>Value</Trans>}
              value={item.value}
              onChange={text => {
                choices[index].value = text;
                updateChoices();
              }}
              fullWidth
            />
            {!hideLabels && (
              <SemiControlledTextField
                disabled={disabled}
                commitOnBlur
                floatingLabelText={<Trans>Label displayed in editor</Trans>}
                value={item.label}
                onChange={text => {
                  choices[index].label = text;
                  updateChoices();
                }}
                fullWidth
              />
            )}
            <IconButton
              disabled={disabled}
              tooltip={t`Delete option`}
              onClick={() => {
                choices.splice(index, 1);
                updateChoices();
              }}
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
              choices.push({ value: 'New Option', label: '' });
              updateChoices();
            }}
            label={<Trans>Add a new option</Trans>}
            icon={<Add />}
          />
        </Line>
      </ColumnStackLayout>
    </ResponsiveLineStackLayout>
  );
};

export default ChoicesEditor;
