// @flow
import { showErrorBox } from '../UI/Messages/MessageBox';
import values from 'lodash/values';

export type ProjectError = {
  type: 'error' | 'warning',
  message: string,
  extraExplanation: string,
};

export type ProjectErrors = {
  [string]: Array<ProjectError>,
};

type TFunction = string => string; //TODO

export const getErrors = (t: TFunction, project: gdProject): ProjectErrors => {
  const errors: ProjectErrors = {};

  const addError = (
    propertyName: string,
    type: 'error' | 'warning',
    message: string,
    extraExplanation: string = ''
  ) => {
    if (!errors[propertyName]) errors[propertyName] = [];

    errors[propertyName].push({
      type,
      message,
      extraExplanation,
    });
  };

  if (!project.getPackageName()) {
    addError(
      'packageName',
      'error',
      t('The package name is empty.'),
      t('Choose and enter a package name in the game properties.')
    );
  } else if (project.getPackageName().length >= 255) {
    addError(
      'packageName',
      'error',
      t('The package name is too long.'),
      t('Change the package name in the game properties.')
    );
  }

  if (!project.getName()) {
    addError(
      'name',
      'error',
      t('The name of your game is too long.'),
      t('Change the name in the game properties.')
    );
  }

  if (!project.getVersion() || project.getVersion().split('.').length < 3) {
    addError(
      'packageName',
      'error',
      t("The version that you've set for the game is invalid."),
      t('Enter a version in the game properties.')
    );
  }

  return errors;
};

export const displayProjectErrorsBox = (
  t: TFunction,
  errors: ProjectErrors
): boolean => {
  if (!Object.keys(errors).length) return true;

  showErrorBox(
    t(
      'Your game has some invalid elements, please fix these before continuing:'
    ) +
      '\n\n' +
      values(errors)
        .map(errors =>
          errors.map((error: ProjectError) => `- ${error.message}`).join('\n')
        )
        .join('\n')
  );

  return false;
};
