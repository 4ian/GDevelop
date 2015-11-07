/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop C++ Platform.
 */
#include "catch.hpp"
#include "GDCore/CommonTools.h"
#include "GDCore/Project/ClassWithObjects.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/SpriteObject.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/Animation.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/RuntimeGame.h"
#include "GDCpp/RuntimeObject.h"
#include "GDCpp/RuntimeObjectsListsTools.h"
#include "GDCpp/RuntimeSpriteObject.h"

TEST_CASE( "RuntimeSpriteObject", "[game-engine]" ) {
	RuntimeGame game;
	RuntimeScene scene(NULL, &game);

	gd::SpriteObject obj1("SpriteObject");
	gd::Animation anim;
	gd::Sprite sprite;
	sprite.SetImageName("Image.png");
	anim.SetDirectionsCount(1);
	anim.GetDirection(0).AddSprite(sprite);
	obj1.AddAnimation(anim);

	RuntimeSpriteObject object(scene, obj1);
	SECTION("Scaling") {
		REQUIRE(object.GetScaleX() == 1);
		object.FlipX(true);
		REQUIRE(object.GetScaleX() == 1);
		object.SetScaleX(0.42);
		REQUIRE(object.GetScaleX() == 0.42f);
		REQUIRE(object.IsFlippedX() == true);
		object.FlipX(false);
		REQUIRE(object.GetScaleX() == 0.42f);
		REQUIRE(object.IsFlippedX() == false);
	}
	SECTION("Angle") {
		REQUIRE(object.GetAngle() == 0);
		object.SetAngle(42);
		REQUIRE(object.GetAngle() == 42);
	}
}
