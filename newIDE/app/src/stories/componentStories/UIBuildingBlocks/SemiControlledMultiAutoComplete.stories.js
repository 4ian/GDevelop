// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../../GDevelopJsInitializerDecorator';
import paperDecorator from '../../PaperDecorator';
import ValueStateHolder from '../../ValueStateHolder';
import SemiControlledMultiAutoComplete from '../../../UI/SemiControlledMultiAutoComplete';
import '../../../UI/Theme/Global/Scrollbar.css';
import '../../../UI/Theme/Global/Animation.css';

export default {
  title: 'UI Building Blocks/SemiControlledMultiAutoComplete',
  decorators: [paperDecorator],
};

const Default = (): React.Node => (
  <ValueStateHolder
    initialValue={[
      {
        text: 'Choice 6',
        value: 'choice-6',
      },
      {
        text: 'Choice 1',
        value: 'choice-1',
      },
    ]}
    render={(value, onChange) => (
      <ValueStateHolder
        initialValue={null}
        render={(inputValue, onInputChange) => (
          <React.Fragment>
            <SemiControlledMultiAutoComplete
              value={value}
              onChange={(event, value) => onChange(value)}
              dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
                text: `Choice ${i}`,
                value: `choice-${i}`,
              }))}
              onInputChange={(event, value) => onInputChange(value)}
              inputValue={inputValue}
              loading={false}
              helperText="This is an autocomplete"
              hintText="Start typing!"
            />
            <p>
              values are {value.map(v => `(${v.text} - ${v.value})`).join(', ')}
            </p>
          </React.Fragment>
        )}
      />
    )}
  />
);

export { Default as _Default };
Default.storyName = 'default';

export const Loading = (): React.Node => (
  <ValueStateHolder
    initialValue={[
      {
        text: 'Choice 6',
        value: 'choice-6',
      },
      {
        text: 'Choice 1',
        value: 'choice-1',
      },
    ]}
    render={(value, onChange) => (
      <ValueStateHolder
        initialValue={null}
        render={(inputValue, onInputChange) => (
          <React.Fragment>
            <SemiControlledMultiAutoComplete
              value={value}
              onChange={(event, value) => onChange(value)}
              dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
                text: `Choice ${i}`,
                value: `choice-${i}`,
              }))}
              onInputChange={(event, value) => onInputChange(value)}
              inputValue={inputValue}
              loading
              helperText="This is an autocomplete"
              hintText="Start typing!"
            />
            <p>
              values are {value.map(v => `(${v.text} - ${v.value})`).join(', ')}
            </p>
          </React.Fragment>
        )}
      />
    )}
  />
);
Loading.storyName = 'loading';

export const Errored = (): React.Node => (
  <ValueStateHolder
    initialValue={[
      {
        text: 'Choice 6',
        value: 'choice-6',
      },
      {
        text: 'Choice 1',
        value: 'choice-1',
      },
    ]}
    render={(value, onChange) => (
      <ValueStateHolder
        initialValue={null}
        render={(inputValue, onInputChange) => (
          <React.Fragment>
            <SemiControlledMultiAutoComplete
              value={value}
              onChange={(event, value) => onChange(value)}
              dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
                text: `Choice ${i}`,
                value: `choice-${i}`,
              }))}
              onInputChange={(event, value) => onInputChange(value)}
              inputValue={inputValue}
              loading={false}
              helperText="This is an autocomplete"
              hintText="Start typing!"
              error="There's been an error."
            />
            <p>
              values are {value.map(v => `(${v.text} - ${v.value})`).join(', ')}
            </p>
          </React.Fragment>
        )}
      />
    )}
  />
);
Errored.storyName = 'errored';
