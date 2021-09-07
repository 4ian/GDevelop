// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import * as React from 'react';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import { Line, Column } from '../UI/Grid';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { IconButton } from '@material-ui/core';
import Delete from '@material-ui/icons/Delete';
import RaisedButton from '../UI/RaisedButton';
import Add from '@material-ui/icons/Add';

type StringArrayEditorProps = {|
  extraInfo: Array<string>,
  setExtraInfo: (Array<string>) => void,
|};

const StringArrayEditor = ({
  extraInfo,
  setExtraInfo,
}: StringArrayEditorProps) => {
  const updateExtraInfo = () => setExtraInfo(extraInfo);

  return (
    <ResponsiveLineStackLayout>
      <Column justifyContent="flex-end" expand>
        {extraInfo.map((item, index) => (
          <Line key={index} justifyContent="flex-end" expand>
            <SemiControlledTextField
              commitOnBlur
              value={item}
              onChange={text => {
                extraInfo[index] = text;
                updateExtraInfo();
              }}
              fullWidth
            />
            <IconButton
              tooltip={t`Delete option`}
              onClick={() => {
                extraInfo.splice(index, 1);
                updateExtraInfo();
              }}
            >
              <Delete />
            </IconButton>
          </Line>
        ))}

        <Line justifyContent="flex-end" expand>
          <RaisedButton
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
