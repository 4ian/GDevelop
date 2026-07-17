// @flow
/* eslint-disable no-use-before-define */

import {
  blurActiveElementBeforeUiTransition,
  cleanupLeakedOverlaysAfterPopOutClose,
} from './MaterialUISpecificUtil';

type FakeRect = {| left: number, top: number, width: number, height: number |};

class FakeElement {
  attributes: { [string]: string };
  children: Array<FakeElement>;
  classList: {| contains: string => boolean |};
  className: string;
  inert: boolean;
  nodeType: number;
  parentElement: ?FakeElement;
  parentNode: ?FakeElement;
  rect: FakeRect;
  style: any;
  tagName: string;

  constructor(
    className: string = '',
    {
      rect,
      style,
      tagName,
    }: {|
      rect?: FakeRect,
      style?: any,
      tagName?: string,
    |} = {}
  ) {
    this.tagName = tagName || 'DIV';
    this.className = className;
    this.children = [];
    this.parentNode = null;
    this.parentElement = null;
    this.attributes = {};
    this.inert = false;
    this.nodeType = 1;
    this.rect = rect || { left: 0, top: 0, width: 0, height: 0 };
    this.style = {
      ...(style || {}),
      removeProperty: (propertyName: string) => {
        const property =
          propertyName === 'padding-right'
            ? 'paddingRight'
            : propertyName === 'pointer-events'
            ? 'pointerEvents'
            : propertyName;
        delete this.style[property];
      },
    };
    this.classList = {
      contains: (name: string) => this.className.split(/\s+/).includes(name),
    };
  }

  appendChild(child: FakeElement): FakeElement {
    child.parentNode = this;
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  removeChild(child: FakeElement): FakeElement {
    if (!this.children.includes(child)) {
      throw new Error('The node to be removed is not a child of this node.');
    }
    this.children = this.children.filter(element => element !== child);
    child.parentNode = null;
    child.parentElement = null;
    return child;
  }

  get firstElementChild(): ?FakeElement {
    return this.children[0] || null;
  }

  setAttribute(name: string, value: string) {
    this.attributes[name] = value;
  }

  getAttribute(name: string): ?string {
    return Object.keys(this.attributes).includes(name)
      ? this.attributes[name]
      : null;
  }

  removeAttribute(name: string) {
    delete this.attributes[name];
  }

  contains(element: FakeElement): boolean {
    return (
      this === element || this.children.some(child => child.contains(element))
    );
  }

  getBoundingClientRect(): FakeRect {
    return this.rect;
  }

  matches(selector: string): boolean {
    return selector.split(',').some(selectorPart => {
      const trimmedSelector = selectorPart.trim();
      if (trimmedSelector === '*') return true;
      if (trimmedSelector.startsWith('.')) {
        return this.className.split(/\s+/).includes(trimmedSelector.slice(1));
      }
      if (trimmedSelector.startsWith('#')) {
        return this.getAttribute('id') === trimmedSelector.slice(1);
      }
      if (trimmedSelector === '[aria-hidden="true"]') {
        return this.getAttribute('aria-hidden') === 'true';
      }
      if (trimmedSelector === '[inert]') {
        return Object.keys(this.attributes).includes('inert') || !!this.inert;
      }
      const roleMatch = trimmedSelector.match(/^\[role="([^"]+)"\]$/);
      if (roleMatch) return this.getAttribute('role') === roleMatch[1];
      return false;
    });
  }

  getDescendants(): Array<FakeElement> {
    const descendants: Array<FakeElement> = [];
    this.children.forEach(child => {
      descendants.push(child);
      descendants.push(...child.getDescendants());
    });
    return descendants;
  }

  querySelectorAll(selector: string): Array<FakeElement> {
    const results: Array<FakeElement> = [];
    const addResult = (element: FakeElement) => {
      if (!results.includes(element)) results.push(element);
    };

    selector.split(',').forEach(selectorPart => {
      const trimmedSelector = selectorPart.trim();
      if (trimmedSelector.startsWith(':scope > ')) {
        const directChildSelector = trimmedSelector.slice(':scope > '.length);
        this.children.forEach(child => {
          if (child.matches(directChildSelector)) addResult(child);
        });
        return;
      }

      this.getDescendants().forEach(descendant => {
        if (trimmedSelector === '*' || descendant.matches(trimmedSelector)) {
          addResult(descendant);
        }
      });
    });

    return results;
  }

  querySelector(selector: string): ?FakeElement {
    return this.querySelectorAll(selector)[0] || null;
  }
}

const installFakeDom = (
  body: FakeElement,
  activeElement?: FakeElement
): (() => void) => {
  const originalDocument = (global: any).document;
  const originalHTMLElement = (global: any).HTMLElement;
  const originalWindow = (global: any).window;

  (global: any).HTMLElement = FakeElement;
  (global: any).document = {
    activeElement: activeElement || body,
    body,
    documentElement: { clientWidth: 1000, clientHeight: 800 },
  };
  (global: any).window = {
    getComputedStyle: (element: FakeElement) => element.style,
    innerHeight: 800,
    innerWidth: 1000,
  };

  return () => {
    if (originalDocument === undefined) delete (global: any).document;
    else (global: any).document = originalDocument;
    if (originalHTMLElement === undefined) delete (global: any).HTMLElement;
    else (global: any).HTMLElement = originalHTMLElement;
    if (originalWindow === undefined) delete (global: any).window;
    else (global: any).window = originalWindow;
  };
};

const fullWindowStyle = {
  display: 'block',
  pointerEvents: 'auto',
  position: 'fixed',
  visibility: 'visible',
  zIndex: '1300',
};

const fullWindowRect = { left: 0, top: 0, width: 1000, height: 800 };

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

  test('neutralizes a stale backdrop-only MUI overlay without detaching React-owned DOM', () => {
    const body = new FakeElement('body');
    const appRoot = new FakeElement();
    appRoot.setAttribute('aria-hidden', 'true');
    body.appendChild(appRoot);
    body.style.overflow = 'hidden';
    body.style.paddingRight = '15px';

    const overlay = new FakeElement('MuiModal-root', {
      rect: fullWindowRect,
      style: fullWindowStyle,
    });
    const backdrop = new FakeElement('MuiBackdrop-root', {
      rect: fullWindowRect,
      style: fullWindowStyle,
    });
    overlay.appendChild(backdrop);
    body.appendChild(overlay);

    const restoreDom = installFakeDom(body);
    try {
      cleanupLeakedOverlaysAfterPopOutClose();

      expect(body.children).toContain(overlay);
      expect(overlay.style.pointerEvents).toBe('none');
      expect(overlay.style.visibility).toBe('hidden');
      expect(overlay.getAttribute('aria-hidden')).toBe('true');
      expect(overlay.getAttribute('data-gdevelop-stale-overlay')).toBe('true');
      expect(appRoot.getAttribute('aria-hidden')).toBe(null);
      expect(body.style.overflow).toBe(undefined);
      expect(body.style.paddingRight).toBe(undefined);

      // React still owns the portal root and must be able to complete the
      // unmount itself without hitting a removeChild NotFoundError.
      expect(() => body.removeChild(overlay)).not.toThrow();
    } finally {
      restoreDom();
    }
  });

  test('keeps a real MUI dialog with interactive content open', () => {
    const body = new FakeElement('body');
    const appRoot = new FakeElement();
    appRoot.setAttribute('aria-hidden', 'true');
    body.appendChild(appRoot);
    body.style.overflow = 'hidden';

    const overlay = new FakeElement('MuiDialog-root', {
      rect: fullWindowRect,
      style: fullWindowStyle,
    });
    const backdrop = new FakeElement('MuiBackdrop-root', {
      rect: fullWindowRect,
      style: fullWindowStyle,
    });
    const paper = new FakeElement('MuiPaper-root', {
      rect: { left: 300, top: 200, width: 400, height: 250 },
      style: {
        display: 'block',
        position: 'relative',
        visibility: 'visible',
      },
    });
    overlay.appendChild(backdrop);
    overlay.appendChild(paper);
    body.appendChild(overlay);

    const restoreDom = installFakeDom(body, paper);
    try {
      cleanupLeakedOverlaysAfterPopOutClose();

      expect(body.children).toContain(overlay);
      expect(overlay.children).toContain(backdrop);
      expect(appRoot.getAttribute('aria-hidden')).toBe('true');
      expect(body.style.overflow).toBe('hidden');
    } finally {
      restoreDom();
    }
  });

  test('keeps a hidden keep-mounted drawer attached so it can be reopened', () => {
    const body = new FakeElement('body');
    const appRoot = new FakeElement();
    body.appendChild(appRoot);

    const overlay = new FakeElement('MuiModal-root', {
      rect: fullWindowRect,
      style: {
        ...fullWindowStyle,
        visibility: 'hidden',
      },
    });
    overlay.setAttribute('aria-hidden', 'true');
    const backdrop = new FakeElement('MuiBackdrop-root', {
      rect: fullWindowRect,
      style: {
        ...fullWindowStyle,
        visibility: 'hidden',
      },
    });
    const drawerPaper = new FakeElement('MuiPaper-root MuiDrawer-paper', {
      rect: { left: 0, top: 0, width: 320, height: 800 },
      style: {
        display: 'block',
        position: 'fixed',
        visibility: 'hidden',
      },
    });
    drawerPaper.setAttribute('id', 'project-manager-drawer-paper');
    overlay.appendChild(backdrop);
    overlay.appendChild(drawerPaper);
    body.appendChild(overlay);

    const restoreDom = installFakeDom(body);
    try {
      cleanupLeakedOverlaysAfterPopOutClose();

      expect(body.children).toContain(overlay);
      expect(overlay.children).toContain(drawerPaper);
    } finally {
      restoreDom();
    }
  });

  test('keeps the backdrop of a keep-mounted MUI Drawer modal', () => {
    const body = new FakeElement('body');
    const appRoot = new FakeElement();
    body.appendChild(appRoot);

    const drawerRoot = new FakeElement('MuiDrawer-root MuiDrawer-modal', {
      rect: fullWindowRect,
      style: {
        ...fullWindowStyle,
        visibility: 'hidden',
      },
    });
    drawerRoot.setAttribute('aria-hidden', 'true');
    const backdrop = new FakeElement('MuiBackdrop-root', {
      rect: fullWindowRect,
      style: {
        ...fullWindowStyle,
        visibility: 'hidden',
      },
    });
    const drawerPaper = new FakeElement('MuiPaper-root MuiDrawer-paper', {
      rect: { left: 0, top: 0, width: 320, height: 800 },
      style: {
        display: 'block',
        position: 'fixed',
        visibility: 'hidden',
      },
    });
    drawerPaper.setAttribute('id', 'version-history-drawer-paper');
    drawerRoot.appendChild(backdrop);
    drawerRoot.appendChild(drawerPaper);
    body.appendChild(drawerRoot);

    const restoreDom = installFakeDom(body);
    try {
      cleanupLeakedOverlaysAfterPopOutClose();

      expect(body.children).toContain(drawerRoot);
      expect(drawerRoot.children).toContain(backdrop);
      expect(drawerRoot.children).toContain(drawerPaper);
    } finally {
      restoreDom();
    }
  });

  test('neutralizes a hidden Paper overlay without detaching it', () => {
    const body = new FakeElement('body');
    const appRoot = new FakeElement();
    body.appendChild(appRoot);

    const overlay = new FakeElement('MuiModal-root', {
      rect: fullWindowRect,
      style: {
        ...fullWindowStyle,
        visibility: 'hidden',
      },
    });
    overlay.setAttribute('aria-hidden', 'true');
    const stalePaper = new FakeElement('MuiPaper-root', {
      rect: { left: 0, top: 0, width: 320, height: 800 },
      style: {
        display: 'block',
        position: 'fixed',
        visibility: 'hidden',
      },
    });
    overlay.appendChild(stalePaper);
    body.appendChild(overlay);

    const restoreDom = installFakeDom(body);
    try {
      cleanupLeakedOverlaysAfterPopOutClose();

      expect(body.children).toContain(overlay);
      expect(overlay.style.pointerEvents).toBe('none');
      expect(overlay.style.visibility).toBe('hidden');
      expect(overlay.getAttribute('data-gdevelop-stale-overlay')).toBe('true');
      expect(() => body.removeChild(overlay)).not.toThrow();
    } finally {
      restoreDom();
    }
  });
});
