// @flow
import { type TFunction } from 'react-i18next';
import { showErrorBox } from '../../UI/Messages/MessageBox';

export type SanityMessages = {
  errors: Array<string>,
  warnings: Array<string>,
};

export const displaySanityCheck = (
  t: TFunction,
  messages: SanityMessages
): boolean => {
  if (messages.errors.length) {
    showErrorBox(
      t(
        'Your game has some invalid elements, please fix these before continuing:'
      ) +
        '\n\n' +
        messages.errors.map(message => `- ${message}`).join('\n')
    );
  }

  return !messages.errors.length;
};
