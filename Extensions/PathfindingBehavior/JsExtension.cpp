/**

GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

#include <iostream>

/**
 * \brief This class declares information about the JS extension.
 */
class JsExtension : public gd::PlatformExtension
{
public:

    /**
     * \brief Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    JsExtension()
    {
        SetExtensionInformation("PathfindingBehavior",
                              _("Pathfinding behavior"),
                              _("Compute paths for objects avoiding obstacles."),
                              "Florian Rival",
                              "Open source (MIT License)");
        CloneExtension("GDevelop C++ platform", "PathfindingBehavior");

        GetBehaviorMetadata("PathfindingBehavior::PathfindingBehavior")
            .SetIncludeFile("Extensions/PathfindingBehavior/pathfindingruntimebehavior.js")
            .AddIncludeFile("Extensions/PathfindingBehavior/pathfindingobstacleruntimebehavior.js");

        {

            std::map<gd::String, gd::InstructionMetadata > & autActions = GetAllActionsForBehavior("PathfindingBehavior::PathfindingBehavior");
            std::map<gd::String, gd::InstructionMetadata > & autConditions = GetAllConditionsForBehavior("PathfindingBehavior::PathfindingBehavior");
            std::map<gd::String, gd::ExpressionMetadata > & autExpressions = GetAllExpressionsForBehavior("PathfindingBehavior::PathfindingBehavior");

            autConditions["PathfindingBehavior::PathFound"].SetFunctionName("pathFound");
            autActions["PathfindingBehavior::SetDestination"].SetFunctionName("moveTo");
            autConditions["PathfindingBehavior::DestinationReached"].SetFunctionName("destinationReached");
            autActions["PathfindingBehavior::CellWidth"].SetFunctionName("setCellWidth").SetGetter("getCellWidth");
            autConditions["PathfindingBehavior::CellWidth"].SetFunctionName("getCellWidth");
            autActions["PathfindingBehavior::CellHeight"].SetFunctionName("setCellHeight").SetGetter("getCellHeight");
            autConditions["PathfindingBehavior::CellHeight"].SetFunctionName("getCellHeight");
            autActions["PathfindingBehavior::Acceleration"].SetFunctionName("setAcceleration").SetGetter("getAcceleration");
            autConditions["PathfindingBehavior::Acceleration"].SetFunctionName("getAcceleration");
            autActions["PathfindingBehavior::MaxSpeed"].SetFunctionName("setMaxSpeed").SetGetter("getMaxSpeed");
            autConditions["PathfindingBehavior::MaxSpeed"].SetFunctionName("getMaxSpeed");
            autActions["PathfindingBehavior::Speed"].SetFunctionName("setSpeed").SetGetter("getSpeed");
            autConditions["PathfindingBehavior::Speed"].SetFunctionName("getSpeed");
            autActions["PathfindingBehavior::AngularMaxSpeed"].SetFunctionName("setAngularMaxSpeed").SetGetter("getAngularMaxSpeed");
            autConditions["PathfindingBehavior::AngularMaxSpeed"].SetFunctionName("getAngularMaxSpeed");
            autActions["PathfindingBehavior::AngleOffset"].SetFunctionName("setAngleOffset").SetGetter("getAngleOffset");
            autConditions["PathfindingBehavior::AngleOffset"].SetFunctionName("getAngleOffset");
            autActions["PathfindingBehavior::ExtraBorder"].SetFunctionName("setExtraBorder").SetGetter("getExtraBorder");
            autConditions["PathfindingBehavior::ExtraBorder"].SetFunctionName("getExtraBorder");

            autActions["PathfindingBehavior::AllowDiagonals"].SetFunctionName("allowDiagonals");
            autConditions["PathfindingBehavior::DiagonalsAllowed"].SetFunctionName("diagonalsAllowed");
            autActions["PathfindingBehavior::RotateObject"].SetFunctionName("setRotateObject");
            autConditions["PathfindingBehavior::ObjectRotated"].SetFunctionName("isObjectRotated");

            autExpressions["GetNodeX"].SetFunctionName("getNodeX");
            autExpressions["GetNodeY"].SetFunctionName("getNodeY");
            autExpressions["NextNodeIndex"].SetFunctionName("getNextNodeIndex");
            autExpressions["NodeCount"].SetFunctionName("getNodeCount");
            autExpressions["NextNodeX"].SetFunctionName("getNextNodeX");
            autExpressions["NextNodeY"].SetFunctionName("getNextNodeY");
            autExpressions["LastNodeX"].SetFunctionName("getLastNodeX");
            autExpressions["LastNodeY"].SetFunctionName("getLastNodeY");
            autExpressions["DestinationX"].SetFunctionName("getDestinationX");
            autExpressions["DestinationY"].SetFunctionName("getDestinationY");

            autExpressions["Acceleration"].SetFunctionName("getAcceleration");
            autExpressions["MaxSpeed"].SetFunctionName("getMaxSpeed");
            autExpressions["Speed"].SetFunctionName("getSpeed");
            autExpressions["AngularMaxSpeed"].SetFunctionName("getAngularMaxSpeed");
            autExpressions["AngleOffset"].SetFunctionName("getAngleOffset");
            autExpressions["ExtraBorder"].SetFunctionName("getExtraBorder");
            autExpressions["CellWidth"].SetFunctionName("getCellWidth");
            autExpressions["CellHeight"].SetFunctionName("getCellHeight");
        }

        GetBehaviorMetadata("PathfindingBehavior::PathfindingObstacleBehavior")
            .SetIncludeFile("Extensions/PathfindingBehavior/pathfindingruntimebehavior.js")
            .AddIncludeFile("Extensions/PathfindingBehavior/pathfindingobstacleruntimebehavior.js");

        {
            std::map<gd::String, gd::InstructionMetadata > & autActions = GetAllActionsForBehavior("PathfindingBehavior::PathfindingObstacleBehavior");
            std::map<gd::String, gd::InstructionMetadata > & autConditions = GetAllConditionsForBehavior("PathfindingBehavior::PathfindingObstacleBehavior");
            std::map<gd::String, gd::ExpressionMetadata > & autExpressions = GetAllExpressionsForBehavior("PathfindingBehavior::PathfindingObstacleBehavior");

            autActions["PathfindingObstacleBehavior::Cost"].SetFunctionName("setCost").SetGetter("getCost");
            autConditions["PathfindingObstacleBehavior::Cost"].SetFunctionName("getCost");
            autActions["PathfindingObstacleBehavior::SetImpassable"].SetFunctionName("setImpassable");
            autConditions["PathfindingObstacleBehavior::IsImpassable"].SetFunctionName("isImpassable");

            autExpressions["Cost"].SetFunctionName("getCost");
        }

        StripUnimplementedInstructionsAndExpressions();
    };
};

/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension * GD_EXTENSION_API CreateGDJSExtension() {
    return new JsExtension;
}
#endif
