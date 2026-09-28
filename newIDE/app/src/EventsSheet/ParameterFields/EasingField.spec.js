// @flow
import * as React from 'react';
import { act } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import { I18nProvider } from '@lingui/react';
import {
  allEasingNames,
  customEasingExampleIdentifier,
} from '../../Utils/Easings';
import EasingField, {
  getCustomEasingHelperMarkdown,
  getCustomEasingIdentifierOrNull,
  getEasingChoicesWithCustomValue,
} from './EasingField';

const mockCaptures: {|
  selectorProps: any,
  dialogProps: any,
|} = {
  selectorProps: null,
  dialogProps: null,
};

jest.mock('../../UI/EasingPreview', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('./StringWithSelectorField', () => {
  const React = require('react');
  const MockField = React.forwardRef((props: any, ref: any) => {
    mockCaptures.selectorProps = props;
    return null;
  });
  return {
    __esModule: true,
    default: MockField,
    renderInlineStringWithSelector: () => null,
  };
});
jest.mock('../../UI/CubicBezierEditor/CubicBezierEditorDialog', () => ({
  __esModule: true,
  default: (props: any) => {
    mockCaptures.dialogProps = props;
    return 'curve-dialog';
  },
}));

describe('getCustomEasingIdentifierOrNull', () => {
  it('returns the unquoted literal of a valid custom easing', () => {
    expect(
      getCustomEasingIdentifierOrNull('"cubic-bezier(.91,.17,.08,.88)"')
    ).toBe('cubic-bezier(.91,.17,.08,.88)');
  });

  it('returns null for a named easing, an invalid curve or an expression', () => {
    expect(getCustomEasingIdentifierOrNull('"easeInQuad"')).toBe(null);
    expect(getCustomEasingIdentifierOrNull('"cubic-bezier(2,0,1,1)"')).toBe(
      null
    );
    expect(
      getCustomEasingIdentifierOrNull(
        '"cubic-bezier(" + VariableString(X) + ")"'
      )
    ).toBe(null);
  });
});

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
    _: (message: any, values: any) => {
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
    const helperMarkdown = getCustomEasingHelperMarkdown((i18n: any));
    expect(helperMarkdown).toContain(`"${customEasingExampleIdentifier}"`);
  });
});

const getMessage = (descriptor: any): string =>
  typeof descriptor === 'string'
    ? descriptor
    : (descriptor && (descriptor.message || descriptor.id)) || '';

const renderEasingField = (value: string, onChange: string => void) => {
  let component = null;
  act(() => {
    component = renderer.create(
      <I18nProvider language="en" catalogs={{ en: { messages: {} } }}>
        {/* $FlowFixMe[incompatible-type] - the selector and the dialog are mocked. */}
        <EasingField value={value} onChange={onChange} />
      </I18nProvider>
    );
  });
  if (!component) throw new Error('EasingField did not render');
  return component;
};

const clickCustomCurveOption = () => {
  act(() => {
    mockCaptures.selectorProps.extraOptions[0].onClick();
  });
};

describe('EasingField custom curve option', () => {
  beforeEach(() => {
    mockCaptures.selectorProps = null;
    mockCaptures.dialogProps = null;
  });

  it('opens the dialog without calling onChange when Custom curve... is clicked', () => {
    const onChange: string => void = jest.fn();
    renderEasingField('"easeInQuad"', onChange);

    expect(getMessage(mockCaptures.selectorProps.extraOptions[0].label)).toBe(
      'Custom curve...'
    );
    expect(mockCaptures.selectorProps.onChange).toBe(onChange);

    clickCustomCurveOption();

    expect(onChange).not.toHaveBeenCalled();
    expect(mockCaptures.dialogProps).not.toBe(null);
  });

  it('calls onChange with the quoted string when the dialog applies', () => {
    const onChange: string => void = jest.fn();
    renderEasingField('"easeInQuad"', onChange);

    clickCustomCurveOption();
    act(() => {
      mockCaptures.dialogProps.onApply('cubic-bezier(.25,.1,.25,1)');
    });

    expect(onChange).toHaveBeenCalledWith('"cubic-bezier(.25,.1,.25,1)"');
  });

  it('does not call onChange when the dialog is cancelled', () => {
    const onChange: string => void = jest.fn();
    const component = renderEasingField('"easeInQuad"', onChange);

    clickCustomCurveOption();
    expect(JSON.stringify(component.toJSON())).toContain('curve-dialog');

    act(() => {
      mockCaptures.dialogProps.onClose();
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(JSON.stringify(component.toJSON())).not.toContain('curve-dialog');
  });

  it('labels the option Edit custom curve... when the value is custom', () => {
    const onChange: string => void = jest.fn();
    renderEasingField('"cubic-bezier(.91,.17,.08,.88)"', onChange);

    expect(getMessage(mockCaptures.selectorProps.extraOptions[0].label)).toBe(
      'Edit custom curve...'
    );
    expect(mockCaptures.selectorProps.choices).toContain(
      'cubic-bezier(.91,.17,.08,.88)'
    );
  });
});
