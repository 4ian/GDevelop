// @flow
import { setupAutocompletions } from './LocalCodeEditorAutocompletions';
import { getAllThemes } from './Theme';

// Track which Monaco instances have been initialized.
// A WeakSet works naturally with separate Monaco instances
// (webpack-bundled in main window vs AMD-loaded in popped-out window)
// without needing separate boolean flags.
const initializedMonacoInstances: WeakSet<any> = new WeakSet();

/** Register custom themes. Safe to call multiple times per instance. */
export const registerThemes = (monaco: any) => {
  getAllThemes().forEach(codeEditorTheme => {
    // Builtin themes don't have themeData, don't redefine them.
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
};

/**
 * Set TypeScript compiler options and load autocompletions.
 * Idempotent per Monaco instance.
 */
export const initializeCompletions = (monaco: any) => {
  if (initializedMonacoInstances.has(monaco)) return;
  initializedMonacoInstances.add(monaco);

  // Enable type checking of JavaScript files
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    // TODO: Uncomment to activate type checking of JS files, once autocompletions are all handled properly.
    // ...monaco.languages.typescript.javascriptDefaults.getCompilerOptions()
    target: monaco.languages.typescript.ScriptTarget.ES6,
    allowNonTsExtensions: true,
    allowJs: true,
    checkJs: true,
  });

  // Activate checks - though this won't work for .d.ts classes/functions for
  // some reason. See:
  // https://microsoft.github.io/monaco-editor/playground.html?source=v0.52.0#XQAAAALxBQAAAAAAAABBqQkHQ5NjdMjwa-jY7SIQ9S7DNlzs5W-mwj0fe1ZCDRFc9ws9XQE0SJE1jc2VKxhaLFIw9vEWSxW3yscw90T9lfa8wm3bKzPN7npWhYaA4x4rxLXXBbB2_OnRSToJ21hOUR_hS9pG2m6stSYmFVtipRHVTrIB91DOr8dFz_2f6wKJhg_ghHcsBt-hKnlu-qt2H4NuwdaqfbMd6vqkrLY5fzdHCB8FZIGGUDanilP6QXPTpV0rme8fvINUj2BklEotLylw-HHch53nHQMCabAMh3iNqg8S_rHB5OZg2IxLB-8POziUzSwFrTcfwxftX7gi3ZIWNPyf4vJOFtRKVr3hJLIKUGJew4RN0hYb1SnPUm1x6B8hb8I5-9WqAgbYz6E0ntlpOU4jvw6zty4iIJ4GQFuyQ1ys6LtVNKef1bnBs7fDr3xFb3LOW7E4RMonCTxapW3_DQvpQ_x4psM1GYFKMZZXr0lCRvrFs4PBf0uXMwEeTfC1PurLOeoNNEEZFLutUE1ojQVjkTgxZC_HCheas9sKTtZRsJ0i6qDWJh3PbNocPFIbvPQ5la2NXuQIph1oaGrDjqgoirRoexyKumFnXVLkvKVoTdglfgXLwEaoheNdItwJfWKdPqmHh18GTsk8Df_mr8zt3r-pLUtNvB6220ZAKaswAMPR0yDrfHfz_7vWaBfDy6yykp-ROV0Ckt2qV83DVNrHW9HNm4e0WC1ByFoDOB8AdJzjQye8YD3aCwy8ft4sSOGvSeNo2FOPoqd2TU-Sr58fhP09rWes4Vgrv1MhMlUtZ5zBNSL_Mpb1R32H8hrNShgxxaT0r048_u6-nFbkNKq-VCjTlFuUoTW-3y8b1UrYxSmTkjmp-KCc9ObqKgzbRV5tPIX_sqYqVCJFOZN0Nndp4s6xm7qmVPi8SMcDfCD4zfPWBpanAohwTcIIbXPJqggntHxMUFvH7h85mh3AZoJ5FPz2v387LTrxdqOZZW7kTGqSl-Y8NHsa_znjlaNDOU-qywr5DypPbH3_wOm2XMeQNg0jX1bBtIoh_PG5BWMQNlJmQRlDnmDtueZf_nTzQw
  //
  // TODO: Uncomment to activate type checking of JS files, once autocompletions are all handled properly.
  //
  // monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
  //   ...monaco.languages.typescript.javascriptDefaults.getDiagnosticsOptions(),
  //   noSemanticValidation: false,
  //   noSuggestionDiagnostics: false,
  //   noSyntaxValidation: false,
  // });

  setupAutocompletions(monaco);
};

/** Base editor options shared by all code editors. */
export const baseEditorOptions = {
  scrollBeyondLastLine: false,
  minimap: { enabled: false },
  // Wrap the code at the viewport width so no need to scroll horizontally
  // on small code editors.
  wordWrap: 'on',
};
