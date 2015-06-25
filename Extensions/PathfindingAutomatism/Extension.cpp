/**

GDevelop - Pathfinding Automatism Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/ExtensionBase.h"
#include "GDCpp/AutomatismsSharedData.h"
#include "GDCore/Tools/Version.h"
#include "PathfindingAutomatism.h"
#include "PathfindingObstacleAutomatism.h"


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
        SetExtensionInformation("PathfindingAutomatism",
                              GD_T("Pathfinding automatism"),
                              GD_T("Compute paths for objects avoiding obstacles."),
                              "Florian Rival",
                              "Open source (MIT License)");

        {
            gd::AutomatismMetadata & aut = AddAutomatism("PathfindingAutomatism",
                  GD_T("Pathfinding"),
                  "Pathfinding",
                  GD_T("Automatism which move objects and avoid objects flagged as obstacles."),
                  "",
                  "CppPlatform/Extensions/AStaricon.png",
                  "PathfindingAutomatism",
                  std::shared_ptr<gd::Automatism>(new PathfindingAutomatism),
                  std::shared_ptr<gd::AutomatismsSharedData>(new gd::AutomatismsSharedData));

            #if defined(GD_IDE_ONLY)

            aut.SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddAction("SetDestination",
                           _("Move to a position"),
                           _("Move the object to a position"),
                           GD_T("Move _PARAM0_ to _PARAM3_;_PARAM4_"),
                           _(""),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .AddCodeOnlyParameter("currentScene", "")

                .AddParameter("expression", GD_T("Destination X position"))
                .AddParameter("expression", GD_T("Destination Y position"))
                .SetFunctionName("MoveTo").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");


            aut.AddCondition("PathFound",
                           _("Path found"),
                           _("Return true if a path has been found."),
                           GD_T("A path has been found for _PARAM0_"),
                           _(""),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .SetFunctionName("PathFound").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");


            aut.AddCondition("DestinationReached",
                           _("Destination reached"),
                           _("Return true if destination was reached."),
                           GD_T("_PARAM0_ reached its destination"),
                           _(""),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .SetFunctionName("DestinationReached").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");


            aut.AddAction("CellWidth",
                           _("Width of the cells"),
                           _("Change the width of the cells of the virtual grid."),
                           GD_T("Do _PARAM2__PARAM3_ to the width of the virtual cells of _PARAM0_"),
                           _("Virtual grid"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("operator", GD_T("Modification's sign"))
                .AddParameter("expression", GD_T("Width (pixels)"))
                .SetFunctionName("SetCellWidth").SetGetter("GetCellWidth").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");


            aut.AddCondition("CellWidth",
                           _("Width of the virtual grid"),
                           _("Compare the width of the cells of the virtual grid."),
                           GD_T("Width of the virtual cells of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Virtual grid"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Width (pixels)"))
                .SetFunctionName("GetCellWidth").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");


            aut.AddAction("CellHeight",
                           _("Height of the cells"),
                           _("Change the height of the cells of the virtual grid."),
                           GD_T("Do _PARAM2__PARAM3_ to the height of the virtual cells of _PARAM0_"),
                           _("Virtual grid"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("operator", GD_T("Modification's sign"))
                .AddParameter("expression", GD_T("Height (pixels)"))
                .SetFunctionName("SetCellHeight").SetGetter("GetCellHeight").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");


            aut.AddCondition("CellHeight",
                           _("Height of the virtual grid"),
                           _("Compare the height of the cells of the virtual grid."),
                           GD_T("Height of the virtual cells of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Virtual grid"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Height (pixels)"))
                .SetFunctionName("GetCellHeight").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");


            aut.AddAction("Acceleration",
                           _("Acceleration"),
                           _("Change the acceleration when moving the object"),
                           GD_T("Do _PARAM2__PARAM3_ to the acceleration of _PARAM0_ on the path"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("operator", GD_T("Modification's sign"))
                .AddParameter("expression", GD_T("Value"))
                .SetFunctionName("SetAcceleration").SetGetter("GetAcceleration").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");


            aut.AddCondition("Acceleration",
                           _("Acceleration"),
                           _("Compare the acceleration when moving the object"),
                           GD_T("Acceleration of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Value"))
                .SetFunctionName("GetAcceleration").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");


            aut.AddAction("MaxSpeed",
                           _("Maximum speed"),
                           _("Change the maximum speed when moving the object"),
                           GD_T("Do _PARAM2__PARAM3_ to the max. speed of _PARAM0_ on the path"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("operator", GD_T("Modification's sign"))
                .AddParameter("expression", GD_T("Value"))
                .SetFunctionName("SetMaxSpeed").SetGetter("GetMaxSpeed").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");


            aut.AddCondition("MaxSpeed",
                           _("Maximum speed"),
                           _("Compare the maximum speed when moving the object"),
                           GD_T("Max. speed of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Value"))
                .SetFunctionName("GetMaxSpeed").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");


            aut.AddAction("Speed",
                           _("Speed"),
                           _("Change the speed of the object on the path"),
                           GD_T("Do _PARAM2__PARAM3_ to the speed of _PARAM0_ on the path"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("operator", GD_T("Modification's sign"))
                .AddParameter("expression", GD_T("Value"))
                .SetFunctionName("SetSpeed").SetGetter("GetSpeed").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");


            aut.AddCondition("Speed",
                           _("Speed"),
                           _("Compare the speed of the object on the path"),
                           GD_T("Speed of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Value"))
                .SetFunctionName("GetSpeed").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");


            aut.AddAction("AngularMaxSpeed",
                           _("Angular maximum speed"),
                           _("Change the maximum angular speed when moving the object"),
                           GD_T("Do _PARAM2__PARAM3_ to the max. angular speed of _PARAM0_ on the path"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("operator", GD_T("Modification's sign"))
                .AddParameter("expression", GD_T("Value"))
                .SetFunctionName("SetAngularMaxSpeed").SetGetter("GetAngularMaxSpeed").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");


            aut.AddCondition("AngularMaxSpeed",
                           _("Angular maximum speed"),
                           _("Compare the maximum angular speed when moving the object"),
                           GD_T("Max. angular speed of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Value"))
                .SetFunctionName("GetAngularMaxSpeed").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");


            aut.AddAction("AngleOffset",
                           _("Rotation offset"),
                           _("Change the rotation offset applied when moving the object"),
                           GD_T("Do _PARAM2__PARAM3_ to the rotation offset of _PARAM0_ on the path"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("operator", GD_T("Modification's sign"))
                .AddParameter("expression", GD_T("Value"))
                .SetFunctionName("SetAngleOffset").SetGetter("GetAngleOffset").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");


            aut.AddCondition("AngleOffset",
                           _("Rotation offset"),
                           _("Compare the rotation offset when moving the object"),
                           GD_T("Rotation offset of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Value"))
                .SetFunctionName("GetAngleOffset").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");


            aut.AddAction("ExtraBorder",
                           _("Extra border"),
                           _("Change the size of the extra border applied to the object when planning a path"),
                           GD_T("Do _PARAM2__PARAM3_ to the extra border of _PARAM0_ on the path"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("operator", GD_T("Modification's sign"))
                .AddParameter("expression", GD_T("Value (in pixels)"))
                .SetFunctionName("SetExtraBorder").SetGetter("GetExtraBorder").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");


            aut.AddCondition("ExtraBorder",
                           _("Extra border"),
                           _("Compare the size of the extra border applied to the object when planning a path"),
                           GD_T("Size of the extra border applied to _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Value (in pixels)"))
                .SetFunctionName("GetExtraBorder").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");


            aut.AddAction("AllowDiagonals",
                           _("Diagonals moves"),
                           _("Allow or restrict diagonal moves on the path"),
                           GD_T("Allow diagonal moves for _PARAM0_ on the path: _PARAM2_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("yesorno", GD_T("Allow?"))
                .SetFunctionName("SetAllowDiagonals").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");


            aut.AddCondition("DiagonalsAllowed",
                           _("Diagonals moves"),
                           _("Return true if the object is allowed to do diagonal moves on the path"),
                           GD_T("Diagonal moves allowed for _PARAM0_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .SetFunctionName("DiagonalsAllowed").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");


            aut.AddAction("RotateObject",
                           _("Rotate the object"),
                           _("Enable or disable rotation of the object on the path"),
                           GD_T("Enable rotation of _PARAM0_ on the path: _PARAM2_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("yesorno", GD_T("Rotate object?"))
                .SetFunctionName("SetRotateObject").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");


            aut.AddCondition("ObjectRotated",
                           _("Object rotated"),
                           _("Return true if the object is rotated when traveling on its path."),
                           GD_T("_PARAM0_ is rotated when traveling on its path"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .SetFunctionName("IsObjectRotated").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("GetNodeX", GD_T("Get a waypoint X position"), GD_T("Get next waypoint X position"), GD_T("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("expression", GD_T("Node index (start at 0!)"))
                .SetFunctionName("GetNodeX").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("GetNodeY", GD_T("Get a waypoint Y position"), GD_T("Get next waypoint Y position"), GD_T("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("expression", GD_T("Node index (start at 0!)"))
                .SetFunctionName("GetNodeY").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("NextNodeIndex", GD_T("Index of the next waypoint"), GD_T("Get the index of the next waypoint to reach"), GD_T("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .SetFunctionName("GetNextNodeIndex").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("NodeCount", GD_T("Waypoint count"), GD_T("Get the number of waypoints on the path"), GD_T("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .SetFunctionName("GetNodeCount").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("NextNodeX", GD_T("Get next waypoint X position"), GD_T("Get next waypoint X position"), GD_T("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .SetFunctionName("GetNextNodeX").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("NextNodeY", GD_T("Get next waypoint Y position"), GD_T("Get next waypoint Y position"), GD_T("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .SetFunctionName("GetNextNodeY").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("LastNodeX", GD_T("Last waypoint X position"), GD_T("Last waypoint X position"), GD_T("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .SetFunctionName("GetLastNodeX").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("LastNodeY", GD_T("Last waypoint Y position"), GD_T("Last waypoint Y position"), GD_T("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .SetFunctionName("GetLastNodeY").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("DestinationX", GD_T("Destination X position"), GD_T("Destination X position"), GD_T("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .SetFunctionName("GetDestinationX").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("DestinationY", GD_T("Destination Y position"), GD_T("Destination Y position"), GD_T("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .SetFunctionName("GetDestinationY").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("Acceleration", GD_T("Acceleration"), GD_T("Acceleration of the object on the path"), GD_T("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .SetFunctionName("GetAcceleration").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("MaxSpeed", GD_T("Maximum speed"), GD_T("Maximum speed of the object on the path"), GD_T("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .SetFunctionName("GetMaxSpeed").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("Speed", GD_T("Speed"), GD_T("Speed of the object on the path"), GD_T("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .SetFunctionName("GetSpeed").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("AngularMaxSpeed", GD_T("Angular maximum speed"), GD_T("Angular maximum speed of the object on the path"), GD_T("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .SetFunctionName("GetAngularMaxSpeed").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("AngleOffset", GD_T("Rotation offset"), GD_T("Rotation offset applied the object on the path"), GD_T("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .SetFunctionName("GetAngleOffset").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("ExtraBorder", GD_T("Extra border size"), GD_T("Extra border applied the object on the path"), GD_T("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .SetFunctionName("GetExtraBorder").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("CellWidth", GD_T("Width of a cell"), GD_T("Width of the virtual grid"), GD_T("Virtual grid"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .SetFunctionName("GetCellWidth").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("CellHeight", GD_T("Height of a cell"), GD_T("Height of the virtual grid"), GD_T("Virtual grid"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingAutomatism", false)
                .SetFunctionName("GetCellHeight").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            #endif

        }
        {
            gd::AutomatismMetadata & aut = AddAutomatism("PathfindingObstacleAutomatism",
                  GD_T("Obstacle for pathfinding"),
                  "PathfindingObstacle",
                  GD_T("Flag the object as being an obstacle for pathfinding."),
                  "",
                  "CppPlatform/Extensions/pathfindingobstacleicon.png",
                  "PathfindingObstacleAutomatism",
                  std::shared_ptr<gd::Automatism>(new PathfindingObstacleAutomatism),
                  std::shared_ptr<gd::AutomatismsSharedData>(new gd::AutomatismsSharedData));

            #if defined(GD_IDE_ONLY)
            aut.SetIncludeFile("PathfindingAutomatism/PathfindingObstacleAutomatism.h");

            aut.AddAction("Cost",
                           _("Cost"),
                           _("Change the cost of going through the object."),
                           GD_T("Do _PARAM2__PARAM3_ to the cost of _PARAM0_"),
                           _("Obstacles"),
                           "CppPlatform/Extensions/pathfindingobstacleicon24.png",
                           "CppPlatform/Extensions/pathfindingobstacleicon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingObstacleAutomatism", false)
                .AddParameter("operator", GD_T("Modification's sign"))
                .AddParameter("expression", GD_T("Difficulty"))
                .SetFunctionName("SetCost").SetGetter("GetCost").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingObstacleAutomatism.h");


            aut.AddCondition("Cost",
                           _("Cost"),
                           _("Compare the cost of going through the object"),
                           GD_T("Cost of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Obstacles"),
                           "CppPlatform/Extensions/pathfindingobstacleicon24.png",
                           "CppPlatform/Extensions/pathfindingobstacleicon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingObstacleAutomatism", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Difficulty"))
                .SetFunctionName("GetCost").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingObstacleAutomatism.h");


            aut.AddAction("SetImpassable",
                           _("Set impassable"),
                           _("Set the object as being an impassable obstacle or not"),
                           GD_T("Set _PARAM0_ as an impassable obstacle: _PARAM2_"),
                           _("Obstacles"),
                           "CppPlatform/Extensions/pathfindingobstacleicon24.png",
                           "CppPlatform/Extensions/pathfindingobstacleicon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingObstacleAutomatism", false)
                .AddParameter("yesorno", GD_T("Impassable?"))
                .SetFunctionName("SetImpassable").SetIncludeFile("PathfindingAutomatism/PathfindingObstacleAutomatism.h");


            aut.AddCondition("IsImpassable",
                           _("Is impassable"),
                           _("Return true if the obstacle is impassable"),
                           GD_T("_PARAM0_ is impassable"),
                           _("Obstacles"),
                           "CppPlatform/Extensions/pathfindingobstacleicon24.png",
                           "CppPlatform/Extensions/pathfindingobstacleicon16.png")

                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingObstacleAutomatism", false)
                .SetFunctionName("IsImpassable").SetIncludeFile("PathfindingAutomatism/PathfindingObstacleAutomatism.h");

            aut.AddExpression("Cost", GD_T("Cost"), GD_T("Obstacle cost"), GD_T("Obstacles"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", GD_T("Object"))
                .AddParameter("automatism", GD_T("Automatism"), "PathfindingObstacleAutomatism", false)
                .SetFunctionName("GetCost").SetIncludeFile("PathfindingAutomatism/PathfindingObstacleAutomatism.h");

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
