// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { enumerateObjectsAndGroups } from './EnumerateObjects';
import { type FieldFocusFunction } from '../EventsSheet/ParameterFields/ParameterFieldCommons';
import SemiControlledAutoComplete, {
  type DataSource,
  type SemiControlledAutoCompleteInterface,
} from '../UI/SemiControlledAutoComplete';
import ListIcon from '../UI/ListIcon';
import getObjectByName from '../Utils/GetObjectByName';
import ObjectsRenderingService from '../ObjectsRendering/ObjectsRenderingService';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { useShouldAutofocusInput } from '../UI/Reponsive/ScreenTypeMeasurer';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
const gd: libGDevelop = global.gd;

type Props = {|
  project: ?gdProject,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,

  /** If specified, only this object type should be allowed to be selected. */
  allowedObjectType?: ?string,
  /**
   * If specified, an object without this required capability won't be selectable.
   * Note that this does not work with groups - which are assumed to have all capabilities.
   */
  requiredObjectCapability?: ?string,

  noGroups?: boolean,

  /** A list of object names to exclude from the autocomplete list (for example if they have already been selected). */
  excludedObjectOrGroupNames?: Array<string>,

  onChoose?: string => void,
  onChange: string => void,
  onRequestClose?: () => void,
  onApply?: () => void,
  value: string,
  errorTextIfInvalid?: React.Node,

  fullWidth?: boolean,
  floatingLabelText?: React.Node,
  helperMarkdownText?: ?string,
  hintText?: MessageDescriptor | string,
  openOnFocus?: boolean,
  margin?: 'none' | 'dense',

  id?: ?string,
|};

const iconSize = 24;

const getObjectsAndGroupsDataSource = ({
  project,
  globalObjectsContainer,
  objectsContainer,
  noGroups,
  allowedObjectType,
  excludedObjectOrGroupNames,
}: {|
  project: ?gdProject,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  noGroups: ?boolean,
  allowedObjectType: ?string,
  excludedObjectOrGroupNames: ?Array<string>,
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
            <ListIcon
              iconSize={iconSize}
              src={ObjectsRenderingService.getThumbnail(
                project,
                object.getConfiguration()
              )}
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

  const fullList =
    groups.length === 0
      ? objects
      : [...objects, { type: 'separator' }, ...groups];

  return excludedObjectOrGroupNames
    ? fullList.filter(
        //$FlowFixMe
        ({ value }) => !excludedObjectOrGroupNames.includes(value)
      )
    : fullList;
};

const checkHasRequiredCapability = ({
  project,
  globalObjectsContainer,
  objectsContainer,
  requiredObjectCapability,
  objectName,
}: {|
  project: ?gdProject,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  requiredObjectCapability: ?string,
  objectName: string,
|}) => {
  if (!requiredObjectCapability) return true;
  if (!project) return true;

  const object = getObjectByName(
    globalObjectsContainer,
    objectsContainer,
    objectName
  );
  if (!object) {
    // Either the object does not exist or it's a group - not a problem because:
    // - if the object does not exist, we can't know its capabilities, we assume it has all.
    // - a group is assumed to have all the capabilities.
    return true;
  }

  const objectMetadata = gd.MetadataProvider.getObjectMetadata(
    project.getCurrentPlatform(),
    object.getType()
  );
  return !objectMetadata.isUnsupportedBaseObjectCapability(
    requiredObjectCapability
  );
};

export type ObjectSelectorInterface = {| focus: FieldFocusFunction |};

const ObjectSelector = React.forwardRef<Props, ObjectSelectorInterface>(
  (props, ref) => {
    const fieldRef = React.useRef<?SemiControlledAutoCompleteInterface>(null);

    const focus: FieldFocusFunction = options => {
      if (fieldRef.current) fieldRef.current.focus(options);
    };
    const shouldAutofocusInput = useShouldAutofocusInput();

    React.useImperativeHandle(ref, () => ({ focus }));

    const {
      value,
      onChange,
      onChoose,
      project,
      globalObjectsContainer,
      objectsContainer,
      allowedObjectType,
      requiredObjectCapability,
      noGroups,
      errorTextIfInvalid,
      margin,
      onRequestClose,
      onApply,
      id,
      excludedObjectOrGroupNames,
      hintText,
      ...otherProps
    } = props;

    const objectAndGroups = getObjectsAndGroupsDataSource({
      project,
      globalObjectsContainer,
      objectsContainer,
      noGroups,
      allowedObjectType,
      excludedObjectOrGroupNames,
    });

    const hasValidChoice =
      objectAndGroups.filter(
        choice => choice.text !== undefined && value === choice.text
      ).length !== 0;

    const hasObjectWithRequiredCapability = checkHasRequiredCapability({
      project,
      requiredObjectCapability,
      globalObjectsContainer,
      objectsContainer,
      objectName: value,
    });

    const errorText = !hasObjectWithRequiredCapability ? (
      <Trans>This object exists, but can't be used here.</Trans>
    ) : !hasValidChoice ? (
      errorTextIfInvalid
    ) : (
      undefined
    );

    return shouldAutofocusInput ? (
      <SemiControlledAutoComplete
        margin={margin}
        hintText={hintText || t`Choose an object`}
        value={value}
        onChange={onChange}
        onChoose={onChoose}
        onRequestClose={onRequestClose}
        onApply={onApply}
        dataSource={objectAndGroups}
        errorText={errorText}
        ref={fieldRef}
        id={id}
        {...otherProps}
      />
    ) : (
      <I18n>
        {({ i18n }) => (
          <SelectField
            margin={margin}
            value={value}
            onChange={(e, i, newValue) => {
              onChange(newValue);
              if (onChoose) onChoose(newValue);
              if (onApply) onApply();
            }}
            translatableHintText={hintText || t`Choose an object`}
            style={{ flex: otherProps.fullWidth ? 1 : undefined }}
            errorText={errorText}
            helperMarkdownText={otherProps.helperMarkdownText}
            floatingLabelText={otherProps.floatingLabelText}
            id={id}
          >
            {objectAndGroups.map((option, index) =>
              option.type === 'separator' ? (
                <optgroup key={`group-divider`} label={i18n._(t`Groups`)} />
              ) : (
                <SelectOption
                  key={option.value}
                  label={option.value}
                  value={option.value}
                  shouldNotTranslate
                />
              )
            )}
          </SelectField>
        )}
      </I18n>
    );
  }
);

export default ObjectSelector;
