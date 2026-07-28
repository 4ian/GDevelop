// @noflow
import * as React from 'react';
import ReactDOM from 'react-dom';
import TestRenderer, { act } from 'react-test-renderer';
import ElementWithMenu from './ElementWithMenu';

const mockOpenMenu = jest.fn();

jest.mock('react-dom', () => ({
  findDOMNode: jest.fn(),
}));

jest.mock('./ContextMenu', () => {
  const React = require('react');
  return React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      open: mockOpenMenu,
    }));
    return null;
  });
});

describe('ElementWithMenu', () => {
  beforeEach(() => {
    mockOpenMenu.mockClear();
    ReactDOM.findDOMNode.mockClear();
  });

  test('opens at pointer coordinates without forcing a layout read', () => {
    const component = TestRenderer.create(
      <ElementWithMenu
        element={<button type="button">Open menu</button>}
        buildMenuTemplate={() => []}
      />
    );
    const button = component.root.findByType('button');
    const pointerEvent = {
      clientX: 420.4,
      clientY: 125.6,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    };

    act(() => button.props.onClick(pointerEvent));

    expect(pointerEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(pointerEvent.stopPropagation).toHaveBeenCalledTimes(1);
    expect(mockOpenMenu).toHaveBeenCalledWith(420, 126);
    expect(ReactDOM.findDOMNode).not.toHaveBeenCalled();
  });

  test('uses the element bounds when opened without pointer coordinates', () => {
    const wrappedElement = {
      nodeType: 1,
      getBoundingClientRect: jest.fn(() => ({
        left: 100,
        top: 50,
        width: 40,
        height: 30,
      })),
    };
    ReactDOM.findDOMNode.mockReturnValue(wrappedElement);
    const component = TestRenderer.create(
      <ElementWithMenu
        element={<button type="button">Open menu</button>}
        buildMenuTemplate={() => []}
      />
    );

    act(() => component.getInstance().open());

    expect(ReactDOM.findDOMNode).toHaveBeenCalledTimes(1);
    expect(wrappedElement.getBoundingClientRect).toHaveBeenCalledTimes(1);
    expect(mockOpenMenu).toHaveBeenCalledWith(120, 80);
  });
});
