/**

Game Develop - Pathfinding Automatism Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#include "GDCpp/ExtensionBase.h"
#include "GDCpp/AutomatismsSharedData.h"
#include "GDCore/Tools/Version.h"
#include "PathfindingAutomatism.h"
#include "PathfindingObstacleAutomatism.h"
#include <boost/version.hpp>

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains : Objects, actions, conditions and expressions.
     */
    Extension()
    {
        SetExtensionInformation("PathfindingAutomatism",
                              _("Pathfinding automatism"),
                              _("Compute paths for objects avoiding obstacles."),
                              "Florian Rival",
                              "zlib/libpng License (Open Source)");

        {
            gd::AutomatismMetadata & aut = AddAutomatism("PathfindingAutomatism",
                  _("Pathfinding"),
                  "Pathfinding",
                  _("Automatism which move objects and avoid objects flagged as obstacles."),
                  "",
                  "CppPlatform/Extensions/AStaricon.png",
                  "PathfindingAutomatism",
                  boost::shared_ptr<gd::Automatism>(new PathfindingAutomatism),
                  boost::shared_ptr<gd::AutomatismsSharedData>(new gd::AutomatismsSharedData));

            #if defined(GD_IDE_ONLY)

            aut.SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddAction("SetDestination",
                           _("Move to a position"),
                           _("Move the object to a position"),
                           _("Move _PARAM0_ to _PARAM3_;_PARAM4_"),
                           "",
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .AddCodeOnlyParameter("currentScene", "")
                .AddParameter("expression", _("Destination X position"))
                .AddParameter("expression", _("Destination Y position"))
                .codeExtraInformation.SetFunctionName("MoveTo").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddCondition("PathFound",
                           _("Path found"),
                           _("Return true if a path has been found."),
                           _("A path has been found for _PARAM0_"),
                           "",
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .codeExtraInformation.SetFunctionName("PathFound").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddCondition("DestinationReached",
                           _("Destination reached"),
                           _("Return true if destination was reached."),
                           _("_PARAM0_ reached its destination"),
                           "",
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .codeExtraInformation.SetFunctionName("DestinationReached").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddAction("CellWidth",
                           _("Width of the cells"),
                           _("Change the width of the cells of the virtual grid."),
                           _("Do _PARAM2__PARAM3_ to the width of the virtual cells of _PARAM0_"),
                           _("Virtual grid"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Width (pixels)"))
                .codeExtraInformation.SetFunctionName("SetCellWidth").SetAssociatedGetter("GetCellWidth").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddCondition("CellWidth",
                           _("Width of the virtual grid"),
                           _("Compare the width of the cells of the virtual grid."),
                           _("Width of the virtual cells of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Virtual grid"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Width (pixels)"))
                .codeExtraInformation.SetFunctionName("GetCellWidth").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddAction("CellHeight",
                           _("Height of the cells"),
                           _("Change the height of the cells of the virtual grid."),
                           _("Do _PARAM2__PARAM3_ to the height of the virtual cells of _PARAM0_"),
                           _("Virtual grid"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Height (pixels)"))
                .codeExtraInformation.SetFunctionName("SetCellHeight").SetAssociatedGetter("GetCellHeight").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddCondition("CellHeight",
                           _("Height of the virtual grid"),
                           _("Compare the height of the cells of the virtual grid."),
                           _("Height of the virtual cells of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Virtual grid"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Height (pixels)"))
                .codeExtraInformation.SetFunctionName("GetCellHeight").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddAction("Acceleration",
                           _("Acceleration"),
                           _("Change the acceleration when moving the object"),
                           _("Do _PARAM2__PARAM3_ to the acceleration of _PARAM0_ on the path"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .codeExtraInformation.SetFunctionName("SetAcceleration").SetAssociatedGetter("GetAcceleration").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddCondition("Acceleration",
                           _("Acceleration"),
                           _("Compare the acceleration when moving the object"),
                           _("Acceleration of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value"))
                .codeExtraInformation.SetFunctionName("GetAcceleration").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddAction("MaxSpeed",
                           _("Maximum speed"),
                           _("Change the maximum speed when moving the object"),
                           _("Do _PARAM2__PARAM3_ to the max. speed of _PARAM0_ on the path"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .codeExtraInformation.SetFunctionName("SetMaxSpeed").SetAssociatedGetter("GetMaxSpeed").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddCondition("MaxSpeed",
                           _("Maximum speed"),
                           _("Compare the maximum speed when moving the object"),
                           _("Max. speed of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value"))
                .codeExtraInformation.SetFunctionName("GetMaxSpeed").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddAction("Speed",
                           _("Speed"),
                           _("Change the speed of the object on the path"),
                           _("Do _PARAM2__PARAM3_ to the speed of _PARAM0_ on the path"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .codeExtraInformation.SetFunctionName("SetSpeed").SetAssociatedGetter("GetSpeed").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddCondition("Speed",
                           _("Speed"),
                           _("Compare the speed of the object on the path"),
                           _("Speed of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value"))
                .codeExtraInformation.SetFunctionName("GetSpeed").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddAction("AngularMaxSpeed",
                           _("Angular maximum speed"),
                           _("Change the maximum angular speed when moving the object"),
                           _("Do _PARAM2__PARAM3_ to the max. angular speed of _PARAM0_ on the path"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .codeExtraInformation.SetFunctionName("SetAngularMaxSpeed").SetAssociatedGetter("GetAngularMaxSpeed").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddCondition("AngularMaxSpeed",
                           _("Angular maximum speed"),
                           _("Compare the maximum angular speed when moving the object"),
                           _("Max. angular speed of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value"))
                .codeExtraInformation.SetFunctionName("GetAngularMaxSpeed").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddAction("AngleOffset",
                           _("Rotation offset"),
                           _("Change the rotation offset applied when moving the object"),
                           _("Do _PARAM2__PARAM3_ to the rotation offset of _PARAM0_ on the path"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value"))
                .codeExtraInformation.SetFunctionName("SetAngleOffset").SetAssociatedGetter("GetAngleOffset").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddCondition("AngleOffset",
                           _("Rotation offset"),
                           _("Compare the rotation offset when moving the object"),
                           _("Rotation offset of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value"))
                .codeExtraInformation.SetFunctionName("GetAngleOffset").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddAction("ExtraBorder",
                           _("Extra border"),
                           _("Change the size of the extra border applied to the object when planning a path"),
                           _("Do _PARAM2__PARAM3_ to the extra border of _PARAM0_ on the path"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Value (in pixels)"))
                .codeExtraInformation.SetFunctionName("SetExtraBorder").SetAssociatedGetter("GetExtraBorder").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddCondition("ExtraBorder",
                           _("Extra border"),
                           _("Compare the size of the extra border applied to the object when planning a path"),
                           _("Size of the extra border applied to _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Value (in pixels)"))
                .codeExtraInformation.SetFunctionName("GetExtraBorder").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddAction("AllowDiagonals",
                           _("Diagonals moves"),
                           _("Allow or restrict diagonal moves on the path"),
                           _("Allow diagonal moves for _PARAM0_ on the path: _PARAM2_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("yesorno", _("Allow?"))
                .codeExtraInformation.SetFunctionName("SetAllowDiagonals").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddCondition("DiagonalsAllowed",
                           _("Diagonals moves"),
                           _("Return true if the object is allowed to do diagonal moves on the path"),
                           _("Diagnolas moved allowed for _PARAM0_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .codeExtraInformation.SetFunctionName("DiagonalsAllowed").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddAction("RotateObject",
                           _("Rotate the object"),
                           _("Enable or disable rotation of the object on the path"),
                           _("Enable rotation of _PARAM0_ on the path: _PARAM2_"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("yesorno", _("Rotate object?"))
                .codeExtraInformation.SetFunctionName("SetRotateObject").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddCondition("ObjectRotated",
                           _("Object rotated"),
                           _("Return true if the object is rotated when traveling on its path."),
                           _("_PARAM0_ is rotated when traveling on its path"),
                           _("Path"),
                           "CppPlatform/Extensions/AStaricon24.png",
                           "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .codeExtraInformation.SetFunctionName("IsObjectRotated").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("GetNodeX", _("Get a waypoint X position"), _("Get next waypoint X position"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("expression", _("Node index (start at 0!)"))
                .codeExtraInformation.SetFunctionName("GetNodeX").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("GetNodeY", _("Get a waypoint Y position"), _("Get next waypoint Y position"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .AddParameter("expression", _("Node index (start at 0!)"))
                .codeExtraInformation.SetFunctionName("GetNodeY").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("NextNodeIndex", _("Index of the next waypoint"), _("Get the index of the next waypoint to reach"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .codeExtraInformation.SetFunctionName("GetNextNodeIndex").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("NodeCount", _("Waypoint count"), _("Get the number of waypoints on the path"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .codeExtraInformation.SetFunctionName("GetNodeCount").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("NextNodeX", _("Get next waypoint X position"), _("Get next waypoint X position"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .codeExtraInformation.SetFunctionName("GetNextNodeX").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("NextNodeY", _("Get next waypoint Y position"), _("Get next waypoint Y position"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .codeExtraInformation.SetFunctionName("GetNextNodeY").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("LastNodeX", _("Last waypoint X position"), _("Last waypoint X position"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .codeExtraInformation.SetFunctionName("GetLastNodeX").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("LastNodeY", _("Last waypoint Y position"), _("Last waypoint Y position"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .codeExtraInformation.SetFunctionName("GetLastNodeY").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("DestinationX", _("Destination X position"), _("Destination X position"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .codeExtraInformation.SetFunctionName("GetDestinationX").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("DestinationY", _("Destination Y position"), _("Destination Y position"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .codeExtraInformation.SetFunctionName("GetDestinationY").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("Acceleration", _("Acceleration"), _("Acceleration of the object on the path"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .codeExtraInformation.SetFunctionName("GetAcceleration").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("MaxSpeed", _("Maximum speed"), _("Maximum speed of the object on the path"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .codeExtraInformation.SetFunctionName("GetMaxSpeed").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("Speed", _("Speed"), _("Speed of the object on the path"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .codeExtraInformation.SetFunctionName("GetSpeed").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("AngularMaxSpeed", _("Angular maximum speed"), _("Angular maximum speed of the object on the path"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .codeExtraInformation.SetFunctionName("GetAngularMaxSpeed").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("AngleOffset", _("Rotation offset"), _("Rotation offset applied the object on the path"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .codeExtraInformation.SetFunctionName("GetAngleOffset").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("ExtraBorder", _("Extra border size"), _("Extra border applied the object on the path"), _("Path"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .codeExtraInformation.SetFunctionName("GetExtraBorder").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("CellWidth", _("Width of a cell"), _("Width of the virtual grid"), _("Virtual grid"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .codeExtraInformation.SetFunctionName("GetCellWidth").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");

            aut.AddExpression("CellHeight", _("Height of a cell"), _("Height of the virtual grid"), _("Virtual grid"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingAutomatism", false)
                .codeExtraInformation.SetFunctionName("GetCellHeight").SetIncludeFile("PathfindingAutomatism/PathfindingAutomatism.h");
            #endif

        }
        {
            gd::AutomatismMetadata & aut = AddAutomatism("PathfindingObstacleAutomatism",
                  _("Obstacle for pathfinding"),
                  "PathfindingObstacle",
                  _("Flag the object as being an obstacle for pathfinding."),
                  "",
                  "CppPlatform/Extensions/pathfindingobstacleicon.png",
                  "PathfindingObstacleAutomatism",
                  boost::shared_ptr<gd::Automatism>(new PathfindingObstacleAutomatism),
                  boost::shared_ptr<gd::AutomatismsSharedData>(new gd::AutomatismsSharedData));

            #if defined(GD_IDE_ONLY)
            aut.SetIncludeFile("PathfindingAutomatism/PathfindingObstacleAutomatism.h");

            aut.AddAction("Cost",
                           _("Cost"),
                           _("Change the cost of going through the object."),
                           _("Do _PARAM2__PARAM3_ to the cost of _PARAM0_"),
                           _("Obstacles"),
                           "CppPlatform/Extensions/pathfindingobstacleicon24.png",
                           "CppPlatform/Extensions/pathfindingobstacleicon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingObstacleAutomatism", false)
                .AddParameter("operator", _("Modification's sign"))
                .AddParameter("expression", _("Difficulty"))
                .codeExtraInformation.SetFunctionName("SetCost").SetAssociatedGetter("GetCost").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingObstacleAutomatism.h");

            aut.AddCondition("Cost",
                           _("Cost"),
                           _("Compare the cost of going through the object"),
                           _("Cost of _PARAM0_ is _PARAM2__PARAM3_"),
                           _("Obstacles"),
                           "CppPlatform/Extensions/pathfindingobstacleicon24.png",
                           "CppPlatform/Extensions/pathfindingobstacleicon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingObstacleAutomatism", false)
                .AddParameter("relationalOperator", _("Sign of the test"))
                .AddParameter("expression", _("Difficulty"))
                .codeExtraInformation.SetFunctionName("GetCost").SetManipulatedType("number").SetIncludeFile("PathfindingAutomatism/PathfindingObstacleAutomatism.h");

            aut.AddAction("SetImpassable",
                           _("Set impassable"),
                           _("Set the object as being an impassable obstacle or not"),
                           _("Set _PARAM0_ as an impassable obstacle: _PARAM2_"),
                           _("Obstacles"),
                           "CppPlatform/Extensions/pathfindingobstacleicon24.png",
                           "CppPlatform/Extensions/pathfindingobstacleicon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingObstacleAutomatism", false)
                .AddParameter("yesorno", _("Impassable?"))
                .codeExtraInformation.SetFunctionName("SetImpassable").SetIncludeFile("PathfindingAutomatism/PathfindingObstacleAutomatism.h");

            aut.AddCondition("IsImpassable",
                           _("Is impassable"),
                           _("Return true if the obstacle is impassable"),
                           _("_PARAM0_ is impassable"),
                           _("Obstacles"),
                           "CppPlatform/Extensions/pathfindingobstacleicon24.png",
                           "CppPlatform/Extensions/pathfindingobstacleicon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingObstacleAutomatism", false)
                .codeExtraInformation.SetFunctionName("IsImpassable").SetIncludeFile("PathfindingAutomatism/PathfindingObstacleAutomatism.h");

            aut.AddExpression("Cost", _("Cost"), _("Obstacle cost"), _("Obstacles"), "CppPlatform/Extensions/AStaricon16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PathfindingObstacleAutomatism", false)
                .codeExtraInformation.SetFunctionName("GetCost").SetIncludeFile("PathfindingAutomatism/PathfindingObstacleAutomatism.h");
            #endif
        }

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
    virtual ~Extension() {};
};

/**
 * Used by Game Develop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}

/**
 * Used by Game Develop to destroy the extension class
 * -- Do not need to be modified. --
 */
extern "C" void GD_EXTENSION_API DestroyGDExtension(ExtensionBase * p) {
    delete p;
}

