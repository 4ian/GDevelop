import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

export const translateExtensionCategory = (
  category: string,
  i18n: I18nType
) => {
  if (!i18n) {
    return category;
  }
  switch (category) {
    case 'Ads':
      return i18n._(t`Ads`);
    case 'Visual effect':
      return i18n._(t`Visual effect`);
    case 'Text':
      return i18n._(t`Text`);
    case 'Audio':
      return i18n._(t`Audio`);
    case 'Advanced':
      return i18n._(t`Advanced`);
    case 'Camera':
      return i18n._(t`Camera`);
    case 'Input':
      return i18n._(t`Input`);
    case 'Game mechanic':
      return i18n._(t`Game mechanic`);
    case 'Movement':
      return i18n._(t`Movement`);
    case 'Network':
      return i18n._(t`Network`);
    case 'Third-party':
      return i18n._(t`Third-party`);
    case 'User interface':
      return i18n._(t`User interface`);
    case 'General':
      return i18n._(t`General`);
    default:
      return category;
  }
};
