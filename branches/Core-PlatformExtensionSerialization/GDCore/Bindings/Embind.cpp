/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

/*
 * When cross-compiling using emscripten, this file exposes the GDCore API
 * to javascript.
 */
#if defined(EMSCRIPTEN)
#include <emscripten/bind.h>
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Platform.h"

using namespace emscripten;
using namespace gd;

EMSCRIPTEN_BINDINGS(Platform) {
    class_<ProjectExporter>("ProjectExporter")
        ;

    class_<Platform>("Platform")
        .constructor<>()
	    .function("getName", &Platform::GetName)
	    .function("getFullName", &Platform::GetFullName)
	    .function("getSubtitle", &Platform::GetSubtitle)
        .function("getDescription", &Platform::GetDescription)
	    .function("getProjectExporter", &Platform::GetProjectExporter)
	    ;
}

EMSCRIPTEN_BINDINGS(Project) {
    class_<Project>("Project")
        .constructor<>()
        .function("setName", &Project::SetName).function("getName", &Project::GetName)
        .function("setAuthor", &Project::SetAuthor).function("getAuthor", &Project::GetAuthor)
        .function("addPlatform", &Project::AddPlatform)
        .function("getCurrentPlatform", &Project::GetCurrentPlatform)
       	//Properties, for convenience only:
        .property("name", &Project::GetName, &Project::SetName)
        .property("author", &Project::GetAuthor, &Project::SetAuthor)
        ;
}
#endif