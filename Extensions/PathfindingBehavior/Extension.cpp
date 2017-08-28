/**

GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/Extensions/ExtensionBase.h"
#include "GDCpp/Runtime/Project/BehaviorsSharedData.h"

#include "PathfindingBehavior.h"
#include "PathfindingObstacleBehavior.h"


/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    Extension()
    {
        SetExtensionInformation("PathfindingBehavior",
                              _("Pathfinding behavior"),
                              _("Compute paths for objects avoiding obstacles."),
                              "Florian Rival",
                              "Open source (MIT License)");

        {
            gd::BehaviorMetadata & aut = AddBehavior("PathfindingBehavior",
                  _("Pathfinding"),
                  "Pathfinding",
                  _("With this, characters will move while avoiding all objects that are flagged as obstacles."),
                  "",
                  "CppPlatform/Extensions/AStaricon.png",
                  "PathfindingBehavior",
                  std::make_shared<PathfindingBehavior>(),
                  std::make_shared<gd::BehaviorsSharedData>());

            #if defined(GD_IDE_ONLY)

            aut.SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");

            aut.AddAction("SetDestination",
                           _("Move to a position"),
                           _("Move the object to a position"),
                           _("Move _PARAM0_ to _PARAM3_;_PARAM4_"),
                           _(""),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .AddCodeOnlyParameter("currentScene", "")

                .AddParameter("expression", _("Destination X position"))
                .AddParameter("expression", _("Destination Y position"))
                .SetFunctionName("MoveTo").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");


            aut.AddCondition("PathFound",
                           _("Path found"),
                           _("Return true if a path has been found."),
                           _("A path has been found for _PARAM0_"),
                           _(""),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .SetFunctionName("PathFound").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");


            aut.AddCondition("DestinationReached",
                           _("Destination reached"),
                           _("Return true if the destination was reached."),
                           _("_PARAM0_ reached its destination"),
                           _(""),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .SetFunctionName("DestinationReached").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");


            aut.AddAction("CellWidth",
                           _("Width of the cells"),
                           _("Change the width of the cells of the virtual grid."),
                           _("Do _PARAM2__PARAM3_ to the width of the virtual cells of _PARAM0_"),
                           _("Virtual grid"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Width (pixels)"))
                .SetFunctionName("SetCellWidth").SetGetter("GetCellWidth").SetManipulatedType("number").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");


            aut.AddCondition("CellWidth",
                           _("Width of the virtual grid"),
                           _("Compare the width of the cells of the virtual grid."),
                           _("Width of the virtual cells of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Virtual grid"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Width (pixels)"))
                .SetFunctionName("GetCellWidth").SetManipulatedType("number").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");


            aut.AddAction("CellHeight",
                           _("Height of the cells"),
                           _("Change the height of the cells of the virtual grid."),
                           _("Do _PARAM2__PARAM3_ to the height of the virtual cells of _PARAM0_"),
                           _("Virtual grid"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Height (pixels)"))
                .SetFunctionName("SetCellHeight").SetGetter("GetCellHeight").SetManipulatedType("number").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");


            aut.AddCondition("CellHeight",
                           _("Height of the virtual grid"),
                           _("Compare the height of the cells of the virtual grid."),
                           _("Height of the virtual cells of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Virtual grid"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Height (pixels)"))
                .SetFunctionName("GetCellHeight").SetManipulatedType("number").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");


            aut.AddAction("Acceleration",
                           _("Acceleration"),
                           _("Change the acceleration when moving the object"),
                           _("Do _PARAM2__PARAM3_ to the acceleration of _PARAM0_ on the path"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .SetFunctionName("SetAcceleration").SetGetter("GetAcceleration").SetManipulatedType("number").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");


            aut.AddCondition("Acceleration",
                           _("Acceleration"),
                           _("Compare the acceleration when moving the object"),
                           _("Acceleration of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value"))
                .SetFunctionName("GetAcceleration").SetManipulatedType("number").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");


            aut.AddAction("MaxSpeed",
                           _("Maximum speed"),
                           _("Change the maximum speed when moving the object"),
                           _("Do _PARAM2__PARAM3_ to the max. speed of _PARAM0_ on the path"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .SetFunctionName("SetMaxSpeed").SetGetter("GetMaxSpeed").SetManipulatedType("number").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");


            aut.AddCondition("MaxSpeed",
                           _("Maximum speed"),
                           _("Compare the maximum speed when moving the object"),
                           _("Max. speed of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value"))
                .SetFunctionName("GetMaxSpeed").SetManipulatedType("number").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");


            aut.AddAction("Speed",
                           _("Speed"),
                           _("Change the speed of the object on the path"),
                           _("Do _PARAM2__PARAM3_ to the speed of _PARAM0_ on the path"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .SetFunctionName("SetSpeed").SetGetter("GetSpeed").SetManipulatedType("number").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");


            aut.AddCondition("Speed",
                           _("Speed"),
                           _("Compare the speed of the object on the path"),
                           _("Speed of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value"))
                .SetFunctionName("GetSpeed").SetManipulatedType("number").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");


            aut.AddAction("AngularMaxSpeed",
                           _("Angular maximum speed"),
                           _("Change the maximum angular speed when moving the object"),
                           _("Do _PARAM2__PARAM3_ to the max. angular speed of _PARAM0_ on the path"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .SetFunctionName("SetAngularMaxSpeed").SetGetter("GetAngularMaxSpeed").SetManipulatedType("number").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");


            aut.AddCondition("AngularMaxSpeed",
                           _("Angular maximum speed"),
                           _("Compare the maximum angular speed when moving the object"),
                           _("Max. angular speed of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value"))
                .SetFunctionName("GetAngularMaxSpeed").SetManipulatedType("number").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");


            aut.AddAction("AngleOffset",
                           _("Rotation offset"),
                           _("Change the rotation offset applied when moving the object"),
                           _("Do _PARAM2__PARAM3_ to the rotation offset of _PARAM0_ on the path"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .SetFunctionName("SetAngleOffset").SetGetter("GetAngleOffset").SetManipulatedType("number").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");


            aut.AddCondition("AngleOffset",
                           _("Rotation offset"),
                           _("Compare the rotation offset when moving the object"),
                           _("Rotation offset of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value"))
                .SetFunctionName("GetAngleOffset").SetManipulatedType("number").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");


            aut.AddAction("ExtraBorder",
                           _("Extra border"),
                           _("Change the size of the extra border applied to the object when planning a path"),
                           _("Do _PARAM2__PARAM3_ to the extra border of _PARAM0_ on the path"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value (in pixels)"))
                .SetFunctionName("SetExtraBorder").SetGetter("GetExtraBorder").SetManipulatedType("number").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");


            aut.AddCondition("ExtraBorder",
                           _("Extra border"),
                           _("Compare the size of the extra border applied to the object when planning a path"),
                           _("Size of the extra border applied to _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value (in pixels)"))
                .SetFunctionName("GetExtraBorder").SetManipulatedType("number").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");


            aut.AddAction("AllowDiagonals",
                           _("Diagonals moves"),
                           _("Allow or restrict diagonal movement on the path"),
                           _("Allow diagonal movement for _PARAM0_ on the path: _PARAM2_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .AddParameter("yesorno", _("Allow?"))
                .SetFunctionName("SetAllowDiagonals").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");


            aut.AddCondition("DiagonalsAllowed",
                           _("Diagonals moves"),
                           _("Return true if the object is allowed to move diagonally on the path"),
                           _("Diagonal moves allowed for _PARAM0_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .SetFunctionName("DiagonalsAllowed").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");


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
                .SetFunctionName("SetRotateObject").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");


            aut.AddCondition("ObjectRotated",
                           _("Object rotated"),
                           _("Return true if the object is rotated when traveling on its path."),
                           _("_PARAM0_ is rotated when traveling on its path"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .SetFunctionName("IsObjectRotated").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");

            aut.AddExpression("GetNodeX", _("Get a waypoint X position"), _("Get next waypoint X position"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .AddParameter("expression", _("Node index (start at 0!)"))
                .SetFunctionName("GetNodeX").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");

            aut.AddExpression("GetNodeY", _("Get a waypoint Y position"), _("Get next waypoint Y position"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .AddParameter("expression", _("Node index (start at 0!)"))
                .SetFunctionName("GetNodeY").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");

            aut.AddExpression("NextNodeIndex", _("Index of the next waypoint"), _("Get the index of the next waypoint to reach"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .SetFunctionName("GetNextNodeIndex").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");

            aut.AddExpression("NodeCount", _("Waypoint count"), _("Get the number of waypoints on the path"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .SetFunctionName("GetNodeCount").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");

            aut.AddExpression("NextNodeX", _("Get next waypoint X position"), _("Get next waypoint X position"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .SetFunctionName("GetNextNodeX").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");

            aut.AddExpression("NextNodeY", _("Get next waypoint Y position"), _("Get next waypoint Y position"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .SetFunctionName("GetNextNodeY").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");

            aut.AddExpression("LastNodeX", _("Last waypoint X position"), _("Last waypoint X position"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .SetFunctionName("GetLastNodeX").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");

            aut.AddExpression("LastNodeY", _("Last waypoint Y position"), _("Last waypoint Y position"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .SetFunctionName("GetLastNodeY").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");

            aut.AddExpression("DestinationX", _("Destination X position"), _("Destination X position"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .SetFunctionName("GetDestinationX").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");

            aut.AddExpression("DestinationY", _("Destination Y position"), _("Destination Y position"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .SetFunctionName("GetDestinationY").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");

            aut.AddExpression("Acceleration", _("Acceleration"), _("Acceleration of the object on the path"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .SetFunctionName("GetAcceleration").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");

            aut.AddExpression("MaxSpeed", _("Maximum speed"), _("Maximum speed of the object on the path"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .SetFunctionName("GetMaxSpeed").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");

            aut.AddExpression("Speed", _("Speed"), _("Speed of the object on the path"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .SetFunctionName("GetSpeed").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");

            aut.AddExpression("AngularMaxSpeed", _("Angular maximum speed"), _("Angular maximum speed of the object on the path"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .SetFunctionName("GetAngularMaxSpeed").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");

            aut.AddExpression("AngleOffset", _("Rotation offset"), _("Rotation offset applied the object on the path"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .SetFunctionName("GetAngleOffset").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");

            aut.AddExpression("ExtraBorder", _("Extra border size"), _("Extra border applied the object on the path"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .SetFunctionName("GetExtraBorder").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");

            aut.AddExpression("CellWidth", _("Width of a cell"), _("Width of the virtual grid"), _("Virtual grid"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .SetFunctionName("GetCellWidth").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");

            aut.AddExpression("CellHeight", _("Height of a cell"), _("Height of the virtual grid"), _("Virtual grid"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingBehavior")
                .SetFunctionName("GetCellHeight").SetIncludeFile("PathfindingBehavior/PathfindingBehavior.h");

            #endif

        }
        {
            gd::BehaviorMetadata & aut = AddBehavior("PathfindingObstacleBehavior",
                  _("Obstacle for pathfinding"),
                  "PathfindingObstacle",
                  _("Flag the object as being an obstacle for pathfinding."),
                  "",
                  "CppPlatform/Extensions/pathfindingobstacleicon.png",
                  "PathfindingObstacleBehavior",
                  std::make_shared<PathfindingObstacleBehavior>(),
                  std::make_shared<gd::BehaviorsSharedData>());

            #if defined(GD_IDE_ONLY)
            aut.SetIncludeFile("PathfindingBehavior/PathfindingObstacleBehavior.h");

            aut.AddAction("Cost",
                           _("Cost"),
                           _("Change the cost of going through the object."),
                           _("Do _PARAM2__PARAM3_ to the cost of _PARAM0_"),
                           _("Obstacles"),
                           "CppPlatform/Extensions/pathfindingobstacleicon24.png",
                           "CppPlatform/Extensions/pathfindingobstacleicon16.png")

                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingObstacleBehavior")
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Difficulty"))
                .SetFunctionName("SetCost").SetGetter("GetCost").SetManipulatedType("number").SetIncludeFile("PathfindingBehavior/PathfindingObstacleBehavior.h");


            aut.AddCondition("Cost",
                           _("Cost"),
                           _("Compare the cost of going through the object"),
                           _("Cost of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Obstacles"),
                           "CppPlatform/Extensions/pathfindingobstacleicon24.png",
                           "CppPlatform/Extensions/pathfindingobstacleicon16.png")

                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingObstacleBehavior")
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Difficulty"))
                .SetFunctionName("GetCost").SetManipulatedType("number").SetIncludeFile("PathfindingBehavior/PathfindingObstacleBehavior.h");


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
                .SetFunctionName("SetImpassable").SetIncludeFile("PathfindingBehavior/PathfindingObstacleBehavior.h");


            aut.AddCondition("IsImpassable",
                           _("Is object impassable?"),
                           _("Return true if the obstacle is impassable"),
                           _("_PARAM0_ is impassable"),
                           _("Obstacles"),
                           "CppPlatform/Extensions/pathfindingobstacleicon24.png",
                           "CppPlatform/Extensions/pathfindingobstacleicon16.png")

                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingObstacleBehavior")
                .SetFunctionName("IsImpassable").SetIncludeFile("PathfindingBehavior/PathfindingObstacleBehavior.h");

            aut.AddExpression("Cost", _("Cost"), _("Obstacle cost"), _("Obstacles"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PathfindingObstacleBehavior")
                .SetFunctionName("GetCost").SetIncludeFile("PathfindingBehavior/PathfindingObstacleBehavior.h");

            #endif
        }

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}
