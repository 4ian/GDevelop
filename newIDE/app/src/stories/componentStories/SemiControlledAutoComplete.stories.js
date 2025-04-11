// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../PaperDecorator';
import ValueStateHolder from '../ValueStateHolder';
import SemiControlledAutoComplete from '../../UI/SemiControlledAutoComplete';
import Dialog from '../../UI/Dialog';
import MiniToolbar, { MiniToolbarText } from '../../UI/MiniToolbar';
import Brush from '@material-ui/icons/Brush';
import ListIcon from '../../UI/ListIcon';
import { Line } from '../../UI/Grid';

export default {
  title: 'UI Building Blocks/SemiControlledAutoComplete',
  component: SemiControlledAutoComplete,
  decorators: [paperDecorator],
};

export const DefaultWithText = () => (
  <ValueStateHolder
    initialValue={'Choice 6'}
    render={(value, onChange) => (
      <React.Fragment>
        <SemiControlledAutoComplete
          value={value}
          onChange={onChange}
          dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
            text: `Choice ${i}`,
            value: `Choice ${i}`,
          }))}
        />
        <p>State value is {value}</p>
      </React.Fragment>
    )}
  />
);

export const WithError = () => (
  <ValueStateHolder
    initialValue={'Choice 6'}
    render={(value, onChange) => (
      <React.Fragment>
        <SemiControlledAutoComplete
          value={value}
          onChange={onChange}
          dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
            text: `Choice ${i}`,
            value: `Choice ${i}`,
          }))}
          errorText={'There was an error somewhere'}
        />
        <p>State value is {value}</p>
      </React.Fragment>
    )}
  />
);

export const WithTranslatableElementsAndSeparator = () => (
  <ValueStateHolder
    initialValue={''}
    render={(value, onChange) => (
      <React.Fragment>
        <SemiControlledAutoComplete
          value={value}
          onChange={onChange}
          dataSource={[
            {
              text: '',
              value: '',
              translatableValue: 'Click me',
              onClick: action('Click me clicked'),
            },
            {
              type: 'separator',
            },
            {
              text: '',
              value: '',
              translatableValue: 'Or click me',
              onClick: action('Click me clicked'),
            },
          ]}
        />
      </React.Fragment>
    )}
  />
);

export const WithOnClickForSomeElements = () => (
  <ValueStateHolder
    initialValue={'Choice 6'}
    render={(value, onChange) => (
      <React.Fragment>
        <SemiControlledAutoComplete
          value={value}
          onChange={onChange}
          dataSource={[
            {
              text: '',
              value: 'Click me 1',
              onClick: action('Click me 1 clicked'),
            },
            {
              text: '',
              value: 'Click me 2',
              onClick: action('Click me 2 clicked'),
            },
            {
              type: 'separator',
            },
          ].concat(
            [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
              text: `Choice ${i}`,
              value: `Choice ${i}`,
            }))
          )}
        />
        <p>State value is {value}</p>
      </React.Fragment>
    )}
  />
);

export const WithOnClickLongTextsAndRenderIcon = () => (
  <ValueStateHolder
    initialValue={'Choice 6'}
    render={(value, onChange) => (
      <React.Fragment>
        <SemiControlledAutoComplete
          value={value}
          onChange={onChange}
          dataSource={[
            {
              text: '',
              value: 'Click me 1',
              onClick: action('Click me 1 clicked'),
              renderIcon: () => <Brush />,
            },
            {
              text: '',
              value: 'Click me 2',
              onClick: action('Click me 2 clicked'),
              renderIcon: () => (
                <ListIcon iconSize={24} src={'res/icon128.png'} />
              ),
            },
            {
              text: '',
              value: 'Click me 3',
              onClick: action('Click me 3 clicked'),
            },
            {
              type: 'separator',
            },
          ].concat(
            [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
              text:
                i % 2
                  ? `Choice ${i}`
                  : `A Veeeeeerrrryyyyyy Looooong Choooooooooooiiiiiiiiice ${i}`,
              value:
                i % 2
                  ? `Choice ${i}`
                  : `A Veeeeeerrrryyyyyy Looooong Choooooooooooiiiiiiiiice ${i}`,
              renderIcon: i % 3 ? () => <Brush /> : undefined,
            }))
          )}
        />
        <p>State value is {value}</p>
      </React.Fragment>
    )}
  />
);

export const InDialog = () => (
  <ValueStateHolder
    initialValue={'Choice 6'}
    render={(value, onChange) => (
      <Dialog open title="some title">
        <SemiControlledAutoComplete
          value={value}
          onChange={onChange}
          dataSource={[
            {
              text: '',
              value: 'Click me 1',
              onClick: action('Click me 1 clicked'),
            },
            {
              text: '',
              value: 'Click me 2',
              onClick: action('Click me 2 clicked'),
            },
            {
              type: 'separator',
            },
          ].concat(
            [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
              text: `Choice ${i}`,
              value: `Choice ${i}`,
            }))
          )}
        />
        <p>State value is {value}</p>
      </Dialog>
    )}
  />
);

export const WithReducedMarginInMiniToolbar = () => (
  <ValueStateHolder
    initialValue={'Choice 6'}
    render={(value, onChange) => (
      <React.Fragment>
        <MiniToolbar>
          <MiniToolbarText firstChild>Please make a choice:</MiniToolbarText>
          <SemiControlledAutoComplete
            margin="none"
            value={value}
            onChange={onChange}
            dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
              text: `Choice ${i}`,
              value: `Choice ${i}`,
            }))}
          />
        </MiniToolbar>
        <p>State value is {value}</p>
      </React.Fragment>
    )}
  />
);

export const WithMarkdownHelperText = () => (
  <ValueStateHolder
    initialValue={'Choice 6'}
    render={(value, onChange) => (
      <React.Fragment>
        <SemiControlledAutoComplete
          value={value}
          onChange={onChange}
          helperMarkdownText="This is some help text that can be written in **markdown**. This is *very* useful for emphasis and can even be used to add [links](http://example.com)."
          dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
            text: `Choice ${i}`,
            value: `Choice ${i}`,
          }))}
        />
        <p>State value is {value}</p>
      </React.Fragment>
    )}
  />
);

export const WithFloatingLabel = () => (
  <ValueStateHolder
    initialValue={'Choice 6'}
    render={(value, onChange) => (
      <React.Fragment>
        <SemiControlledAutoComplete
          value={value}
          onChange={onChange}
          floatingLabelText="This is a floating label"
          helperMarkdownText="This is some help text that can be written in **markdown**. This is *very* useful for emphasis and can even be used to add [links](http://example.com)."
          dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
            text: `Choice ${i}`,
            value: `Choice ${i}`,
          }))}
        />
        <p>State value is {value}</p>
      </React.Fragment>
    )}
  />
);

export const WithInputValueListener = () => {
  const [value, setValue] = React.useState('Choice 6');
  const [inputValue, setInputValue] = React.useState('Choice 6');

  return (
    <Line>
      <>
        <SemiControlledAutoComplete
          value={value}
          onChange={setValue}
          dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
            text: `Choice ${i}`,
            value: `Choice ${i}`,
          }))}
          onInputValueChange={setInputValue}
        />
        <p>State value is {value}</p>
      </>
      <p>Input value is {inputValue}</p>
    </Line>
  );
};
