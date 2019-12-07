// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import { enumerateObjectsAndGroups } from './EnumerateObjects';
import SemiControlledAutoComplete, {
  type DataSource,
} from '../UI/SemiControlledAutoComplete';
import ListIcon from '../UI/ListIcon';
import ObjectsRenderingService from '../ObjectsRendering/ObjectsRenderingService';

type Props = {|
  project: ?gdProject,
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
  margin?: 'none' | 'dense',
|};

const iconSize = 24;

const getObjectsAndGroupsDataSource = ({
  project,
  globalObjectsContainer,
  objectsContainer,
  noGroups,
  allowedObjectType,
}: {|
  project: ?gdProject,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  noGroups: ?boolean,
  allowedObjectType: ?string,
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
      renderIcon: project
        ? () => (
            // TODO: This is broken since the changes to ListIcon
            <ListIcon
              iconSize={iconSize}
              src={ObjectsRenderingService.getThumbnail(project, object)}
            />
          )
        : undefined,
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

  return [...objects, { type: 'separator' }, ...groups];
};

export default class ObjectSelector extends React.Component<Props, {||}> {
  _field: ?SemiControlledAutoComplete;

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
      project,
      globalObjectsContainer,
      objectsContainer,
      allowedObjectType,
      noGroups,
      errorTextIfInvalid,
      margin,
      ...rest
    } = this.props;

    const objectAndGroups = getObjectsAndGroupsDataSource({
      project,
      globalObjectsContainer,
      objectsContainer,
      noGroups,
      allowedObjectType,
    });
    const hasValidChoice =
      objectAndGroups.filter(
        choice => choice.text !== undefined && value === choice.text
      ).length !== 0;

    return (
      <SemiControlledAutoComplete
        margin={margin}
        hintText={t`Choose an object`}
        value={value}
        onChange={onChange}
        onChoose={onChoose}
        dataSource={objectAndGroups}
        errorText={hasValidChoice ? undefined : errorTextIfInvalid}
        ref={field => (this._field = field)}
        {...rest}
      />
    );
  }
}
