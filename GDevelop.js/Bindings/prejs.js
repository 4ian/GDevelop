// If running under ASAN, disable the "container overflow" checks because of false positives
// with std::vector<gd::String>. See https://github.com/google/sanitizers/wiki/AddressSanitizerContainerOverflow.
if (Module['ASAN_OPTIONS'] === undefined)
  Module['ASAN_OPTIONS'] ='detect_container_overflow=0';

// Prevent calling process["exit"] when there is a abort/runtime crash
// (useful for tests when running ASAN, to see the logs).
if (Module.noExitRuntime === undefined)
  Module.noExitRuntime = true;