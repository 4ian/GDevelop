// @flow
import { buildRuntimeApiDeclaration } from '../ProjectsStorage/JavaScriptAuthoringApi';

export const setupAutocompletions = (monaco: any) => {
  monaco.languages.typescript.javascriptDefaults.addExtraLib(
    buildRuntimeApiDeclaration(),
    'gdevelop-runtime-api.d.ts'
  );
};
