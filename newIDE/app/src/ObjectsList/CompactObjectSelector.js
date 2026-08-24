// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import CompactSelectField from '../UI/CompactSelectField';
import SelectOption from '../UI/SelectOption';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import {
  checkHasRequiredBehaviors,
  getMissingBehaviors,
  getObjectsAndGroupsDataSource,
} from './ObjectSelector';
import classes from '../UI/CompactTextAreaField/CompactTextAreaField.module.css';
import CompactPropertiesEditorRowField from '../CompactPropertiesEditor/CompactPropertiesEditorRowField';

const gd: libGDevelop = global.gd;

type Props = {|
  project: ?gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,

  /** If specified, only this object type should be allowed to be selected. */
  allowedObjectType?: ?string,
  /**
   * If specified, an object without these behaviors won't be selectable.
   * Note that groups with at least 1 incompatible object won't be shown.
   */
  requiredCapabilitiesBehaviorTypes?: Array<string>,
  /**
   * If specified, an object without these behaviors will show an error.
   */
  requiredVisibleBehaviorTypes?: Array<string>,

  noGroups?: boolean,

  /** A list of object names to exclude from the autocomplete list (for example if they have already been selected). */
  excludedObjectOrGroupNames?: Array<string>,

  onChoose?: string => void,
  onChange: string => void,
  onRequestClose?: () => void,
  onApply?: () => void,
  value: string,
  errorTextIfInvalid?: React.Node,
  disabled?: boolean,

  fullWidth?: boolean,
  label: string,
  helperMarkdownText?: ?string,
  hintText?: MessageDescriptor | string,

  id: string,
|};

const CompactObjectSelector = (props: Props): React.Node => {
  const {
    value,
    onChange,
    onChoose,
    project,
    projectScopedContainersAccessor,
    allowedObjectType,
    noGroups,
    errorTextIfInvalid,
    onRequestClose,
    onApply,
    id,
    excludedObjectOrGroupNames,
    hintText,
    requiredCapabilitiesBehaviorTypes,
    requiredVisibleBehaviorTypes,
    disabled,
    ...otherProps
  } = props;

  const objectAndGroups = React.useMemo(
    () => {
      const objectsContainersList = projectScopedContainersAccessor
        .get()
        .getObjectsContainersList();

      return getObjectsAndGroupsDataSource({
        project,
        objectsContainersList,
        noGroups,
        allowedObjectType,
        requiredCapabilitiesBehaviorTypes,
        excludedObjectOrGroupNames,
      });
    },
    [
      allowedObjectType,
      excludedObjectOrGroupNames,
      noGroups,
      project,
      projectScopedContainersAccessor,
      requiredCapabilitiesBehaviorTypes,
    ]
  );

  const errorText = React.useMemo(
    () => {
      const objectsContainersList = projectScopedContainersAccessor
        .get()
        .getObjectsContainersList();

      const hasValidChoice =
        objectAndGroups.filter(
          choice => choice.text !== undefined && value === choice.text
        ).length !== 0;

      const hasObjectWithRequiredCapability = checkHasRequiredBehaviors({
        objectsContainersList,
        objectName: value,
        requiredBehaviorTypes: requiredCapabilitiesBehaviorTypes,
      });
      const missingVisibleBehaviors = getMissingBehaviors({
        objectsContainersList,
        objectName: value,
        requiredBehaviorTypes: requiredVisibleBehaviorTypes,
      });

      return !hasObjectWithRequiredCapability ? (
        <Trans>This object exists, but can't be used here.</Trans>
      ) : missingVisibleBehaviors.length > 0 ? (
        <Trans>
          This object misses some behaviors:{' '}
          {missingVisibleBehaviors
            .map(
              behaviorTypeName =>
                gd.MetadataProvider.getBehaviorMetadata(
                  gd.JsPlatform.get(),
                  behaviorTypeName
                ).getFullName() || behaviorTypeName
            )
            .join(', ')}
        </Trans>
      ) : !hasValidChoice ? (
        errorTextIfInvalid
      ) : (
        undefined
      );
    },
    [
      errorTextIfInvalid,
      objectAndGroups,
      projectScopedContainersAccessor,
      requiredCapabilitiesBehaviorTypes,
      requiredVisibleBehaviorTypes,
      value,
    ]
  );

  const renderField = React.useCallback(
    (i18n: I18nType) => (
      <CompactSelectField
        value={value}
        errored={!!errorText}
        onChange={newValue => {
          onChange(newValue);
          if (onChoose) onChoose(newValue);
          if (onApply) onApply();
        }}
        id={id}
      >
        {[
          <SelectOption
            key={'select-field-hint'}
            label={i18n._(hintText || t`Choose an object`)}
            value={''}
            shouldNotTranslate
          />,
          ...objectAndGroups.map((option, index) =>
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
          ),
        ]}
      </CompactSelectField>
    ),
    [
      errorText,
      hintText,
      id,
      objectAndGroups,
      onApply,
      onChange,
      onChoose,
      value,
    ]
  );

  return disabled ? null : (
    <I18n>
      {({ i18n }) => (
        <>
          {otherProps.label ? (
            <CompactPropertiesEditorRowField
              label={otherProps.label}
              markdownDescription={otherProps.helperMarkdownText}
              field={renderField(i18n)}
            />
          ) : (
            renderField(i18n)
          )}
          {errorText && <div className={classes.error}>{errorText}</div>}
        </>
      )}
    </I18n>
  );
};

export default CompactObjectSelector;
