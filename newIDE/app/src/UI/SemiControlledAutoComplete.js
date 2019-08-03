// @flow
import * as React from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import Divider from 'material-ui/Divider';
import MenuItem from 'material-ui/MenuItem';
import ListIcon from './ListIcon';
import { fuzzyOrEmptyFilter } from '../Utils/FuzzyOrEmptyFilter';

type State = {|
  focused: boolean,
  text: ?string,
|};

export type DataSource = Array<
  | {|
      type: 'separator',
    |}
  | {|
      text: string, // The text used for filtering
      value: string, // The value to show on screen
      onClick?: () => void, // If defined, will be called when the item is clicked. onChange/onChoose won't be called.
      renderLeftIcon?: ?() => React.Element<typeof ListIcon>,
      renderRightIcon?: ?() => React.Element<typeof ListIcon>,
    |}
>;

type Props = {|
  value: string,
  onChange: string => void,
  onChoose?: string => void, // Optionally called when Enter pressed or item clicked.
  dataSource: DataSource,

  // Some AutoComplete props that can be reused:
  id?: string,
  onBlur?: (event: {|
    currentTarget: {|
      value: string,
    |},
  |}) => void,
  errorText?: React.Node,
  disabled?: boolean,
  floatingLabelText?: ?React.Node,
  hintText?: React.Node,
  fullWidth?: boolean,
  textFieldStyle?: Object,
  menuProps?: {|
    maxHeight?: number,
  |},
  popoverProps?: {
    canAutoPosition?: boolean,
  },
  filter?: (string, string) => boolean,
  openOnFocus?: boolean,
|};

/**
 * Provides props for material-ui AutoComplete components that specify
 * sensible defaults for size and popover size/positioning.
 */
const defaultAutocompleteProps = {
  fullWidth: true,
  textFieldStyle: {
    minWidth: 300,
  },
  menuProps: {
    maxHeight: 250,
  },
  popoverProps: {
    // Ensure that the Popover menu is always visible on screen
    canAutoPosition: true,
  },
  filter: fuzzyOrEmptyFilter,
};

/**
 * This component works like a material-ui AutoComplete, except that
 * the value passed as props is not forced into the text field when the user
 * is typing. This is useful if the parent component can do modifications on the value:
 * the user won't be interrupted or have the value changed until he blurs the field.
 */
export default class SemiControlledAutoComplete extends React.Component<
  Props,
  State
> {
  state = { focused: false, text: null };
  _field: ?AutoComplete;

  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    const {
      floatingLabelText,
      value,
      onChange,
      onChoose,
      dataSource,
      onBlur,
      ...otherProps
    } = this.props;

    return (
      <AutoComplete
        {...defaultAutocompleteProps}
        {...otherProps}
        floatingLabelText={floatingLabelText}
        searchText={this.state.focused ? this.state.text : value}
        onFocus={() => {
          this.setState({
            focused: true,
            text: value,
          });
        }}
        onUpdateInput={value => {
          this.setState({
            focused: true,
            text: value,
          });
        }}
        onBlur={event => {
          onChange(event.currentTarget.value);
          this.setState({
            focused: false,
            text: null,
          });

          if (onBlur) onBlur(event);
        }}
        onNewRequest={data => {
          if (data.onClick) {
            data.onClick();
            return;
          } else if (
            data.value &&
            data.value.props &&
            typeof data.value.props.value === 'string'
          ) {
            const callback = onChoose || onChange;
            callback(data.value.props.value);
          } else {
            console.error(
              'SemiControlledAutoComplete internal error: no value could be found. This must be fixed and can be due to an upgrade in Material UI or the way data source is created'
            );
          }
          this.focus(); // Keep the focus after choosing an item
        }}
        dataSource={dataSource.map(item => {
          if (item.type === 'separator') {
            return {
              text: '',
              value: <Divider />,
            };
          }

          // Encapsulate everything in a MenuItem
          // (which is what material-ui is doing anyway),
          // to get a consistent experience.
          return {
            text: item.text,
            value: (
              <MenuItem
                primaryText={item.value}
                rightIcon={
                  item.renderRightIcon ? item.renderRightIcon() : undefined
                }
                leftIcon={
                  item.renderLeftIcon ? item.renderLeftIcon() : undefined
                }
                value={item.value}
              />
            ),
            onClick: item.onClick,
          };
        })}
        ref={field => (this._field = field)}
      />
    );
  }
}
