/**

GDevelop - Pathfinding Automatism Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Version.h"

#include <iostream>
#include <wx/intl.h>

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
        SetExtensionInformation("PathfindingAutomatism",
                              GD_T("Pathfinding automatism"),
                              GD_T("Compute paths for objects avoiding obstacles."),
                              "Florian Rival",
                              "Open source (MIT License)");
        CloneExtension("GDevelop C++ platform", "PathfindingAutomatism");

        GetAutomatismMetadata("PathfindingAutomatism::PathfindingAutomatism")
            .SetIncludeFile("PathfindingAutomatism/pathfindingruntimeautomatism.js")
            .AddIncludeFile("PathfindingAutomatism/pathfindingobstacleruntimeautomatism.js");

        {

            std::map<std::string, gd::InstructionMetadata > & autActions = GetAllActionsForAutomatism("PathfindingAutomatism::PathfindingAutomatism");
            std::map<std::string, gd::InstructionMetadata > & autConditions = GetAllConditionsForAutomatism("PathfindingAutomatism::PathfindingAutomatism");
            std::map<std::string, gd::ExpressionMetadata > & autExpressions = GetAllExpressionsForAutomatism("PathfindingAutomatism::PathfindingAutomatism");

            autConditions["PathfindingAutomatism::PathFound"].SetFunctionName("pathFound");
            autActions["PathfindingAutomatism::SetDestination"].SetFunctionName("moveTo");
            autConditions["PathfindingAutomatism::DestinationReached"].SetFunctionName("destinationReached");
            autActions["PathfindingAutomatism::CellWidth"].SetFunctionName("setCellWidth").SetGetter("getCellWidth");
            autConditions["PathfindingAutomatism::CellWidth"].SetFunctionName("getCellWidth");
            autActions["PathfindingAutomatism::CellHeight"].SetFunctionName("setCellHeight").SetGetter("getCellHeight");
            autConditions["PathfindingAutomatism::CellHeight"].SetFunctionName("getCellHeight");
            autActions["PathfindingAutomatism::Acceleration"].SetFunctionName("setAcceleration").SetGetter("getAcceleration");
            autConditions["PathfindingAutomatism::Acceleration"].SetFunctionName("getAcceleration");
            autActions["PathfindingAutomatism::MaxSpeed"].SetFunctionName("setMaxSpeed").SetGetter("getMaxSpeed");
            autConditions["PathfindingAutomatism::MaxSpeed"].SetFunctionName("getMaxSpeed");
            autActions["PathfindingAutomatism::Speed"].SetFunctionName("setSpeed").SetGetter("getSpeed");
            autConditions["PathfindingAutomatism::Speed"].SetFunctionName("getSpeed");
            autActions["PathfindingAutomatism::AngularMaxSpeed"].SetFunctionName("setAngularMaxSpeed").SetGetter("getAngularMaxSpeed");
            autConditions["PathfindingAutomatism::AngularMaxSpeed"].SetFunctionName("getAngularMaxSpeed");
            autActions["PathfindingAutomatism::AngleOffset"].SetFunctionName("setAngleOffset").SetGetter("getAngleOffset");
            autConditions["PathfindingAutomatism::AngleOffset"].SetFunctionName("getAngleOffset");
            autActions["PathfindingAutomatism::ExtraBorder"].SetFunctionName("setExtraBorder").SetGetter("getExtraBorder");
            autConditions["PathfindingAutomatism::ExtraBorder"].SetFunctionName("getExtraBorder");

            autActions["PathfindingAutomatism::AllowDiagonals"].SetFunctionName("allowDiagonals");
            autConditions["PathfindingAutomatism::DiagonalsAllowed"].SetFunctionName("diagonalsAllowed");
            autActions["PathfindingAutomatism::RotateObject"].SetFunctionName("setRotateObject");
            autConditions["PathfindingAutomatism::ObjectRotated"].SetFunctionName("isObjectRotated");

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

        GetAutomatismMetadata("PathfindingAutomatism::PathfindingObstacleAutomatism")
            .SetIncludeFile("PathfindingAutomatism/pathfindingruntimeautomatism.js")
            .AddIncludeFile("PathfindingAutomatism/pathfindingobstacleruntimeautomatism.js");

        {
            std::map<std::string, gd::InstructionMetadata > & autActions = GetAllActionsForAutomatism("PathfindingAutomatism::PathfindingObstacleAutomatism");
            std::map<std::string, gd::InstructionMetadata > & autConditions = GetAllConditionsForAutomatism("PathfindingAutomatism::PathfindingObstacleAutomatism");
            std::map<std::string, gd::ExpressionMetadata > & autExpressions = GetAllExpressionsForAutomatism("PathfindingAutomatism::PathfindingObstacleAutomatism");

            autActions["PathfindingObstacleAutomatism::Cost"].SetFunctionName("setCost").SetGetter("getCost");
            autConditions["PathfindingObstacleAutomatism::Cost"].SetFunctionName("getCost");
            autActions["PathfindingObstacleAutomatism::SetImpassable"].SetFunctionName("setImpassable");
            autConditions["PathfindingObstacleAutomatism::IsImpassable"].SetFunctionName("isImpassable");

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
