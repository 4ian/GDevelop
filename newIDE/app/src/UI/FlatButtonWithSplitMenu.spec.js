/**
 * @jest-environment jsdom
 * @jest-environment-options {"url":"http://localhost/"}
 */
// @flow
import * as React from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import FlatButtonWithSplitMenu from './FlatButtonWithSplitMenu';
import {
  captureMaterialUiOverlayCleanupCandidates,
  cleanupLeakedOverlaysAfterPopOutClose,
} from './MaterialUISpecificUtil';

jest.mock('@lingui/react', () => ({
  I18n: ({ children }: {| children: Function |}) => children({ i18n: {} }),
}));

describe('FlatButtonWithSplitMenu', () => {
  let previousActEnvironment;

  beforeEach(() => {
    previousActEnvironment = (global: any).IS_REACT_ACT_ENVIRONMENT;
    (global: any).IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(() => {
    (global: any).IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
  });

  test('survives delayed pop-out cleanup for 20 consecutive clicks', () => {
    const menuItemClicked: () => void = jest.fn();
    const container = document.createElement('div');
    const body = document.body;
    if (!body) throw new Error('Document body not found.');
    body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <FlatButtonWithSplitMenu
          label="Preview"
          onClick={() => {}}
          splitMenuButtonId="preview-split-menu"
          buildMenuTemplate={() => [
            { label: 'Preview option', click: menuItemClicked },
          ]}
        />
      );
    });

    const splitMenuButton = document.getElementById('preview-split-menu');
    if (!splitMenuButton)
      throw new Error('Preview split-menu button not found.');

    for (let clickIndex = 0; clickIndex < 20; clickIndex++) {
      // Recreate the race that used to disable Preview's menu: a stale modal
      // exists when pop-out cleanup is scheduled, then the user opens the
      // dropdown before the delayed cleanup pass runs.
      const staleOverlay = document.createElement('div');
      staleOverlay.className = 'MuiModal-root';
      staleOverlay.style.position = 'fixed';
      staleOverlay.style.top = '0';
      staleOverlay.style.right = '0';
      staleOverlay.style.bottom = '0';
      staleOverlay.style.left = '0';
      const staleBackdrop = document.createElement('div');
      staleBackdrop.className = 'MuiBackdrop-root';
      staleOverlay.appendChild(staleBackdrop);
      body.appendChild(staleOverlay);
      const cleanupCandidates = captureMaterialUiOverlayCleanupCandidates();

      act(() => {
        splitMenuButton.dispatchEvent(
          new MouseEvent('click', { bubbles: true })
        );
      });

      cleanupLeakedOverlaysAfterPopOutClose(cleanupCandidates);

      const menu = document.querySelector('[role="menu"]');
      expect(menu).not.toBe(null);
      const menuRoot: any = menu && menu.closest('.MuiPopover-root');
      expect(menuRoot && menuRoot.style.pointerEvents).not.toBe('none');
      const menuItem = document.querySelector('[role="menuitem"]');
      if (!menuItem) throw new Error('Preview dropdown item not found.');

      expect(staleOverlay.style.pointerEvents).toBe('none');
      staleOverlay.remove();

      act(() => {
        menuItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(document.querySelector('[role="menu"]')).toBe(null);
    }

    expect(menuItemClicked).toHaveBeenCalledTimes(20);
    act(() => root.unmount());
    container.remove();
  });
});
