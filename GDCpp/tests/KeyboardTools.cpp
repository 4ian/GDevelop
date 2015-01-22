/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop C++ Platform.
 */
#include "catch.hpp"
#include <SFML/Window.hpp>
#include "GDCore/CommonTools.h"
#include "GDCpp/BuiltinExtensions/KeyboardTools.h"

TEST_CASE( "KeyboardTools", "[game-engine]" ) {
	SECTION("Key maps") {

		REQUIRE(GetSfKeyToKeyNameMap().find(static_cast<int>(sf::Keyboard::A))->second == "a");
		REQUIRE(GetSfKeyToKeyNameMap().find(static_cast<int>(sf::Keyboard::Space))->second == "Space");
		REQUIRE(GetKeyNameToSfKeyMap().find("Space")->second == sf::Keyboard::Space);
		REQUIRE(GetKeyNameToSfKeyMap().find("a")->second == sf::Keyboard::A);
	}
}
