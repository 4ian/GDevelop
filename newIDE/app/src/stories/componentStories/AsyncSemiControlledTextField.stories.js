// @flow
import * as React from 'react';

import AsyncSemiControlledTextField from '../../UI/AsyncSemiControlledTextField';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import paperDecorator from '../PaperDecorator';
import { delay } from '../../Utils/Delay';
import IconButton from '../../UI/IconButton';
import Edit from '../../UI/CustomSvgIcons/Edit';
import Text from '../../UI/Text';

export default {
  title: 'UI Building Blocks/AsyncSemiControlledTextField',
  component: AsyncSemiControlledTextField,
  decorators: [paperDecorator],
};

export const Default = (args: {|
  floatingLabelText?: ?string,
  endAdornment?: React.Node,
  helperMarkdownText?: string,
  required?: boolean,
|}) => {
  const [value, setValue] = React.useState('Hello world');
  const [isEditing, setIsEditing] = React.useState<boolean>(false);

  const onValidateValue = React.useCallback(async newValue => {
    await delay(1000);
    if (Math.random() < 0.15) {
      throw new Error('Random error');
    }
    setValue(newValue);
    setIsEditing(false);
  }, []);

  return (
    <ColumnStackLayout>
      {isEditing ? (
        <AsyncSemiControlledTextField
          margin="dense"
          maxLength={50}
          autoFocus="desktop"
          value={value}
          callback={onValidateValue}
          callbackErrorText={
            'An error occurred while renaming the group name. Please try again later.'
          }
          onCancel={() => setIsEditing(false)}
          emptyErrorText={'Input cannot be empty'}
        />
      ) : (
        <LineStackLayout alignItems="center">
          <Text noMargin>{value}</Text>
          <IconButton size="small" onClick={() => setIsEditing(true)}>
            <Edit />
          </IconButton>
        </LineStackLayout>
      )}
      <p>State value is {value}</p>
    </ColumnStackLayout>
  );
};
export const NoMargin = (args: {|
  floatingLabelText?: ?string,
  endAdornment?: React.Node,
  helperMarkdownText?: string,
  required?: boolean,
|}) => {
  const [value, setValue] = React.useState('Hello world');
  const [isEditing, setIsEditing] = React.useState<boolean>(false);

  const onValidateValue = React.useCallback(async newValue => {
    await delay(1000);
    if (Math.random() < 0.15) {
      throw new Error('Random error');
    }
    setValue(newValue);
    setIsEditing(false);
  }, []);

  return (
    <ColumnStackLayout>
      {isEditing ? (
        <AsyncSemiControlledTextField
          margin="none"
          maxLength={50}
          autoFocus="desktop"
          value={value}
          callback={onValidateValue}
          callbackErrorText={
            'An error occurred while renaming. Please try again later.'
          }
          onCancel={() => setIsEditing(false)}
          emptyErrorText={'Input cannot be empty'}
        />
      ) : (
        <LineStackLayout alignItems="center">
          <Text noMargin>{value}</Text>
          <IconButton size="small" onClick={() => setIsEditing(true)}>
            <Edit />
          </IconButton>
        </LineStackLayout>
      )}
      <p>State value is {value}</p>
    </ColumnStackLayout>
  );
};
