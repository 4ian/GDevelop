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

const getStyles = (value: string, disabled?: boolean) => {
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

export type SearchBarInterface = {|
  focus: () => void,
  blur: () => void,
|};

/**
 * Material design search bar,
 * inspired from https://github.com/TeamWertarbyte/material-ui-search-bar
 *
 * Customized to add optional tags button.
 */
const SearchBar = React.forwardRef<Props, SearchBarInterface>(
  (
    {
      disabled,
      placeholder,
      onChange,
      onRequestSearch,
      style,
      value: parentValue,
      buildTagsMenuTemplate,
      helpPagePath,
    },
    ref
  ) => {
    React.useImperativeHandle(ref, () => ({
      focus,
      blur,
    }));
    const focus = () => {
      if (textField.current) {
        textField.current.focus();
      }
    };
    const blur = () => {
      if (textField.current) {
        textField.current.blur();
      }
    };

    const [value, setValue] = React.useState<string>(parentValue);

    const textField = React.useRef<?TextField>(null);

    const styles = getStyles(value, disabled);

    React.useEffect(
      () => {
        setValue(parentValue);
      },
      [parentValue]
    );

    const handleBlur = () => {
      if (value.trim().length === 0) {
        setValue('');
      }
    };

    const handleInput = (e: {| target: {| value: string |} |}) => {
      setValue(e.target.value);
      onChange && onChange(e.target.value);
    };

    const handleCancel = () => {
      setValue('');
      onChange && onChange('');
    };

    const handleKeyPressed = (event: SyntheticKeyboardEvent<>) => {
      if (shouldValidate(event)) {
        onRequestSearch(value);
      }
    };

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
                hintText={placeholder || t`Search`}
                onBlur={handleBlur}
                value={value}
                onChange={handleInput}
                onKeyUp={handleKeyPressed}
                fullWidth
                style={styles.input}
                underlineShow={false}
                disabled={disabled}
                ref={textField}
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
              onClick={handleCancel}
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
);

export default SearchBar;

export const useShouldAutofocusSearchbar = () => {
  // Note: this is not a React hook but is named as one to encourage
  // components to use it as such, so that it could be reworked
  // at some point to use a context (verify in this case all usages).
  const isTouchscreen = useScreenType() === 'touch';
  return !isTouchscreen;
};
