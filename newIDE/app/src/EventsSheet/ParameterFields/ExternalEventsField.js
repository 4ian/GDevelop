// @flow
import * as React from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import Divider from 'material-ui/Divider';
import {
  enumerateLayouts,
  enumerateExternalEvents,
} from '../../ProjectManager/EnumerateProjectItems';
import { type ParameterFieldProps } from './ParameterFieldProps.flow';
import { defaultAutocompleteProps } from '../../UI/AutocompleteProps';

type State = {|
  focused: boolean,
  text: ?string,
|};

export default class ExternalEventsField extends React.Component<
  ParameterFieldProps,
  State
> {
  state = { focused: false, text: null };

  _description: ?string = undefined;
  _fullList: Array<{ text: string, value: React.Node }> = [];
  _field: ?any;

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
    if (newProps.project !== this.props.project) {
      this._loadNamesFrom(newProps);
    }
  }

  _loadNamesFrom(props: ParameterFieldProps) {
    const { project } = props;
    if (!project) {
      return;
    }

    const externalEvents = enumerateExternalEvents(project).map(
      externalEvents => ({
        text: externalEvents.getName(),
        value: externalEvents.getName(),
      })
    );
    const layouts = enumerateLayouts(project).map(layout => ({
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
        {...defaultAutocompleteProps}
        floatingLabelText={this._description}
        id="external-events-field"
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
          this.focus(); // Keep the focus after choosing an item
        }}
        dataSource={this._fullList}
        openOnFocus={!this.props.isInline}
        ref={field => (this._field = field)}
      />
    );
  }
}
