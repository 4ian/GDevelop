/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#if defined(EMSCRIPTEN)
#include <emscripten.h>
#include "GDCore/String.h"

namespace gd {
gd::String GetTranslation(const char* str) {  // TODO: Inline?
  const char* translatedStr = (const char*)EM_ASM_INT(
      {
        var getTranslation = Module['getTranslation'];
        if (!getTranslation) {
          return $0;
        }

        // Uncomment lines to display a warning if the cache
        // for strings is not ready.
        // if (!ensureCache) {
        //   console.warn('No ensureCache initialized');
        //   return $0;
        // }
        ensureCache.prepare();

        var translatedStr = getTranslation(UTF8ToString($0));
        return ensureString(translatedStr);
      },
      str);
  return gd::String(translatedStr);  // TODO: Is copying necessary?
}
}  // namespace gd
#endif
