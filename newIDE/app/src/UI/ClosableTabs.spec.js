// @flow
import * as React from 'react';
import TestRenderer from 'react-test-renderer';
import { act } from 'react-dom/test-utils';
import { ClosableTab } from './ClosableTabs';

jest.mock('@material-ui/core/ButtonBase', () => props => (
  <button onClick={props.onClick}>{props.children}</button>
));
jest.mock('./Menu/ContextMenu', () => {
  const ReactForMock = require('react');
  return ReactForMock.forwardRef((props: any, ref: any) => null);
});
jest.mock('../Utils/UseLongTouch', () => ({
  useLongTouch: () => ({ contextMenuProps: {} }),
}));
jest.mock('./Theme/GDevelopThemeContext', () => {
  const ReactForMock = require('react');
  return ReactForMock.createContext({
    closableTabs: {
      selectedTextColor: '#fff',
      textColor: '#fff',
      selectedBorderColor: '#fff',
      backgroundColor: '#000',
      selectedBackgroundColor: '#000',
      height: 32,
      fontFamily: 'sans-serif',
    },
    palette: { type: 'dark' },
  });
});

const makeProps = (active: boolean, onActivated: () => void): any => ({
  active,
  onActivated,
  onClose: () => {},
  onCloseOthers: () => {},
  onCloseAll: () => {},
  onClick: () => {},
  onHover: () => {},
  label: 'Events',
  icon: null,
  closable: true,
  maxWidth: 200,
});

describe('ClosableTab', () => {
  it('activates once when selected, without reactivating for a new callback', () => {
    const firstOnActivated = jest.fn<[], void>();
    const nextOnActivated = jest.fn<[], void>();
    let component: any;

    act(() => {
      component = TestRenderer.create(
        <ClosableTab {...makeProps(false, firstOnActivated)} />
      );
    });
    act(() => {
      component.update(<ClosableTab {...makeProps(true, firstOnActivated)} />);
    });
    act(() => {
      component.update(<ClosableTab {...makeProps(true, nextOnActivated)} />);
    });

    expect(firstOnActivated).toHaveBeenCalledTimes(1);
    expect(nextOnActivated).not.toHaveBeenCalled();
  });
});
