/**

GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

void DeclarePathfindingBehaviorExtension(gd::PlatformExtension& extension);

/**
 * \brief This class declares information about the JS extension.
 */
class PathfindingBehaviorJsExtension : public gd::PlatformExtension {
 public:
  /**
   * \brief Constructor of an extension declares everything the extension
   * contains: objects, actions, conditions and expressions.
   */
  PathfindingBehaviorJsExtension() {
    DeclarePathfindingBehaviorExtension(*this);

    GetBehaviorMetadata("PathfindingBehavior::PathfindingBehavior")
        .SetIncludeFile(
            "Extensions/PathfindingBehavior/pathfindingruntimebehavior.js")
        .AddIncludeFile(
            "Extensions/PathfindingBehavior/"
            "pathfindingobstacleruntimebehavior.js")
        .AddIncludeFile(
            "Extensions/PathfindingBehavior/"
            "PathTools.js");

    {
      std::map<gd::String, gd::InstructionMetadata>& autActions =
          GetAllActionsForBehavior("PathfindingBehavior::PathfindingBehavior");
      std::map<gd::String, gd::InstructionMetadata>& autConditions =
          GetAllConditionsForBehavior(
              "PathfindingBehavior::PathfindingBehavior");
      std::map<gd::String, gd::ExpressionMetadata>& autExpressions =
          GetAllExpressionsForBehavior(
              "PathfindingBehavior::PathfindingBehavior");

      autConditions["PathfindingBehavior::PathFound"].SetFunctionName(
          "pathFound");
      autActions["PathfindingBehavior::SetDestination"].SetFunctionName(
          "moveTo");
      autConditions["PathfindingBehavior::DestinationReached"].SetFunctionName(
          "destinationReached");
      autActions["PathfindingBehavior::CellWidth"]
          .SetFunctionName("setCellWidth")
          .SetGetter("getCellWidth");
      autConditions["PathfindingBehavior::CellWidth"].SetFunctionName(
          "getCellWidth");
      autActions["PathfindingBehavior::CellHeight"]
          .SetFunctionName("setCellHeight")
          .SetGetter("getCellHeight");
      autConditions["PathfindingBehavior::CellHeight"].SetFunctionName(
          "getCellHeight");
      autActions["PathfindingBehavior::PathfindingBehavior::SetGridOffsetX"]
          .SetFunctionName("setGridOffsetX")
          .SetGetter("getGridOffsetX");
      autConditions["PathfindingBehavior::PathfindingBehavior::GridOffsetX"].SetFunctionName(
          "getGridOffsetX");
      autActions["PathfindingBehavior::PathfindingBehavior::SetGridOffsetY"]
          .SetFunctionName("setGridOffsetY")
          .SetGetter("getGridOffsetY");
      autConditions["PathfindingBehavior::PathfindingBehavior::GridOffsetY"].SetFunctionName(
          "getGridOffsetY");
      autActions["PathfindingBehavior::Acceleration"]
          .SetFunctionName("setAcceleration")
          .SetGetter("getAcceleration");
      autConditions["PathfindingBehavior::Acceleration"].SetFunctionName(
          "getAcceleration");
      autActions["PathfindingBehavior::MaxSpeed"]
          .SetFunctionName("setMaxSpeed")
          .SetGetter("getMaxSpeed");
      autConditions["PathfindingBehavior::MaxSpeed"].SetFunctionName(
          "getMaxSpeed");
      autActions["PathfindingBehavior::Speed"]
          .SetFunctionName("setSpeed")
          .SetGetter("getSpeed");
      autConditions["PathfindingBehavior::Speed"].SetFunctionName("getSpeed");
      autConditions["PathfindingBehavior::PathfindingBehavior::MovementAngleIsAround"]
          .SetFunctionName("movementAngleIsAround");
      autActions["PathfindingBehavior::AngularMaxSpeed"]
          .SetFunctionName("setAngularMaxSpeed")
          .SetGetter("getAngularMaxSpeed");
      autConditions["PathfindingBehavior::AngularMaxSpeed"].SetFunctionName(
          "getAngularMaxSpeed");
      autActions["PathfindingBehavior::AngleOffset"]
          .SetFunctionName("setAngleOffset")
          .SetGetter("getAngleOffset");
      autConditions["PathfindingBehavior::AngleOffset"].SetFunctionName(
          "getAngleOffset");
      autActions["PathfindingBehavior::ExtraBorder"]
          .SetFunctionName("setExtraBorder")
          .SetGetter("getExtraBorder");
      autConditions["PathfindingBehavior::ExtraBorder"].SetFunctionName(
          "getExtraBorder");

      autActions["PathfindingBehavior::AllowDiagonals"].SetFunctionName(
          "allowDiagonals");
      autConditions["PathfindingBehavior::DiagonalsAllowed"].SetFunctionName(
          "diagonalsAllowed");
      autActions["PathfindingBehavior::RotateObject"].SetFunctionName(
          "setRotateObject");
      autConditions["PathfindingBehavior::ObjectRotated"].SetFunctionName(
          "isObjectRotated");

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
      autExpressions["MovementAngle"].SetFunctionName("getMovementAngle");
      autExpressions["AngularMaxSpeed"].SetFunctionName("getAngularMaxSpeed");
      autExpressions["AngleOffset"].SetFunctionName("getAngleOffset");
      autExpressions["ExtraBorder"].SetFunctionName("getExtraBorder");
      autExpressions["CellWidth"].SetFunctionName("getCellWidth");
      autExpressions["CellHeight"].SetFunctionName("getCellHeight");
      autExpressions["GridOffsetX"].SetFunctionName("getGridOffsetX");
      autExpressions["GridOffsetY"].SetFunctionName("getGridOffsetY");
    }

    GetBehaviorMetadata("PathfindingBehavior::PathfindingObstacleBehavior")
        .SetIncludeFile(
            "Extensions/PathfindingBehavior/pathfindingruntimebehavior.js")
        .AddIncludeFile(
            "Extensions/PathfindingBehavior/"
            "pathfindingobstacleruntimebehavior.js");

    {
      std::map<gd::String, gd::InstructionMetadata>& autActions =
          GetAllActionsForBehavior(
              "PathfindingBehavior::PathfindingObstacleBehavior");
      std::map<gd::String, gd::InstructionMetadata>& autConditions =
          GetAllConditionsForBehavior(
              "PathfindingBehavior::PathfindingObstacleBehavior");
      std::map<gd::String, gd::ExpressionMetadata>& autExpressions =
          GetAllExpressionsForBehavior(
              "PathfindingBehavior::PathfindingObstacleBehavior");

      autActions["PathfindingBehavior::Cost"]
          .SetFunctionName("setCost")
          .SetGetter("getCost");
      autConditions["PathfindingBehavior::Cost"].SetFunctionName("getCost");
      autActions["PathfindingBehavior::SetImpassable"].SetFunctionName(
          "setImpassable");
      autConditions["PathfindingBehavior::IsImpassable"].SetFunctionName(
          "isImpassable");

      autExpressions["Cost"].SetFunctionName("getCost");
    }

    StripUnimplementedInstructionsAndExpressions();
    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension* CreateGDJSPathfindingBehaviorExtension() {
  return new PathfindingBehaviorJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension* GD_EXTENSION_API CreateGDJSExtension() {
  return new PathfindingBehaviorJsExtension;
}
#endif
#endif
