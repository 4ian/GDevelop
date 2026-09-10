// If running under ASAN, disable the "container overflow" checks because of false positives
// with std::vector<gd::String>. See https://github.com/google/sanitizers/wiki/AddressSanitizerContainerOverflow.
// Also append options from the ASAN_OPTIONS environment variable when running in Node.js,
// as Emscripten only reads them from Module['ASAN_OPTIONS'] (not from the environment).
if (Module['ASAN_OPTIONS'] === undefined) {
  var envAsanOptions =
    typeof process !== 'undefined' && process.env && process.env.ASAN_OPTIONS
      ? ':' + process.env.ASAN_OPTIONS
      : '';
  Module['ASAN_OPTIONS'] = 'detect_container_overflow=0' + envAsanOptions;
}

// Prevent calling process["exit"] when there is a abort/runtime crash
// (useful for tests when running ASAN, to see the logs).
if (Module.noExitRuntime === undefined)
  Module.noExitRuntime = true;