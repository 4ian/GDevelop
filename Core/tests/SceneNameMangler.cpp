/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop Core.
 */
#include "catch.hpp"
#include "GDCore/IDE/SceneNameMangler.h"

TEST_CASE( "SceneNameMangler", "[common]" ) {
    SECTION("Basics") {
        REQUIRE( gd::SceneNameMangler::GetMangledSceneName(u8"TotallyCorrectSceneName") == u8"TotallyCorrectSceneName" );
        REQUIRE( gd::SceneNameMangler::GetMangledSceneName(u8"Totally NOT CorrectSceneName") == u8"Totally_32NOT_32CorrectSceneName" );
        REQUIRE( gd::SceneNameMangler::GetMangledSceneName(u8"Nouvelle scène") == u8"Nouvelle_32sc_232ne" );
        REQUIRE( gd::SceneNameMangler::GetMangledSceneName(u8"A test Ԙ") == u8"A_32test_32_1304" );
        REQUIRE( gd::SceneNameMangler::GetMangledSceneName(u8"1 Nouvelle scène") == u8"_49_32Nouvelle_32sc_232ne" );
    }
}
