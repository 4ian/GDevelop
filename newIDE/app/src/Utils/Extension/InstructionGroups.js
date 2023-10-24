import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

export const translateInstructionGroup = (
  instructionGroup: string,
  i18n: I18nType
) => {
  if (!i18n) {
    return instructionGroup;
  }
  switch (instructionGroup) {
    case 'Angle':
      return i18n._(t`Angle`);
    case 'Animations and images':
      return i18n._(t`Animations and images`);
    case 'Collision':
      return i18n._(t`Collision`);
    case 'Effects':
      return i18n._(t`Effects`);
    case 'Layer':
      return i18n._(t`Layer`);
    case 'Layers and cameras':
      console.log(instructionGroup);
      return i18n._(t`Layers and cameras`);
    case 'Mouse and touch':
      return i18n._(t`Mouse and touch`);
    case 'Movement using forces':
      return i18n._(t`Movement using forces`);
    case 'Objects':
      return i18n._(t`Objects`);
    case 'Position':
      return i18n._(t`Position`);
    case 'Position/Center':
      return i18n._(t`Position/Center`);
    case 'Position/Bounding Box':
      return i18n._(t`Position/Bounding Box`);
    case 'Size':
      return i18n._(t`Size`);
    case 'Timers':
      return i18n._(t`Timers`);
    case 'Variables':
      return i18n._(t`Variables`);
    case 'Variables/Arrays and structures':
      return i18n._(t`Variables/Arrays and structures`);
    case 'Visibility':
      return i18n._(t`Visibility`);
    case 'Z-order':
      return i18n._(t`Z-order`);
    case 'Z order':
      return i18n._(t`Z order`);
    default:
      return instructionGroup;
  }
};
