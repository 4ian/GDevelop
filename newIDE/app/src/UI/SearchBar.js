// @flow
import { t } from '@lingui/macro';

import * as React from 'react';
import IconButton from './IconButton';
import TextField from './TextField';
import Paper from '@material-ui/core/Paper';
import Close from '@material-ui/icons/Close';
import Search from '@material-ui/icons/Search';
import FilterList from '@material-ui/icons/FilterList';
import ElementWithMenu from './Menu/ElementWithMenu';
import ThemeConsumer from './Theme/ThemeConsumer';
import HelpIcon from './HelpIcon';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { useScreenType } from './Reponsive/ScreenTypeMeasurer';
import { shouldValidate } from './KeyboardShortcuts/InteractionKeys';

type Props = {|
  /** Disables text field. */
  disabled?: boolean,
  /** Sets placeholder for the embedded text field. */
  placeholder?: MessageDescriptor,
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
  /** If defined, a help icon button redirecting to this page will be shown */
  helpPagePath?: ?string,
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
      height: 30,
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
        marginRight: -30,
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
    },
    iconButtonHelp: {
      style: {
        opacity: !disabled ? 0.54 : 0.38,
      },
    },
    input: {
      width: '100%',
    },
    searchContainer: {
      top: -1,
      position: 'relative',
      margin: 'auto 8px',
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
export default class SearchBar extends React.PureComponent<Props, State> {
  state: State = {
    focus: false,
    value: this.props.value,
    active: false,
  };
  _textField: {| current: null | TextField |} = React.createRef<TextField>();

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.value !== nextProps.value) {
      this.setState({ ...this.state, value: nextProps.value });
    }
  }

  focus: () => void = () => {
    if (this._textField.current) {
      this._textField.current.focus();
    }
  };

  blur: () => void = () => {
    if (this._textField.current) {
      this._textField.current.blur();
    }
  };

  handleFocus: () => void = () => {
    this.setState({ focus: true });
  };

  handleBlur: () => void = () => {
    this.setState({ focus: false });
    if (this.state.value.trim().length === 0) {
      this.setState({ value: '' });
    }
  };

  handleInput: (e: {| target: {| value: string |} |}) => void = (e: {|
    target: {| value: string |},
  |}) => {
    this.setState({ value: e.target.value });
    this.props.onChange && this.props.onChange(e.target.value);
  };

  handleCancel: () => void = () => {
    this.setState({ active: false, value: '' });
    this.props.onChange && this.props.onChange('');
  };

  handleKeyPressed: (event: SyntheticKeyboardEvent<>) => void = (
    event: SyntheticKeyboardEvent<>
  ) => {
    if (shouldValidate(event)) {
      this.props.onRequestSearch(this.state.value);
    }
  };

  render(): React.Node {
    const styles = getStyles(this.props, this.state);
    const { value } = this.state;
    const { disabled, style, buildTagsMenuTemplate, helpPagePath } = this.props;

    return (
      <ThemeConsumer>
        {muiTheme => (
          <Paper
            style={{
              backgroundColor: muiTheme.searchBar.backgroundColor,
              ...styles.root,
              ...style,
            }}
            square
            elevation={1}
          >
            <div style={styles.searchContainer}>
              <TextField
                margin="none"
                hintText={this.props.placeholder || t`Search`}
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
              <ElementWithMenu
                element={
                  <IconButton
                    style={styles.iconButtonFilter.style}
                    disabled={disabled}
                    size="small"
                  >
                    <FilterList />
                  </IconButton>
                }
                buildMenuTemplate={buildTagsMenuTemplate}
              />
            )}
            {helpPagePath && (
              <HelpIcon
                disabled={disabled}
                helpPagePath={helpPagePath}
                style={styles.iconButtonHelp.style}
                size="small"
              />
            )}
            <IconButton
              style={styles.iconButtonSearch.style}
              disabled={disabled}
              size="small"
            >
              <Search style={styles.iconButtonSearch.iconStyle} />
            </IconButton>
            <IconButton
              onClick={this.handleCancel}
              style={styles.iconButtonClose.style}
              disabled={disabled}
              size="small"
            >
              <Close style={styles.iconButtonClose.iconStyle} />
            </IconButton>
          </Paper>
        )}
      </ThemeConsumer>
    );
  }
}

export const useShouldAutofocusSearchbar = (): boolean => {
  // Note: this is not a React hook but is named as one to encourage
  // components to use it as such, so that it could be reworked
  // at some point to use a context (verify in this case all usages).
  const isTouchscreen = useScreenType() === 'touch';
  return !isTouchscreen;
};
