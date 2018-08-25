// @flow
import React, { Component } from 'react';
import { mapVector } from '../Utils/MapFor';
import Chip from 'material-ui/Chip';
import TextField from 'material-ui/TextField';
import { Column } from '../UI/Grid';
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

const basicHashCode = (str: string) => {
  var hash = 0,
    i,
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

const getChipColor = (extensionName: string) => {
  const hash = Math.abs(basicHashCode(extensionName));

  return `rgb(${130 + hash % 70}, ${130 + hash % 110}, 240)`;
};

export default class ExamplesSearchbar extends Component<Props> {
  _chips: Array<{ text: string, value: string }> = [];

  constructor(props: Props) {
    super(props);

    const extensions = gd.JsPlatform.get().getAllPlatformExtensions();
    this._chips = mapVector(extensions, extension => {
      if (extension.isBuiltin()) return null;

      return {
        text: extension.getFullName(),
        value: extension.getName(),
      };
    }).filter(extension => !!extension);
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
          hintText="Search in examples"
          id="examples-searchbar"
          value={value}
          onChange={(e, value) => {
            onChange(value);
          }}
        />
        <div style={styles.chipsList}>
          {this._chips.map(({ text, value }) => (
            <Chip
              key={value}
              backgroundColor={
                !chosenExtensionName || chosenExtensionName === value
                  ? getChipColor(value)
                  : undefined
              }
              style={styles.chip}
              onClick={() =>
                onExtensionNameChosen(
                  chosenExtensionName === value ? '' : value
                )}
            >
              {text}
            </Chip>
          ))}
        </div>
      </Column>
    );
  }
}
