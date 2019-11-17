// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import Downshift from 'downshift';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import ListIcon from './ListIcon';
import Popper from '@material-ui/core/Popper';
import muiZIndex from '@material-ui/core/styles/zIndex';
import SvgIcon from '@material-ui/core/SvgIcon';
import ListItemIcon from '@material-ui/core/ListItemIcon';

export type DataSource = Array<
  | {|
      type: 'separator',
    |}
  | {|
      text: string, // The text used for filtering. If empty, item is always shown.
      value: string, // The value to show on screen and to be selected
      onClick?: () => void, // If defined, will be called when the item is clicked. onChange/onChoose won't be called.
      renderIcon?: ?() => React.Element<typeof ListIcon | typeof SvgIcon>,
    |}
>;

const styles = {
  container: {
    position: 'relative',
  },
  inputRoot: {
    flexWrap: 'wrap',
  },
  inputInput: {
    width: 'auto',
    flexGrow: 1,
  },
  menuPopper: {
    // Ensure the popper is above everything (modal, dialog, snackbar, tooltips, etc).
    // There will be only one AutoComplete opened at a time, so it's fair to put the
    // highest z index. If this is breaking, check the z-index of material-ui.
    zIndex: muiZIndex.tooltip + 100,
  },
  menuPaper: {
    marginTop: 8,
    // Limit the size of the menu:
    maxHeight: 250,
    overflowY: 'auto',
  },
};

function renderTextField(textFieldProps) {
  const { InputProps, ...other } = textFieldProps;

  return (
    <TextField
      InputProps={{
        style: styles.inputRoot,
        ...InputProps,
      }}
      // eslint-disable-next-line react/jsx-no-duplicate-props
      inputProps={{
        style: styles.inputInput,
      }}
      {...other}
    />
  );
}

function renderItem(itemProps) {
  const { item, index, menuItemProps, highlightedIndex, selected } = itemProps;

  if (item.type === 'separator') {
    return <Divider key={'separator-' + index} />;
  }

  const isHighlighted = highlightedIndex === index;

  return (
    <MenuItem
      {...menuItemProps}
      dense
      key={
        item.value
          ? 'item-with-value-' + item.value
          : 'item-without-value' + index
      }
      selected={isHighlighted}
      component="div"
      style={{
        fontWeight: selected ? 500 : 400,
      }}
    >
      {item.renderIcon && <ListItemIcon>{item.renderIcon()}</ListItemIcon>}
      {item.value}
    </MenuItem>
  );
}

const filterDataSource = (dataSource: DataSource, inputValue: string) => {
  const lowercaseInputValue = inputValue.toLowerCase();
  return dataSource.filter(item => {
    if (item.type === 'separator') return true;
    if (!item.text) return true;

    return item.text.toLowerCase().indexOf(lowercaseInputValue) !== -1;
  });
};

type Props = {|
  value: string,
  onChange: string => void,
  onChoose?: string => void,
  dataSource: DataSource,

  id?: string,
  onBlur?: (event: {|
    currentTarget: {|
      value: string,
    |},
  |}) => void,
  errorText?: React.Node,
  disabled?: boolean,
  floatingLabelText?: React.Node,
  hintText?: MessageDescriptor | string,
  fullWidth?: boolean,
  margin?: 'none' | 'dense',
  textFieldStyle?: Object,
  openOnFocus?: boolean,
|};

type State = {|
  inputValue: string | null,
|};

/**
 * An autocomplete field, showing options as the user type (or when the user presses down button).
 * Options can be chosen with keyboard or mouse.
 *
 * Supports divider between items and special items with `onClick` prop that when present is called
 * when the item is selected (and value is not changed).
 */
export default class SemiControlledAutoComplete extends React.Component<
  Props,
  State
> {
  _input = React.createRef<HTMLInputElement>();
  state = {
    inputValue: null,
  };

  /**
   * Allow to override the value being written in the autocomplete, if any.
   * Usually you don't want to do that as the point of having a "SemiControlled" auto-complete
   * is that the value being written by the user is the source of truth.
   *
   * In some cases, you want to force a new value when the auto-complete is focused (for example,
   * if you opened a native dialog selector that is going to make the auto-complete focused/blurred/
   * focused again, in a manner that depends on the OS).
   * Call this function to do so.
   *
   * @param newValue The new value to set in the auto complete. If the field is not being focused,
   * nothing will be forced (the value props will be used when the field is focused).
   */
  forceInputValueTo(newValue: string) {
    if (this.state.inputValue !== null) {
      this.setState({
        inputValue: newValue,
      });
    }
  }

  focus() {
    if (this._input.current) this._input.current.focus();
  }

  render() {
    const { props, state } = this;
    const currentInputValue =
      state.inputValue !== null ? state.inputValue : props.value;

    return (
      <I18n>
        {({ i18n }) => (
          <Downshift
            inputValue={currentInputValue}
            onChange={selectedItem => {
              if (selectedItem !== null) {
                if (selectedItem.onClick) {
                  selectedItem.onClick();

                  // Reset the value shown to the current value,
                  // as the menu item clicked is not a "value" to be
                  // chosen.
                  this.setState({
                    inputValue: props.value,
                  });
                } else {
                  // Call onChoose, if available, as this is a real selection
                  // of an item (contrary to onChange, which can be called even
                  // with a partial input when the field is blurred)
                  if (props.onChoose) props.onChoose(selectedItem.value);
                  else props.onChange(selectedItem.value);
                }
              }
            }}
            onInputValueChange={inputValue => {
              this.setState({ inputValue });
            }}
            itemToString={item =>
              item ? (item.type === 'separator' ? '' : item.value) : ''
            }
          >
            {({
              getInputProps,
              getItemProps,
              getLabelProps,
              getMenuProps,

              // Actions:
              closeMenu,
              openMenu,

              // State:
              highlightedIndex,
              inputValue,
              isOpen,
              selectedItem,
            }) => {
              const { onBlur, ...inputProps } = getInputProps({
                placeholder:
                  typeof props.hintText === 'string'
                    ? props.hintText
                    : i18n._(props.hintText),
                disabled: props.disabled,
              });

              // Wrap onBlur to close the menu and commit the changes to the value
              const wrappedOnBlur = event => {
                onBlur(event);

                // Downshift will, after the blur event, reset the state so that the
                // input value is itemToString applied to the selected item - which can
                // be null as we allow whatever value is entered, even an incomplete one.
                // Use a setTimeout to clear the inputValue just after Downshift has
                // changed inputValue.
                // (this is purely "visual", the onChange props is properly called, this
                // being done or not)
                setTimeout(() => {
                  this.setState({
                    inputValue: null,
                  });
                });

                // Also close the menu
                closeMenu();

                // Call onChange with whatever value is entered, even an incomplete one.
                props.onChange(event.currentTarget.value);

                if (props.onBlur) props.onBlur(event);
              };

              const onFocus = event => {
                if (props.openOnFocus) openMenu();
                this.setState({
                  inputValue: props.value,
                });
              };

              return (
                <div
                  style={{
                    ...styles.container,
                    flexGrow: props.fullWidth ? 1 : undefined,
                  }}
                >
                  {renderTextField({
                    disabled: props.disabled,
                    label: props.floatingLabelText,
                    id: props.id,

                    // Error handling:
                    error: !!props.errorText,
                    helperText: props.errorText,

                    // Display:
                    InputLabelProps: getLabelProps({ shrink: true }),

                    // Events:
                    InputProps: {
                      // We wrap the onBlur/onFocus as we're a "semi controlled" field
                      onBlur: wrappedOnBlur,
                      onFocus: onFocus,
                    },

                    // Props for the input field from downshift:
                    inputProps,

                    // Style:
                    style: props.textFieldStyle,
                    fullWidth: props.fullWidth,
                    variant: props.margin === 'none' ? 'standard' : 'filled',
                    margin: props.margin || 'dense',

                    inputRef: this._input,
                  })}
                  <Popper
                    open={isOpen}
                    anchorEl={this._input.current}
                    style={styles.menuPopper}
                  >
                    <div
                      {...(isOpen
                        ? getMenuProps({}, { suppressRefError: true })
                        : {})}
                    >
                      {isOpen ? (
                        <Paper
                          style={{
                            ...styles.menuPaper,
                            width: this._input.current
                              ? this._input.current.clientWidth
                              : undefined,
                          }}
                          square
                        >
                          {filterDataSource(props.dataSource, inputValue).map(
                            (item, index) =>
                              renderItem({
                                item,
                                index,
                                menuItemProps: getItemProps({ item, index }),
                                highlightedIndex,
                                selected: item === selectedItem,
                              })
                          )}
                        </Paper>
                      ) : null}
                    </div>
                  </Popper>
                </div>
              );
            }}
          </Downshift>
        )}
      </I18n>
    );
  }
}
