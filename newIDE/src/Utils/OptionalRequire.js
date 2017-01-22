export default function optionalRequire(moduleName) {
  try {
    // Avoid webpack trying to inject the module by using an expression
    // and global to get the require function.
    return global['require'](moduleName);
  } catch(ex) {
    return null;
  }
}
