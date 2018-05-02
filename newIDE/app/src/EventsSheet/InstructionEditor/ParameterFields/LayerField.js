// @flow
import React, { Component } from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import { mapFor } from '../../../Utils/MapFor';
import { type ParameterFieldProps } from './ParameterFieldProps.flow';
import { defaultAutocompleteProps } from '../../../UI/AutocompleteProps';

const fuzzyFilterOrEmpty = (searchText, key) => {
  return !key || AutoComplete.fuzzyFilter(searchText, key);
};

type State = {|
  focused: boolean,
  text: ?string,
|};

export default class LayerField extends Component<ParameterFieldProps, State> {
  state = { focused: false, text: null };

  _description: ?string;
  _field: ?any;
  _layersNames: Array<string> = [];

  constructor(props: ParameterFieldProps) {
    super(props);

    const { parameterMetadata } = this.props;
    this._description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    this._loadNamesFrom(props);
  }

  focus() {
    if (this._field) this._field.focus();
  }

  componentWillReceiveProps(newProps: ParameterFieldProps) {
    if (newProps.layout !== this.props.layout) {
      this._loadNamesFrom(newProps);
    }
  }

  _loadNamesFrom(props: ParameterFieldProps) {
    const layout = props.layout;
    if (!layout) {
      this._layersNames = [];
      return;
    }

    this._layersNames = mapFor(0, layout.getLayersCount(), i => {
      const layer = layout.getLayerAt(i);
      return layer.getName();
    });
  }

  render() {
    return (
      <AutoComplete
        {...defaultAutocompleteProps}
        floatingLabelText={this._description}
        searchText={this.state.focused ? this.state.text : this.props.value}
        onFocus={() => {
          this.setState({
            focused: true,
            text: this.props.value,
          });
        }}
        onUpdateInput={value => {
          this.setState({
            focused: true,
            text: value,
          });
        }}
        onBlur={event => {
          this.props.onChange(event.target.value);
          this.setState({
            focused: false,
            text: null,
          });
        }}
        onNewRequest={data => {
          // Note that data may be a string or a {text, value} object.
          if (typeof data === 'string') {
            this.props.onChange(data);
          } else if (typeof data.value === 'string') {
            this.props.onChange(data.value);
          }
        }}
        dataSource={this._layersNames.map(layerName => ({
          text: layerName || '(Base layer)',
          value: `"${layerName}"`,
        }))}
        filter={fuzzyFilterOrEmpty}
        openOnFocus={!this.props.isInline}
        ref={field => (this._field = field)}
      />
    );
  }
}
