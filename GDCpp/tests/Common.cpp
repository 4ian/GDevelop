/*
 * Game Develop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
/**
 * @file Tests covering common features of Game Develop C++ Platform.
 */
#include "catch.hpp"
#include "GDCore/CommonTools.h"
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
	SECTION("Basics") {
		RuntimeGame game;
		RuntimeScene scene(NULL, &game);
		scene.RenderAndStep();
	}
}
