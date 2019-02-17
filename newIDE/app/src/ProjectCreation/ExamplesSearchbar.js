// @flow
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import { mapVector } from '../Utils/MapFor';
import Chip from 'material-ui/Chip';
import TextField from 'material-ui/TextField';
import { Column } from '../UI/Grid';
import randomColor from 'randomcolor';
const gd = global.gd;

type Props = {|
  value: string,
  onChange: string => void,
  chosenExtensionName: string,
  onExtensionNameChosen: string => void,
|};

const styles = {
  chip: {
    margin: 2,
  },
  chipsList: {
    display: 'flex',
    flexWrap: 'wrap',
  },
};

const getChipColor = (extensionName: string) => {
  return randomColor({
    seed: extensionName,
    luminosity: 'light',
  });
};

export default class ExamplesSearchbar extends Component<Props> {
  _chips: Array<{ text: string, value: string }> = [];
  _textField: ?TextField;

  constructor(props: Props) {
    super(props);

    const extensions = gd.JsPlatform.get().getAllPlatformExtensions();
    this._chips = mapVector(extensions, extension => {
      if (
        extension.isBuiltin() ||
        extension.getFullName().indexOf('(deprecated)') !== -1
      )
        return null;

      return {
        text: extension.getFullName(),
        value: extension.getName(),
      };
    }).filter(Boolean);
  }

  componentDidMount() {
    if (this._textField) this._textField.focus();
  }

  render() {
    const {
      chosenExtensionName,
      onExtensionNameChosen,
      value,
      onChange,
    } = this.props;
    return (
      <Column noMargin>
        <TextField
          fullWidth
          hintText={<Trans>Search in examples</Trans>}
          id="examples-searchbar"
          value={value}
          onChange={(e, value) => {
            onChange(value);
          }}
          ref={textField => (this._textField = textField)}
        />
        <div style={styles.chipsList}>
          {this._chips.map(({ text, value }) => (
            <Chip
              key={value}
              labelColor={
                !chosenExtensionName || chosenExtensionName === value
                  ? 'black'
                  : undefined
              }
              backgroundColor={
                !chosenExtensionName || chosenExtensionName === value
                  ? getChipColor(value)
                  : undefined
              }
              style={styles.chip}
              onClick={() =>
                onExtensionNameChosen(
                  chosenExtensionName === value ? '' : value
                )
              }
            >
              {text}
            </Chip>
          ))}
        </div>
      </Column>
    );
  }
}
