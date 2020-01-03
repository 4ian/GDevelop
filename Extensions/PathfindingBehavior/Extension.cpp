/**

GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/Extensions/ExtensionBase.h"
#include "GDCpp/Runtime/Project/BehaviorsSharedData.h"
#include "PathfindingBehavior.h"
#include "PathfindingObstacleBehavior.h"
#include "PathfindingRuntimeBehavior.h"
#include "PathfindingObstacleRuntimeBehavior.h"

void DeclarePathfindingBehaviorExtension(gd::PlatformExtension& extension) {
  extension.SetExtensionInformation(
      "PathfindingBehavior",
      _("Pathfinding behavior"),
      _("Compute paths for objects avoiding obstacles."),
      "Florian Rival",
      "Open source (MIT License)")
      .SetExtensionHelpPath("/behaviors/pathfinding");

  {
    gd::BehaviorMetadata& aut = extension.AddBehavior(
        "PathfindingBehavior",
        _("Pathfinding"),
        "Pathfinding",
        _("With this, characters will move while avoiding all objects that are "
          "flagged as obstacles."),
        "",
        "CppPlatform/Extensions/AStaricon.png",
        "PathfindingBehavior",
        std::make_shared<PathfindingBehavior>(),
        std::make_shared<gd::BehaviorsSharedData>());

#if defined(GD_IDE_ONLY)

    aut.SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddAction("SetDestination",
                  _("Move to a position"),
                  _("Move the object to a position"),
                  _("Move _PARAM0_ to _PARAM3_;_PARAM4_"),
                  "",
                  "CppPlatform/Extensions/AStaricon24.png",
                  "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .AddCodeOnlyParameter("currentScene", "")

        .AddParameter("expression", _("Destination X position"))
        .AddParameter("expression", _("Destination Y position"))
        .SetFunctionName("MoveTo")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddCondition("PathFound",
                     _("Path found"),
                     _("Return true if a path has been found."),
                     _("A path has been found for _PARAM0_"),
                     "",
                     "CppPlatform/Extensions/AStaricon24.png",
                     "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("PathFound")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddCondition("DestinationReached",
                     _("Destination reached"),
                     _("Return true if the destination was reached."),
                     _("_PARAM0_ reached its destination"),
                     "",
                     "CppPlatform/Extensions/AStaricon24.png",
                     "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("DestinationReached")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddAction("CellWidth",
                  _("Width of the cells"),
                  _("Change the width of the cells of the virtual grid."),
                  _("the width of the virtual cells"),
                  _("Virtual grid"),
                  "CppPlatform/Extensions/AStaricon24.png",
                  "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardOperatorParameters("number")
        .SetFunctionName("SetCellWidth")
        .SetGetter("GetCellWidth")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddCondition(
           "CellWidth",
           _("Width of the virtual grid"),
           _("Compare the width of the cells of the virtual grid."),
           _("the width of the virtual cells"),
           _("Virtual grid"),
           "CppPlatform/Extensions/AStaricon24.png",
           "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardRelationalOperatorParameters("number")
        .SetFunctionName("GetCellWidth")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddAction("CellHeight",
                  _("Height of the cells"),
                  _("Change the height of the cells of the virtual grid."),
                  _("the height of the virtual cells"),
                  _("Virtual grid"),
                  "CppPlatform/Extensions/AStaricon24.png",
                  "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardOperatorParameters("number")
        .SetFunctionName("SetCellHeight")
        .SetGetter("GetCellHeight")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddCondition(
           "CellHeight",
           _("Height of the virtual grid"),
           _("Compare the height of the cells of the virtual grid."),
           _("the height of the virtual cells"),
           _("Virtual grid"),
           "CppPlatform/Extensions/AStaricon24.png",
           "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardRelationalOperatorParameters("number")
        .SetFunctionName("GetCellHeight")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddAction(
           "Acceleration",
           _("Acceleration"),
           _("Change the acceleration when moving the object"),
           _("the acceleration on the path"),
           _("Path"),
           "CppPlatform/Extensions/AStaricon24.png",
           "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardOperatorParameters("number")
        .SetFunctionName("SetAcceleration")
        .SetGetter("GetAcceleration")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddCondition("Acceleration",
                     _("Acceleration"),
                     _("Compare the acceleration when moving the object"),
                     _("the acceleration"),
                     _("Path"),
                     "CppPlatform/Extensions/AStaricon24.png",
                     "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardRelationalOperatorParameters("number")
        .SetFunctionName("GetAcceleration")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddAction(
           "MaxSpeed",
           _("Maximum speed"),
           _("Change the maximum speed when moving the object"),
           _("the max. speed on the path"),
           _("Path"),
           "CppPlatform/Extensions/AStaricon24.png",
           "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardOperatorParameters("number")
        .SetFunctionName("SetMaxSpeed")
        .SetGetter("GetMaxSpeed")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddCondition("MaxSpeed",
                     _("Maximum speed"),
                     _("Compare the maximum speed when moving the object"),
                     _("the max. speed"),
                     _("Path"),
                     "CppPlatform/Extensions/AStaricon24.png",
                     "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardRelationalOperatorParameters("number")
        .SetFunctionName("GetMaxSpeed")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddAction("Speed",
                  _("Speed"),
                  _("Change the speed of the object on the path"),
                  _("the speed on the path"),
                  _("Path"),
                  "CppPlatform/Extensions/AStaricon24.png",
                  "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardOperatorParameters("number")
        .SetFunctionName("SetSpeed")
        .SetGetter("GetSpeed")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddCondition("Speed",
                     _("Speed"),
                     _("Compare the speed of the object on the path"),
                     _("the speed"),
                     _("Path"),
                     "CppPlatform/Extensions/AStaricon24.png",
                     "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardRelationalOperatorParameters("number")
        .SetFunctionName("GetSpeed")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddAction("AngularMaxSpeed",
                  _("Angular maximum speed"),
                  _("Change the maximum angular speed when moving the object"),
                  _("the max. angular speed on the path"),
                  _("Path"),
                  "CppPlatform/Extensions/AStaricon24.png",
                  "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardOperatorParameters("number")
        .SetFunctionName("SetAngularMaxSpeed")
        .SetGetter("GetAngularMaxSpeed")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddCondition(
           "AngularMaxSpeed",
           _("Angular maximum speed"),
           _("Compare the maximum angular speed when moving the object"),
           _("the max. angular speed"),
           _("Path"),
           "CppPlatform/Extensions/AStaricon24.png",
           "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardRelationalOperatorParameters("number")
        .SetFunctionName("GetAngularMaxSpeed")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddAction(
           "AngleOffset",
           _("Rotation offset"),
           _("Change the rotation offset applied when moving the object"),
           _("the rotation offset on the path"),
           _("Path"),
           "CppPlatform/Extensions/AStaricon24.png",
           "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardOperatorParameters("number")
        .SetFunctionName("SetAngleOffset")
        .SetGetter("GetAngleOffset")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddCondition("AngleOffset",
                     _("Rotation offset"),
                     _("Compare the rotation offset when moving the object"),
                     _("the rotation offset"),
                     _("Path"),
                     "CppPlatform/Extensions/AStaricon24.png",
                     "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardRelationalOperatorParameters("number")
        .SetFunctionName("GetAngleOffset")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddAction(
           "ExtraBorder",
           _("Extra border"),
           _("Change the size of the extra border applied to the object when "
             "planning a path"),
           _("the size of the extra border on the path"),
           _("Path"),
           "CppPlatform/Extensions/AStaricon24.png",
           "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardOperatorParameters("number")
        .SetFunctionName("SetExtraBorder")
        .SetGetter("GetExtraBorder")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddCondition("ExtraBorder",
                     _("Extra border"),
                     _("Compare the size of the extra border applied to the "
                       "object when planning a path"),
                     _("the size of the extra border on the path"),
                     _("Path"),
                     "CppPlatform/Extensions/AStaricon24.png",
                     "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardRelationalOperatorParameters("number")
        .SetFunctionName("GetExtraBorder")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddAction(
           "AllowDiagonals",
           _("Diagonal movement"),
           _("Allow or restrict diagonal movement on the path"),
           _("Allow diagonal movement for _PARAM0_ on the path: _PARAM2_"),
           _("Path"),
           "CppPlatform/Extensions/AStaricon24.png",
           "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .AddParameter("yesorno", _("Allow?"))
        .SetFunctionName("SetAllowDiagonals")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddCondition("DiagonalsAllowed",
                     _("Diagonal movement"),
                     _("Return true if the object is allowed to move "
                       "diagonally on the path"),
                     _("Diagonal moves allowed for _PARAM0_"),
                     _("Path"),
                     "CppPlatform/Extensions/AStaricon24.png",
                     "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("DiagonalsAllowed")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddAction("RotateObject",
                  _("Rotate the object"),
                  _("Enable or disable rotation of the object on the path"),
                  _("Enable rotation of _PARAM0_ on the path: _PARAM2_"),
                  _("Path"),
                  "CppPlatform/Extensions/AStaricon24.png",
                  "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .AddParameter("yesorno", _("Rotate object?"))
        .SetFunctionName("SetRotateObject")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddCondition("ObjectRotated",
                     _("Object rotated"),
                     _("Return true if the object is rotated when traveling on "
                       "its path."),
                     _("_PARAM0_ is rotated when traveling on its path"),
                     _("Path"),
                     "CppPlatform/Extensions/AStaricon24.png",
                     "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("IsObjectRotated")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddExpression("GetNodeX",
                      _("Get a waypoint X position"),
                      _("Get next waypoint X position"),
                      _("Path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .AddParameter("expression", _("Node index (start at 0!)"))
        .SetFunctionName("GetNodeX")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddExpression("GetNodeY",
                      _("Get a waypoint Y position"),
                      _("Get next waypoint Y position"),
                      _("Path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .AddParameter("expression", _("Node index (start at 0!)"))
        .SetFunctionName("GetNodeY")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddExpression("NextNodeIndex",
                      _("Index of the next waypoint"),
                      _("Get the index of the next waypoint to reach"),
                      _("Path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetNextNodeIndex")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddExpression("NodeCount",
                      _("Waypoint count"),
                      _("Get the number of waypoints on the path"),
                      _("Path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetNodeCount")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddExpression("NextNodeX",
                      _("Get next waypoint X position"),
                      _("Get next waypoint X position"),
                      _("Path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetNextNodeX")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddExpression("NextNodeY",
                      _("Get next waypoint Y position"),
                      _("Get next waypoint Y position"),
                      _("Path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetNextNodeY")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddExpression("LastNodeX",
                      _("Last waypoint X position"),
                      _("Last waypoint X position"),
                      _("Path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetLastNodeX")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddExpression("LastNodeY",
                      _("Last waypoint Y position"),
                      _("Last waypoint Y position"),
                      _("Path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetLastNodeY")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddExpression("DestinationX",
                      _("Destination X position"),
                      _("Destination X position"),
                      _("Path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetDestinationX")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddExpression("DestinationY",
                      _("Destination Y position"),
                      _("Destination Y position"),
                      _("Path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetDestinationY")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddExpression("Acceleration",
                      _("Acceleration"),
                      _("Acceleration of the object on the path"),
                      _("Path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetAcceleration")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddExpression("MaxSpeed",
                      _("Maximum speed"),
                      _("Maximum speed of the object on the path"),
                      _("Path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetMaxSpeed")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddExpression("Speed",
                      _("Speed"),
                      _("Speed of the object on the path"),
                      _("Path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetSpeed")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddExpression("AngularMaxSpeed",
                      _("Angular maximum speed"),
                      _("Angular maximum speed of the object on the path"),
                      _("Path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetAngularMaxSpeed")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddExpression("AngleOffset",
                      _("Rotation offset"),
                      _("Rotation offset applied the object on the path"),
                      _("Path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetAngleOffset")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddExpression("ExtraBorder",
                      _("Extra border size"),
                      _("Extra border applied the object on the path"),
                      _("Path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetExtraBorder")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddExpression("CellWidth",
                      _("Width of a cell"),
                      _("Width of the virtual grid"),
                      _("Virtual grid"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetCellWidth")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    aut.AddExpression("CellHeight",
                      _("Height of a cell"),
                      _("Height of the virtual grid"),
                      _("Virtual grid"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetCellHeight")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

#endif
  }
  {
    gd::BehaviorMetadata& aut = extension.AddBehavior(
        "PathfindingObstacleBehavior",
        _("Obstacle for pathfinding"),
        "PathfindingObstacle",
        _("Flag the object as being an obstacle for pathfinding."),
        "",
        "CppPlatform/Extensions/pathfindingobstacleicon.png",
        "PathfindingObstacleBehavior",
        std::make_shared<PathfindingObstacleBehavior>(),
        std::make_shared<gd::BehaviorsSharedData>());

#if defined(GD_IDE_ONLY)
    aut.SetIncludeFile("PathfindingBehavior/PathfindingObstacleRuntimeBehavior.h");

    aut.AddAction("Cost",
                  _("Cost"),
                  _("Change the cost of going through the object."),
                  _("the cost"),
                  _("Obstacles"),
                  "CppPlatform/Extensions/pathfindingobstacleicon24.png",
                  "CppPlatform/Extensions/pathfindingobstacleicon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingObstacleBehavior")
        .UseStandardOperatorParameters("number")
        .SetFunctionName("SetCost")
        .SetGetter("GetCost")
        .SetIncludeFile("PathfindingBehavior/PathfindingObstacleRuntimeBehavior.h");

    aut.AddCondition("Cost",
                     _("Cost"),
                     _("Compare the cost of going through the object"),
                     _("the cost"),
                     _("Obstacles"),
                     "CppPlatform/Extensions/pathfindingobstacleicon24.png",
                     "CppPlatform/Extensions/pathfindingobstacleicon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingObstacleBehavior")
        .UseStandardRelationalOperatorParameters("number")
        .SetFunctionName("GetCost")
        .SetIncludeFile("PathfindingBehavior/PathfindingObstacleRuntimeBehavior.h");

    aut.AddAction("SetImpassable",
                  _("Should object be impassable?"),
                  _("Decide if the object is an impassable obstacle"),
                  _("Set _PARAM0_ as an impassable obstacle: _PARAM2_"),
                  _("Obstacles"),
                  "CppPlatform/Extensions/pathfindingobstacleicon24.png",
                  "CppPlatform/Extensions/pathfindingobstacleicon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingObstacleBehavior")
        .AddParameter("yesorno", _("Impassable?"))
        .SetFunctionName("SetImpassable")
        .SetIncludeFile("PathfindingBehavior/PathfindingObstacleRuntimeBehavior.h");

    aut.AddCondition("IsImpassable",
                     _("Is object impassable?"),
                     _("Return true if the obstacle is impassable"),
                     _("_PARAM0_ is impassable"),
                     _("Obstacles"),
                     "CppPlatform/Extensions/pathfindingobstacleicon24.png",
                     "CppPlatform/Extensions/pathfindingobstacleicon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingObstacleBehavior")
        .SetFunctionName("IsImpassable")
        .SetIncludeFile("PathfindingBehavior/PathfindingObstacleRuntimeBehavior.h");

    aut.AddExpression("Cost",
                      _("Cost"),
                      _("Obstacle cost"),
                      _("Obstacles"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingObstacleBehavior")
        .SetFunctionName("GetCost")
        .SetIncludeFile("PathfindingBehavior/PathfindingObstacleRuntimeBehavior.h");

#endif
  }
}

/**
 * \brief This class declares information about the extension.
 */
class PathfindingBehaviorCppExtension : public ExtensionBase {
 public:
  /**
   * Constructor of an extension declares everything the extension contains:
   * objects, actions, conditions and expressions.
   */
  PathfindingBehaviorCppExtension() {
    DeclarePathfindingBehaviorExtension(*this);
    AddRuntimeBehavior<PathfindingRuntimeBehavior>(
        GetBehaviorMetadata("PathfindingBehavior::Pathfinding"),
        "PathfindingRuntimeBehavior");
    GetBehaviorMetadata("PathfindingBehavior::Pathfinding")
        .SetIncludeFile("PathfindingBehavior/PathfindingRuntimeBehavior.h");

    AddRuntimeBehavior<PathfindingObstacleRuntimeBehavior>(
        GetBehaviorMetadata("PathfindingBehavior::PathfindingObstacle"),
        "PathfindingObstacleRuntimeBehavior");
    GetBehaviorMetadata("PathfindingBehavior::PathfindingObstacle")
        .SetIncludeFile("PathfindingBehavior/PathfindingObstacleRuntimeBehavior.h");

    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if defined(ANDROID)
extern "C" ExtensionBase* CreateGDCppPathfindingBehaviorExtension() {
  return new PathfindingBehaviorCppExtension;
}
#elif !defined(EMSCRIPTEN)
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase* GD_EXTENSION_API CreateGDExtension() {
  return new PathfindingBehaviorCppExtension;
}
#endif
