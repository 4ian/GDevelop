// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import { type ExtensionMemberGroupKind } from './useExtensionChangesToKeep';
import {
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
      return i18n._(t`Private`);
    case 'objectType':
      return i18n._(t`Object type`);
    case 'defaultName':
      return i18n._(t`Default name`);
    case 'author':
      return i18n._(t`Author`);
    case 'category':
      return i18n._(t`Category`);
    case 'helpPath':
      return i18n._(t`Help page`);
    default:
      return field;
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
