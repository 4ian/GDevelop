import React, { Component } from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import { mapFor } from '../../../Utils/MapFor';

const styles = {
  autoCompleteTextField: {
    minWidth: 300,
  },
};

const fuzzyFilterOrEmpty = (searchText, key) => {
  return !key || AutoComplete.fuzzyFilter(searchText, key);
};

export default class LayerField extends Component {
  constructor(props) {
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

  componentWillReceiveProps(newProps) {
    if (newProps.layout !== this.props.layout) {
      this._loadNamesFrom(newProps);
    }
  }

  _loadNamesFrom(props) {
    if (!props.layout) {
      this._layersNames = [];
      return;
    }

    this._layersNames = mapFor(0, props.layout.getLayersCount(), i => {
      const layer = props.layout.getLayerAt(i);
      return layer.getName();
    });
  }

  render() {
    return (
      <AutoComplete
        floatingLabelText={this._description}
        fullWidth
        textFieldStyle={styles.autoCompleteTextField}
        menuProps={{
          maxHeight: 250,
        }}
        searchText={this.props.value}
        onUpdateInput={value => {
          this.props.onChange(value);
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
