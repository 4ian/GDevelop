// @flow
import { type JsExtensionsLoader } from '.';

export default class BrowserJsExtensionsLoader implements JsExtensionsLoader {
  loadAllExtensions(): Promise<Array<ExtensionLoadingResult>> {
    return Promise.resolve([]);
  }
}
