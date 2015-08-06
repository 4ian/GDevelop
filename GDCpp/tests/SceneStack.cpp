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
#include "GDCore/PlatformDefinition/ClassWithObjects.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/RuntimeGame.h"
#include "GDCpp/RuntimeObject.h"
#include "GDCpp/SceneStack.h"

TEST_CASE( "SceneStack", "[game-engine]" ) {
	RuntimeGame game;
	SceneStack stack(game,  NULL, "");

	SECTION("Pop") {
		REQUIRE(stack.Pop() == std::shared_ptr<RuntimeScene>());
	}

	SECTION("Push a not existing scene") {
		REQUIRE(stack.Push("test") == std::shared_ptr<RuntimeScene>());
	}
}
