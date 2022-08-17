// @flow
import { t } from '@lingui/macro';

import * as React from 'react';
import { makeStyles } from '@material-ui/styles';
import IconButton from './IconButton';
import TextField from './TextField';
import Paper from '@material-ui/core/Paper';
import {
  Collapse,
  Typography,
  TextField as MuiTextField,
} from '@material-ui/core';
import Close from '@material-ui/icons/Close';
import Search from '@material-ui/icons/Search';
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
import GDevelopThemeContext from './Theme/ThemeContext';

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

const getStyles = (value: ?string, disabled?: boolean) => {
  const nonEmpty = !!value && value.length > 0;

  return {
    root: {
      height: 30,
      display: 'flex',
      flex: 1,
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
      position: 'relative',
      margin: 'auto 8px',
      width: '100%',
    },
  };
};

const useAutocompleteStyles = makeStyles(
  ({
    palette: {
      text: { primary },
    },
  }) => ({
    // We can't change the label opacity directly as it also changes the
    // opacity of the background. Colors are stored in the themes as hex
    // (#A3B or #AE345B) so we need to add the alpha channel to control
    // opacity.
    groupLabel: { color: `${primary}${primary.length > 4 ? '88' : '8'}` },
  })
);

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

    const gdevelopTheme = React.useContext(GDevelopThemeContext);

    // This variable represents the content of the input (text field)
    const [value, setValue] = React.useState<string>(parentValue);
    // This variable represents the value of the autocomplete, used to
    // highlight an option and to determine if an option is selectable, or
    // if an event should be fired when an option is selected.
    const [autocompleteValue, setAutocompleteValue] = React.useState<string>(
      parentValue
    );

    const textField = React.useRef<?TextField>(null);

    const styles = getStyles(value, disabled);
    const autocompleteStyles = useAutocompleteStyles();

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
    const previousChosenTagsCount = React.useRef<number>(0);
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

    React.useEffect(() => {
      previousChosenTagsCount.current = tagsHandler
        ? tagsHandler.chosenTags.size
        : 0;
    });

    const handleBlur = () => {
      if (!value || value.trim() === '') {
        changeValue('');
      }
    };

    const handleInput = (e: {| target: {| value: string |} |}) => {
      changeValue(e.target.value);
    };

    const handleCancel = () => {
      changeValue('');
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
        changeValue('');
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
              <Paper
                style={{
                  backgroundColor: gdevelopTheme.searchBar.backgroundColor,
                  ...styles.root,
                }}
                square={aspect === 'integrated-search-bar'}
                elevation={0}
              >
                <div style={styles.searchContainer}>
                  {tags ? (
                    <Autocomplete
                      id={id}
                      options={tags}
                      groupBy={options => i18n._(t`Apply a filter`)}
                      classes={autocompleteStyles}
                      freeSolo
                      fullWidth
                      defaultValue=""
                      inputValue={value}
                      value={autocompleteValue}
                      onChange={handleAutocompleteInput}
                      onInputChange={handleAutocompleteInputChange}
                      onKeyPress={handleKeyPressed}
                      onBlur={handleBlur}
                      renderOption={option => <Typography>{option}</Typography>}
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
                      style={styles.input}
                      underlineShow={false}
                      disabled={disabled}
                      ref={textField}
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
            </Line>
            {tagsHandler && (
              <Collapse in={tagsHandler.chosenTags.size > 0}>
                <TagChips
                  tags={Array.from(tagsHandler.chosenTags)}
                  onRemove={tag => tagsHandler.remove(tag)}
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
