// @flow
import * as React from 'react';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import { getAllThemes } from './Theme';

type Props = {|
  value: string,
  onChange: string => void,
  width: number,
  height: number,
  theme: string,
  fontSize: number,
  onEditorMounted?: () => void,
  onFocus: () => void,
  onBlur: () => void,
|};

type State = {|
  loading: boolean,
|};

/**
 * Monaco editor component that loads Monaco via the AMD loader in the current
 * window's context. This is necessary for popped-out windows (via WindowPortal)
 * because the webpack-bundled Monaco (from react-monaco-editor) uses the main
 * window's `document` and `window` internally — its `isInDOM()` check compares
 * against `document.body` of the main window, so elements rendered in a
 * different window's document are treated as detached and never rendered.
 *
 * By loading Monaco fresh via the AMD loader in the popped-out window, all
 * internal references (`document`, `window`, `document.body`) correctly point
 * to the popped-out window.
 */
class PoppedOutMonacoEditor extends React.Component<Props, State> {
  state: State = { loading: true };
  _containerRef: {| current: HTMLDivElement | null |} = React.createRef();
  _editor: any = null;
  _monaco: any = null;
  _isChangingValue: boolean = false;

  componentDidMount() {
    this._loadAndCreateEditor();
  }

  componentDidUpdate(prevProps: Props) {
    if (!this._editor) return;

    // Sync value (only when the change comes from outside, not from the
    // editor's own onChange callback).
    if (prevProps.value !== this.props.value && !this._isChangingValue) {
      const model = this._editor.getModel();
      if (model && model.getValue() !== this.props.value) {
        model.setValue(this.props.value);
      }
    }

    // Update layout when dimensions change.
    if (
      prevProps.width !== this.props.width ||
      prevProps.height !== this.props.height
    ) {
      this._editor.layout({
        width: this.props.width,
        height: this.props.height,
      });
    }

    // Update theme.
    if (prevProps.theme !== this.props.theme && this._monaco) {
      this._monaco.editor.setTheme(this.props.theme);
    }

    // Update font size.
    if (prevProps.fontSize !== this.props.fontSize) {
      this._editor.updateOptions({ fontSize: this.props.fontSize });
    }
  }

  componentWillUnmount() {
    if (this._editor) {
      this._editor.dispose();
      this._editor = null;
    }
    this._monaco = null;
  }

  _loadAndCreateEditor = () => {
    const container = this._containerRef.current;
    if (!container) return;

    const targetWindow: any = container.ownerDocument.defaultView;
    if (!targetWindow) return;

    // If a Monaco instance was already loaded in this window, reuse it.
    if (targetWindow.__gdMonaco) {
      this._createEditor(targetWindow.__gdMonaco, container);
      return;
    }

    // In Electron, the popped-out window inherits Node.js globals (require,
    // module, exports, process). Monaco's AMD loader detects these and uses
    // Node.js `require()` to load modules — which fails because relative
    // paths resolve against process.cwd(), not the app directory.
    // Temporarily hide these globals so the AMD loader falls back to
    // browser-style <script> tag loading, which respects the <base> tag.
    const savedGlobals = {
      require: targetWindow.require,
      module: targetWindow.module,
      exports: targetWindow.exports,
      process: targetWindow.process,
    };
    targetWindow.require = undefined;
    targetWindow.module = undefined;
    targetWindow.exports = undefined;
    targetWindow.process = undefined;

    // Load Monaco's AMD loader in the target window.
    const script = container.ownerDocument.createElement('script');
    script.src = 'external/monaco-editor-min/vs/loader.js';
    script.onload = () => {
      const amdRequire = targetWindow.require;
      if (!amdRequire || !amdRequire.config) {
        // Restore Node.js globals on failure.
        Object.assign(targetWindow, savedGlobals);
        console.error(
          'PoppedOutMonacoEditor: AMD loader not available after script load.'
        );
        return;
      }

      // Restore Node.js globals that the AMD loader didn't replace.
      // `require` is now the AMD loader's require — don't overwrite it.
      if (savedGlobals.module) targetWindow.module = savedGlobals.module;
      if (savedGlobals.exports) targetWindow.exports = savedGlobals.exports;
      if (savedGlobals.process) targetWindow.process = savedGlobals.process;

      amdRequire.config({
        paths: { vs: 'external/monaco-editor-min/vs' },
      });

      amdRequire(['vs/editor/editor.main'], monaco => {
        // Cache the Monaco instance on the window for reuse.
        targetWindow.__gdMonaco = monaco;
        if (this._containerRef.current) {
          this._createEditor(monaco, this._containerRef.current);
        }
      });
    };
    script.onerror = () => {
      // Restore Node.js globals on failure.
      Object.assign(targetWindow, savedGlobals);
      console.error(
        'PoppedOutMonacoEditor: Failed to load Monaco AMD loader.'
      );
    };
    if (container.ownerDocument.head) {
      container.ownerDocument.head.appendChild(script);
    }
  };

  _createEditor = (monaco: any, container: HTMLDivElement) => {
    this._monaco = monaco;

    // Register custom themes.
    getAllThemes().forEach(codeEditorTheme => {
      if (codeEditorTheme.themeData) {
        try {
          monaco.editor.defineTheme(
            codeEditorTheme.themeName,
            codeEditorTheme.themeData
          );
        } catch (e) {
          // Theme might already be defined — ignore.
        }
      }
    });

    this._editor = monaco.editor.create(container, {
      value: this.props.value,
      language: 'javascript',
      theme: this.props.theme,
      fontSize: this.props.fontSize,
      scrollBeyondLastLine: false,
      minimap: { enabled: false },
      wordWrap: 'on',
    });

    this._editor.onDidChangeModelContent(() => {
      if (!this._editor) return;
      this._isChangingValue = true;
      this.props.onChange(this._editor.getValue());
      this._isChangingValue = false;
    });

    this._editor.onDidFocusEditorText(this.props.onFocus);
    this._editor.onDidBlurEditorText(this.props.onBlur);

    this._editor.layout({
      width: this.props.width,
      height: this.props.height,
    });

    this.setState({ loading: false });

    if (this.props.onEditorMounted) {
      this.props.onEditorMounted();
    }
  };

  _handleContextMenu = (event: SyntheticEvent<>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  render(): React.Node {
    return (
      <div onContextMenu={this._handleContextMenu}>
        <div
          ref={this._containerRef}
          style={{ width: this.props.width, height: this.props.height }}
        />
        {this.state.loading && <PlaceholderLoader />}
      </div>
    );
  }
}

export default PoppedOutMonacoEditor;
