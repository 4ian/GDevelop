/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
/**
 * @file Tests covering scene stacking of GDevelop C++ Platform.
 */
#include "catch.hpp"
#include "GDCore/CommonTools.h"
#include "GDCore/Project/ClassWithObjects.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/RuntimeGame.h"
#include "GDCpp/RuntimeObject.h"
#include "GDCpp/SceneStack.h"

TEST_CASE( "SceneStack", "[game-engine]" ) {
	RuntimeGame game;
	game.InsertNewLayout("Scene 1", 0);
	game.InsertNewLayout("Scene 2", 0);
	SceneStack stack(game,  NULL, "");

	SECTION("Pop on an empty stack") {
		REQUIRE(stack.Pop() == std::shared_ptr<RuntimeScene>());
	}

	SECTION("Push a not existing scene") {
		REQUIRE(stack.Push("test") == std::shared_ptr<RuntimeScene>());
	}

	SECTION("Push, Pop, Replace") {
		auto scene1 = stack.Push("Scene 1");
		auto scene2 = stack.Push("Scene 2");
		auto scene3 = stack.Push("Scene 1");
		auto scene4 = stack.Replace("Scene 2");

		REQUIRE(stack.Pop() == scene4);
		REQUIRE(stack.Pop() == scene2);

		auto scene5 = stack.Replace("Scene 1", true);
		REQUIRE(stack.Pop() == std::shared_ptr<RuntimeScene>());
	}

	SECTION("Step") {
		auto scene = stack.Replace("Scene 1", true);
		REQUIRE(stack.Step() == true);
	}
}
