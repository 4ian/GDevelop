/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
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
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/RuntimeGame.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/RuntimeObjectsListsTools.h"
#include "GDCpp/Runtime/RuntimeSpriteObject.h"

TEST_CASE( "RuntimeSpriteObject", "[game-engine]" ) {
	RuntimeGame game;
	RuntimeScene scene(NULL, &game);

	gd::SpriteObject obj1("SpriteObject");
	{
		gd::Animation anim;
		anim.SetName("First animation");
		gd::Sprite sprite;
		sprite.SetImageName("Image.png");
		anim.SetDirectionsCount(1);
		anim.GetDirection(0).AddSprite(sprite);
		obj1.AddAnimation(anim);
	}
	{
		gd::Animation anim;
		anim.SetName("Second animation");
		obj1.AddAnimation(anim);
	}
	{
		gd::Animation anim;
		obj1.AddAnimation(anim);
	}

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
	SECTION("Animations") {
		REQUIRE(object.GetCurrentAnimation() == 0);
		REQUIRE(object.GetCurrentAnimationName() == "First animation");
		REQUIRE(object.IsCurrentAnimationName("First animation") == true);

		object.SetCurrentAnimation("Second animation");
		REQUIRE(object.GetCurrentAnimation() == 1);
		REQUIRE(object.GetCurrentAnimationName() == "Second animation");

		SECTION("It keeps the same animation when using an invalid/empty name") {
			object.SetCurrentAnimation("");
			REQUIRE(object.GetCurrentAnimation() == 1);
			object.SetCurrentAnimation("Invalid name");
			REQUIRE(object.GetCurrentAnimation() == 1);
		}

		SECTION("It can change animation using animation index") {
			object.SetCurrentAnimation(2);
			REQUIRE(object.GetCurrentAnimation() == 2);
			REQUIRE(object.GetCurrentAnimationName() == "");

			object.SetCurrentAnimation(0);
			REQUIRE(object.GetCurrentAnimation() == 0);
			REQUIRE(object.GetCurrentAnimationName() == "First animation");
		}
	}
}
