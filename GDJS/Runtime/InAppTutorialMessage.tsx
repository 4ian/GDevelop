/*
 * GDevelop JS Platform
 * Copyright 2013-2025 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  declare var nmd: any;
  const logger = new gdjs.Logger('InAppTutorialMessage');
  const padding = '20px';
  const redHeroImage =
    'data:image/png;base64,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';

  /** A minimal utility to define DOM elements. */
  function h<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    attrs: {
      style?: Partial<CSSStyleDeclaration>;
      onClick?: () => void;
    },
    ...nodes: (HTMLElement | string)[]
  ): HTMLElement {
    const node = document.createElement(tag);
    Object.keys(attrs).forEach((key) => {
      if (key === 'style') {
        for (const [styleName, value] of Object.entries(attrs.style!)) {
          node.style[styleName] = value;
        }
      } else if (key === 'onClick') {
        node.addEventListener('click', attrs[key]!);
      } else {
        node.setAttribute(key, '' + attrs[key]);
      }
    });

    node.append(...nodes);
    return node;
  }

  const styles = {
    container: {
      position: 'absolute',
      zIndex: '1',
      display: 'flex',
    },
    avatarContainer: {
      display: 'flex',
      boxShadow:
        'rgba(43, 19, 19, 0.2) 0px 2px 4px -1px, rgba(0, 0, 0, 0.14) 0px 4px 5px 0px, rgba(0, 0, 0, 0.12) 0px 1px 10px 0px',
      borderRadius: '30px',
      cursor: 'pointer',
    },
    messageContainer: {
      position: 'absolute',
      padding: '10px 12px',
      minWidth: '180px',
      borderRadius: '8px',
      backgroundColor: 'rgb(250, 250, 250)',
      boxShadow:
        'rgba(43, 19, 19, 0.2) 0px 2px 4px -1px, rgba(0, 0, 0, 0.14) 0px 4px 5px 0px, rgba(0, 0, 0, 0.12) 0px 1px 10px 0px',
      fontFamily:
        "'Fira Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, 'Helvetica Neue', Helvetica, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
      fontSize: '14px',
      lineHeight: '20px',
      letterSpacing: '0.01em',
      color: 'rgb(73, 73, 82)',
    },
  };

  type AbsolutePositionStyle = {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    transform?: string;
  };

  export namespace inAppTutorialMessage {
    const containerId = 'in-app-tutorial-container';

    let _container: HTMLElement | null = null;

    const _loadFonts = () => {
      new FontFace(
        'Fira Sans',
        "url(https://fonts.gstatic.com/s/firasans/v17/va9E4kDNxMZdWfMOD5Vvl4jLazX3dA.woff2) format('woff2')",
        {
          variant: 'normal',
          weight: 'normal',
          unicodeRange:
            'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
          display: 'swap',
        }
      )
        .load()
        .then((fontFace) => document.fonts.add(fontFace));
      new FontFace(
        'Fira Sans',
        "url(https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnLK3eRhf6Xl7Glw.woff2) format('woff2')",
        {
          variant: 'normal',
          weight: 'bold',
          unicodeRange:
            'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
          display: 'swap',
        }
      )
        .load()
        .then((fontFace) => document.fonts.add(fontFace));
    };

    const _loadStyles = () => {
      const adhocStyle = document.createElement('style');
      adhocStyle.textContent = `
        #${containerId} p {
          margin-block: 0; /* To remove any browser built-in style */
        }
      `;
      document.head.appendChild(adhocStyle);
    };

    const getDomElementContainer = (
      runtimeGame: gdjs.RuntimeGame
    ): HTMLDivElement | null => {
      // Find the DOM element container.
      const domElementContainer = runtimeGame
        .getRenderer()
        .getDomElementContainer();
      if (!domElementContainer) {
        logger.error('No DOM element container found.');
        return null;
      }
      return domElementContainer;
    };

    export const displayInAppTutorialMessage = (
      runtimeGame: gdjs.RuntimeGame,
      message: string,
      position: string
    ) => {
      const domElementContainer = getDomElementContainer(runtimeGame);
      if (!domElementContainer) {
        return;
      }

      if (_container) return;

      const leftOrRight = position.toLowerCase().includes('right')
        ? 'right'
        : 'left';
      const topOrMiddleOrBottom = position.toLowerCase().includes('top')
        ? 'top'
        : position.toLowerCase().includes('middle')
        ? 'middle'
        : 'bottom';

      const containerPositionStyle: AbsolutePositionStyle = {};
      const messageContainerPositionStyle: AbsolutePositionStyle = {};

      if (leftOrRight === 'left') {
        containerPositionStyle.left = padding;
        messageContainerPositionStyle.left =
          topOrMiddleOrBottom === 'top' ? 'calc(100% + 10px)' : '0px';
      } else {
        containerPositionStyle.right = padding;
        messageContainerPositionStyle.right =
          topOrMiddleOrBottom === 'top' ? 'calc(100% + 10px)' : '0px';
      }
      if (topOrMiddleOrBottom === 'top') {
        containerPositionStyle.top = padding;
        messageContainerPositionStyle.top = '0px';
      } else if (topOrMiddleOrBottom === 'middle') {
        containerPositionStyle.top = '50%';
        messageContainerPositionStyle.transform =
          'translateY(calc(-100% - 10px))';
      } else {
        containerPositionStyle.bottom = padding;
        messageContainerPositionStyle.transform =
          'translateY(calc(-100% - 10px))';
      }

      const messageContent = document.createElement('div');
      messageContent.innerHTML = nmd(message);

      _loadFonts();
      _loadStyles();
      _container = (
        <div
          id={containerId}
          style={{ ...styles.container, ...containerPositionStyle }}
        >
          <div style={styles.avatarContainer}>
            <div
              style={{
                ...styles.messageContainer,
                ...messageContainerPositionStyle,
              }}
            >
              {messageContent}
            </div>
            <img
              width={60}
              height={60}
              alt="GDevelop mascot red hero"
              src={redHeroImage}
            />
          </div>
        </div>
      );
      // @ts-ignore - TS doesn't acknowledge the assignation above that excludes
      // the possibility that _container can be null.
      domElementContainer.appendChild(_container);
    };
  }
}
