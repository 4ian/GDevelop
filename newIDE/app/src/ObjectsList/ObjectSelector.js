// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import Divider from 'material-ui/Divider';
import { enumerateObjectsAndGroups } from './EnumerateObjects';
import SemiControlledAutoComplete from '../UI/SemiControlledAutoComplete';

type Props = {|
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  allowedObjectType?: ?string,
  noGroups?: boolean,

  onChoose?: string => void,
  onChange: string => void,
  value: string,
  errorTextIfInvalid?: React.Node,

  fullWidth?: boolean,
  floatingLabelText?: ?string,
  openOnFocus?: boolean,
  hintText?: ?React.Node,
|};

type DataSource = Array<{| text: string, value: React.Node |}>;

const getObjectsAndGroupsDataSource = ({
  globalObjectsContainer,
  objectsContainer,
  noGroups,
  allowedObjectType,
}: {|
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  noGroups: ?boolean,
  allowedObjectType?: ?string,
|}): DataSource => {
  const list = enumerateObjectsAndGroups(
    globalObjectsContainer,
    objectsContainer,
    allowedObjectType || undefined
  );
  const objects = list.allObjectsList.map(({ object }) => {
    return {
      text: object.getName(),
      value: object.getName(),
    };
  });
  const groups = noGroups
    ? []
    : list.allGroupsList.map(({ group }) => {
        return {
          text: group.getName(),
          value: group.getName(),
        };
      });

  return [...objects, { text: '', value: <Divider /> }, ...groups];
};

export default class ObjectSelector extends React.Component<Props, {||}> {
  _field: ?AutoComplete;

  // Don't add a componentWillUnmount that would call onChange. This can lead to
  // calling callbacks that would then update a deleted instruction parameters.

  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    const {
      value,
      onChange,
      onChoose,
      globalObjectsContainer,
      objectsContainer,
      allowedObjectType,
      noGroups,
      errorTextIfInvalid,
      ...rest
    } = this.props;

    const objectAndGroups = getObjectsAndGroupsDataSource({
      globalObjectsContainer,
      objectsContainer,
      noGroups,
    });
    const hasValidObject =
      objectAndGroups.filter(choice => value === choice.text).length !== 0;

    return (
      <SemiControlledAutoComplete
        hintText={<Trans>Choose an object</Trans>}
        value={value}
        onChange={onChange}
        onChoose={onChoose}
        dataSource={objectAndGroups}
        errorText={hasValidObject ? undefined : errorTextIfInvalid}
        ref={field => (this._field = field)}
        {...rest}
      />
    );
  }
}
