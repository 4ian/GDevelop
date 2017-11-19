import React, { Component } from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import Divider from 'material-ui/Divider';
import {
  enumerateLayouts,
  enumerateExternalEvents,
} from '../../../ProjectManager/EnumerateProjectItems';

const styles = {
  autoCompleteTextField: {
    minWidth: 300,
  },
};

const fuzzyFilterOrEmpty = (searchText, key) => {
  return !key || AutoComplete.fuzzyFilter(searchText, key);
};

export default class ExternalEventsField extends Component {
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
    if (newProps.project !== this.props.project) {
      this._loadNamesFrom(newProps);
    }
  }

  _loadNamesFrom(props) {
    if (!props.project) {
      this._externalEventsNames = [];
      return;
    }

    const externalEvents = enumerateExternalEvents(
      props.project
    ).map(externalEvents => ({
      text: externalEvents.getName(),
      value: externalEvents.getName(),
    }));
    const layouts = enumerateLayouts(props.project).map(layout => ({
      text: layout.getName(),
      value: layout.getName(),
    }));
    this._fullList = [
      ...externalEvents,
      { text: '', value: <Divider /> },
      ...layouts,
    ];
  }

  render() {
    return (
      <AutoComplete
        floatingLabelText={this._description}
        fullWidth
        id="external-events-field"
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
        dataSource={this._fullList}
        filter={fuzzyFilterOrEmpty}
        openOnFocus={!this.props.isInline}
        ref={field => (this._field = field)}
      />
    );
  }
}
