// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import Close from 'material-ui/svg-icons/navigation/close';
import Search from 'material-ui/svg-icons/action/search';
import FilterList from 'material-ui/svg-icons/content/filter-list';
import IconMenu from './Menu/IconMenu';

type Props = {|
  /** Disables text field. */
  disabled?: boolean,
  /** Sets placeholder for the embedded text field. */
  placeholder?: ?React.Node,
  /** Fired when the text value changes. */
  onChange?: string => void,
  /** Fired when the search icon is clicked. */
  onRequestSearch: string => void,
  /** Override the inline-styles of the root element. */
  style?: Object,
  /** The value of the text field. */
  value: string,
  /** If tags are supported, the function to list the tags menu */
  buildTagsMenuTemplate?: () => any,
|};

type State = {|
  focus: boolean,
  value: string,
  active: boolean,
|};

const getStyles = (props: Props, state: State) => {
  const { disabled } = props;
  const { value } = state;
  const nonEmpty = value.length > 0;

  return {
    root: {
      height: 48,
      display: 'flex',
      justifyContent: 'space-between',
    },
    iconButtonClose: {
      style: {
        opacity: !disabled ? 0.54 : 0.38,
        transform: nonEmpty ? 'scale(1, 1)' : 'scale(0, 0)',
        transition: 'transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
      iconStyle: {
        opacity: nonEmpty ? 1 : 0,
        transition: 'opacity 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
    },
    iconButtonSearch: {
      style: {
        opacity: !disabled ? 0.54 : 0.38,
        transform: nonEmpty ? 'scale(0, 0)' : 'scale(1, 1)',
        transition: 'transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
        marginRight: -48,
      },
      iconStyle: {
        opacity: nonEmpty ? 0 : 1,
        transition: 'opacity 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
    },
    iconButtonFilter: {
      style: {
        opacity: !disabled ? 0.54 : 0.38,
      },
      iconStyle: {},
    },
    input: {
      width: '100%',
    },
    searchContainer: {
      margin: 'auto 16px',
      width: '100%',
    },
  };
};

/**
 * Material design search bar,
 * inspired from https://github.com/TeamWertarbyte/material-ui-search-bar
 *
 * Customized to add optional tags button.
 */
export default class SearchBar extends React.Component<Props, State> {
  state = {
    focus: false,
    value: this.props.value,
    active: false,
  };
  _textField = React.createRef<TextField>();

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.value !== nextProps.value) {
      this.setState({ ...this.state, value: nextProps.value });
    }
  }

  focus = () => {
    if (this._textField.current) {
      this._textField.current.focus();
    }
  };

  blur = () => {
    if (this._textField.current) {
      this._textField.current.blur();
    }
  };

  handleFocus = () => {
    this.setState({ focus: true });
  };

  handleBlur = () => {
    this.setState({ focus: false });
    if (this.state.value.trim().length === 0) {
      this.setState({ value: '' });
    }
  };

  handleInput = (e: { target: { value: string } }) => {
    this.setState({ value: e.target.value });
    this.props.onChange && this.props.onChange(e.target.value);
  };

  handleCancel = () => {
    this.setState({ active: false, value: '' });
    this.props.onChange && this.props.onChange('');
  };

  handleKeyPressed = (e: { charCode: number, key: string }) => {
    if (e.charCode === 13 || e.key === 'Enter') {
      this.props.onRequestSearch(this.state.value);
    }
  };

  render() {
    const styles = getStyles(this.props, this.state);
    const { value } = this.state;
    const { disabled, style, buildTagsMenuTemplate } = this.props;

    return (
      <Paper
        style={{
          ...styles.root,
          ...style,
        }}
      >
        <div style={styles.searchContainer}>
          <TextField
            hintText={this.props.placeholder || <Trans>Search</Trans>}
            onBlur={this.handleBlur}
            value={value}
            onChange={this.handleInput}
            onKeyUp={this.handleKeyPressed}
            onFocus={this.handleFocus}
            fullWidth
            style={styles.input}
            underlineShow={false}
            disabled={disabled}
            ref={this._textField}
          />
        </div>
        {buildTagsMenuTemplate && (
          <IconMenu
            iconButtonElement={
              <IconButton
                style={styles.iconButtonFilter.style}
                disabled={disabled}
              >
                <FilterList style={styles.iconButtonFilter.iconStyle} />
              </IconButton>
            }
            buildMenuTemplate={buildTagsMenuTemplate}
          />
        )}
        <IconButton style={styles.iconButtonSearch.style} disabled={disabled}>
          <Search style={styles.iconButtonSearch.iconStyle} />
        </IconButton>
        <IconButton
          onClick={this.handleCancel}
          style={styles.iconButtonClose.style}
          disabled={disabled}
        >
          <Close style={styles.iconButtonClose.iconStyle} />
        </IconButton>
      </Paper>
    );
  }
}
