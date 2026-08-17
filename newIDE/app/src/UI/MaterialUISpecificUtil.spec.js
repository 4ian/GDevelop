/**
 * @jest-environment jsdom
 */
// @flow
import { getDialogFocusTrapContainer } from './MaterialUISpecificUtil';

// The class names are suffixed with a counter by Material UI when themes are
// nested (see `FullThemeProvider`), so both forms must be recognized.
const testCases: Array<{|
  title: string,
  html: string,
  expectedClassName: string | null,
|}> = [
  {
    title: 'the dialog container',
    html:
      '<div class="MuiDialog-container MuiDialog-scrollPaper"><i></i></div>',
    expectedClassName: 'MuiDialog-container MuiDialog-scrollPaper',
  },
  {
    title: 'the dialog container with suffixed class names',
    html:
      '<div class="MuiDialog-container-10242 MuiDialog-scrollPaper-10240"><i></i></div>',
    expectedClassName: 'MuiDialog-container-10242 MuiDialog-scrollPaper-10240',
  },
  {
    title: 'the innermost dialog container when dialogs are nested',
    html:
      '<div class="MuiDialog-container-1"><div class="MuiDialog-container-2"><i></i></div></div>',
    expectedClassName: 'MuiDialog-container-2',
  },
  {
    title: 'nothing when the element is not in a dialog',
    html: '<div class="some-panel"><i></i></div>',
    expectedClassName: null,
  },
  {
    title: 'nothing for a class only containing the container class name',
    html: '<div class="custom-MuiDialog-container"><i></i></div>',
    expectedClassName: null,
  },
];

describe('getDialogFocusTrapContainer', () => {
  testCases.forEach(({ title, html, expectedClassName }) => {
    it(`returns ${title}`, () => {
      const documentBody = document.body;
      if (!documentBody) throw new Error('The document body is missing.');

      documentBody.innerHTML = html;
      const element = document.querySelector('i');
      if (!element) throw new Error('The test element was not rendered.');

      const container = getDialogFocusTrapContainer(element);
      expect(container ? container.className : null).toBe(expectedClassName);
    });
  });
});
