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

  it('separates and labels groups of options, and runs an option action without selecting it', () => {
    const onChange: string => void = jest.fn();
    const onActionClick: () => void = jest.fn();
    let component = null;
    act(() => {
      component = renderer.create(
        <I18nProvider language="en" catalogs={{ en: { messages: {} } }}>
          <RichSelectField
            value="a"
            onChange={onChange}
            options={[
              {
                value: 'a',
                label: 'A',
                group: 'first',
                action: {
                  icon: 'edit',
                  tooltip: { id: 'Edit', message: 'Edit' },
                  onClick: onActionClick,
                },
              },
              { value: 'b', label: 'B', group: 'first' },
              { value: 'c', label: 'C', group: 'second' },
            ]}
            groupLabels={{ second: { id: 'Second', message: 'Second' } }}
          />
        </I18nProvider>
      );
    });
    if (!component) throw new Error('RichSelectField did not render');

    const menuItems = getMenuItems(component);
    // A, B, then a disabled divider and group label, then C.
    expect(menuItems).toHaveLength(5);
    expect(menuItems[2].props.disabled).toBe(true);
    expect(menuItems[2].props.divider).toBe(true);
    expect(menuItems[3].props.disabled).toBe(true);
    expect(menuItems[3].props.children).toBe('Second');
    expect(menuItems[4].props.value).toBe('c');

    const actionButton: any = React.Children.toArray<any>(
      menuItems[0].props.children
    ).find((child: any) => child.props && child.props.tooltip);
    const stopPropagation: () => void = jest.fn();
    act(() => {
      actionButton.props.onClick({ stopPropagation });
    });

    expect(stopPropagation).toHaveBeenCalled();
    expect(onActionClick).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });
});
