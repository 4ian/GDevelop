// @flow
import { setupAutocompletions } from './LocalCodeEditorAutocompletions';
import { getAllThemes } from './Theme';
import optionalRequire from '../Utils/OptionalRequire';

const electron = optionalRequire('electron');

// The main window and each popped-out window load their own Monaco instance.
const initializedMonacoInstances: WeakSet<any> = new WeakSet();
const modelsWithTopLevelAwait: WeakSet<any> = new WeakSet();
// TypeScript reports a module and a compiler-target error for each of
// top-level `await` (1375, 1378) and `for await` (1431, 1432).
const topLevelAwaitDiagnosticCodes = ['1375', '1378', '1431', '1432'];

export const initializeMonaco = (monaco: any, showJsTypeError: boolean) => {
  if (initializedMonacoInstances.has(monaco)) return;
  initializedMonacoInstances.add(monaco);

  getAllThemes().forEach(({ themeName, themeData }) => {
    if (themeData) monaco.editor.defineTheme(themeName, themeData);
  });

  // Monaco's diagnosticCodesToIgnore would also suppress errors in JS events.
  const originalSetModelMarkers = monaco.editor.setModelMarkers;
  monaco.editor.setModelMarkers = (model: any, owner: string, markers: any) => {
    const filteredMarkers = modelsWithTopLevelAwait.has(model)
      ? markers.filter(
          marker => !topLevelAwaitDiagnosticCodes.includes(marker.code)
        )
      : markers;
    originalSetModelMarkers(model, owner, filteredMarkers);
  };

  // Monaco skips its clipboard service in Electron when Chromium refuses paste.
  if (electron) {
    monaco.editor.addEditorAction({
      id: 'editor.action.clipboardPasteAction',
      label: 'Paste',
      run: (editor: any) => {
        const text = electron.clipboard.readText();
        if (text) editor.trigger('keyboard', 'paste', { text });
      },
    });
  }

  // Enable type checking of JavaScript files
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    ...monaco.languages.typescript.javascriptDefaults.getCompilerOptions(),
    allowNonTsExtensions: true,
    allowJs: true,
    checkJs: true,
  });
  if (showJsTypeError) enableJsTypeDiagnostics(monaco);

  setupAutocompletions(monaco).catch(error => {
    // No GDJS sources at hand (the web app, or a desktop build without them):
    // the code editor works without autocompletions.
    console.info('No GDJS autocompletions for the code editor:', error.message);
  });
};

export const allowTopLevelAwaitForModel = (model: any) => {
  modelsWithTopLevelAwait.add(model);
};

/**
 * Enable JS type error diagnostics. This won't work for .d.ts classes/functions
 * for some reason. See:
 * https://microsoft.github.io/monaco-editor/playground.html?source=v0.52.0#XQAAAALxBQAAAAAAAABBqQkHQ5NjdMjwa-jY7SIQ9S7DNlzs5W-mwj0fe1ZCDRFc9ws9XQE0SJE1jc2VKxhaLFIw9vEWSxW3yscw90T9lfa8wm3bKzPN7npWhYaA4x4rxLXXBbB2_OnRSToJ21hOUR_hS9pG2m6stSYmFVtipRHVTrIB91DOr8dFz_2f6wKJhg_ghHcsBt-hKnlu-qt2H4NuwdaqfbMd6vqkrLY5fzdHCB8FZIGGUDanilP6QXPTpV0rme8fvINUj2BklEotLylw-HHch53nHQMCabAMh3iNqg8S_rHB5OZg2IxLB-8POziUzSwFrTcfwxftX7gi3ZIWNPyf4vJOFtRKVr3hJLIKUGJew4RN0hYb1SnPUm1x6B8hb8I5-9WqAgbYz6E0ntlpOU4jvw6zty4iIJ4GQFuyQ1ys6LtVNKef1bnBs7fDr3xFb3LOW7E4RMonCTxapW3_DQvpQ_x4psM1GYFKMZZXr0lCRvrFs4PBf0uXMwEeTfC1PurLOeoNNEEZFLutUE1ojQVjkTgxZC_HCheas9sKTtZRsJ0i6qDWJh3PbNocPFIbvPQ5la2NXuQIph1oaGrDjqgoirRoexyKumFnXVLkvKVoTdglfgXLwEaoheNdItwJfWKdPqmHh18GTsk8Df_mr8zt3r-pLUtNvB6220ZAKaswAMPR0yDrfHfz_7vWaBfDy6yykp-ROV0Ckt2qV83DVNrHW9HNm4e0WC1ByFoDOB8AdJzjQye8YD3aCwy8ft4sSOGvSeNo2FOPoqd2TU-Sr58fhP09rWes4Vgrv1MhMlUtZ5zBNSL_Mpb1R32H8hrNShgxxaT0r048_u6-nFbkNKq-VCjTlFuUoTW-3y8b1UrYxSmTkjmp-KCc9ObqKgzbRV5tPIX_sqYqVCJFOZN0Nndp4s6xm7qmVPi8SMcDfCD4zfPWBpanAohwTcIIbXPJqggntHxMUFvH7h85mh3AZoJ5FPz2v387LTrxdqOZZW7kTGqSl-Y8NHsa_znjlaNDOU-qywr5DypPbH3_wOm2XMeQNg0jX1bBtIoh_PG5BWMQNlJmQRlDnmDtueZf_nTzQw
 */
const enableJsTypeDiagnostics = (monaco: any) => {
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    ...monaco.languages.typescript.javascriptDefaults.getDiagnosticsOptions(),
    noSemanticValidation: false,
    noSuggestionDiagnostics: false,
    noSyntaxValidation: false,
  });
};

/** Base editor options shared by all code editors. */
export const baseEditorOptions = {
  scrollBeyondLastLine: false,
  minimap: { enabled: false },
  // The Paste As provider replaces the selection even when the clipboard is empty.
  pasteAs: { enabled: false },
  // Wrap the code at the viewport width so no need to scroll horizontally
  // on small code editors.
  wordWrap: 'on',
};
