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
 * Strings to be translated in GDevelop Core codebase (and GDCpp),
 * are marked with the underscore macro, for example: _("Hello World").
 * 
 * The macro is then defined to be using the translation function
 * of the underlying platform (Emscripten for GD5, wxWidgets for GD4,
 * no translation for GDCpp Runtime).
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
// When compiling with wxWidgets, use the translation method
// provided by wxWidgets, but return a gd::String.

#include <wx/intl.h>
#include "GDCore/String.h"

// Create a new macro to return UTF8 gd::String from a translation
#if defined(_)
#undef _
#endif
#define _(s) gd::String(wxGetTranslation(wxString::FromUTF8(u8##s)))

#elif defined(EMSCRIPTEN)
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
// When compiling without Emscripten or wxWidgets (typically for GDC++ Runtime),
// just return an untranslated gd::String.

// Create a new macro to return UTF8 gd::String from a translation
#if defined(_)
#undef _
#endif
#define _(s) gd::String(u8##s)

#endif

#endif  // GDCORE_LOCALIZATION_H
