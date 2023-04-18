// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { t } from '@lingui/macro';
import MuiTextField from '@material-ui/core/TextField';
import { indexName, searchClient } from '../Utils/AlgoliaSearch';
import {
  InstantSearch,
  useInstantSearch,
  useSearchBox,
} from 'react-instantsearch-hooks';
import SearchBarContainer from './SearchBarContainer';
import Autocomplete from '@material-ui/lab/Autocomplete/Autocomplete';
import { useDebounce } from '../Utils/UseDebounce';
import { type GoToWikiCommand } from '../CommandPalette/CommandManager';
import Window from '../Utils/Window';
import { type AlgoliaSearchHit as AlgoliaSearchHitType } from '../Utils/AlgoliaSearch';
import { AlgoliaSearchHit } from '../CommandPalette/CommandPalette/AutocompletePicker';

type Props = {|
  id?: string,
|};

const WikiSearchBar = ({ id }: Props) => {
  const [autocompleteValue, setAutocompleteValue] = React.useState<string>('');
  const [value, setValue] = React.useState<string>('');
  const [isInputFocused, setIsInputFocused] = React.useState<boolean>(false);
  const handleBlur = () => {
    setIsInputFocused(false);
    if (!value || value.trim() === '') {
      setValue('');
    }
  };
  const [
    algoliaSearchStableStatus,
    setAlgoliaSearchStableStatus,
  ] = React.useState<'error' | 'ok'>('ok');

  const { results, status } = useInstantSearch();
  const { refine } = useSearchBox();

  React.useEffect(
    () => {
      if (algoliaSearchStableStatus === 'ok' && status === 'error') {
        setAlgoliaSearchStableStatus('error');
      } else if (algoliaSearchStableStatus === 'error' && status === 'idle') {
        setAlgoliaSearchStableStatus('ok');
      }
    },
    [status, algoliaSearchStableStatus]
  );

  const shouldHideAlgoliaSearchResults =
    !value || algoliaSearchStableStatus === 'error';

  const launchSearch = useDebounce(() => {
    if (value) {
      refine(value);
    }
  }, 200);

  React.useEffect(launchSearch, [value, launchSearch]);

  const handleFocus = () => {
    setIsInputFocused(true);
  };

  const nonEmpty = !!value && value.length > 0;

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
      newValue.handler()
      // Clear the value that was entered as an option was selected.
      setAutocompleteValue('');
    } else {
      setAutocompleteValue(newValue || '');
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
      setValue('');
    } else {
      setValue(newValue || '');
    }
  };

  const commands: Array<GoToWikiCommand> = React.useMemo(
    () => {
      if (shouldHideAlgoliaSearchResults) return [];

      const algoliaCommands: Array<GoToWikiCommand> = results.hits.map(
        (hit: AlgoliaSearchHitType) => {
          return {
            hit,
            handler: () => Window.openExternalURL(hit.url),
          };
        }
      );
      return algoliaCommands;
    },
    [results.hits, shouldHideAlgoliaSearchResults]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <SearchBarContainer
          isFocused={isInputFocused}
          isSearchBarEmpty={!nonEmpty}
          onCancel={() => setValue('')}
          renderContent={({ inputStyle, popperContainerStyle }) => (
            <Autocomplete
              id={id}
              options={commands}
              freeSolo
              fullWidth
              defaultValue=""
              inputValue={value}
              value={autocompleteValue}
              getOptionLabel={() => 'bonjour'}
              onChange={handleAutocompleteInput}
              onInputChange={handleAutocompleteInputChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              PopperComponent={props => (
                <div style={popperContainerStyle}>{props.children}</div>
              )}
              renderOption={({ hit }) => <AlgoliaSearchHit hit={hit} />}
              renderInput={params => (
                <MuiTextField
                  margin="none"
                  {...params}
                  InputProps={{
                    ...params.InputProps,
                    disableUnderline: true,
                    endAdornment: null,
                    placeholder: i18n._(t`Search GDevelop wiki`),
                    style: inputStyle,
                  }}
                />
              )}
            />
          )}
        />
      )}
    </I18n>
  );
};

const WikiSearchBarWithAlgoliaSearch = (props: Props) => (
  <InstantSearch searchClient={searchClient} indexName={indexName}>
    <WikiSearchBar {...props} />
  </InstantSearch>
);

export default WikiSearchBarWithAlgoliaSearch;
