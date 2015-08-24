/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
/**
 * @file Tests covering events of GDevelop Core.
 */
#include "catch.hpp"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include <memory>

TEST_CASE( "EventsCodeGenerator", "[common][events]" ) {
    SECTION("Basics") {
        gd::Project project;
        auto & layout = project.InsertNewLayout("Layout 1", 0);
        gd::Platform platform;
        gd::EventsCodeGenerator codeGenerator(project, layout, platform);
        
        REQUIRE(codeGenerator.ConvertToString("Hello \"world\"!\nThis is a backslash \\") == "Hello \\\"world\\\"!\\nThis is a backslash \\\\");
    }
}
