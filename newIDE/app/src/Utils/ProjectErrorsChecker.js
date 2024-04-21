// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
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

/**
 * Check if there is any blocking error in the project properties.
 */
export const getProjectPropertiesErrors = (
  i18n: I18nType,
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
      i18n._(t`The package name is empty.`),
      i18n._(t`Choose and enter a package name in the game properties.`)
    );
  } else if (project.getPackageName().length >= 255) {
    addError(
      'packageName',
      'error',
      i18n._(t`The package name is too long.`),
      i18n._(t`Change the package name in the game properties.`)
    );
  } else if (!validatePackageName(project.getPackageName())) {
    addError(
      'packageName',
      'error',
      i18n._(
        t`The package name is containing invalid characters or not following the convention "xxx.yyy.zzz" (numbers allowed after a letter only).`
      ),
      i18n._(t`Change the package name in the game properties.`)
    );
  }

  if (!project.getName()) {
    addError(
      'name',
      'error',
      i18n._(t`The name of your game is too long`),
      i18n._(t`Change the name in the game properties.`)
    );
  }

  if (!project.getVersion() || project.getVersion().split('.').length < 3) {
    addError(
      'packageName',
      'error',
      i18n._(t`The version that you've set for the game is invalid.`),
      i18n._(t`Enter a version in the game properties.`)
    );
  }

  return errors;
};

export const displayProjectErrorsBox = (
  i18n: I18nType,
  errors: ProjectErrors
): boolean => {
  if (!Object.keys(errors).length) return true;

  showErrorBox({
    message:
      i18n._(
        t`Your game has some invalid elements, please fix these before continuing:`
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
