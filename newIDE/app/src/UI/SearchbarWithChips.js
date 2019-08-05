// @flow
import React, { Component } from 'react';
import Chip from 'material-ui/Chip';
import TextField from 'material-ui/TextField';
import { Column, Line } from '../UI/Grid';
import randomColor from 'randomcolor';
import SearchBar from '../UI/SearchBar';

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
  _textField: ?TextField;

  componentDidMount() {
    if (this._textField) this._textField.focus();
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
          ref={textField => (this._textField = textField)}
        />
        <Line>
          <Column>
            <div style={styles.chipsList}>
              {chips &&
                chips.map(({ text, value }) => (
                  <Chip
                    key={value}
                    labelColor={
                      !chosenChip || chosenChip === value ? 'black' : undefined
                    }
                    backgroundColor={
                      !chosenChip || chosenChip === value
                        ? getChipColor(value)
                        : undefined
                    }
                    style={styles.chip}
                    onClick={() =>
                      onChooseChip(chosenChip === value ? '' : value)
                    }
                  >
                    {text}
                  </Chip>
                ))}
            </div>
          </Column>
        </Line>
      </Column>
    );
  }
}
