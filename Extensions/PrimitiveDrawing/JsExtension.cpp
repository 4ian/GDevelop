/**

GDevelop - Primitive Drawing Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#include <iostream>

#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

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
            "Extensions/PrimitiveDrawing/pixi-graphics-extras/"
            "graphics-extras.min.js")
        .AddIncludeFile(
            "Extensions/PrimitiveDrawing/"
            "shapepainterruntimeobject-pixi-renderer.js");

    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::Rectangle"]
        .SetFunctionName("drawRectangle");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::Circle"]
        .SetFunctionName("drawCircle");
    GetAllActionsForObject("PrimitiveDrawing::Drawer")["PrimitiveDrawing::Line"]
        .SetFunctionName("drawLine");

    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::LineV2"]
        .SetFunctionName("drawLineV2");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::Ellipse"]
        .SetFunctionName("drawEllipse");

    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::FilletRectangle"]
        .SetFunctionName("drawFilletRectangle");
        
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::RoundedRectangle"]
        .SetFunctionName("drawRoundedRectangle");
    GetAllActionsForObject("PrimitiveDrawing::Drawer")["PrimitiveDrawing::ChamferRectangle"]
        .SetFunctionName("drawChamferRectangle");
    GetAllActionsForObject("PrimitiveDrawing::Drawer")["PrimitiveDrawing::RegularPolygon"]
        .SetFunctionName("drawRegularPolygon");
    GetAllActionsForObject("PrimitiveDrawing::Drawer")["PrimitiveDrawing::Torus"]
        .SetFunctionName("drawTorus");
    GetAllActionsForObject("PrimitiveDrawing::Drawer")["PrimitiveDrawing::Star"]
        .SetFunctionName("drawStar");
    GetAllActionsForObject("PrimitiveDrawing::Drawer")["PrimitiveDrawing::Arc"]
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


    // These actions are not exposed yet as the way they work is unsure. See
    // https://github.com/4ian/GDevelop/pull/1256
    /*GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::Arc"]
        .SetFunctionName("drawArc");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::ArcTo"]
        .SetFunctionName("drawArcTo");*/
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::Drawer::ClearShapes"]
        .SetFunctionName("clear");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::ClearBetweenFrames"]
        .SetFunctionName("setClearBetweenFrames");
    GetAllConditionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::ClearBetweenFrames"]
        .SetFunctionName("isClearedBetweenFrames");

    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::FillColor"]
        .SetFunctionName("setFillColor");
    GetAllExpressionsForObject("PrimitiveDrawing::Drawer")["FillColorRed"]
        .SetFunctionName("getFillColorR");
    GetAllExpressionsForObject("PrimitiveDrawing::Drawer")["FillColorGreen"]
        .SetFunctionName("getFillColorG");
    GetAllExpressionsForObject("PrimitiveDrawing::Drawer")["FillColorBlue"]
        .SetFunctionName("getFillColorB");

    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::OutlineColor"]
        .SetFunctionName("setOutlineColor");
    GetAllExpressionsForObject("PrimitiveDrawing::Drawer")["OutlineColorRed"]
        .SetFunctionName("getOutlineColorR");
    GetAllExpressionsForObject("PrimitiveDrawing::Drawer")["OutlineColorGreen"]
        .SetFunctionName("getOutlineColorG");
    GetAllExpressionsForObject("PrimitiveDrawing::Drawer")["OutlineColorBlue"]
        .SetFunctionName("getOutlineColorB");

    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::OutlineSize"]
        .SetFunctionName("setOutlineSize")
        .SetGetter("getOutlineSize");
    GetAllConditionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::OutlineSize"]
        .SetFunctionName("getOutlineSize");
    GetAllExpressionsForObject("PrimitiveDrawing::Drawer")["OutlineSize"]
        .SetFunctionName("getOutlineSize");

    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::FillOpacity"]
        .SetFunctionName("setFillOpacity")
        .SetGetter("getFillOpacity");
    GetAllConditionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::FillOpacity"]
        .SetFunctionName("getFillOpacity");
    GetAllExpressionsForObject("PrimitiveDrawing::Drawer")["FillOpacity"]
        .SetFunctionName("getFillOpacity");

    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::OutlineOpacity"]
        .SetFunctionName("setOutlineOpacity")
        .SetGetter("getOutlineOpacity");
    GetAllConditionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::OutlineOpacity"]
        .SetFunctionName("getOutlineOpacity");
    GetAllExpressionsForObject("PrimitiveDrawing::Drawer")["OutlineOpacity"]
        .SetFunctionName("getOutlineOpacity");

    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::UseRelativeCoordinates"]
        .SetFunctionName("setCoordinatesRelative");
    GetAllConditionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::AreCoordinatesRelative"]
        .SetFunctionName("areCoordinatesRelative");

    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::Scale"]
        .SetFunctionName("setScale")
        .SetGetter("getScale");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::Drawer::SetScaleX"]
        .SetFunctionName("setScaleX")
        .SetGetter("getScaleX");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::Drawer::SetScaleY"]
        .SetFunctionName("setScaleY")
        .SetGetter("getScaleY");
    GetAllConditionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::ScaleX"]
        .SetFunctionName("getScaleX");
    GetAllConditionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::ScaleY"]
        .SetFunctionName("getScaleY");
    GetAllExpressionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::ScaleX"]
        .SetFunctionName("getScaleX");
    GetAllExpressionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::ScaleY"]
        .SetFunctionName("getScaleY");

    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::FlipX"]
        .SetFunctionName("flipX");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::FlipY"]
        .SetFunctionName("flipY");
    GetAllConditionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::FlippedX"]
        .SetFunctionName("isFlippedX");
    GetAllConditionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::FlippedY"]
        .SetFunctionName("isFlippedY");

    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::Width"]
        .SetFunctionName("setWidth")
        .SetGetter("getWidth");
    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::Height"]
        .SetFunctionName("setHeight")
        .SetGetter("getHeight");

    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::SetRotationCenter"]
        .SetFunctionName("setRotationCenter");
    GetAllActionsForObject("PrimitiveDrawing::Drawer")
        ["PrimitiveDrawing::SetRectangularCollisionMask"]
            .SetFunctionName("setRectangularCollisionMask");

    GetAllExpressionsForObject("PrimitiveDrawing::Drawer")["ToDrawingX"]
        .SetFunctionName("transformToDrawingX");
    GetAllExpressionsForObject("PrimitiveDrawing::Drawer")["ToDrawingY"]
        .SetFunctionName("transformToDrawingY");
    GetAllExpressionsForObject("PrimitiveDrawing::Drawer")["ToSceneX"]
        .SetFunctionName("transformToSceneX");
    GetAllExpressionsForObject("PrimitiveDrawing::Drawer")["ToSceneY"]
        .SetFunctionName("transformToSceneX");

    GetAllActionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::SetAntialiasing"]
        .SetFunctionName("setAntialiasing");
    GetAllStrExpressionsForObject("PrimitiveDrawing::Drawer")["Antialiasing"]
        .SetFunctionName("getAntialiasing");
    GetAllConditionsForObject(
        "PrimitiveDrawing::Drawer")["PrimitiveDrawing::CheckAntialiasing"]
        .SetFunctionName("checkAntialiasing");
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
