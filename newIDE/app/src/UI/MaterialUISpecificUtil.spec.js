// @flow

import { blurActiveElementBeforeUiTransition } from './MaterialUISpecificUtil';

describe('MaterialUISpecificUtil', () => {
  test('blurs the focused control before a UI transition can aria-hide it', () => {
    const originalDocument = (global: any).document;
    const originalHTMLElement = (global: any).HTMLElement;
    const blur = jest.fn<[], void>();
    class FocusedElement {
      blur() {
        blur();
      }
    }
    (global: any).HTMLElement = FocusedElement;
    (global: any).document = { activeElement: new FocusedElement() };

    try {
      blurActiveElementBeforeUiTransition();
      expect(blur).toHaveBeenCalledTimes(1);
    } finally {
      if (originalDocument === undefined) delete (global: any).document;
      else (global: any).document = originalDocument;
      if (originalHTMLElement === undefined) delete (global: any).HTMLElement;
      else (global: any).HTMLElement = originalHTMLElement;
    }
  });
});
