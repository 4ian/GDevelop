// @flow
import React from 'react';
import Chip from '@material-ui/core/Chip';
import { Column, Line } from './Grid';
import randomColor from 'randomcolor';
import SearchBar, {
  useShouldAutofocusSearchbar,
  type SearchBarInterface,
} from './SearchBar';

type Props = {|
  value: string,
  onChange: string => void,
  chosenChip: string,
  onChooseChip: string => void,
  chips: ?Array<{| text: string, value: string |}>,
  onRequestSearch: () => void,
|};

const styles = {
  chip: {
    margin: 2,
  },
  chipsList: {
    marginTop: 4,
    display: 'flex',
    flexWrap: 'wrap',
  },
};

const getChipColor = (tag: string) => {
  return randomColor({
    seed: tag,
    luminosity: 'light',
  });
};

const SearchBarWithChips = ({
  value,
  onChange,
  chosenChip,
  onChooseChip,
  chips,
  onRequestSearch,
}: Props) => {
  const searchBar = React.useRef<?SearchBarInterface>(null);
  const shouldAutofocusSearchbar = useShouldAutofocusSearchbar();

  React.useEffect(() => {
    if (shouldAutofocusSearchbar && searchBar.current)
      searchBar.current.focus();
  });

  return (
    <Column noMargin>
      <SearchBar
        value={value}
        onRequestSearch={onRequestSearch}
        onChange={value => {
          onChange(value);
        }}
        ref={searchBar}
      />
      <Line>
        <Column>
          <div style={styles.chipsList}>
            {chips &&
              chips.map(({ text, value }) => (
                <Chip
                  size="small"
                  key={value}
                  style={{
                    ...styles.chip,
                    backgroundColor:
                      !chosenChip || chosenChip === value
                        ? getChipColor(value)
                        : undefined,
                    color:
                      !chosenChip || chosenChip === value ? 'black' : undefined,
                  }}
                  onClick={() =>
                    onChooseChip(chosenChip === value ? '' : value)
                  }
                  label={text}
                />
              ))}
          </div>
        </Column>
      </Line>
    </Column>
  );
};

export default SearchBarWithChips;
