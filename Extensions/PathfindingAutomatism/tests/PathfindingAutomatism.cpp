/**

GDevelop - Pathfinding Automatism Extension
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
#include "GDCpp/BuiltinExtensions/ObjectTools.h"
#include "../PathfindingAutomatism.h"

TEST_CASE( "PathfindingAutomatism", "[game-engine][pathfinding]" ) {
	SECTION("Pathfinding basics") {
		//Prepare some objects and the context
		RuntimeGame game;
		gd::Object obj1("1");
		PathfindingAutomatism * automatism = new PathfindingAutomatism();
		automatism->SetName("Pathfinding");
		obj1.AddAutomatism(automatism);

		RuntimeScene scene(NULL, &game);
		RuntimeObject obj1A(scene, obj1);

		PathfindingAutomatism * runtimeAutomatism =
			static_cast<PathfindingAutomatism *>(obj1A.GetAutomatismRawPointer("Pathfinding"));

		//Check that a path can be computed without obstacles
		runtimeAutomatism->MoveTo(scene, 1200, 1300);
		REQUIRE(runtimeAutomatism->PathFound() == true);
		REQUIRE(runtimeAutomatism->GetNodeCount() == 66);
		REQUIRE(runtimeAutomatism->GetNodeX(65) == 1200);
		REQUIRE(runtimeAutomatism->GetNodeY(65) == 1300);
	}
}
