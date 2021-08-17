/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_LOCALIZATION_H
#define GDCORE_LOCALIZATION_H

/** @file
 * Provide a way to mark strings to be translated.
 * 
 * Strings to be translated in GDevelop Core codebase
 * are marked with the underscore macro, for example: _("Hello World").
 * 
 * The macro is then defined to be using the translation function
 * of the underlying platform (Emscripten for GDevelop 5).
 */

#if defined(EMSCRIPTEN)
// When compiling with Emscripten, use a translation function that is calling a
// JS method on the module, so that an external translation library can be used.

#include "GDCore/String.h"
#if defined(_)
#undef _
#endif

namespace gd {
gd::String GetTranslation(const char* str);
}

#define _(s) gd::GetTranslation(u8##s)

#else
// When compiling without Emscripten,
// just return an untranslated gd::String.

// Create a new macro to return UTF8 gd::String from a translation
#if defined(_)
#undef _
#endif
#define _(s) gd::String(u8##s)

#endif

#endif  // GDCORE_LOCALIZATION_H
