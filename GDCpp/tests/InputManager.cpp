/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
/**
 * @file Tests for InputManager
 */
#include "catch.hpp"
#include <SFML/Window.hpp>
#include "GDCore/CommonTools.h"
#include "GDCpp/InputManager.h"
#include <SFML/Window.hpp>

TEST_CASE( "InputManager", "[game-engine]" ) {
	SECTION("Key maps") {
		REQUIRE(InputManager::GetSfKeyToKeyNameMap().find(static_cast<int>(sf::Keyboard::A))->second == "a");
		REQUIRE(InputManager::GetSfKeyToKeyNameMap().find(static_cast<int>(sf::Keyboard::Space))->second == "Space");
		REQUIRE(InputManager::GetKeyNameToSfKeyMap().find("Space")->second == sf::Keyboard::Space);
		REQUIRE(InputManager::GetKeyNameToSfKeyMap().find("a")->second == sf::Keyboard::A);
	}
	SECTION("Key event management") {
		InputManager m;

		sf::Event keyEvent;
		keyEvent.type = sf::Event::KeyPressed;
		keyEvent.key = {sf::Keyboard::A, false, false, false, false};

		sf::Event focusLost;
		focusLost.type = sf::Event::LostFocus;

		m.HandleEvent(keyEvent);
		REQUIRE(m.AnyKeyIsPressed() == true);

		m.NextFrame();
		REQUIRE(m.AnyKeyIsPressed() == false);

		m.NextFrame();
		m.HandleEvent(focusLost);
		m.HandleEvent(keyEvent);
		REQUIRE(m.AnyKeyIsPressed() == false);
	}
}
