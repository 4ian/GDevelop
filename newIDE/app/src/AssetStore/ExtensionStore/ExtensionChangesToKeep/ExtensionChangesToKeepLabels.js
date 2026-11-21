// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import { type ExtensionMemberGroupKind } from './useExtensionChangesToKeep';
import {
  type ExtensionFieldValue,
  type ExtensionMemberChangeDetails,
  type ExtensionMemberDifference,
  type ExtensionMemberDifferentPart,
  type ExtensionReferenceProblem,
} from '../../../Utils/Extension/ExtensionChangesToKeep';

export const getMemberName = (memberKey: string): string =>
  memberKey.substring(memberKey.indexOf(':') + 1);

export const getDifferentPartLabel = (
  i18n: I18nType,
  differentPart: ExtensionMemberDifferentPart
): string => {
  switch (differentPart) {
    case 'parameters':
      return i18n._(t`Parameters`);
    case 'properties':
      return i18n._(t`Properties`);
    case 'events':
      return i18n._(t`Events`);
    case 'functions':
      return i18n._(t`Functions`);
    case 'variables':
      return i18n._(t`Variables`);
    case 'children':
      return i18n._(t`Children`);
    case 'configuration':
    default:
      return i18n._(t`Configuration`);
  }
};

export const getFieldLabel = (i18n: I18nType, field: string): string => {
  switch (field) {
    case 'fullName':
      return i18n._(t`Name displayed in editor`);
    case 'description':
      return i18n._(t`Description`);
    case 'shortDescription':
      return i18n._(t`Short description`);
    case 'sentence':
      return i18n._(t`Sentence in Events Sheet`);
    case 'functionType':
      return i18n._(t`Type`);
    case 'group':
      return i18n._(t`Group`);
    case 'private':
      return i18n._(t`Visibility`);
    case 'async':
      return i18n._(t`Asynchronous`);
    case 'getterName':
      return i18n._(t`Getter`);
    case 'objectType':
      return i18n._(t`Object`);
    case 'quickCustomizationVisibility':
      return i18n._(t`Quick customization`);
    case 'defaultName':
      return i18n._(t`Default name`);
    case 'assetStoreTag':
      return i18n._(t`Asset store tag`);
    case 'is3D':
      return i18n._(t`Rendering`);
    case 'isAnimatable':
      return i18n._(t`Has animations`);
    case 'isTextContainer':
      return i18n._(t`Contains a text`);
    case 'isInnerAreaFollowingParentSize':
      return i18n._(t`Children follow the object size`);
    case 'isUsingLegacyInstancesRenderer':
      return i18n._(t`Legacy rendering of children`);
    case 'author':
      return i18n._(t`Author`);
    case 'category':
      return i18n._(t`Category`);
    case 'dimension':
      return i18n._(t`Dimension`);
    case 'extensionNamespace':
      return i18n._(t`Namespace`);
    case 'iconUrl':
      return i18n._(t`Icon`);
    case 'previewIconUrl':
      return i18n._(t`Preview icon`);
    case 'helpPath':
    case 'helpUrl':
      return i18n._(t`Help page`);
    default:
      return field;
  }
};

/** Fields holding the URL of an image, shown as images rather than texts. */
export const isImageField = (field: string): boolean =>
  field === 'iconUrl' || field === 'previewIconUrl';

const getFunctionTypeLabel = (i18n: I18nType, functionType: string): string => {
  switch (functionType) {
    case 'Action':
      return i18n._(t`Action`);
    case 'ActionWithOperator':
      return i18n._(t`Action with an operator`);
    case 'Condition':
      return i18n._(t`Condition`);
    case 'Expression':
      return i18n._(t`Expression (number)`);
    case 'StringExpression':
      return i18n._(t`Expression (text)`);
    case 'ExpressionAndCondition':
      return i18n._(t`Expression and condition`);
    default:
      return functionType;
  }
};

/**
 * A value of a field, as shown to users. An empty string means that the field
 * is not set.
 */
export const getFieldValueLabel = (
  i18n: I18nType,
  field: string,
  value: ExtensionFieldValue
): string => {
  // Boolean fields are not serialized when false.
  const isEnabled = value === true;
  switch (field) {
    case 'private':
      return isEnabled ? i18n._(t`Private`) : i18n._(t`Public`);
    case 'is3D':
      return isEnabled ? i18n._(t`3D`) : i18n._(t`2D`);
    case 'async':
    case 'isAnimatable':
    case 'isTextContainer':
    case 'isInnerAreaFollowingParentSize':
    case 'isUsingLegacyInstancesRenderer':
      return isEnabled ? i18n._(t`Yes`) : i18n._(t`No`);
    case 'functionType':
      return typeof value === 'string' ? getFunctionTypeLabel(i18n, value) : '';
    case 'objectType':
      return value ? String(value) : i18n._(t`Any object`);
    case 'quickCustomizationVisibility':
      return value === 'visible'
        ? i18n._(t`Visible`)
        : value === 'hidden'
        ? i18n._(t`Hidden`)
        : i18n._(t`Default`);
    default:
      if (typeof value === 'boolean') {
        return value ? i18n._(t`Yes`) : i18n._(t`No`);
      }
      return value === null ? '' : String(value);
  }
};

/**
 * Explain a problem on the member whose choice must change to solve it
 * (the member used by another one).
 */
export const getProblemExplanation = (
  i18n: I18nType,
  {
    memberKey,
    problem,
    missingChildNames,
    fixingSource,
  }: ExtensionReferenceProblem
): string => {
  const memberName = getMemberName(memberKey);
  if (problem === 'missing-children') {
    const childNames = missingChildNames.join(', ');
    return fixingSource === 'new-version'
      ? i18n._(
          t`The new logic of this object uses children that your version doesn't have: ${childNames}.`
        )
      : i18n._(
          t`Your logic of this object uses children that the new version doesn't have: ${childNames}.`
        );
  }
  if (problem === 'removed') {
    return i18n._(t`${memberName}, which you keep, uses it.`);
  }
  return fixingSource === 'new-version'
    ? i18n._(
        t`The new version of ${memberName} uses it with different parameters or properties.`
      )
    : i18n._(
        t`Your version of ${memberName} uses it with different parameters or properties.`
      );
};

export const getGroupTitle = (
  i18n: I18nType,
  kind: ExtensionMemberGroupKind
): string => {
  switch (kind) {
    case 'extension-settings':
      return i18n._(t`Extension`);
    case 'function':
      return i18n._(t`Functions`);
    case 'behavior':
      return i18n._(t`Behaviors`);
    case 'object':
    default:
      return i18n._(t`Objects`);
  }
};

export const getMemberSecondaryText = (
  i18n: I18nType,
  difference: ExtensionMemberDifference,
  details: ExtensionMemberChangeDetails
): string => {
  if (difference.kind === 'extension-settings') {
    return i18n._(t`Description, variables and other settings`);
  }
  if (difference.kind === 'object') {
    return i18n._(t`${difference.name} · Logic`);
  }
  if (difference.kind === 'object-children') {
    return i18n._(t`${difference.name} · Children and layout`);
  }
  return details.displayName !== difference.name ? difference.name : '';
};
