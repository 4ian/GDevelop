// @flow
import type { Node } from 'React';
import React, { Component } from 'react';
import { mapVector } from '../Utils/MapFor';
import TextField from '../UI/TextField';
import SearchbarWithChips from '../UI/SearchbarWithChips';
const gd: libGDevelop = global.gd;

type Props = {|
  value: string,
  onChange: string => void,
  chosenExtensionName: string,
  onExtensionNameChosen: string => void,
|};

export default class ExamplesSearchbar extends Component<Props> {
  _chips: Array<{| text: string, value: string |}> = [];
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

  render(): Node {
    const {
      chosenExtensionName,
      onExtensionNameChosen,
      value,
      onChange,
    } = this.props;
    return (
      <SearchbarWithChips
        value={value}
        onChange={onChange}
        chips={this._chips}
        chosenChip={chosenExtensionName}
        onChooseChip={onExtensionNameChosen}
        onRequestSearch={() => {}}
      />
    );
  }
}
