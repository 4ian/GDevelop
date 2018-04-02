// @flow
import { type TFunction } from 'react-i18next';
import { type SanityMessages } from './index';

export const getSanityMessages = (t: TFunction, project: gdProject): SanityMessages => {
  let errors = [];
  let warnings = [];
  if (!project.getPackageName()) {
    errors.push(
      t(
        'The package name is empty. Choose and enter a package name in the game properties.'
      )
    );
  } else if (project.getPackageName().length >= 255) {
    errors.push(t('The package name is too long.'));
  }

  if (!project.getName()) {
    errors.push(
      t(
        'The game name is empty. Choose and enter a name in the game properties.'
      )
    );
  }

  return {
    errors,
    warnings,
  };
};
