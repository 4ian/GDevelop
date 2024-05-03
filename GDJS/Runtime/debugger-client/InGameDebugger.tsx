namespace gdjs {
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

  const styles: {
    errorContainer: Partial<CSSStyleDeclaration>;
    errorTitle: Partial<CSSStyleDeclaration>;
    errorMessage: Partial<CSSStyleDeclaration>;
    stacktrace: Partial<CSSStyleDeclaration>;
    closeButton: Partial<CSSStyleDeclaration>;
  } = {
    errorContainer: {
      padding: '15px',
      backgroundColor: '#a70000cc',
      borderRadius: '8px',
      position: 'absolute',
      bottom: '5px',
      left: '5px',
      right: '5px',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      pointerEvents: 'all',
    },
    errorTitle: {
      fontFamily: 'system-ui',
      fontSize: '20px',
      marginTop: '5px',
      marginBottom: '5px',
      userSelect: 'all',
    },
    errorMessage: {
      fontFamily: 'system-ui',
      fontSize: '14px',
      userSelect: 'all',
    },
    stacktrace: {
      fontSize: '14px',
      fontFamily: 'monospace',
      whiteSpace: 'pre',
      maxHeight: '510px',
      overflow: 'auto',
      userSelect: 'all',
    },
    closeButton: {
      padding: '3px',
      width: '20px',
      fontSize: '18px',
      position: 'absolute',
      right: '5px',
      top: '5px',
      color: 'white',
      border: '1px solid white',
      borderRadius: '6px',
      backgroundColor: 'transparent',
    },
  };

  const isErrorComingFromJavaScriptCode = (
    exception: Error | null
  ): boolean => {
    if (!exception || !exception.stack) return false;

    return exception.stack.includes('GDJSInlineCode');
  };

  /**
   * Displays uncaught exceptions on top of the game.
   * Could be reworked in the future to support a minimal debugger inside the game.
   */
  export class InGameDebugger {
    _runtimeGame: RuntimeGame;
    _uncaughtException: Error | null = null;
    _uncaughtExceptionElement: HTMLElement | null = null;

    constructor(runtimeGame: RuntimeGame) {
      this._runtimeGame = runtimeGame;
    }

    setUncaughtException(exception: Error | null) {
      // Only show the first uncaught exception and ignore anything else.
      if (this._uncaughtException && !!exception) return;

      this._uncaughtException = exception;
      this.render();
    }

    render() {
      const domElementContainer = this._runtimeGame
        .getRenderer()
        .getDomElementContainer();
      if (!domElementContainer) return;

      if (this._uncaughtExceptionElement) {
        domElementContainer.removeChild(this._uncaughtExceptionElement);
        this._uncaughtExceptionElement = null;
      }

      if (this._uncaughtException) {
        const errorIsInJs = isErrorComingFromJavaScriptCode(
          this._uncaughtException
        );
        this._uncaughtExceptionElement = (
          <div style={styles.errorContainer}>
            <button
              style={styles.closeButton}
              onClick={() => this.setUncaughtException(null)}
            >
              ×
            </button>
            <h2 style={styles.errorTitle}>
              {errorIsInJs
                ? 'An error happened in a JavaScript code event.'
                : 'A crash or error happened in the game.'}
            </h2>
            <p style={styles.errorMessage}>
              {(errorIsInJs
                ? 'This error comes from a JavaScript code event. Verify your code to ensure no error is happening. You can use the Developer Tools (menu "View" > "Toggle Developer Tools"). Full error is: '
                : "If you're using JavaScript, verify your code. Otherwise, this might be an issue with GDevelop - consider reporting a bug. Full error is: ") +
                this._uncaughtException.message}
            </p>
            <pre style={styles.stacktrace}>
              {this._uncaughtException.stack || '(No stracktrace).'}
            </pre>
          </div>
        );

        if (this._uncaughtExceptionElement)
          domElementContainer.appendChild(this._uncaughtExceptionElement);
      }
    }
  }
}
