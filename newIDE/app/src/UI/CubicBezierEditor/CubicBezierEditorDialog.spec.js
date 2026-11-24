/**
 * @flow
 * @jest-environment jsdom
 */
import * as React from 'react';
import { act } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import { I18nProvider } from '@lingui/react';
import CubicBezierEditorDialog from './CubicBezierEditorDialog';

const mockCaptures: {|
  dialogProps: any,
  saveAsDialogProps: any,
  valueFieldsProps: any,
  presetGridProps: any,
  nameFieldProps: any,
  flatButtons: Array<any>,
  alertMessages: Array<any>,
|} = {
  dialogProps: null,
  saveAsDialogProps: null,
  valueFieldsProps: null,
  presetGridProps: null,
  nameFieldProps: null,
  flatButtons: [],
  alertMessages: [],
};

const mockShowConfirmation: JestMockFn<any, any> = jest.fn(() =>
  Promise.resolve(true)
);
jest.mock('../Alert/useAlertDialog', () => ({
  __esModule: true,
  default: () => ({
    showConfirmation: options => mockShowConfirmation(options),
  }),
}));
jest.mock('../AlertMessage', () => ({
  __esModule: true,
  default: (props: any) => {
    mockCaptures.alertMessages.push(props);
    return 'alert-message';
  },
}));
jest.mock('../TextField', () => ({
  __esModule: true,
  default: (props: any) => {
    mockCaptures.nameFieldProps = props;
    return 'name-field';
  },
}));
jest.mock('../FlatButton', () => ({
  __esModule: true,
  default: (props: any) => {
    mockCaptures.flatButtons.push(props);
    return 'flat-button';
  },
}));

jest.mock('../Dialog', () => ({
  __esModule: true,
  default: (props: any) => {
    if (props.id === 'save-as-named-easing-dialog') {
      mockCaptures.saveAsDialogProps = props;
    } else {
      mockCaptures.dialogProps = props;
    }
    return props.children;
  },
  DialogPrimaryButton: (props: any) => {
    mockCaptures.flatButtons.push(props);
    return 'primary-button';
  },
}));
jest.mock('../Responsive/ResponsiveWindowMeasurer', () => ({
  useResponsiveWindowSize: () => ({ isMobile: false }),
}));
jest.mock('./UseCubicBezierCurveSize', () => ({
  useCubicBezierCurveSize: () => ({
    graphFrameRef: { current: null },
    curveSize: 240,
  }),
}));
jest.mock('./CubicBezierCurveEditor', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('./CubicBezierAnimatedPreview', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('./CubicBezierPresetGrid', () => ({
  __esModule: true,
  presetGridWidth: 380,
  default: (props: any) => {
    mockCaptures.presetGridProps = props;
    return null;
  },
}));
jest.mock('./CubicBezierValueFields', () => ({
  __esModule: true,
  default: (props: any) => {
    mockCaptures.valueFieldsProps = props;
    return null;
  },
}));

const renderDialog = (onApply: string => void, extraProps: Object = {}) => {
  act(() => {
    renderer.create(
      <I18nProvider language="en" catalogs={{ en: { messages: {} } }}>
        <CubicBezierEditorDialog
          initialPoints={[0.25, 0.1, 0.25, 1]}
          onApply={onApply}
          onClose={() => {}}
          {...extraProps}
        />
      </I18nProvider>
    );
  });
};

const getSecondaryAction = (key: string) =>
  (mockCaptures.dialogProps.secondaryActions || []).find(
    action => action && action.key === key
  );

const apply = () => {
  act(() => {
    mockCaptures.dialogProps.onApply();
  });
};

describe('CubicBezierEditorDialog', () => {
  beforeEach(() => {
    mockCaptures.dialogProps = null;
    mockCaptures.saveAsDialogProps = null;
    mockCaptures.valueFieldsProps = null;
    mockCaptures.presetGridProps = null;
    mockCaptures.nameFieldProps = null;
    mockCaptures.flatButtons = [];
    mockCaptures.alertMessages = [];
    mockShowConfirmation.mockReset();
    mockShowConfirmation.mockResolvedValue(true);
  });

  it('applies the edited curve', () => {
    const onApply: string => void = jest.fn();
    renderDialog(onApply);

    act(() => {
      mockCaptures.valueFieldsProps.onChangePoints([0.1, 0.2, 0.3, 0.4]);
    });
    apply();

    expect(onApply).toHaveBeenCalledWith('cubic-bezier(.1,.2,.3,.4)');
  });

  it('does not apply while the value is invalid', () => {
    const onApply: string => void = jest.fn();
    renderDialog(onApply);

    act(() => {
      mockCaptures.valueFieldsProps.onInvalidValue('cubic-bezier(2,0,1,1)');
    });
    apply();

    expect(onApply).not.toHaveBeenCalled();
    expect(mockCaptures.valueFieldsProps.invalidValueText).toBe(
      'cubic-bezier(2,0,1,1)'
    );
  });

  it('clears the invalid value when another curve is chosen', () => {
    const onApply: string => void = jest.fn();
    renderDialog(onApply);

    act(() => {
      mockCaptures.valueFieldsProps.onInvalidValue('not a curve');
    });
    act(() => {
      mockCaptures.presetGridProps.onSelect([0.42, 0, 1, 1]);
    });
    apply();

    expect(mockCaptures.valueFieldsProps.invalidValueText).toBe(null);
    expect(onApply).toHaveBeenCalledWith('cubic-bezier(.42,0,1,1)');
  });
});

describe('CubicBezierEditorDialog named mode', () => {
  const namedEasingCallbacks: {|
    onApplyNamedEasing: JestMockFn<any, any>,
    onDeleteNamedEasing: JestMockFn<any, any>,
    onDetachAsCustomCurve: JestMockFn<any, any>,
  |} = {
    onApplyNamedEasing: jest.fn(),
    onDeleteNamedEasing: jest.fn(),
    onDetachAsCustomCurve: jest.fn(),
  };

  beforeEach(() => {
    mockCaptures.dialogProps = null;
    mockCaptures.saveAsDialogProps = null;
    mockCaptures.valueFieldsProps = null;
    mockCaptures.presetGridProps = null;
    mockCaptures.nameFieldProps = null;
    mockCaptures.flatButtons = [];
    mockCaptures.alertMessages = [];
    mockShowConfirmation.mockReset();
    mockShowConfirmation.mockResolvedValue(true);
    namedEasingCallbacks.onApplyNamedEasing.mockReset();
    namedEasingCallbacks.onDeleteNamedEasing.mockReset();
    namedEasingCallbacks.onDetachAsCustomCurve.mockReset();
  });

  const renderNamedDialog = (extraProps: Object = {}) => {
    act(() => {
      renderer.create(
        <I18nProvider language="en" catalogs={{ en: { messages: {} } }}>
          <CubicBezierEditorDialog
            initialPoints={[0.34, 1.56, 0.64, 1]}
            onApply={jest.fn()}
            onClose={jest.fn()}
            existingNamedEasingNames={['PopupOpen', 'ButtonPress']}
            namedEasing={{
              name: 'PopupOpen',
              ...namedEasingCallbacks,
            }}
            {...extraProps}
          />
        </I18nProvider>
      );
    });
  };

  it('applies the named easing with the edited name and curve', () => {
    renderNamedDialog();

    act(() => {
      mockCaptures.nameFieldProps.onChange({}, 'SlideIn');
    });
    act(() => {
      mockCaptures.valueFieldsProps.onChangePoints([0.1, 0.2, 0.3, 0.4]);
    });
    apply();

    expect(namedEasingCallbacks.onApplyNamedEasing).toHaveBeenCalledWith(
      'SlideIn',
      'cubic-bezier(.1,.2,.3,.4)'
    );
  });

  it('does not apply a named easing when the name is invalid', () => {
    renderNamedDialog();

    act(() => {
      mockCaptures.nameFieldProps.onChange({}, 'easeInQuad');
    });
    apply();

    expect(namedEasingCallbacks.onApplyNamedEasing).not.toHaveBeenCalled();
  });

  it('shows the error and disables Apply when the name is emptied', () => {
    renderNamedDialog();

    act(() => {
      mockCaptures.nameFieldProps.onChange({}, '');
    });

    expect(mockCaptures.nameFieldProps.errorText).toMatch(/empty/i);
    const applyButton = mockCaptures.dialogProps.actions.find(
      action => action.key === 'apply'
    );
    expect(applyButton.props.disabled).toBe(true);
  });

  it('saves an anonymous curve as a named easing from a nested dialog', () => {
    const onSaveAsNamedEasing: (string, string) => void = jest.fn();
    const onClose: () => void = jest.fn();
    const onApply: string => void = jest.fn();
    renderDialog(onApply, {
      existingNamedEasingNames: ['ButtonPress'],
      onSaveAsNamedEasing,
      onClose,
    });

    act(() => {
      mockCaptures.valueFieldsProps.onChangePoints([0.34, 1.56, 0.64, 1]);
    });
    act(() => {
      getSecondaryAction('save-as-named-easing').props.onClick();
    });
    expect(mockCaptures.saveAsDialogProps).toBeTruthy();
    act(() => {
      mockCaptures.nameFieldProps.onChange({}, 'PopupOpen');
    });
    act(() => {
      mockCaptures.saveAsDialogProps.onApply();
    });

    expect(onSaveAsNamedEasing).toHaveBeenCalledWith(
      'PopupOpen',
      'cubic-bezier(.34,1.56,.64,1)'
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(onApply).not.toHaveBeenCalled();
  });

  it('cancels the save-as dialog without applying or saving', () => {
    const onSaveAsNamedEasing: (string, string) => void = jest.fn();
    const onClose: () => void = jest.fn();
    const onApply: string => void = jest.fn();
    renderDialog(onApply, {
      onSaveAsNamedEasing,
      onClose,
    });

    act(() => {
      getSecondaryAction('save-as-named-easing').props.onClick();
    });
    act(() => {
      mockCaptures.nameFieldProps.onChange({}, 'PopupOpen');
    });
    act(() => {
      mockCaptures.saveAsDialogProps.onRequestClose();
    });

    expect(onSaveAsNamedEasing).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(onApply).not.toHaveBeenCalled();
  });

  it('warns when saving a curve that already exists under another name', () => {
    const onSaveAsNamedEasing: (string, string) => void = jest.fn();
    renderDialog(jest.fn(), {
      existingNamedEasingNames: ['Wheel'],
      existingNamedEasingPointsByName: {
        Wheel: [0.08, 3.35, 0.95, -1.08],
      },
      onSaveAsNamedEasing,
    });

    act(() => {
      mockCaptures.valueFieldsProps.onChangePoints([0.08, 3.35, 0.95, -1.08]);
    });
    act(() => {
      getSecondaryAction('save-as-named-easing').props.onClick();
    });

    expect(
      mockCaptures.alertMessages.some(message => message.kind === 'warning')
    ).toBe(true);

    act(() => {
      mockCaptures.nameFieldProps.onChange({}, 'wheel1');
    });
    act(() => {
      mockCaptures.saveAsDialogProps.onApply();
    });

    expect(onSaveAsNamedEasing).toHaveBeenCalledWith(
      'wheel1',
      'cubic-bezier(.08,3.35,.95,-1.08)'
    );
  });

  it('deletes after confirmation', async () => {
    const onClose: () => void = jest.fn();
    renderNamedDialog({ onClose });

    await act(async () => {
      await getSecondaryAction('delete-named-easing').props.onClick();
    });

    expect(mockShowConfirmation).toHaveBeenCalled();
    expect(namedEasingCallbacks.onDeleteNamedEasing).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('does not delete when confirmation is cancelled', async () => {
    mockShowConfirmation.mockResolvedValue(false);
    renderNamedDialog();

    await act(async () => {
      await getSecondaryAction('delete-named-easing').props.onClick();
    });

    expect(namedEasingCallbacks.onDeleteNamedEasing).not.toHaveBeenCalled();
  });

  it('detaches as a custom curve', () => {
    const onClose: () => void = jest.fn();
    renderNamedDialog({ onClose });

    act(() => {
      mockCaptures.valueFieldsProps.onChangePoints([0.1, 0.2, 0.3, 0.4]);
    });
    act(() => {
      getSecondaryAction('detach-as-custom-curve').props.onClick();
    });

    expect(namedEasingCallbacks.onDetachAsCustomCurve).toHaveBeenCalledWith(
      'cubic-bezier(.1,.2,.3,.4)'
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('hides Detach as custom curve when it is not offered', () => {
    const { onApplyNamedEasing, onDeleteNamedEasing } = namedEasingCallbacks;
    renderNamedDialog({
      namedEasing: {
        name: 'PopupOpen',
        onApplyNamedEasing,
        onDeleteNamedEasing,
      },
    });

    expect(getSecondaryAction('delete-named-easing')).toBeTruthy();
    expect(getSecondaryAction('detach-as-custom-curve')).toBe(undefined);
  });

  it('labels the cancel button Close once the curve was saved as a named easing', () => {
    let component = null;
    const getCancelButtonLabel = () =>
      mockCaptures.dialogProps.actions.find(action => action.key === 'cancel')
        .props.label.props.id;
    const renderSaveAsDialog = (namedEasing: any) => (
      <I18nProvider language="en" catalogs={{ en: { messages: {} } }}>
        <CubicBezierEditorDialog
          initialPoints={[0.34, 1.56, 0.64, 1]}
          onApply={jest.fn()}
          onClose={jest.fn()}
          onSaveAsNamedEasing={jest.fn()}
          namedEasing={namedEasing}
        />
      </I18nProvider>
    );
    act(() => {
      component = renderer.create(renderSaveAsDialog(null));
    });
    expect(getCancelButtonLabel()).toBe('Cancel');

    act(() => {
      getSecondaryAction('save-as-named-easing').props.onClick();
    });
    act(() => {
      mockCaptures.nameFieldProps.onChange({}, 'PopupOpen');
    });
    act(() => {
      mockCaptures.saveAsDialogProps.onApply();
    });
    act(() => {
      if (!component) throw new Error('Dialog did not render');
      component.update(
        renderSaveAsDialog({ name: 'PopupOpen', ...namedEasingCallbacks })
      );
    });

    expect(getCancelButtonLabel()).toBe('Close');
  });
});
