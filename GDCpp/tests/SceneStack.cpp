/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
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
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/RuntimeGame.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/SceneStack.h"

TEST_CASE( "SceneStack", "[game-engine]" ) {
	RuntimeGame game;
	game.InsertNewLayout("Scene 1", 0);
	game.InsertNewLayout("Scene 2", 0);
	SceneStack stack(game,  NULL);

	SECTION("Pop on an empty stack") {
		REQUIRE(stack.Pop() == nullptr);
	}

	SECTION("Push a not existing scene") {
		REQUIRE(stack.Push("test") == nullptr);
	}

	SECTION("Push, Pop, Replace") {
		auto scene1 = stack.Push("Scene 1");
		auto scene2 = stack.Push("Scene 2");
		auto scene3 = stack.Push("Scene 1");
		auto scene4 = stack.Replace("Scene 2");

		REQUIRE(stack.Pop().get() == scene4);
		REQUIRE(stack.Pop().get() == scene2);

		auto scene5 = stack.Replace("Scene 1", true);
		REQUIRE(stack.Pop() == nullptr);
	}

	SECTION("Step") {
		auto scene = stack.Replace("Scene 1", true);
		REQUIRE(stack.Step() == true);
	}

	SECTION("OnLoadScene") {
		stack.OnLoadScene([](RuntimeScene & scene) {
			REQUIRE(scene.GetName() == "Scene 2");
			return true;
		});
		stack.Push("Scene 2");

		stack.OnLoadScene([](RuntimeScene & scene) {
			REQUIRE(scene.GetName() == "Scene 1");
			return true;
		});
		stack.Replace("Scene 1", true);
	}
}
