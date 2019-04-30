/**

GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
/**
 * @file Tests for the Pathfinding extension.
 */
#define CATCH_CONFIG_MAIN
#include "../PathfindingBehavior.h"
#include "../PathfindingObstacleBehavior.h"
#include "../PathfindingObstacleRuntimeBehavior.h"
#include "../PathfindingRuntimeBehavior.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCpp/Extensions/Builtin/ObjectTools.h"
#include "GDCpp/Runtime/RuntimeGame.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "catch.hpp"

// Mock objects that can have a specific size
class ResizableRuntimeObject : public RuntimeObject {
 public:
  ResizableRuntimeObject(RuntimeScene &scene, const gd::Object &obj)
      : RuntimeObject(scene, obj) {}

  float GetWidth() const override { return width; }
  float GetHeight() const override { return height; }
  void SetWidth(float newWidth) override { width = newWidth; }
  void SetHeight(float newHeight) override { height = newHeight; }

 private:
  float width;
  float height;
};

namespace {
template <class TRuntimeBehavior, class TBehavior>
std::unique_ptr<TRuntimeBehavior> CreateNewRuntimeBehavior() {
  gd::SerializerElement behaviorContent;
  TBehavior behavior;
  behavior.InitializeContent(behaviorContent);
  return std::move(gd::make_unique<TRuntimeBehavior>(behaviorContent));
};
}  // namespace

TEST_CASE("PathfindingRuntimeBehavior", "[game-engine][pathfinding]") {
  SECTION("Basics") {
    // Prepare some objects and the context
    RuntimeGame game;
    gd::Object playerObject("player");
    RuntimeScene scene(NULL, &game);
    RuntimeObject player(scene, playerObject);
    player.AddBehavior("Pathfinding",
                       CreateNewRuntimeBehavior<PathfindingRuntimeBehavior,
                                                PathfindingBehavior>());

    PathfindingRuntimeBehavior *runtimeBehavior =
        static_cast<PathfindingRuntimeBehavior *>(
            player.GetBehaviorRawPointer("Pathfinding"));

    // Check that a path can be computed without obstacles
    runtimeBehavior->MoveTo(scene, 1200, 1300);
    REQUIRE(runtimeBehavior->PathFound() == true);
    REQUIRE(runtimeBehavior->GetNodeCount() == 66);
    REQUIRE(runtimeBehavior->GetNodeX(65) == 1200);  // Check that destination
    REQUIRE(runtimeBehavior->GetNodeY(65) == 1300);  // is correct

    // Add an obstacle
    gd::Object obstacleObj("obstacle");
    std::unique_ptr<ResizableRuntimeObject> obstacle(
        new ResizableRuntimeObject(scene, obstacleObj));

    obstacle->AddBehavior(
        "PathfindingObstacle",
        CreateNewRuntimeBehavior<PathfindingObstacleRuntimeBehavior,
                                 PathfindingObstacleBehavior>());

    obstacle->SetX(1100);
    obstacle->SetY(1200);
    obstacle->SetWidth(200);
    obstacle->SetHeight(200);

    scene.objectsInstances.AddObject(std::move(obstacle));

    scene.RenderAndStep();

    runtimeBehavior->MoveTo(scene, 1200, 1300);
    REQUIRE(runtimeBehavior->PathFound() == false);
    REQUIRE(runtimeBehavior->GetNodeCount() == 0);
  }
  SECTION("Obstacle in the middle") {
    // Prepare some objects and the context
    RuntimeGame game;

    gd::Object playerObj("player");
    gd::Object obstacleObj("obstacle");

    RuntimeScene scene(NULL, &game);
    auto *player = scene.objectsInstances.AddObject(
        std::unique_ptr<RuntimeObject>(new RuntimeObject(scene, playerObj)));

    player->AddBehavior("Pathfinding",
                        CreateNewRuntimeBehavior<PathfindingRuntimeBehavior,
                                                 PathfindingBehavior>());
    auto *obstacle =
        scene.objectsInstances.AddObject(std::unique_ptr<RuntimeObject>(
            new ResizableRuntimeObject(scene, obstacleObj)));
    obstacle->AddBehavior(
        "PathfindingObstacle",
        CreateNewRuntimeBehavior<PathfindingObstacleRuntimeBehavior,
                                 PathfindingObstacleBehavior>());

    obstacle->SetX(300);
    obstacle->SetY(600);
    obstacle->SetWidth(32);
    obstacle->SetHeight(32);
    scene.RenderAndStep();

    PathfindingRuntimeBehavior *runtimeBehavior =
        static_cast<PathfindingRuntimeBehavior *>(
            player->GetBehaviorRawPointer("Pathfinding"));

    // Check that a path changes when adding obstacles
    runtimeBehavior->MoveTo(scene, 1200, 1300);
    REQUIRE(runtimeBehavior->PathFound() == true);
    REQUIRE(runtimeBehavior->GetNodeX(30) == 540);
    REQUIRE(runtimeBehavior->GetNodeY(30) == 600);
    REQUIRE(runtimeBehavior->GetNodeCount() == 66);

    // Enlarge the obstacle
    obstacle->SetWidth(600);
    scene.RenderAndStep();

    runtimeBehavior->MoveTo(scene, 1200, 1300);
    REQUIRE(runtimeBehavior->PathFound() == true);
    REQUIRE(runtimeBehavior->GetNodeCount() == 77);

    // Enlarge more
    obstacle->SetX(0);
    obstacle->SetWidth(1300);
    scene.RenderAndStep();

    runtimeBehavior->MoveTo(scene, 1200, 1300);
    REQUIRE(runtimeBehavior->PathFound() == true);
    REQUIRE(runtimeBehavior->GetNodeCount() == 92);
  }
  SECTION("Obstacles making a corridor") {
    // Prepare some objects and the context
    RuntimeGame game;

    gd::Object playerObj("player");
    gd::Object obstacleObj("obstacle");

    RuntimeScene scene(NULL, &game);

    auto *player = scene.objectsInstances.AddObject(
        std::unique_ptr<RuntimeObject>(new RuntimeObject(scene, playerObj)));

    player->AddBehavior("Pathfinding",
                        CreateNewRuntimeBehavior<PathfindingRuntimeBehavior,
                                                 PathfindingBehavior>());
    auto *obstacle1 =
        scene.objectsInstances.AddObject(std::unique_ptr<RuntimeObject>(
            new ResizableRuntimeObject(scene, obstacleObj)));
    obstacle1->AddBehavior(
        "PathfindingObstacle",
        CreateNewRuntimeBehavior<PathfindingObstacleRuntimeBehavior,
                                 PathfindingObstacleBehavior>());
    auto *obstacle2 =
        scene.objectsInstances.AddObject(std::unique_ptr<RuntimeObject>(
            new ResizableRuntimeObject(scene, obstacleObj)));
    obstacle1->AddBehavior(
        "PathfindingObstacle",
        CreateNewRuntimeBehavior<PathfindingObstacleRuntimeBehavior,
                                 PathfindingObstacleBehavior>());

    obstacle1->SetX(-20);
    obstacle2->SetX(20);
    obstacle1->SetWidth(20);
    obstacle1->SetHeight(20);
    obstacle2->SetWidth(20);
    obstacle2->SetHeight(20);
    player->SetX(5);
    player->SetY(25);
    scene.RenderAndStep();

    PathfindingRuntimeBehavior *runtimeBehavior =
        static_cast<PathfindingRuntimeBehavior *>(
            player->GetBehaviorRawPointer("Pathfinding"));

    // Check that a path changes when adding obstacles
    runtimeBehavior->MoveTo(scene, 5, -5);
    REQUIRE(runtimeBehavior->PathFound() == true);
    REQUIRE(runtimeBehavior->GetNodeCount() == 2);
  }
  SECTION("Diagonals") {
    // Prepare some objects and the context
    RuntimeGame game;

    gd::Object playerObj("player");

    RuntimeScene scene(NULL, &game);
    auto *player = scene.objectsInstances.AddObject(
        std::unique_ptr<RuntimeObject>(new RuntimeObject(scene, playerObj)));

    player->AddBehavior("Pathfinding",
                        CreateNewRuntimeBehavior<PathfindingRuntimeBehavior,
                                                 PathfindingBehavior>());

    PathfindingRuntimeBehavior *runtimeBehavior =
        static_cast<PathfindingRuntimeBehavior *>(
            player->GetBehaviorRawPointer("Pathfinding"));

    // Test a specific path that can lead to false computations
    // in case the algorithm open nodes list is not implemented properly
    // and can remove node with same cost.
    runtimeBehavior->MoveTo(scene, 1 * 20, 4 * 20);
    REQUIRE(runtimeBehavior->PathFound() == true);
    REQUIRE(runtimeBehavior->GetNodeCount() == 5);
    REQUIRE(runtimeBehavior->GetNodeX(0) == 0);
    REQUIRE(runtimeBehavior->GetNodeY(0) == 0);
    REQUIRE(runtimeBehavior->GetNodeX(1) == 0);
    REQUIRE(runtimeBehavior->GetNodeY(1) == 20);
    REQUIRE(runtimeBehavior->GetNodeX(2) == 0);
    REQUIRE(runtimeBehavior->GetNodeY(2) == 40);
    REQUIRE(runtimeBehavior->GetNodeX(3) == 0);
    REQUIRE(runtimeBehavior->GetNodeY(3) == 60);
    REQUIRE(runtimeBehavior->GetNodeX(4) == 20);
    REQUIRE(runtimeBehavior->GetNodeY(4) == 80);
  }
}
