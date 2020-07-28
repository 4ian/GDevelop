//@flow
import optionalRequire from './OptionalRequire';

/**
 * Return a function that will load, only when called, the specified module name.
 *
 * As `optionalRequire`, this allows to require a Node.js/npm module without having it bundled by webpack.
 * This means that this module will only be available when running on Electron or Node.js.
 * When running without Electron or Node.js, `null` will be returned.
 */
export default function optionalLazyRequire(moduleName: string) {
  let moduleLoaded = false;
  let module = undefined;
  return (): ?any => {
    if (moduleLoaded) {
      return module;
    }

    console.info(`Lazy loading ${moduleName}...`);
    module = optionalRequire(moduleName);
    moduleLoaded = true;
    return module;
  };
}
