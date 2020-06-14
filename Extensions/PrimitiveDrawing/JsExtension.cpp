/**

GDevelop - Primitive Drawing Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

#include <iostream>

void DeclarePrimitiveDrawingExtension(gd::PlatformExtension& extension);

/**
 * \brief This class declares information about the JS extension.
 */
class PrimitiveDrawingJsExtension : public gd::PlatformExtension {
 public:
  /**
   * Constructor of an extension declares everything the extension contains:
   * objects, actions, conditions and expressions.
   */
  PrimitiveDrawingJsExtension() {
    DeclarePrimitiveDrawingExtension(*this);
    GetObjectMetadata("PrimitiveDrawing::Drawer")
        .SetIncludeFile(
            "Extensions/PrimitiveDrawing/shapepainterruntimeobject.js")
        .AddIncludeFile(
            "Extensions/PrimitiveDrawing/"
            "shapepainterruntimeobject-pixi-renderer.js")
        .AddIncludeFile(
            "Extensions/PrimitiveDrawing/"
            "shapepainterruntimeobject-cocos-renderer.js");

    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::Rectangle"]
        .SetFunctionName("drawRectangle");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::Circle"]
        .SetFunctionName("drawCircle");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::Line"]
        .SetFunctionName("drawLine");

    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::LineV2"]
        .SetFunctionName("drawLineV2");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::Ellipse"]
        .SetFunctionName("drawEllipse");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::RoundedRectangle"]
        .SetFunctionName("drawRoundedRectangle");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::Star"]
        .SetFunctionName("drawStar");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::Arc"]
        .SetFunctionName("drawArc");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::BezierCurve"]
        .SetFunctionName("drawBezierCurve");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::QuadraticCurve"]
        .SetFunctionName("drawQuadraticCurve");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::BeginFillPath"]
        .SetFunctionName("beginFillPath");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::EndFillPath"]
        .SetFunctionName("endFillPath");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::PathMoveTo"]
        .SetFunctionName("drawPathMoveTo");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::PathLineTo"]
        .SetFunctionName("drawPathLineTo");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::PathBezierCurveTo"]
        .SetFunctionName("drawPathBezierCurveTo");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::PathArc"]
        .SetFunctionName("drawPathArc");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::PathQuadraticCurveTo"]
        .SetFunctionName("drawPathQuadraticCurveTo");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::ClosePath"]
        .SetFunctionName("closePath");

    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::Ellipse"]
        .SetFunctionName("drawEllipse");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::RoundedRectangle"]
        .SetFunctionName("drawRoundedRectangle");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::Star"]
        .SetFunctionName("drawStar");
    // These actions are not exposed yet as the way they work is unsure. See https://github.com/4ian/GDevelop/pull/1256
    /*GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::Arc"]
        .SetFunctionName("drawArc");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::ArcTo"]
        .SetFunctionName("drawArcTo");*/
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::ClearBetweenFrames"]
        .SetFunctionName("setClearBetweenFrames");
    GetAllConditionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::ClearBetweenFrames"]
        .SetFunctionName("isClearedBetweenFrames");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::FillColor"]
        .SetFunctionName("setFillColor");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::OutlineColor"]
        .SetFunctionName("setOutlineColor");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::OutlineSize"]
        .SetFunctionName("setOutlineSize")
        .SetGetter("getOutlineSize");
    GetAllConditionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::OutlineSize"]
        .SetFunctionName("getOutlineSize");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::FillOpacity"]
        .SetFunctionName("setFillOpacity")
        .SetGetter("getFillOpacity");
    GetAllConditionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::FillOpacity"]
        .SetFunctionName("getFillOpacity");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::OutlineOpacity"]
        .SetFunctionName("setOutlineOpacity")
        .SetGetter("getOutlineOpacity");
    GetAllConditionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::OutlineOpacity"]
        .SetFunctionName("getOutlineOpacity");

    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension* CreateGDJSPrimitiveDrawingExtension() {
  return new PrimitiveDrawingJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension* GD_EXTENSION_API CreateGDJSExtension() {
  return new PrimitiveDrawingJsExtension;
}
#endif
#endif
