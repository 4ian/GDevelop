/**

GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCore/Extensions/Metadata/MultipleInstructionMetadata.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/BehaviorsSharedData.h"
#include "GDCore/Tools/Localization.h"
#include "PathfindingBehavior.h"
#include "PathfindingObstacleBehavior.h"

void DeclarePathfindingBehaviorExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "PathfindingBehavior",
          _("Pathfinding behavior"),
          "Pathfinding allows to compute an efficient path for objects, "
          "avoiding obstacles on the way.",
          "Florian Rival",
          "Open source (MIT License)")
      .SetCategory("Movement")
      .SetTags("pathfinding, obstacle, collision")
      .SetExtensionHelpPath("/behaviors/pathfinding");
  extension.AddInstructionOrExpressionGroupMetadata(_("Pathfinding behavior"))
      .SetIcon("CppPlatform/Extensions/AStaricon16.png");

  {
    gd::BehaviorMetadata& aut =
        extension.AddBehavior("PathfindingBehavior",
                              _("Pathfinding"),
                              "Pathfinding",
                              _("Move objects to a target "
                                "while avoiding all objects that are "
                                "flagged as obstacles."),
                              "",
                              "CppPlatform/Extensions/AStaricon.png",
                              "PathfindingBehavior",
                              std::make_shared<PathfindingBehavior>(),
                              std::make_shared<gd::BehaviorsSharedData>());

    aut.AddAction("SetDestination",
                  _("Move to a position"),
                  _("Move the object to a position"),
                  _("Move _PARAM0_ to _PARAM3_;_PARAM4_"),
                  _("Movement on the path"),
                  "CppPlatform/Extensions/AStaricon24.png",
                  "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .AddCodeOnlyParameter("currentScene", "")

        .AddParameter("expression", _("Destination X position"))
        .AddParameter("expression", _("Destination Y position"))
        .SetFunctionName("MoveTo");

    aut.AddCondition("PathFound",
                     _("Path found"),
                     _("Check if a path has been found."),
                     _("A path has been found for _PARAM0_"),
                     _("Movement on the path"),
                     "CppPlatform/Extensions/AStaricon24.png",
                     "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("PathFound");

    aut.AddCondition("DestinationReached",
                     _("Destination reached"),
                     _("Check if the destination was reached."),
                     _("_PARAM0_ reached its destination"),
                     _("Movement on the path"),
                     "CppPlatform/Extensions/AStaricon24.png",
                     "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("DestinationReached");

    aut.AddAction("CellWidth",
                  _("Width of the cells"),
                  _("Change the width of the cells of the virtual grid."),
                  _("the width of the virtual cells"),
                  _("Virtual grid"),
                  "CppPlatform/Extensions/AStaricon24.png",
                  "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardOperatorParameters("number",
                                       gd::ParameterOptions::MakeNewOptions())
        .SetFunctionName("SetCellWidth")
        .SetGetter("GetCellWidth");

    aut.AddCondition("CellWidth",
                     _("Width of the virtual grid"),
                     _("Compare the width of the cells of the virtual grid."),
                     _("the width of the virtual cells"),
                     _("Virtual grid"),
                     "CppPlatform/Extensions/AStaricon24.png",
                     "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardRelationalOperatorParameters(
            "number", gd::ParameterOptions::MakeNewOptions())
        .SetFunctionName("GetCellWidth");

    aut.AddAction("CellHeight",
                  _("Height of the cells"),
                  _("Change the height of the cells of the virtual grid."),
                  _("the height of the virtual cells"),
                  _("Virtual grid"),
                  "CppPlatform/Extensions/AStaricon24.png",
                  "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardOperatorParameters("number",
                                       gd::ParameterOptions::MakeNewOptions())
        .SetFunctionName("SetCellHeight")
        .SetGetter("GetCellHeight");

    aut.AddCondition("CellHeight",
                     _("Height of the virtual grid"),
                     _("Compare the height of the cells of the virtual grid."),
                     _("the height of the virtual cells"),
                     _("Virtual grid"),
                     "CppPlatform/Extensions/AStaricon24.png",
                     "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardRelationalOperatorParameters(
            "number", gd::ParameterOptions::MakeNewOptions())
        .SetFunctionName("GetCellHeight");

    aut.AddAction("Acceleration",
                  _("Acceleration"),
                  _("Change the acceleration when moving the object"),
                  _("the acceleration on the path"),
                  _("Pathfinding configuration"),
                  "CppPlatform/Extensions/AStaricon24.png",
                  "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardOperatorParameters("number",
                                       gd::ParameterOptions::MakeNewOptions())
        .SetFunctionName("SetAcceleration")
        .SetGetter("GetAcceleration");

    aut.AddCondition("Acceleration",
                     _("Acceleration"),
                     _("Compare the acceleration when moving the object"),
                     _("the acceleration"),
                     _("Pathfinding configuration"),
                     "CppPlatform/Extensions/AStaricon24.png",
                     "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardRelationalOperatorParameters(
            "number", gd::ParameterOptions::MakeNewOptions())
        .SetFunctionName("GetAcceleration");

    aut.AddAction("MaxSpeed",
                  _("Maximum speed"),
                  _("Change the maximum speed when moving the object"),
                  _("the max. speed on the path"),
                  _("Pathfinding configuration"),
                  "CppPlatform/Extensions/AStaricon24.png",
                  "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Max speed (in pixels per second)")))
        .SetFunctionName("SetMaxSpeed")
        .SetGetter("GetMaxSpeed");

    aut.AddCondition("MaxSpeed",
                     _("Maximum speed"),
                     _("Compare the maximum speed when moving the object"),
                     _("the max. speed"),
                     _("Pathfinding configuration"),
                     "CppPlatform/Extensions/AStaricon24.png",
                     "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardRelationalOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Max speed to compare to (in pixels per second)")))
        .SetFunctionName("GetMaxSpeed");

    aut.AddAction("Speed",
                  _("Speed"),
                  _("Change the speed of the object on the path"),
                  _("the speed on the path"),
                  _("Movement on the path"),
                  "CppPlatform/Extensions/AStaricon24.png",
                  "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Speed (in pixels per second)")))
        .SetFunctionName("SetSpeed")
        .SetGetter("GetSpeed");

    aut.AddCondition("Speed",
                     _("Speed on its path"),
                     _("Compare the speed of the object on its path."),
                     _("the speed"),
                     _("Movement on the path"),
                     "CppPlatform/Extensions/AStaricon24.png",
                     "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardRelationalOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Speed to compare to (in pixels per second)")))
        .SetFunctionName("GetSpeed");

    aut.AddScopedCondition(
           "MovementAngleIsAround",
           _("Angle of movement on its path"),
           _("Compare the angle of movement of an object on its path."),
           _("Angle of movement of _PARAM0_ is _PARAM2_ ± _PARAM3_°"),
           _("Movement on the path"),
           "CppPlatform/Extensions/AStaricon24.png",
           "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .AddParameter("expression", _("Angle, in degrees"))
        .AddParameter("expression", _("Tolerance, in degrees"));

    aut.AddAction("AngularMaxSpeed",
                  _("Angular maximum speed"),
                  _("Change the maximum angular speed when moving the object"),
                  _("the max. angular speed on the path"),
                  _("Pathfinding configuration"),
                  "CppPlatform/Extensions/AStaricon24.png",
                  "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Max angular speed (in degrees per second)")))
        .SetFunctionName("SetAngularMaxSpeed")
        .SetGetter("GetAngularMaxSpeed");

    aut.AddCondition(
           "AngularMaxSpeed",
           _("Angular maximum speed"),
           _("Compare the maximum angular speed when moving the object"),
           _("the max. angular speed"),
           _("Pathfinding configuration"),
           "CppPlatform/Extensions/AStaricon24.png",
           "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardRelationalOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Max angular speed to compare to (in degrees per second)")))
        .SetFunctionName("GetAngularMaxSpeed");

    aut.AddAction(
           "AngleOffset",
           _("Rotation offset"),
           _("Change the rotation offset applied when moving the object"),
           _("the rotation offset on the path"),
           _("Pathfinding configuration"),
           "CppPlatform/Extensions/AStaricon24.png",
           "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Angle (in degrees)")))
        .SetFunctionName("SetAngleOffset")
        .SetGetter("GetAngleOffset");

    aut.AddCondition("AngleOffset",
                     _("Rotation offset"),
                     _("Compare the rotation offset when moving the object"),
                     _("the rotation offset"),
                     _("Pathfinding configuration"),
                     "CppPlatform/Extensions/AStaricon24.png",
                     "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardRelationalOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Angle to compare to (in degrees)")))
        .SetFunctionName("GetAngleOffset");

    aut.AddAction(
           "ExtraBorder",
           _("Extra border"),
           _("Change the size of the extra border applied to the object when "
             "planning a path"),
           _("the size of the extra border on the path"),
           _("Pathfinding configuration"),
           "CppPlatform/Extensions/AStaricon24.png",
           "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardOperatorParameters("number",
                                       gd::ParameterOptions::MakeNewOptions())
        .SetFunctionName("SetExtraBorder")
        .SetGetter("GetExtraBorder");

    aut.AddCondition("ExtraBorder",
                     _("Extra border"),
                     _("Compare the size of the extra border applied to the "
                       "object when planning a path"),
                     _("the size of the extra border on the path"),
                     _("Pathfinding configuration"),
                     "CppPlatform/Extensions/AStaricon24.png",
                     "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardRelationalOperatorParameters(
            "number", gd::ParameterOptions::MakeNewOptions())
        .SetFunctionName("GetExtraBorder");

    aut.AddAction(
           "AllowDiagonals",
           _("Diagonal movement"),
           _("Allow or restrict diagonal movement on the path"),
           _("Allow diagonal movement for _PARAM0_ on the path: _PARAM2_"),
           _("Pathfinding configuration"),
           "CppPlatform/Extensions/AStaricon24.png",
           "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .AddParameter("yesorno", _("Allow?"))
        .SetFunctionName("SetAllowDiagonals");

    aut.AddCondition("DiagonalsAllowed",
                     _("Diagonal movement"),
                     _("Check if the object is allowed to move "
                       "diagonally on the path"),
                     _("Diagonal moves allowed for _PARAM0_"),
                     _("Pathfinding configuration"),
                     "CppPlatform/Extensions/AStaricon24.png",
                     "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("DiagonalsAllowed");

    aut.AddAction("RotateObject",
                  _("Rotate the object"),
                  _("Enable or disable rotation of the object on the path"),
                  _("Enable rotation of _PARAM0_ on the path: _PARAM2_"),
                  _("Pathfinding configuration"),
                  "CppPlatform/Extensions/AStaricon24.png",
                  "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .AddParameter("yesorno", _("Rotate object?"))
        .SetFunctionName("SetRotateObject");

    aut.AddCondition("ObjectRotated",
                     _("Object rotated"),
                     _("Check if the object is rotated when traveling on "
                       "its path."),
                     _("_PARAM0_ is rotated when traveling on its path"),
                     _("Pathfinding configuration"),
                     "CppPlatform/Extensions/AStaricon24.png",
                     "CppPlatform/Extensions/AStaricon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("IsObjectRotated");

    aut.AddExpression("GetNodeX",
                      _("Get a waypoint X position"),
                      _("Get next waypoint X position"),
                      _("Movement on the path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .AddParameter("expression", _("Node index (start at 0!)"))
        .SetFunctionName("GetNodeX");

    aut.AddExpression("GetNodeY",
                      _("Get a waypoint Y position"),
                      _("Get next waypoint Y position"),
                      _("Movement on the path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .AddParameter("expression", _("Node index (start at 0!)"))
        .SetFunctionName("GetNodeY");

    aut.AddExpression("NextNodeIndex",
                      _("Index of the next waypoint"),
                      _("Get the index of the next waypoint to reach"),
                      _("Movement on the path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetNextNodeIndex");

    aut.AddExpression("NodeCount",
                      _("Waypoint count"),
                      _("Get the number of waypoints on the path"),
                      _("Movement on the path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetNodeCount");

    aut.AddExpression("NextNodeX",
                      _("Get next waypoint X position"),
                      _("Get next waypoint X position"),
                      _("Movement on the path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetNextNodeX");

    aut.AddExpression("NextNodeY",
                      _("Get next waypoint Y position"),
                      _("Get next waypoint Y position"),
                      _("Movement on the path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetNextNodeY");

    aut.AddExpression("LastNodeX",
                      _("Last waypoint X position"),
                      _("Last waypoint X position"),
                      _("Movement on the path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetLastNodeX");

    aut.AddExpression("LastNodeY",
                      _("Last waypoint Y position"),
                      _("Last waypoint Y position"),
                      _("Movement on the path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetLastNodeY");

    aut.AddExpression("DestinationX",
                      _("Destination X position"),
                      _("Destination X position"),
                      _("Movement on the path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetDestinationX");

    aut.AddExpression("DestinationY",
                      _("Destination Y position"),
                      _("Destination Y position"),
                      _("Movement on the path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetDestinationY");

    aut.AddExpression("Acceleration",
                      _("Acceleration"),
                      _("Acceleration of the object on the path"),
                      _("Pathfinding configuration"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetAcceleration");

    aut.AddExpression("MaxSpeed",
                      _("Maximum speed"),
                      _("Maximum speed of the object on the path"),
                      _("Pathfinding configuration"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetMaxSpeed");

    aut.AddExpression("Speed",
                      _("Speed"),
                      _("Speed of the object on the path"),
                      _("Movement on the path"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetSpeed");

    aut.AddExpression("AngularMaxSpeed",
                      _("Angular maximum speed"),
                      _("Angular maximum speed of the object on the path"),
                      _("Pathfinding configuration"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetAngularMaxSpeed");

    aut.AddExpression("AngleOffset",
                      _("Rotation offset"),
                      _("Rotation offset applied the object on the path"),
                      _("Pathfinding configuration"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetAngleOffset");

    aut.AddExpression("ExtraBorder",
                      _("Extra border size"),
                      _("Extra border applied the object on the path"),
                      _("Pathfinding configuration"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetExtraBorder");

    aut.AddExpression("CellWidth",
                      _("Width of a cell"),
                      _("Width of the virtual grid"),
                      _("Virtual grid"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetCellWidth");

    aut.AddExpression("CellHeight",
                      _("Height of a cell"),
                      _("Height of the virtual grid"),
                      _("Virtual grid"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .SetFunctionName("GetCellHeight");

    aut.AddExpression("MovementAngle",
                    _("Angle of movement on its path"),
                    _("Angle of movement on its path"),
                    _("Movement on the path"),
                    "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior");

    aut.AddExpressionAndConditionAndAction("number",
                      "GridOffsetX",
                      _("Grid X offset"),
                      _("X offset of the virtual grid"),
                      _("X offset of the virtual grid"),
                      _("Virtual grid"),
                      "CppPlatform/Extensions/AStaricon24.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardParameters("number", gd::ParameterOptions::MakeNewOptions());

    aut.AddExpressionAndConditionAndAction("number",
                      "GridOffsetY",
                      _("Grid Y offset"),
                      _("Y offset of the virtual grid"),
                      _("Y offset of the virtual grid"),
                      _("Virtual grid"),
                      "CppPlatform/Extensions/AStaricon24.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
        .UseStandardParameters("number", gd::ParameterOptions::MakeNewOptions());

  }
  {
    gd::BehaviorMetadata& aut = extension.AddBehavior(
        "PathfindingObstacleBehavior",
        _("Obstacle for pathfinding"),
        "PathfindingObstacle",
        _("Flag objects as being obstacles for pathfinding."),
        "",
        "CppPlatform/Extensions/pathfindingobstacleicon.png",
        "PathfindingObstacleBehavior",
        std::make_shared<PathfindingObstacleBehavior>(),
        std::make_shared<gd::BehaviorsSharedData>());

    aut.AddAction("Cost",
                  _("Cost"),
                  _("Change the cost of going through the object."),
                  _("the cost"),
                  _("Obstacles"),
                  "CppPlatform/Extensions/pathfindingobstacleicon24.png",
                  "CppPlatform/Extensions/pathfindingobstacleicon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingObstacleBehavior")
        .UseStandardOperatorParameters("number",
                                       gd::ParameterOptions::MakeNewOptions())
        .SetFunctionName("SetCost")
        .SetGetter("GetCost");

    aut.AddCondition("Cost",
                     _("Cost"),
                     _("Compare the cost of going through the object"),
                     _("the cost"),
                     _("Obstacles"),
                     "CppPlatform/Extensions/pathfindingobstacleicon24.png",
                     "CppPlatform/Extensions/pathfindingobstacleicon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingObstacleBehavior")
        .UseStandardRelationalOperatorParameters(
            "number", gd::ParameterOptions::MakeNewOptions())
        .SetFunctionName("GetCost");

    aut.AddAction("SetImpassable",
                  _("Should object be impassable"),
                  _("Decide if the object is an impassable obstacle."),
                  _("Set _PARAM0_ as an impassable obstacle: _PARAM2_"),
                  _("Obstacles"),
                  "CppPlatform/Extensions/pathfindingobstacleicon24.png",
                  "CppPlatform/Extensions/pathfindingobstacleicon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingObstacleBehavior")
        .AddParameter("yesorno", _("Impassable"))
        .SetFunctionName("SetImpassable");

    aut.AddCondition("IsImpassable",
                     _("Impassable obstacle"),
                     _("Check if the obstacle is impassable."),
                     _("_PARAM0_ is impassable"),
                     _("Obstacles"),
                     "CppPlatform/Extensions/pathfindingobstacleicon24.png",
                     "CppPlatform/Extensions/pathfindingobstacleicon16.png")

        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingObstacleBehavior")
        .SetFunctionName("IsImpassable");

    aut.AddExpression("Cost",
                      _("Cost"),
                      _("Obstacle cost"),
                      _("Obstacles"),
                      "CppPlatform/Extensions/AStaricon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PathfindingObstacleBehavior")
        .SetFunctionName("GetCost");
  }
}
