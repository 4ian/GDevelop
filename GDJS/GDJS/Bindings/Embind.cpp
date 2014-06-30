/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

/*
 * When cross-compiling using emscripten, this file exposes the GDJS API
 * to javascript.
 */
#if defined(EMSCRIPTEN)
#include <emscripten/bind.h>
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDJS/EventsCodeGenerator.h"
#include "GDJS/Exporter.h"
#include "GDJS/JsPlatform.h"

using namespace emscripten;
using namespace gdjs;

namespace gdjs {
JsPlatform * AsJSPlatform(gd::Platform & platform) { return static_cast<JsPlatform *>(&platform); }
gd::Platform * AsPlatform(JsPlatform & platform) { return static_cast<gd::Platform *>(&platform); }
}

EMSCRIPTEN_BINDINGS(gdjs_JsPlatform) {

    class_<JsPlatform, base<gd::Platform>>("JsPlatform")
        .constructor<>()
        .class_function("get", &JsPlatform::Get)
        ;

    function("asPlatform", &gdjs::AsPlatform, allow_raw_pointers());
    function("asJSPlatform", &gdjs::AsJSPlatform, allow_raw_pointers());
}

EMSCRIPTEN_BINDINGS(gdjs_EventsCodeGenerator) {
    function("GenerateSceneEventsCompleteCode", &EventsCodeGenerator::GenerateSceneEventsCompleteCode);
}

EMSCRIPTEN_BINDINGS(gdjs_Exporter) {
    class_<Exporter>("Exporter")
        .constructor<gd::AbstractFileSystem &>()
        .function("exportLayoutForPreview", &Exporter::ExportLayoutForPreview)
        .function("exportWholeProject", &Exporter::ExportWholeProject)
        ;
}
#endif