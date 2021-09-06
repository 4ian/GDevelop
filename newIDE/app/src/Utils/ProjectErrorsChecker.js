// @flow
import { showErrorBox } from '../UI/Messages/MessageBox';
import values from 'lodash/values';
const gd: libGDevelop = global.gd;

export type ProjectError = {
  type: 'error' | 'warning',
  message: string,
  extraExplanation: string,
};

export type ProjectErrors = {
  [string]: Array<ProjectError>,
};

export const validatePackageName = (packageName: string) => {
  const pattern = /^([A-Za-z]{1}[A-Za-z\d_]*\.)+[A-Za-z][A-Za-z\d_]*$/i;

  return pattern.test(packageName);
};

type TFunction = string => string; //TODO

/**
 * Check if there is any blocking error in the project properties.
 */
export const getProjectPropertiesErrors = (
  t: TFunction,
  project: gdProject
): ProjectErrors => {
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
  } else if (!validatePackageName(project.getPackageName())) {
    addError(
      'packageName',
      'error',
      t(
        'The package name is containing invalid characters or not following the convention "xxx.yyy.zzz" (numbers allowed after a letter only).'
      ),
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

  showErrorBox({
    message:
      t(
        'Your game has some invalid elements, please fix these before continuing:'
      ) +
      '\n\n' +
      values(errors)
        .map(errors =>
          errors.map((error: ProjectError) => `- ${error.message}`).join('\n')
        )
        .join('\n'),
    rawError: undefined,
    errorId: 'project-invalid-settings-error',
    doNotReport: true,
  });

  return false;
};

/**
 * Log errors found in the project and that should stop a preview (or an export)
 * of the project to be done.
 *
 * For now, not all errors are reported (errors when generating events should ideally
 * be stored and shown in the editor).
 * See https://trello.com/c/IiLgNR16/462-add-a-diagnostic-report-to-warn-about-potential-issues-in-the-game-and-show-them-in-the-events-sheet
 */
export const findAndLogProjectPreviewErrors = (project: gdProject) => {
  const problems = gd.WholeProjectRefactorer.findInvalidRequiredBehaviorProperties(
    project
  );
  for (let index = 0; index < problems.size(); index++) {
    const problem = problems.at(index);

    const suggestedBehaviorNames = gd.WholeProjectRefactorer.getBehaviorsWithType(
      problem.getSourceObject(),
      problem.getExpectedBehaviorTypeName()
    ).toJSArray();

    console.error(
      `Invalid value for required behavior property "${problem.getSourcePropertyName()}" in object ${problem
        .getSourceObject()
        .getName()} for behavior ${problem
        .getSourceBehaviorContent()
        .getName()}.`
    );
    console.info(
      `Expected behavior of type ${problem.getExpectedBehaviorTypeName()}. Possibles values are: ${suggestedBehaviorNames.join(
        ', '
      ) || '(none)'}.`
    );
  }
};
