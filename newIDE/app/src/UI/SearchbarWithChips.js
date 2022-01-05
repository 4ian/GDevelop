// @flow
import React, { Component } from 'react';
import Chip from '@material-ui/core/Chip';
import { Column, Line } from '../UI/Grid';
import randomColor from 'randomcolor';
import SearchBar, {
  useShouldAutofocusSearchbar,
  type SearchBarInterface,
} from '../UI/SearchBar';

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

export default class SearchbarWithChips extends Component<Props> {
  _searchBar: ?SearchBarInterface;

  componentDidMount() {
    if (useShouldAutofocusSearchbar() && this._searchBar)
      this._searchBar.focus();
  }

  render() {
    const {
      chosenChip,
      onChooseChip,
      value,
      onChange,
      onRequestSearch,
      chips,
    } = this.props;

    return (
      <Column noMargin>
        <SearchBar
          value={value}
          onRequestSearch={onRequestSearch}
          onChange={value => {
            onChange(value);
          }}
          ref={searchBar => (this._searchBar = searchBar)}
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
                        !chosenChip || chosenChip === value
                          ? 'black'
                          : undefined,
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
  }
}
