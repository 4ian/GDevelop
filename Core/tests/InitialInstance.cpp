/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
/**
 * @file Tests covering events of GDevelop Core.
 */
#include "catch.hpp"

#include <algorithm>
#include <initializer_list>
#include <map>

#include "GDCore/CommonTools.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "GDCore/Project/InitialInstance.h"

TEST_CASE( "InitialInstance", "[common][instances]" ) {
    gd::InitialInstance instance;

    SECTION("GetRawFloatProperty") {
        REQUIRE( instance.GetRawFloatProperty("NotExistingProperty") == 0 );
    }

    SECTION("GetRawStringProperty") {
        REQUIRE( instance.GetRawStringProperty("NotExistingProperty") == "" );
    }
}
