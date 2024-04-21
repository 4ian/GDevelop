// @flow
import { t } from '@lingui/macro';

import * as React from 'react';
import TextField, { type TextFieldInterface } from './TextField';
import Collapse from '@material-ui/core/Collapse';
import MuiTextField from '@material-ui/core/TextField';
import Text from './Text';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { useShouldAutofocusInput } from './Responsive/ScreenTypeMeasurer';
import { shouldValidate } from './KeyboardShortcuts/InteractionKeys';
import TagChips from './TagChips';
import { I18n } from '@lingui/react';
import { useDebounce } from '../Utils/UseDebounce';
import SearchBarContainer from './SearchBarContainer';
import { useResponsiveWindowSize } from './Responsive/ResponsiveWindowMeasurer';

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
  autoFocus?: 'desktop' | 'desktopAndMobileDevices',
|};

export type SearchBarInterface = {|
  focus: () => void,
  blur: () => void,
|};

const noop = () => {};

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
      autoFocus,
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
    const { isMobile } = useResponsiveWindowSize();

    const [isInputFocused, setIsInputFocused] = React.useState(false);

    // This variable represents the content of the input (text field)
    const [value, setValue] = React.useState<string>(parentValue);
    // This variable represents the value of the autocomplete, used to
    // highlight an option and to determine if an option is selectable, or
    // if an event should be fired when an option is selected.
    const [autocompleteValue, setAutocompleteValue] = React.useState<string>(
      parentValue
    );

    const textField = React.useRef<?TextFieldInterface>(null);

    const nonEmpty = !!value && value.length > 0;
    const debouncedOnChange = useDebounce(onChange ? onChange : noop, 250);

    const changeValueDebounced = React.useCallback(
      (newValue: string) => {
        setValue(newValue);
        debouncedOnChange(newValue);
      },
      [debouncedOnChange, setValue]
    );

    const changeValueImmediately = React.useCallback(
      (newValue: string) => {
        setValue(newValue);
        onChange && onChange(newValue);
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

    const shouldAutofocusSearchbar = useShouldAutofocusInput();
    const shouldAutoFocusTextField = !autoFocus
      ? false
      : autoFocus === 'desktopAndMobileDevices'
      ? true
      : shouldAutofocusSearchbar;
    const previousChosenTagsCount = React.useRef<number>(
      tagsHandler ? tagsHandler.chosenTags.size : 0
    );
    React.useEffect(
      () => {
        // Used to focus search bar when all tags have been removed.
        // It is convenient when using keyboard to remove all tags and
        // quickly get back to the text field.
        if (
          shouldAutoFocusTextField &&
          tagsHandler &&
          tagsHandler.chosenTags.size === 0 &&
          previousChosenTagsCount.current > 0
        )
          focus();
      },
      [tagsHandler, shouldAutoFocusTextField]
    );

    const handleBlur = () => {
      setIsInputFocused(false);
      if (!value || value.trim() === '') {
        changeValueImmediately('');
      }
    };

    const handleFocus = () => {
      setIsInputFocused(true);
    };

    const handleInput = (e: {| target: {| value: string |} |}) => {
      changeValueDebounced(e.target.value);
    };

    const handleCancel = () => {
      changeValueImmediately('');
      if (!isMobile) focus();
    };

    const handleKeyPressed = (event: SyntheticKeyboardEvent<>) => {
      if (shouldValidate(event)) {
        onRequestSearch(value);
      }
    };

    // --- Autocomplete-specific handlers ---

    const handleAutocompleteInput = (
      event: any,
      newValue: ?string,
      reason:
        | 'create-option'
        | 'select-option'
        | 'remove-option'
        | 'blur'
        | 'clear'
    ) => {
      // Called when the value of the autocomplete changes.
      if (reason === 'select-option') {
        tagsHandler && tagsHandler.add(newValue || '');

        // Clear the value that was entered as an option was selected.
        changeValueImmediately('');

        // Clear this value to make sure the autocomplete doesn't keep the
        // last typed value in memory.
        setAutocompleteValue('');
      } else {
        changeValueImmediately(newValue || '');
      }
    };

    const handleAutocompleteInputChange = (
      event: any,
      newValue: ?string,
      reason: 'reset' | 'input' | 'clear'
    ) => {
      // Called when the value of the input within the autocomplete changes.
      if (reason === 'reset') {
        // Happens when user selects an option. Do as for 'select-option':
        // Clear the value that was entered as an option was selected.
        changeValueImmediately('');

        // Clear this value to make sure the autocomplete doesn't keep the
        // last typed value in memory.
        setAutocompleteValue('');
      } else {
        changeValueDebounced(newValue || '');
      }
    };

    return (
      <I18n>
        {({ i18n }) => (
          <SearchBarContainer
            onCancel={handleCancel}
            isFocused={isInputFocused}
            disabled={disabled}
            isSearchBarEmpty={!nonEmpty}
            helpPagePath={helpPagePath}
            aspect={aspect}
            buildMenuTemplate={buildMenuTemplate}
            renderSubLine={
              tagsHandler
                ? () => (
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
                  )
                : null
            }
            renderContent={({ inputStyle, popperContainerStyle }) =>
              tags ? (
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
                    <div style={popperContainerStyle}>{props.children}</div>
                  )}
                  renderOption={option => <Text noMargin>{option}</Text>}
                  renderInput={params => (
                    <MuiTextField
                      margin="none"
                      {...params}
                      autoFocus={shouldAutoFocusTextField}
                      inputRef={textField}
                      InputProps={{
                        ...params.InputProps,
                        disableUnderline: true,
                        endAdornment: null,
                        placeholder: i18n._(placeholder || t`Search`),
                        style: inputStyle,
                      }}
                    />
                  )}
                />
              ) : (
                <TextField
                  id={id}
                  margin="none"
                  dataset={{ searchBar: 'true' }}
                  translatableHintText={placeholder || t`Search`}
                  onBlur={handleBlur}
                  value={value}
                  onChange={handleInput}
                  onKeyUp={handleKeyPressed}
                  fullWidth
                  underlineShow={false}
                  disabled={disabled}
                  ref={textField}
                  inputStyle={inputStyle}
                  onFocus={handleFocus}
                  autoFocus={autoFocus}
                />
              )
            }
          />
        )}
      </I18n>
    );
  }
);

export default SearchBar;
