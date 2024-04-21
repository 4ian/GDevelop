// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import * as React from 'react';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import { Line, Column } from '../UI/Grid';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { IconButton } from '@material-ui/core';
import RaisedButton from '../UI/RaisedButton';
import Add from '../UI/CustomSvgIcons/Add';
import Trash from '../UI/CustomSvgIcons/Trash';

type StringArrayEditorProps = {|
  extraInfo: Array<string>,
  setExtraInfo: (Array<string>) => void,
  disabled?: boolean,
|};

const StringArrayEditor = ({
  extraInfo,
  setExtraInfo,
  disabled,
}: StringArrayEditorProps) => {
  const updateExtraInfo = () => setExtraInfo(extraInfo);

  return (
    <ResponsiveLineStackLayout>
      <Column justifyContent="flex-end" expand noMargin>
        {extraInfo.map((item, index) => (
          <Line
            key={index}
            justifyContent="flex-end"
            expand
            alignItems="center"
            noMargin
          >
            <SemiControlledTextField
              disabled={disabled}
              commitOnBlur
              value={item}
              onChange={text => {
                extraInfo[index] = text;
                updateExtraInfo();
              }}
              fullWidth
            />
            <IconButton
              disabled={disabled}
              tooltip={t`Delete option`}
              onClick={() => {
                extraInfo.splice(index, 1);
                updateExtraInfo();
              }}
            >
              <Trash />
            </IconButton>
          </Line>
        ))}

        <Line justifyContent="flex-end" expand>
          <RaisedButton
            disabled={disabled}
            primary
            onClick={() => {
              extraInfo.push('New Option');
              updateExtraInfo();
            }}
            label={<Trans>Add a new option</Trans>}
            icon={<Add />}
          />
        </Line>
      </Column>
    </ResponsiveLineStackLayout>
  );
};

export default StringArrayEditor;
