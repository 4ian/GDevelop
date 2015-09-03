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
#include "../PathfindingObstacleBehavior.h"

 class ResizableRuntimeObject : public RuntimeObject {
 public:
 	ResizableRuntimeObject(RuntimeScene & scene, const gd::Object & obj) :
 		RuntimeObject(scene, obj)
 	{}

 	virtual float GetWidth() const override { return width; }
 	virtual float GetHeight() const override { return height; }
 	void SetWidth(float newWidth) { width = newWidth; }
 	void SetHeight(float newHeight) { height = newHeight; }

 private:
 	float width;
 	float height;
 };

TEST_CASE( "PathfindingBehavior", "[game-engine][pathfinding]" ) {
	SECTION("Basics") {
		//Prepare some objects and the context
		RuntimeGame game;
		gd::Object playerObj("player");
		PathfindingBehavior * behavior = new PathfindingBehavior();
		behavior->SetName("Pathfinding");
		playerObj.AddBehavior(behavior);

		RuntimeScene scene(NULL, &game);
		RuntimeObject player(scene, playerObj);

		PathfindingBehavior * runtimeBehavior =
			static_cast<PathfindingBehavior *>(player.GetBehaviorRawPointer("Pathfinding"));

		//Check that a path can be computed without obstacles
		runtimeBehavior->MoveTo(scene, 1200, 1300);
		REQUIRE(runtimeBehavior->PathFound() == true);
		REQUIRE(runtimeBehavior->GetNodeCount() == 66);
		REQUIRE(runtimeBehavior->GetNodeX(65) == 1200); //Check that destination
		REQUIRE(runtimeBehavior->GetNodeY(65) == 1300); //is correct

		//Add an obstacle
		gd::Object obstacleObj("obstacle");
		obstacleObj.AddBehavior(new PathfindingObstacleBehavior());
		std::shared_ptr<ResizableRuntimeObject> obstacle(new ResizableRuntimeObject(scene, obstacleObj));

		scene.objectsInstances.AddObject(obstacle);

		obstacle->SetX(1100);
		obstacle->SetY(1200);
		obstacle->SetWidth(200);
		obstacle->SetHeight(200);
		scene.RenderAndStep();

		runtimeBehavior->MoveTo(scene, 1200, 1300);
		REQUIRE(runtimeBehavior->PathFound() == false);
		REQUIRE(runtimeBehavior->GetNodeCount() == 0);
	}
	SECTION("Obstacle in the middle") {
		//Prepare some objects and the context
		RuntimeGame game;

		gd::Object playerObj("player");
		auto behavior = new PathfindingBehavior();
		behavior->SetName("Pathfinding");
		playerObj.AddBehavior(behavior);

		gd::Object obstacleObj("obstacle");
		obstacleObj.AddBehavior(new PathfindingObstacleBehavior());

		RuntimeScene scene(NULL, &game);
		std::shared_ptr<RuntimeObject> player(new RuntimeObject(scene, playerObj));
		std::shared_ptr<ResizableRuntimeObject> obstacle(new ResizableRuntimeObject(scene, obstacleObj));
		scene.objectsInstances.AddObject(player);
		scene.objectsInstances.AddObject(obstacle);

		obstacle->SetX(300);
		obstacle->SetY(600);
		obstacle->SetWidth(32);
		obstacle->SetHeight(32);
		scene.RenderAndStep();

		PathfindingBehavior * runtimeBehavior =
			static_cast<PathfindingBehavior *>(player->GetBehaviorRawPointer("Pathfinding"));

		//Check that a path changes when adding obstacles
		runtimeBehavior->MoveTo(scene, 1200, 1300);
		REQUIRE(runtimeBehavior->PathFound() == true);
		REQUIRE(runtimeBehavior->GetNodeX(30) == 540);
		REQUIRE(runtimeBehavior->GetNodeY(30) == 600);
		REQUIRE(runtimeBehavior->GetNodeCount() == 66);

		//Enlarge the obstacle
		obstacle->SetWidth(600);
		scene.RenderAndStep();

		runtimeBehavior->MoveTo(scene, 1200, 1300);
		REQUIRE(runtimeBehavior->PathFound() == true);
		REQUIRE(runtimeBehavior->GetNodeCount() == 78);

		//Enlarge more
		obstacle->SetX(0);
		obstacle->SetWidth(1300);
		scene.RenderAndStep();

		runtimeBehavior->MoveTo(scene, 1200, 1300);
		REQUIRE(runtimeBehavior->PathFound() == true);
		REQUIRE(runtimeBehavior->GetNodeCount() == 93);
	}
	SECTION("Obstacles making a corridor") {
		//Prepare some objects and the context
		RuntimeGame game;

		gd::Object playerObj("player");
		auto behavior = new PathfindingBehavior();
		behavior->SetName("Pathfinding");
		playerObj.AddBehavior(behavior);

		gd::Object obstacleObj("obstacle");
		obstacleObj.AddBehavior(new PathfindingObstacleBehavior());

		RuntimeScene scene(NULL, &game);
		std::shared_ptr<RuntimeObject> player(new RuntimeObject(scene, playerObj));
		std::shared_ptr<ResizableRuntimeObject> obstacle1(new ResizableRuntimeObject(scene, obstacleObj));
		std::shared_ptr<ResizableRuntimeObject> obstacle2(new ResizableRuntimeObject(scene, obstacleObj));
		scene.objectsInstances.AddObject(player);
		scene.objectsInstances.AddObject(obstacle1);
		scene.objectsInstances.AddObject(obstacle2);

		obstacle1->SetX(-20);
		obstacle2->SetX(20);
		obstacle1->SetWidth(20);
		obstacle1->SetHeight(20);
		obstacle2->SetWidth(20);
		obstacle2->SetHeight(20);
		player->SetX(5);
		player->SetY(25);
		scene.RenderAndStep();

		PathfindingBehavior * runtimeBehavior =
			static_cast<PathfindingBehavior *>(player->GetBehaviorRawPointer("Pathfinding"));

		//Check that a path changes when adding obstacles
		runtimeBehavior->MoveTo(scene, 5, -5);
		REQUIRE(runtimeBehavior->PathFound() == true);
		REQUIRE(runtimeBehavior->GetNodeCount() == 2);
	}
}
