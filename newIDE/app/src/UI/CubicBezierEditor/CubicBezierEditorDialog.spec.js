/**
 * @flow
 * @jest-environment jsdom
 */
import * as React from 'react';
import { act } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import CubicBezierEditorDialog from './CubicBezierEditorDialog';

const mockCaptures: {|
  dialogProps: any,
  valueFieldsProps: any,
  presetGridProps: any,
|} = {
  dialogProps: null,
  valueFieldsProps: null,
  presetGridProps: null,
};

jest.mock('../Dialog', () => ({
  __esModule: true,
  default: (props: any) => {
    mockCaptures.dialogProps = props;
    return props.children;
  },
  DialogPrimaryButton: () => null,
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

const renderDialog = (onApply: string => void) => {
  act(() => {
    renderer.create(
      <CubicBezierEditorDialog
        initialPoints={[0.25, 0.1, 0.25, 1]}
        onApply={onApply}
        onClose={() => {}}
      />
    );
  });
};

const apply = () => {
  act(() => {
    mockCaptures.dialogProps.onApply();
  });
};

describe('CubicBezierEditorDialog', () => {
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
