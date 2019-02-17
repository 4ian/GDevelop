// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import Divider from 'material-ui/Divider';
import { enumerateObjectsAndGroups } from './EnumerateObjects';
import { defaultAutocompleteProps } from '../UI/AutocompleteProps';

type Props = {|
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  allowedObjectType?: ?string,
  noGroups?: boolean,
  onChoose: string => void,
  onChange: string => void,
  value: string,
  onBlur?: (event: any) => void,

  fullWidth?: boolean,
  floatingLabelText?: ?string,
  errorText?: ?string,
  openOnFocus?: boolean,
  hintText?: ?React.Node,
  autoCompleteStyle?: Object,
|};

type State = {|
  focused: boolean,
  text: ?string,
|};

export default class ObjectSelector extends React.Component<Props, State> {
  state = {
    focused: false,
    text: null,
  };

  _field: ?AutoComplete;
  fullList: Array<{ text: string, value: React.Node }>;

  constructor(props: Props) {
    super(props);

    const { globalObjectsContainer, objectsContainer } = this.props;
    const list = enumerateObjectsAndGroups(
      globalObjectsContainer,
      objectsContainer,
      this.props.allowedObjectType || undefined
    );
    const objects = list.allObjectsList.map(({ object }) => {
      return {
        text: object.getName(),
        value: object.getName(),
      };
    });
    const groups = props.noGroups
      ? []
      : list.allGroupsList.map(({ group }) => {
          return {
            text: group.getName(),
            value: group.getName(),
          };
        });

    this.fullList = [...objects, { text: '', value: <Divider /> }, ...groups];
  }

  componentWillUnmount() {
    if (this.state.focused) {
      this.props.onChange(this.state.text || '');
    }
  }

  focus() {
    if (this._field) this._field.focus();
  }

  hasAValidObject = () => {
    return (
      this.fullList.filter(choice => this.props.value === choice.text)
        .length !== 0
    );
  };

  render() {
    const {
      value,
      onChange,
      onChoose,
      globalObjectsContainer,
      objectsContainer,
      allowedObjectType,
      noGroups,
      onBlur,
      ...rest
    } = this.props;

    return (
      <AutoComplete
        {...defaultAutocompleteProps}
        hintText={<Trans>Choose an object</Trans>}
        searchText={this.state.focused ? this.state.text : value}
        onFocus={() => {
          this.setState({
            focused: true,
            text: value,
          });
        }}
        onUpdateInput={value => {
          this.setState({
            text: value,
          });
        }}
        onBlur={event => {
          onChange(event.target.value);
          this.setState({
            focused: false,
            text: null,
          });

          if (onBlur) onBlur(event);
        }}
        onNewRequest={data => {
          // Note that data may be a string or a {text, value} object.
          if (typeof data === 'string') {
            onChoose(data);
          } else if (typeof data.value === 'string') {
            onChoose(data.value);
          }
          this.focus(); // Keep the focus after choosing an item
        }}
        dataSource={this.fullList}
        ref={field => (this._field = field)}
        {...rest}
      />
    );
  }
}
