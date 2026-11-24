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

  it('puts named easings in scope before built-ins', () => {
    expect(
      getEasingChoicesWithCustomValue(null, '"easeInQuad"', [
        'PopupOpen',
        'ButtonPress',
      ])
    ).toEqual(['PopupOpen', 'ButtonPress'].concat(allEasingNames));
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

const makeFakeEasing = (
  name: string,
  points: [number, number, number, number]
) => {
  let currentName = name;
  const currentPoints = [...points];
  return {
    points: currentPoints,
    getName: () => currentName,
    getX1: () => currentPoints[0],
    getY1: () => currentPoints[1],
    getX2: () => currentPoints[2],
    getY2: () => currentPoints[3],
    setName: (nextName: string) => {
      currentName = nextName;
    },
    setX1: (x1: number) => {
      currentPoints[0] = x1;
    },
    setY1: (y1: number) => {
      currentPoints[1] = y1;
    },
    setX2: (x2: number) => {
      currentPoints[2] = x2;
    },
    setY2: (y2: number) => {
      currentPoints[3] = y2;
    },
  };
};

const makeFakeContainer = (easings: Array<any>) => ({
  hasNamedEasingNamed: (name: string) =>
    easings.some(easing => easing.getName() === name),
  getNamedEasingsCount: () => easings.length,
  getNamedEasingAt: (index: number) => easings[index],
  getNamedEasing: (name: string): any =>
    easings.find(easing => easing.getName() === name),
  insertNewNamedEasing: jest.fn((name: string) => {
    const easing = makeFakeEasing(name, [0.25, 0.1, 0.25, 1]);
    easings.push(easing);
    return easing;
  }),
  removeNamedEasing: jest.fn((name: string) => {
    const index = easings.findIndex(easing => easing.getName() === name);
    if (index !== -1) easings.splice(index, 1);
  }),
});

const renderEasingField = (
  value: string,
  onChange: string => void,
  extraProps: Object = {}
) => {
  let component = null;
  act(() => {
    component = renderer.create(
      <I18nProvider language="en" catalogs={{ en: { messages: {} } }}>
        {/* $FlowFixMe[incompatible-type] - the selector and the dialog are mocked. */}
        <EasingField value={value} onChange={onChange} {...extraProps} />
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

const makeNamedEasingsProps = ({
  container,
  projectContainer = container,
  eventsFunctionsExtension,
  scopeExtensionName = eventsFunctionsExtension
    ? eventsFunctionsExtension.name
    : '',
  parameterType = 'easing',
}: {|
  container: any,
  projectContainer?: any,
  eventsFunctionsExtension?: any,
  scopeExtensionName?: string,
  parameterType?: string,
|}) => {
  const extension = eventsFunctionsExtension
    ? { ...eventsFunctionsExtension, getNamedEasings: () => container }
    : null;
  const project = {
    getNamedEasings: () => projectContainer,
    hasEventsFunctionsExtensionNamed: (name: string) =>
      !!extension && extension.name === name,
    getEventsFunctionsExtension: () => extension,
  };
  const scope = extension
    ? { project, eventsFunctionsExtension: extension }
    : { project };
  return {
    project,
    scope,
    parameterMetadata: {
      getType: () => parameterType,
      getExtraInfo: () => '',
    },
    projectScopedContainersAccessor: {
      getScope: () => scope,
      get: () => ({
        getNamedEasings: () =>
          scopeExtensionName ? container : projectContainer,
        getScopeExtensionName: () => scopeExtensionName,
      }),
    },
  };
};

const getErrorText = (value: string): ?string =>
  mockCaptures.selectorProps.onExtractAdditionalErrors
    ? mockCaptures.selectorProps.onExtractAdditionalErrors(value)
    : null;

describe('EasingField named easings', () => {
  const popupOpenPoints: [number, number, number, number] = [
    0.34,
    1.56,
    0.64,
    1,
  ];
  const originalWholeProjectRefactorer = global.gd.WholeProjectRefactorer;

  beforeEach(() => {
    mockCaptures.selectorProps = null;
    mockCaptures.dialogProps = null;
    global.gd.WholeProjectRefactorer = {
      renameNamedEasing: jest.fn(),
      renameNamedEasingInEventsFunctionsExtension: jest.fn(),
    };
  });

  afterAll(() => {
    global.gd.WholeProjectRefactorer = originalWholeProjectRefactorer;
  });

  const openNamedEasingEditor = (name: string = 'PopupOpen') => {
    act(() => {
      mockCaptures.selectorProps.getChoiceAction(name).onClick();
    });
  };

  it('lists named easings in scope first and keeps a built-in easing as the default choice', () => {
    renderEasingField(
      '"PopupOpen"',
      jest.fn(),
      makeNamedEasingsProps({
        container: makeFakeContainer([
          makeFakeEasing('PopupOpen', popupOpenPoints),
          makeFakeEasing('ButtonPress', [0.5, 0, 0.75, 0]),
        ]),
      })
    );

    expect(mockCaptures.selectorProps.choices.slice(0, 2)).toEqual([
      'PopupOpen',
      'ButtonPress',
    ]);
    expect(mockCaptures.selectorProps.defaultChoice).toBe(allEasingNames[0]);
    expect(getErrorText('"PopupOpen"')).toBe(null);
  });

  it('does not offer named easings for a "stringWithSelector" parameter displayed as an easing', () => {
    renderEasingField(
      '"PopupOpen"',
      jest.fn(),
      makeNamedEasingsProps({
        container: makeFakeContainer([
          makeFakeEasing('PopupOpen', popupOpenPoints),
        ]),
        parameterType: 'stringWithSelector',
      })
    );

    expect(mockCaptures.selectorProps.choices).not.toContain('PopupOpen');
    expect(mockCaptures.selectorProps.extraOptions).toHaveLength(1);
    expect(mockCaptures.selectorProps.onExtractAdditionalErrors).toBe(
      undefined
    );
  });

  it('warns for the value being checked when it is not a built-in, curve or named easing in scope', () => {
    renderEasingField(
      '"PopupOpen"',
      jest.fn(),
      makeNamedEasingsProps({
        container: makeFakeContainer([
          makeFakeEasing('PopupOpen', popupOpenPoints),
        ]),
      })
    );

    expect(getErrorText('"DeletedEasing"')).toMatch(/not defined/i);
    expect(getErrorText('VariableString(MyEasing)')).toBe(null);
  });

  it('only offers Custom curve... below the choices when the value is a named easing', () => {
    renderEasingField(
      '"PopupOpen"',
      jest.fn(),
      makeNamedEasingsProps({
        container: makeFakeContainer([
          makeFakeEasing('PopupOpen', popupOpenPoints),
        ]),
      })
    );

    expect(mockCaptures.selectorProps.extraOptions).toHaveLength(1);
    expect(getMessage(mockCaptures.selectorProps.extraOptions[0].label)).toBe(
      'Custom curve...'
    );
  });

  it('groups named easings apart from the built-in ones and custom curves, with labels', () => {
    renderEasingField(
      '"cubic-bezier(.5,0,.75,0)"',
      jest.fn(),
      makeNamedEasingsProps({
        container: makeFakeContainer([
          makeFakeEasing('PopupOpen', popupOpenPoints),
        ]),
      })
    );

    const {
      choices,
      getChoiceGroup,
      choiceGroupLabels,
    } = mockCaptures.selectorProps;
    expect(getChoiceGroup('PopupOpen')).toBe('named');
    expect(getChoiceGroup(allEasingNames[0])).toBe('builtIn');
    expect(getChoiceGroup(choices[choices.length - 1])).toBe('custom');
    expect(getMessage(choiceGroupLabels.named)).toBe('Named easings');
    expect(getMessage(choiceGroupLabels.custom)).toBe('Custom curve');
    expect(choiceGroupLabels.builtIn).toBe(undefined);
  });

  it('opens the editor of any named easing from its action in the list', () => {
    renderEasingField(
      '"easeInQuad"',
      jest.fn(),
      makeNamedEasingsProps({
        container: makeFakeContainer([
          makeFakeEasing('PopupOpen', popupOpenPoints),
          makeFakeEasing('ButtonPress', [0.5, 0, 0.75, 0]),
        ]),
      })
    );

    expect(mockCaptures.selectorProps.getChoiceAction('easeInQuad')).toBe(null);
    openNamedEasingEditor('ButtonPress');

    expect(mockCaptures.dialogProps.namedEasing.name).toBe('ButtonPress');
    expect(mockCaptures.dialogProps.initialPoints).toEqual([0.5, 0, 0.75, 0]);
  });

  it('only offers to detach the named easing used by the parameter', () => {
    renderEasingField(
      '"PopupOpen"',
      jest.fn(),
      makeNamedEasingsProps({
        container: makeFakeContainer([
          makeFakeEasing('PopupOpen', popupOpenPoints),
          makeFakeEasing('ButtonPress', [0.5, 0, 0.75, 0]),
        ]),
      })
    );

    openNamedEasingEditor('ButtonPress');
    expect(mockCaptures.dialogProps.namedEasing.onDetachAsCustomCurve).toBe(
      undefined
    );

    act(() => {
      mockCaptures.dialogProps.onClose();
    });
    openNamedEasingEditor('PopupOpen');
    expect(
      mockCaptures.dialogProps.namedEasing.onDetachAsCustomCurve
    ).toBeInstanceOf(Function);
  });

  it('inserts a named easing and sets the parameter when saving as named', () => {
    const onChange: string => void = jest.fn();
    const easings: Array<any> = [];
    const container = makeFakeContainer(easings);
    renderEasingField(
      '"easeInQuad"',
      onChange,
      makeNamedEasingsProps({ container })
    );

    clickCustomCurveOption();
    act(() => {
      mockCaptures.dialogProps.onSaveAsNamedEasing(
        'PopupOpen',
        'cubic-bezier(.34,1.56,.64,1)'
      );
    });

    expect(container.insertNewNamedEasing).toHaveBeenCalledWith('PopupOpen', 0);
    expect(easings[0].getName()).toBe('PopupOpen');
    expect(easings[0].points).toEqual([0.34, 1.56, 0.64, 1]);
    expect(onChange).toHaveBeenCalledWith('"PopupOpen"');
    expect(mockCaptures.dialogProps.namedEasing.name).toBe('PopupOpen');
  });

  it('renames through the project refactorer and updates the field value', () => {
    const onChange: string => void = jest.fn();
    const container = makeFakeContainer([
      makeFakeEasing('PopupOpen', popupOpenPoints),
    ]);
    const props = makeNamedEasingsProps({ container });
    renderEasingField('"PopupOpen"', onChange, props);

    openNamedEasingEditor();
    act(() => {
      mockCaptures.dialogProps.namedEasing.onApplyNamedEasing(
        'SlideIn',
        'cubic-bezier(.34,1.56,.64,1)'
      );
    });

    expect(
      global.gd.WholeProjectRefactorer.renameNamedEasing
    ).toHaveBeenCalledWith(props.project, 'PopupOpen', 'SlideIn');
    expect(
      global.gd.WholeProjectRefactorer
        .renameNamedEasingInEventsFunctionsExtension
    ).not.toHaveBeenCalled();
    expect(container.getNamedEasing('SlideIn').getName()).toBe('SlideIn');
    expect(onChange).toHaveBeenCalledWith('"SlideIn"');
  });

  it('renames through the extension refactorer when editing an extension function', () => {
    const container = makeFakeContainer([
      makeFakeEasing('PopupOpen', popupOpenPoints),
    ]);
    const props = makeNamedEasingsProps({
      container,
      eventsFunctionsExtension: { name: 'MyExtension' },
    });
    renderEasingField('"PopupOpen"', jest.fn(), props);

    openNamedEasingEditor();
    act(() => {
      mockCaptures.dialogProps.namedEasing.onApplyNamedEasing(
        'SlideIn',
        'cubic-bezier(.34,1.56,.64,1)'
      );
    });

    expect(
      global.gd.WholeProjectRefactorer
        .renameNamedEasingInEventsFunctionsExtension
    ).toHaveBeenCalledWith(
      props.project,
      props.scope.eventsFunctionsExtension,
      'PopupOpen',
      'SlideIn'
    );
    expect(
      global.gd.WholeProjectRefactorer.renameNamedEasing
    ).not.toHaveBeenCalled();
  });

  it('uses the project named easings when the scope has no extension', () => {
    const extensionContainer = makeFakeContainer([]);
    const projectContainer = makeFakeContainer([
      makeFakeEasing('PopupOpen', popupOpenPoints),
    ]);
    renderEasingField(
      '"PopupOpen"',
      jest.fn(),
      makeNamedEasingsProps({
        container: extensionContainer,
        projectContainer,
        eventsFunctionsExtension: { name: 'MyExtension' },
        scopeExtensionName: '',
      })
    );

    openNamedEasingEditor();
    act(() => {
      mockCaptures.dialogProps.namedEasing.onDeleteNamedEasing();
    });

    expect(projectContainer.removeNamedEasing).toHaveBeenCalledWith(
      'PopupOpen'
    );
    expect(extensionContainer.removeNamedEasing).not.toHaveBeenCalled();
  });

  it('deletes the named easing and leaves the parameter unchanged', () => {
    const onChange: string => void = jest.fn();
    const container = makeFakeContainer([
      makeFakeEasing('PopupOpen', popupOpenPoints),
    ]);
    renderEasingField(
      '"PopupOpen"',
      onChange,
      makeNamedEasingsProps({ container })
    );

    openNamedEasingEditor();
    act(() => {
      mockCaptures.dialogProps.namedEasing.onDeleteNamedEasing();
    });

    expect(container.removeNamedEasing).toHaveBeenCalledWith('PopupOpen');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('restores the custom curve when deleting a named easing saved in the same dialog', () => {
    const onChange: string => void = jest.fn();
    const container = makeFakeContainer([]);
    const props = makeNamedEasingsProps({ container });
    const component = renderEasingField(
      '"cubic-bezier(.34,1.56,.64,1)"',
      onChange,
      props
    );

    clickCustomCurveOption();
    act(() => {
      mockCaptures.dialogProps.onSaveAsNamedEasing(
        'PopupOpen',
        'cubic-bezier(.34,1.56,.64,1)'
      );
    });
    act(() => {
      component.update(
        <I18nProvider language="en" catalogs={{ en: { messages: {} } }}>
          {/* $FlowFixMe[incompatible-type] - the selector and the dialog are mocked. */}
          <EasingField value='"PopupOpen"' onChange={onChange} {...props} />
        </I18nProvider>
      );
    });
    act(() => {
      mockCaptures.dialogProps.namedEasing.onDeleteNamedEasing();
    });

    expect(container.removeNamedEasing).toHaveBeenCalledWith('PopupOpen');
    expect(onChange).toHaveBeenLastCalledWith('"cubic-bezier(.34,1.56,.64,1)"');
  });

  it('detaches as a custom curve without changing the named definition', () => {
    const onChange: string => void = jest.fn();
    const container = makeFakeContainer([
      makeFakeEasing('PopupOpen', popupOpenPoints),
    ]);
    renderEasingField(
      '"PopupOpen"',
      onChange,
      makeNamedEasingsProps({ container })
    );

    openNamedEasingEditor();
    act(() => {
      mockCaptures.dialogProps.namedEasing.onDetachAsCustomCurve(
        'cubic-bezier(.34,1.56,.64,1)'
      );
    });

    expect(onChange).toHaveBeenCalledWith('"cubic-bezier(.34,1.56,.64,1)"');
    expect(container.hasNamedEasingNamed('PopupOpen')).toBe(true);
  });
});
