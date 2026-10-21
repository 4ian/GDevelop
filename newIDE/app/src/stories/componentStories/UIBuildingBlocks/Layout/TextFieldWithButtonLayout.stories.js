// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../../../GDevelopJsInitializerDecorator';
import paperDecorator from '../../../PaperDecorator';
import SemiControlledTextField from '../../../../UI/SemiControlledTextField';
import RaisedButton from '../../../../UI/RaisedButton';
import IconButton from '../../../../UI/IconButton';
import Brush from '@material-ui/icons/Brush';
import { TextFieldWithButtonLayout } from '../../../../UI/Layout';
import '../../../../UI/Theme/Global/Scrollbar.css';
import '../../../../UI/Theme/Global/Animation.css';
import SemiControlledAutoComplete from '../../../../UI/SemiControlledAutoComplete';

export default {
  title: 'UI Building Blocks/Layout/TextFieldWithButtonLayout',
  decorators: [paperDecorator],
};

export const EmptyTextField = (): React.Node => (
  <TextFieldWithButtonLayout
    renderTextField={() => (
      <SemiControlledTextField
        floatingLabelText="Hello world"
        value=""
        onChange={() => {}}
      />
    )}
    renderButton={style => (
      <RaisedButton style={style} label="Button" onClick={() => {}} />
    )}
  />
);
EmptyTextField.storyName = 'Empty text field';

export const EmptyTextFieldMarginNone = (): React.Node => (
  <TextFieldWithButtonLayout
    margin="none"
    renderTextField={() => (
      <SemiControlledTextField
        margin="none"
        floatingLabelText="Hello world"
        value=""
        onChange={() => {}}
      />
    )}
    renderButton={style => (
      <RaisedButton style={style} label="Button" onClick={() => {}} />
    )}
  />
);
EmptyTextFieldMarginNone.storyName = 'Empty text field, margin=none';

export const EmptyAutoCompleteField = (): React.Node => (
  <TextFieldWithButtonLayout
    renderTextField={() => (
      <SemiControlledAutoComplete
        floatingLabelText="Hello world"
        value={''}
        onChange={() => {}}
        dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
          text: `Choice ${i}`,
          value: `Choice ${i}`,
        }))}
      />
    )}
    renderButton={style => (
      <RaisedButton style={style} label="Button" onClick={() => {}} />
    )}
  />
);
EmptyAutoCompleteField.storyName = 'Empty auto complete field';

export const EmptyAutoCompleteFieldNoFloatingLabelText = (): React.Node => (
  <TextFieldWithButtonLayout
    noFloatingLabelText
    renderTextField={() => (
      <SemiControlledAutoComplete
        value={''}
        onChange={() => {}}
        dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
          text: `Choice ${i}`,
          value: `Choice ${i}`,
        }))}
      />
    )}
    renderButton={style => (
      <RaisedButton style={style} label="Button" onClick={() => {}} />
    )}
  />
);
EmptyAutoCompleteFieldNoFloatingLabelText.storyName =
  'Empty auto complete field, noFloatingLabelText';

export const EmptyAutoCompleteFieldMarginNone = (): React.Node => (
  <TextFieldWithButtonLayout
    margin="none"
    renderTextField={() => (
      <SemiControlledAutoComplete
        margin="none"
        floatingLabelText="Hello world"
        value={''}
        onChange={() => {}}
        dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
          text: `Choice ${i}`,
          value: `Choice ${i}`,
        }))}
      />
    )}
    renderButton={style => (
      <RaisedButton style={style} label="Button" onClick={() => {}} />
    )}
  />
);
EmptyAutoCompleteFieldMarginNone.storyName =
  'Empty auto complete field, margin=none';

export const EmptyAutoCompleteFieldMarginNoneNoFloatingLabelText = (): React.Node => (
  <TextFieldWithButtonLayout
    margin="none"
    noFloatingLabelText
    renderTextField={() => (
      <SemiControlledAutoComplete
        margin="none"
        value={''}
        onChange={() => {}}
        dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
          text: `Choice ${i}`,
          value: `Choice ${i}`,
        }))}
      />
    )}
    renderButton={style => (
      <RaisedButton style={style} label="Button" onClick={() => {}} />
    )}
  />
);
EmptyAutoCompleteFieldMarginNoneNoFloatingLabelText.storyName =
  'Empty auto complete field, margin=none, noFloatingLabelText';

export const EmptyAutoCompleteFieldMarginNoneNoFloatingLabelTextWithASmallIconButton = (): React.Node => (
  <TextFieldWithButtonLayout
    margin="none"
    noFloatingLabelText
    renderTextField={() => (
      <SemiControlledAutoComplete
        margin="none"
        value={''}
        onChange={() => {}}
        dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
          text: `Choice ${i}`,
          value: `Choice ${i}`,
        }))}
      />
    )}
    renderButton={style => (
      <IconButton size="small">
        <Brush />
      </IconButton>
    )}
  />
);
EmptyAutoCompleteFieldMarginNoneNoFloatingLabelTextWithASmallIconButton.storyName =
  'Empty auto complete field, margin=none, noFloatingLabelText, with a small IconButton';

export const FilledTextField = (): React.Node => (
  <TextFieldWithButtonLayout
    renderTextField={() => (
      <SemiControlledTextField
        floatingLabelText="Hello"
        value="123"
        onChange={() => {}}
      />
    )}
    renderButton={style => (
      <RaisedButton style={style} label="Button" onClick={() => {}} />
    )}
  />
);
FilledTextField.storyName = 'Filled text field';

export const FilledTextFieldFullWidth = (): React.Node => (
  <TextFieldWithButtonLayout
    renderTextField={() => (
      <SemiControlledTextField
        floatingLabelText="Hello"
        value="123"
        onChange={() => {}}
        fullWidth
      />
    )}
    renderButton={style => (
      <RaisedButton style={style} label="Button" onClick={() => {}} />
    )}
  />
);
FilledTextFieldFullWidth.storyName = 'Filled text field, full width';

export const FilledMultilineTextField = (): React.Node => (
  <TextFieldWithButtonLayout
    renderTextField={() => (
      <SemiControlledTextField
        floatingLabelText="Hello"
        multiline
        value={'123\n456\n789\nblablabla bla bla'}
        onChange={() => {}}
      />
    )}
    renderButton={style => (
      <RaisedButton style={style} label="Button" onClick={() => {}} />
    )}
  />
);
FilledMultilineTextField.storyName = 'Filled multiline text field';

export const FilledAutoCompleteField = (): React.Node => (
  <TextFieldWithButtonLayout
    renderTextField={() => (
      <SemiControlledAutoComplete
        floatingLabelText="Hello world"
        value={'Choice 5'}
        onChange={() => {}}
        dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
          text: `Choice ${i}`,
          value: `Choice ${i}`,
        }))}
      />
    )}
    renderButton={style => (
      <RaisedButton style={style} label="Button" onClick={() => {}} />
    )}
  />
);
FilledAutoCompleteField.storyName = 'Filled auto complete field';

export const FilledAutoCompleteFieldFullWidth = (): React.Node => (
  <TextFieldWithButtonLayout
    renderTextField={() => (
      <SemiControlledAutoComplete
        floatingLabelText="Hello world"
        value={'Choice 5'}
        onChange={() => {}}
        dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
          text: `Choice ${i}`,
          value: `Choice ${i}`,
        }))}
        fullWidth
      />
    )}
    renderButton={style => (
      <RaisedButton style={style} label="Button" onClick={() => {}} />
    )}
  />
);
FilledAutoCompleteFieldFullWidth.storyName =
  'Filled auto complete field, full width';
