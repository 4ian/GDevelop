/*
 * GDevelop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop C++ Platform.
 */
#include "catch.hpp"
#include "GDCore/CommonTools.h"
#include "GDCore/PlatformDefinition/ClassWithObjects.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/RuntimeGame.h"

TEST_CASE( "RuntimeScene", "[common]" ) {
	SECTION("Basics") {
		RuntimeGame game;
		RuntimeScene scene(NULL, &game);
		REQUIRE( scene.IsFirstLoop() == true );
		REQUIRE( scene.GetTimeScale() == 1 );
		REQUIRE( scene.renderWindow == NULL );
		REQUIRE( scene.game == &game );
	}
	SECTION("Loading from a layout") {
		gd::Project project;
		gd::Layout layout;
                layout.SetName("My layout");

		RuntimeGame game;
		RuntimeScene scene(NULL, &game);

		scene.LoadFromScene(layout);
                REQUIRE(scene.GetName() == "My layout");
	}
}
