// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../../GDevelopJsInitializerDecorator';
import paperDecorator from '../../PaperDecorator';
import SemiControlledTextField, {
  type SemiControlledTextFieldInterface,
} from '../../../UI/SemiControlledTextField';
import MiniToolbar, { MiniToolbarText } from '../../../UI/MiniToolbar';
import RaisedButton from '../../../UI/RaisedButton';
import '../../../UI/Theme/Global/Scrollbar.css';
import '../../../UI/Theme/Global/Animation.css';

export default {
  title: 'UI Building Blocks/SemiControlledTextField',
  decorators: [paperDecorator],
};

export const Default = (): React.Node => {
  const [value, setValue] = React.useState('Hello World');
  return (
    <React.Fragment>
      <SemiControlledTextField value={value} onChange={setValue} />
      <p>State value is {value}</p>
    </React.Fragment>
  );
};
Default.storyName = 'default';

export const DefaultCommitOnBlur = (): React.Node => {
  const [value, setValue] = React.useState('Hello World');
  return (
    <React.Fragment>
      <SemiControlledTextField value={value} onChange={setValue} commitOnBlur />
      <p>State value is {value}</p>
    </React.Fragment>
  );
};
DefaultCommitOnBlur.storyName = 'default (commitOnBlur)';

export const ExampleThatIsStoringAFloatInTheState = (): React.Node => {
  const [value, setValue] = React.useState(12.35);
  return (
    <React.Fragment>
      <SemiControlledTextField
        value={value.toString()}
        onChange={newValue => setValue(parseFloat(newValue))}
      />
      <p>
        State value is {value} ({typeof value})
      </p>
    </React.Fragment>
  );
};
ExampleThatIsStoringAFloatInTheState.storyName =
  'example that is storing a float in the state';

export const ExampleThatIsStoringAFloatInTheStateCommitOnBlur = (): React.Node => {
  const [value, setValue] = React.useState(12.35);
  return (
    <React.Fragment>
      <SemiControlledTextField
        value={value.toString()}
        onChange={newValue => setValue(parseFloat(newValue))}
        commitOnBlur
      />
      <p>
        State value is {value} ({typeof value})
      </p>
    </React.Fragment>
  );
};
ExampleThatIsStoringAFloatInTheStateCommitOnBlur.storyName =
  'example that is storing a float in the state (commitOnBlur)';

export const ReducedMarginInAMiniToolbar = (): React.Node => {
  const [value, setValue] = React.useState('Some value');
  return (
    <React.Fragment>
      <MiniToolbar>
        <MiniToolbarText firstChild>Please enter something:</MiniToolbarText>
        <SemiControlledTextField
          margin="none"
          value={value}
          onChange={setValue}
          commitOnBlur
        />
      </MiniToolbar>
      <p>State value is {value}</p>
    </React.Fragment>
  );
};
ReducedMarginInAMiniToolbar.storyName = 'reduced margin, in a MiniToolbar';

export const WithAMarkdownHelperText = (): React.Node => {
  const [value, setValue] = React.useState('Hello World!');
  return (
    <React.Fragment>
      <SemiControlledTextField
        helperMarkdownText="This is some help text that can be written in **markdown**. This is *very* useful for emphasis and can even be used to add [links](http://example.com)."
        value={value}
        onChange={setValue}
      />
      <p>State value is {value}</p>
    </React.Fragment>
  );
};
WithAMarkdownHelperText.storyName = 'with a (markdown) helper text';

export const ForceSetValueAndForceSetSelection = (): React.Node => {
  const [value, setValue] = React.useState('Hello World!');
  const field = React.useRef<?SemiControlledTextFieldInterface>(null);
  return (
    <React.Fragment>
      <SemiControlledTextField ref={field} value={value} onChange={setValue} />
      <p>State value is {value}</p>
      <p>
        Clicking on these buttons will focus the field, then do the action after
        1 second.
      </p>
      <RaisedButton
        onClick={() => {
          field.current && field.current.focus();
          setTimeout(
            () =>
              field.current &&
              field.current.forceSetValue('Forced Hello World'),
            1000
          );
        }}
        label="Force change the value"
      />
      <RaisedButton
        onClick={() => {
          field.current && field.current.focus();
          setTimeout(
            () => field.current && field.current.forceSetSelection(2, 4),
            1000
          );
        }}
        label="Change the selection"
      />
    </React.Fragment>
  );
};
ForceSetValueAndForceSetSelection.storyName =
  'forceSetValue and forceSetSelection';
