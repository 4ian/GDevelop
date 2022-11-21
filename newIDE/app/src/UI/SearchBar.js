// @flow
import { t } from '@lingui/macro';

import * as React from 'react';
import { makeStyles } from '@material-ui/styles';
import IconButton from './IconButton';
import TextField from './TextField';
import Collapse from '@material-ui/core/Collapse';
import MuiTextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Text from './Text';
import FilterList from '@material-ui/icons/FilterList';
import Autocomplete from '@material-ui/lab/Autocomplete';
import ElementWithMenu from './Menu/ElementWithMenu';
import HelpIcon from './HelpIcon';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { useScreenType } from './Reponsive/ScreenTypeMeasurer';
import { shouldValidate } from './KeyboardShortcuts/InteractionKeys';
import { Column, Line } from './Grid';
import TagChips from './TagChips';
import { I18n } from '@lingui/react';
import Search from './CustomSvgIcons/Search';
import Cross from './CustomSvgIcons/Cross';
import GDevelopThemeContext from './Theme/ThemeContext';
import { type GDevelopTheme } from './Theme';

type TagsHandler = {|
  remove: string => void,
  add: string => void,
  chosenTags: Set<string>,
|};

type Props = {|
  id?: string,
  /** Disables text field. */
  disabled?: boolean,
  /** Sets placeholder for the embedded text field. */
  placeholder?: MessageDescriptor,
  /** Fired when the text value changes. */
  onChange?: string => void,
  /** Fired when the search icon is clicked. */
  onRequestSearch: string => void,
  /** Set if rounding should be applied or not. */
  aspect?: 'integrated-search-bar',
  /** The value of the text field. */
  value: string,
  /** The functions needed to interact with the list of tags displayed below search bar. */
  tagsHandler?: TagsHandler,
  /** Used to display matching tags in dropdown below search bar. */
  tags?: ?Array<string>,
  /** The function to generate the optional menu. */
  buildMenuTemplate?: () => any,
  /** If defined, a help icon button redirecting to this page will be shown. */
  helpPagePath?: ?string,
|};

// Defines the space an icon takes with a button, to place the popper accordingly.
const leftIconSpace = 43;
const rightIconSpace = 33;

const getStyles = ({
  nonEmpty,
  disabled,
  theme,
  aspect,
  focused,
  hasHelpPage,
}: {
  nonEmpty: boolean,
  disabled: boolean,
  theme: GDevelopTheme,
  aspect?: 'integrated-search-bar',
  focused: boolean,
  hasHelpPage: boolean,
}) => {
  const iconOpacity = !disabled ? 1 : 0.38;
  const iconSize = 30;
  return {
    root: {
      height: 30,
      display: 'flex',
      flex: 1,
      justifyContent: 'space-between',
      backgroundColor: disabled
        ? theme.searchBar.backgroundColor.disabled
        : theme.searchBar.backgroundColor.default,
      borderRadius: aspect === 'integrated-search-bar' ? 0 : 4,
    },
    iconButtonClose: {
      style: {
        opacity: iconOpacity,
        visibility: nonEmpty && !disabled ? 'visible' : 'hidden',
        transition: 'visibility 0s linear 0.1s',
      },
    },
    iconButtonSearch: {
      container: {
        padding: '5px 10px',
      },
      iconStyle: {
        fontSize: 18,
        opacity: focused ? 1 : 0.5,
        transition: 'opacity 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
    },
    iconButtonFilter: {
      style: {
        opacity: iconOpacity,
        transform: nonEmpty ? 'translateX(0)' : `translateX(${iconSize}px)`,
        transition: 'transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
    },
    iconButtonHelp: {
      style: {
        opacity: iconOpacity,
        transform: nonEmpty ? 'translateX(0)' : `translateX(${iconSize}px)`,
        transition: 'transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
    },
    inputStyle: {
      padding: 0,
      color: disabled
        ? theme.searchBar.textColor.disabled
        : nonEmpty && focused
        ? theme.searchBar.textColor.focused
        : theme.searchBar.textColor.default,
    },
    searchContainer: {
      position: 'relative',
      margin: 'auto 4px',
      width: '100%',
    },
    popperContainer: {
      left: `-${leftIconSpace}px`,
      right: hasHelpPage ? `-${2 * rightIconSpace}px` : `-${rightIconSpace}px`,
      position: 'absolute',
      zIndex: 1, // Make sure the Popper is above the search bar.
    },
  };
};

// We override the style of paper for the border, as we need access
// to the hover/focus status of the paper to change the border color.
const usePaperStyles = ({ theme, disabled, nonEmpty, focused }) =>
  makeStyles({
    root: {
      border: `1px solid ${
        focused ? theme.searchBar.borderColor.focused : 'transparent'
      }`,
      '&:hover': {
        border:
          !focused &&
          !disabled &&
          `1px solid ${theme.searchBar.borderColor.hovered}`,
      },
    },
  })();

export type SearchBarInterface = {|
  focus: () => void,
  blur: () => void,
|};

/**
 * Material design search bar,
 * inspired from https://github.com/TeamWertarbyte/material-ui-search-bar
 *
 * Customized to add optional menu button and chips corresponding to tags.
 */
const SearchBar = React.forwardRef<Props, SearchBarInterface>(
  (
    {
      id,
      disabled,
      placeholder,
      onChange,
      onRequestSearch,
      value: parentValue,
      aspect,
      tagsHandler,
      tags,
      buildMenuTemplate,
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

    const [isInputFocused, setIsInputFocused] = React.useState(false);

    const GDevelopTheme = React.useContext(GDevelopThemeContext);

    // This variable represents the content of the input (text field)
    const [value, setValue] = React.useState<string>(parentValue);
    // This variable represents the value of the autocomplete, used to
    // highlight an option and to determine if an option is selectable, or
    // if an event should be fired when an option is selected.
    const [autocompleteValue, setAutocompleteValue] = React.useState<string>(
      parentValue
    );

    const textField = React.useRef<?TextField>(null);

    const nonEmpty = !!value && value.length > 0;
    const styles = getStyles({
      nonEmpty,
      disabled: !!disabled,
      theme: GDevelopTheme,
      aspect,
      focused: isInputFocused,
      hasHelpPage: !!helpPagePath,
    });
    const paperStyles = usePaperStyles({
      theme: GDevelopTheme,
      disabled: !!disabled,
      nonEmpty,
      focused: isInputFocused,
    });

    const changeValue = React.useCallback(
      newValue => {
        setValue(newValue || '');
        onChange && onChange(newValue || '');
      },
      [onChange, setValue]
    );

    React.useEffect(
      () => {
        // The value given by the parent has priority: if it changes,
        // the search bar must display it.
        setValue(parentValue);
      },
      [parentValue]
    );

    const shouldAutofocusSearchbar = useShouldAutofocusSearchbar();
    const previousChosenTagsCount = React.useRef<number>(
      tagsHandler ? tagsHandler.chosenTags.size : 0
    );
    React.useEffect(
      () => {
        // Used to focus search bar when all tags have been removed.
        // It is convenient when using keyboard to remove all tags and
        // quickly get back to the text field.
        if (
          shouldAutofocusSearchbar &&
          tagsHandler &&
          tagsHandler.chosenTags.size === 0 &&
          previousChosenTagsCount.current > 0
        )
          focus();
      },
      [tagsHandler, shouldAutofocusSearchbar]
    );

    const handleBlur = () => {
      setIsInputFocused(false);
      if (!value || value.trim() === '') {
        changeValue('');
      }
    };

    const handleFocus = () => {
      setIsInputFocused(true);
    };

    const handleInput = (e: {| target: {| value: string |} |}) => {
      changeValue(e.target.value);
    };

    const handleCancel = () => {
      changeValue('');
      focus();
    };

    const handleKeyPressed = (event: SyntheticKeyboardEvent<>) => {
      if (shouldValidate(event)) {
        onRequestSearch(value);
      }
    };

    // --- Autocomplete-specific handlers ---

    const handleAutocompleteInput = (
      event: any,
      newValue: string,
      reason:
        | 'create-option'
        | 'select-option'
        | 'remove-option'
        | 'blur'
        | 'clear'
    ) => {
      // Called when the value of the autocomplete changes.
      if (reason === 'select-option') {
        tagsHandler && tagsHandler.add(newValue);
      } else {
        changeValue(newValue);
      }
    };

    const handleAutocompleteInputChange = (
      event: any,
      newValue: string,
      reason: 'reset' | 'input' | 'clear'
    ) => {
      // Called when the value of the input within the autocomplete changes.
      if (reason === 'reset') {
        // Happens when user selects an option
        setValue('');
        // Clear this value to make sure the autocomplete doesn't keep the
        // last typed value in memory.
        setAutocompleteValue('');
      } else {
        setValue(newValue);
      }
    };

    return (
      <I18n>
        {({ i18n }) => (
          <Column noMargin>
            <Line noMargin>
              <Paper classes={paperStyles} style={styles.root}>
                <div style={styles.iconButtonSearch.container}>
                  <Search style={styles.iconButtonSearch.iconStyle} />
                </div>
                <div style={styles.searchContainer}>
                  {tags ? (
                    <Autocomplete
                      id={id}
                      options={tags}
                      freeSolo
                      fullWidth
                      defaultValue=""
                      inputValue={value}
                      value={autocompleteValue}
                      onChange={handleAutocompleteInput}
                      onInputChange={handleAutocompleteInputChange}
                      onKeyPress={handleKeyPressed}
                      onBlur={handleBlur}
                      onFocus={handleFocus}
                      getOptionDisabled={option =>
                        option.disabled ||
                        (!!tagsHandler && !!tagsHandler.chosenTags.has(option))
                      }
                      getOptionSelected={(option, _) =>
                        !!tagsHandler && tagsHandler.chosenTags.has(option)
                      }
                      PopperComponent={props => (
                        <div style={styles.popperContainer}>
                          {props.children}
                        </div>
                      )}
                      renderOption={option => <Text noMargin>{option}</Text>}
                      renderInput={params => (
                        <MuiTextField
                          margin="none"
                          {...params}
                          inputRef={textField}
                          InputProps={{
                            ...params.InputProps,
                            disableUnderline: true,
                            endAdornment: null,
                            placeholder: i18n._(placeholder || t`Search`),
                            style: styles.inputStyle,
                          }}
                        />
                      )}
                    />
                  ) : (
                    <TextField
                      id={id}
                      margin="none"
                      translatableHintText={placeholder || t`Search`}
                      onBlur={handleBlur}
                      value={value}
                      onChange={handleInput}
                      onKeyUp={handleKeyPressed}
                      fullWidth
                      underlineShow={false}
                      disabled={disabled}
                      ref={textField}
                      inputStyle={styles.inputStyle}
                      onFocus={handleFocus}
                    />
                  )}
                </div>
                {buildMenuTemplate && (
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
                    buildMenuTemplate={buildMenuTemplate}
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
                  onClick={handleCancel}
                  style={styles.iconButtonClose.style}
                  disabled={disabled}
                  size="small"
                >
                  <Cross />
                </IconButton>
              </Paper>
            </Line>
            {tagsHandler && (
              <Collapse in={tagsHandler.chosenTags.size > 0}>
                <TagChips
                  tags={Array.from(tagsHandler.chosenTags)}
                  onRemove={tag => {
                    if (tagsHandler.chosenTags.size === 1) {
                      // If the last tag is removed, focus the search bar.
                      focus();
                    }
                    tagsHandler.remove(tag);
                  }}
                />
              </Collapse>
            )}
          </Column>
        )}
      </I18n>
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
