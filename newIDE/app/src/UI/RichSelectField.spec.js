/**
 * @flow
 * @jest-environment jsdom
 */
import * as React from 'react';
import { act } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import { I18nProvider } from '@lingui/react';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import RichSelectField from './RichSelectField';

const renderField = ({
  onChange,
  onExtraOptionClick,
}: {|
  onChange: string => void,
  onExtraOptionClick: () => void,
|}): any => {
  let component = null;
  act(() => {
    component = renderer.create(
      <I18nProvider language="en" catalogs={{ en: { messages: {} } }}>
        <RichSelectField
          value="a"
          onChange={onChange}
          options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]}
          extraOptions={[
            {
              label: { id: 'Custom...', message: 'Custom...' },
              onClick: onExtraOptionClick,
            },
          ]}
        />
      </I18nProvider>
    );
  });
  if (!component) throw new Error('RichSelectField did not render');
  return component;
};

// The menu is closed, so its items are read from the children of the field.
const getMenuItems = (component: any): Array<any> =>
  React.Children.toArray<any>(
    component.root.findByType(TextField).props.children
  ).filter((child: any) => child.type === MenuItem);

const selectMenuItem = (component: any, index: number) => {
  const value = getMenuItems(component)[index].props.value;
  act(() => {
    component.root.findByType(TextField).props.onChange({ target: { value } });
  });
};

describe('RichSelectField', () => {
  it('calls onChange with the value of a selected option', () => {
    const onChange: string => void = jest.fn();
    const onExtraOptionClick: () => void = jest.fn();
    const component = renderField({ onChange, onExtraOptionClick });

    selectMenuItem(component, 1);

    expect(onChange).toHaveBeenCalledWith('b');
    expect(onExtraOptionClick).not.toHaveBeenCalled();
  });

  it('calls onClick of an extra option, not onChange', () => {
    const onChange: string => void = jest.fn();
    const onExtraOptionClick: () => void = jest.fn();
    const component = renderField({ onChange, onExtraOptionClick });

    const menuItems = getMenuItems(component);
    // Options, then a disabled divider, then the extra option.
    expect(menuItems).toHaveLength(4);
    expect(menuItems[2].props.disabled).toBe(true);

    selectMenuItem(component, 3);

    expect(onExtraOptionClick).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });
});
