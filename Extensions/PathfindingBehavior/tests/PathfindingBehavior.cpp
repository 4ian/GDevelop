/**

GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
/**
 * @file Tests for the Pathfinding extension.
 */
#define CATCH_CONFIG_MAIN
#include "catch.hpp"
#include "GDCore/CommonTools.h"
#include "GDCore/PlatformDefinition/ClassWithObjects.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/RuntimeGame.h"
#include "GDCpp/RuntimeObject.h"
#include "GDCpp/BuiltinExtensions/ObjectTools.h"
#include "../PathfindingBehavior.h"

TEST_CASE( "PathfindingBehavior", "[game-engine][pathfinding]" ) {
	SECTION("Pathfinding basics") {
		//Prepare some objects and the context
		RuntimeGame game;
		gd::Object obj1("1");
		PathfindingBehavior * behavior = new PathfindingBehavior();
		behavior->SetName("Pathfinding");
		obj1.AddBehavior(behavior);

		RuntimeScene scene(NULL, &game);
		RuntimeObject obj1A(scene, obj1);

		PathfindingBehavior * runtimeBehavior =
			static_cast<PathfindingBehavior *>(obj1A.GetBehaviorRawPointer("Pathfinding"));

		//Check that a path can be computed without obstacles
		runtimeBehavior->MoveTo(scene, 1200, 1300);
		REQUIRE(runtimeBehavior->PathFound() == true);
		REQUIRE(runtimeBehavior->GetNodeCount() == 66);
		REQUIRE(runtimeBehavior->GetNodeX(65) == 1200);
		REQUIRE(runtimeBehavior->GetNodeY(65) == 1300);
	}
}
