// @flow
import {
  allEasingNames,
  customEasingExampleIdentifier,
} from '../../Utils/Easings';
import {
  getCustomEasingHelperMarkdown,
  getEasingChoicesWithCustomValue,
} from './EasingField';

jest.mock('../../UI/EasingPreview', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('./StringWithSelectorField', () => ({
  __esModule: true,
  default: () => null,
  renderInlineStringWithSelector: () => null,
}));

describe('getEasingChoicesWithCustomValue', () => {
  it('adds a quoted cubic-bezier literal so the events sheet can preview it', () => {
    expect(
      getEasingChoicesWithCustomValue(null, '"cubic-bezier(.91,.17,.08,.88)"')
    ).toEqual(allEasingNames.concat('cubic-bezier(.91,.17,.08,.88)'));
  });

  it('does not add an expression that only starts and ends with quotes', () => {
    expect(
      getEasingChoicesWithCustomValue(
        null,
        '"cubic-bezier(" + VariableString(X) + ")"'
      )
    ).toEqual(allEasingNames);
  });
});

describe('getCustomEasingHelperMarkdown', () => {
  const i18n = {
    _: (message, values) => {
      const text =
        typeof message === 'string'
          ? message
          : message.message || message.id || '';
      const replacements = (message && message.values) || values || {};
      return text.replace(
        /\{(\w+)\}/g,
        (match, key) => replacements[key] || match
      );
    },
  };

  it('tells the user to keep quotes around a cubic-bezier value', () => {
    const helperMarkdown = getCustomEasingHelperMarkdown(i18n);
    expect(helperMarkdown).toContain(`"${customEasingExampleIdentifier}"`);
  });
});
