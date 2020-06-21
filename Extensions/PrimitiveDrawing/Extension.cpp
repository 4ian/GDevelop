/**

GDevelop - Primitive Drawing Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/Extensions/ExtensionBase.h"

#include "ShapePainterObject.h"

void DeclarePrimitiveDrawingExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "PrimitiveDrawing",
          _("Primitive drawing"),
          _("This Extension allows you to draw shapes and manipulate images."),
          "Florian Rival and Aurélien Vivet",
          "Open source (MIT License)")
      .SetExtensionHelpPath("/objects/shape_painter");

  gd::ObjectMetadata& obj = extension.AddObject<ShapePainterObject>(
      "Drawer",  //"Drawer" is kept for compatibility with GD<=3.6.76
      _("Shape painter"),
      _("Allows you to draw simple shapes on the screen"),
      "CppPlatform/Extensions/primitivedrawingicon.png");

#if defined(GD_IDE_ONLY)
  obj.SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddAction("Rectangle",
                _("Rectangle"),
                _("Draw a rectangle on screen"),
                _("Draw from _PARAM1_;_PARAM2_ to _PARAM3_;_PARAM4_ a rectangle "
                  "with _PARAM0_"),
                _("Drawing"),
                "res/actions/rectangle24.png",
                "res/actions/rectangle.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("expression", _("Top left side: X position"))
      .AddParameter("expression", _("Top left side: Y position"))
      .AddParameter("expression", _("Bottom right side: X position"))
      .AddParameter("expression", _("Bottom right side: Y position"))
      .SetFunctionName("DrawRectangle")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddAction("Circle",
                _("Circle"),
                _("Draw a circle on screen"),
                _("Draw at _PARAM1_;_PARAM2_ a circle of radius _PARAM3_ "
                  "with _PARAM0_"),
                _("Drawing"),
                "res/actions/circle24.png",
                "res/actions/circle.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("expression", _("X position of center"))
      .AddParameter("expression", _("Y position of center"))
      .AddParameter("expression", _("Radius (in pixels)"))
      .SetFunctionName("DrawCircle")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddAction("Line",
                _("Line"),
                _("Draw a line on screen"),
                _("Draw from _PARAM1_;_PARAM2_ to _PARAM3_;_PARAM4_ a line (thickness: _PARAM5_) "
                  "with _PARAM0_"),
                _("Drawing"),
                "res/actions/line24.png",
                "res/actions/line.png")

      .SetHidden()
      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("expression", _("X position of start point"))
      .AddParameter("expression", _("Y position of start point"))
      .AddParameter("expression", _("X position of end point"))
      .AddParameter("expression", _("Y position of end point"))
      .AddParameter("expression", _("Thickness (in pixels)"))
      .SetFunctionName("DrawLine")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

   obj.AddAction("LineV2",
                _("Line"),
                _("Draw a line on screen"),
                _("Draw from _PARAM1_;_PARAM2_ to _PARAM3_;_PARAM4_ a line (thickness: _PARAM5_) "
                  "with _PARAM0_"),
                _("Drawing"),
                "res/actions/line24.png",
                "res/actions/line.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("expression", _("X position of start point"))
      .AddParameter("expression", _("Y position of start point"))
      .AddParameter("expression", _("X position of end point"))
      .AddParameter("expression", _("Y position of end point"))
      .AddParameter("expression", _("Thickness (in pixels)"))
      .SetFunctionName("drawLineV2")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddAction("Ellipse",
                _("Ellipse"),
                _("Draw an ellipse on screen"),
                _("Draw at _PARAM1_;_PARAM2_ an ellipse of width _PARAM3_ and height _PARAM4_ "
                "with _PARAM0_"),
                _("Drawing"),
                "res/actions/ellipse24.png",
                "res/actions/ellipse.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("expression", _("X position of center"))
      .AddParameter("expression", _("Y position of center"))
      .AddParameter("expression", _("The width of the ellipse"))
      .AddParameter("expression", _("The height of the ellipse"))
      .SetFunctionName("DrawEllipse")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddAction("RoundedRectangle",
                _("Rounded rectangle"),
                _("Draw a rounded rectangle on screen"),
                _("Draw from _PARAM1_;_PARAM2_ to _PARAM3_;_PARAM4_ a rounded rectangle (radius: _PARAM5_) "
                "with _PARAM0_"),
                _("Drawing"),
                "res/actions/roundedRectangle24.png",
                "res/actions/roundedRectangle.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("expression", _("Top left side: X position"))
      .AddParameter("expression", _("Top left side: Y position"))
      .AddParameter("expression", _("Bottom right side: X position"))
      .AddParameter("expression", _("Bottom right side: Y position"))
      .AddParameter("expression", _("Radius (in pixels)"))
      .SetFunctionName("DrawRoundedRectangle")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddAction("Star",
                _("Star"),
                _("Draw a star on screen"),
                _("Draw at _PARAM1_;_PARAM2_ a star with _PARAM3_ points and radius: _PARAM4_ (inner radius: _PARAM5_, rotation: _PARAM6_) "
                "with _PARAM0_"),
                _("Drawing"),
                "res/actions/star24.png",
                "res/actions/star.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("expression", _("X position of center"))
      .AddParameter("expression", _("Y position of center"))
      .AddParameter("expression", _("Number of points of the star (minimum: 2)"))
      .AddParameter("expression", _("Radius (in pixels)"))
      .AddParameter("expression", _("Inner radius (in pixels, half radius by default)"))
      .AddParameter("expression", _("Rotation (in degrees)"))
      .SetFunctionName("DrawStar")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");


  obj.AddAction("Arc",
                _("Arc"),
                _("Draw an arc on screen. If \"Close path\" is set to yes, a line will be drawn between the start and end point of the arc, closing the shape."),
                _("Draw at _PARAM1_;_PARAM2_ an arc with radius: _PARAM3_, start angle: _PARAM4_, end angle: _PARAM5_ (anticlockwise: _PARAM6_, close path: _PARAM7_) "
                "with _PARAM0_"),
                _("Drawing"),
                "res/actions/arc24.png",
                "res/actions/arc.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("expression", _("X position of center"))
      .AddParameter("expression", _("Y position of center"))
      .AddParameter("expression", _("Radius (in pixels)"))
      .AddParameter("expression", _("Start angle of the arc (in degrees)"))
      .AddParameter("expression", _("End angle of the arc (in degrees)"))
      .AddParameter("yesorno", _("Anticlockwise"))
      .AddParameter("yesorno", _("Close path"))
      .SetFunctionName("DrawArc")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddAction("BezierCurve",
                _("Bezier curve"),
                _("Draw a bezier curve on screen"),
                _("Draw from _PARAM1_;_PARAM2_ to _PARAM7_;_PARAM8_ a bezier curve (first control point: _PARAM3_;_PARAM4_, second control point: _PARAM5_;_PARAM6_) "
                  "with _PARAM0_"),
                _("Drawing"),
                "res/actions/bezierCurve24.png",
                "res/actions/bezierCurve.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("expression", _("X position of start point"))
      .AddParameter("expression", _("Y position of start point"))
      .AddParameter("expression", _("First control point x"))
      .AddParameter("expression", _("First control point y"))
      .AddParameter("expression", _("Second Control point x"))
      .AddParameter("expression", _("Second Control point y"))
      .AddParameter("expression", _("Destination point x"))
      .AddParameter("expression", _("Destination point y"))
      .SetFunctionName("drawBezierCurve")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddAction("QuadraticCurve",
                _("Quadratic curve"),
                _("Draw a quadratic curve on screen"),
                _("Draw from _PARAM1_;_PARAM2_ to _PARAM5_;_PARAM6_ a quadratic curve (control point: _PARAM3_;_PARAM4_) "
                "with _PARAM0_"),
                _("Drawing"),
                "res/actions/quadraticCurve24.png",
                "res/actions/quadraticCurve.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("expression", _("X position of start point"))
      .AddParameter("expression", _("Y position of start point"))
      .AddParameter("expression", _("Control point x"))
      .AddParameter("expression", _("Control point y"))
      .AddParameter("expression", _("Destination point x"))
      .AddParameter("expression", _("Destination point y"))
      .SetFunctionName("drawQuadraticCurve")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddAction("BeginFillPath",
                _("Begin fill path"),
                _("Begin to draw a simple one-color fill. Subsequent actions, such as \"Path line\" (in the Advanced category) can be used to draw. Be sure to use \"End fill path\" action when you're done drawing the shape."),
                _("Begins drawing filling of an advanced path "
                  "with _PARAM0_ (start: _PARAM1_;_PARAM2_)"),
                _("Advanced"),
                "res/actions/beginFillPath24.png",
                "res/actions/beginFillPath.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("expression", _("Start drawing x"))
      .AddParameter("expression", _("Start drawing y"))
      .SetFunctionName("beginFillPath")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddAction("EndFillPath",
                _("End fill path"),
                _("Finish the filling drawing in an advanced path"),
                _("Finish the filling drawing in an advanced path "
                  "with _PARAM0_"),
                _("Advanced"),
                "res/actions/endFillPath24.png",
                "res/actions/endFillPath.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .SetFunctionName("endFillPath")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddAction("MovePathTo",
                _("Move path drawing position"),
                _("Move the drawing position for the current path"),
                _("Move the drawing position of the path to _PARAM1_;_PARAM2_ "
                  "with _PARAM0_"),
                _("Advanced"),
                "res/actions/position24.png",
                "res/actions/position.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("expression", _("X position of start point"))
      .AddParameter("expression", _("Y position of start point"))
      .SetFunctionName("drawPathMoveTo")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddAction("PathLineTo",
                _("Path line"),
                _("Add to a path a line to a position. The origin comes from the previous action or from \"Begin fill path\" or \"Move path drawing position\". By default, the start position will be the object's position."),
                _("Add to a path a line to the position _PARAM1_;_PARAM2_ "
                  "with _PARAM0_"),
                _("Advanced"),
                "res/actions/line24.png",
                "res/actions/line.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("expression", _("X position of start point"))
      .AddParameter("expression", _("Y position of start point"))
      .SetFunctionName("drawPathLineTo")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddAction("PathBezierCurveTo",
                _("Path bezier curve"),
                _("Add to a path a bezier curve to a position. The origin comes from the previous action or from \"Begin fill path\" or \"Move path drawing position\". By default, the start position will be the object's position."),
                _("Add to a path a bezier curve to the position _PARAM5_;_PARAM6_ (first control point: _PARAM1_;_PARAM2_, second control point: _PARAM3_;_PARAM4_) "
                  "with _PARAM0_"),
                _("Advanced"),
                "res/actions/bezierCurve24.png",
                "res/actions/bezierCurve.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("expression", _("First control point x"))
      .AddParameter("expression", _("First control point y"))
      .AddParameter("expression", _("Second Control point x"))
      .AddParameter("expression", _("Second Control point y"))
      .AddParameter("expression", _("Destination point x"))
      .AddParameter("expression", _("Destination point y"))
      .SetFunctionName("drawPathBezierCurveTo")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddAction("PathArc",
                _("Path arc"),
                _("Add to a path an arc to a position. The origin comes from the previous action or from \"Begin fill path\" or \"Move path drawing position\". By default, the start position will be the object's position."),
                _("Add to a path an arc at the position _PARAM1_;_PARAM2_ (radius: _PARAM3_, start angle: _PARAM4_, end angle: _PARAM5_, anticlockwise: _PARAM6_) "
                "with _PARAM0_"),
                _("Advanced"),
                "res/actions/arc24.png",
                "res/actions/arc.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("expression", _("Center x of circle"))
      .AddParameter("expression", _("Center y of circle"))
      .AddParameter("expression", _("Radius (in pixels)"))
      .AddParameter("expression", _("Start angle"))
      .AddParameter("expression", _("End angle"))
      .AddParameter("yesorno", _("Anticlockwise"))
      .SetFunctionName("drawPathArc")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddAction("PathQuadraticCurveTo",
                _("Path quadratic curve"),
                _("Add to a path a quadratic curve to a position. The origin comes from the previous action or from \"Begin fill path\" or \"Move path drawing position\". By default, the start position will be the object's position."),
                _("Add to a path a quadratic curve to the position _PARAM3_;_PARAM4_ (control point: _PARAM1_;_PARAM2_) "
                "with _PARAM0_"),
                _("Advanced"),
                "res/actions/quadraticCurve24.png",
                "res/actions/quadraticCurve.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("expression", _("Control point x"))
      .AddParameter("expression", _("Control point y"))
      .AddParameter("expression", _("Destination point x"))
      .AddParameter("expression", _("Destination point y"))
      .SetFunctionName("drawPathQuadraticCurveTo")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddAction("closePath",
                _("Close Path"),
                _("Close the path of the advanced shape. This closes the outline between the last and the first point."),
                _("Close the path "
                  "with _PARAM0_"),
                _("Advanced"),
                "res/actions/closePath24.png",
                "res/actions/closePath.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .SetFunctionName("closePath")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddAction("ClearBetweenFrames",
                _("Clear between frames"),
                _("Activate (or deactivate) the clearing of the rendered shape at the beginning of each frame."),
                _("Clear the rendered image of _PARAM0_ between each frame: PARAM1"),
                _("Setup"),
                "res/actions/visibilite24.png",
                "res/actions/visibilite.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("yesorno", _("Clear between each frame"), "", true)
      .SetDefaultValue("yes")
      .SetFunctionName("SetClearBetweenFrames")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddCondition(
         "ClearBetweenFrames",
         _("Clear between frames"),
         _("Check if the rendered image is cleared between frames."),
         _("_PARAM0_ is clearing its rendered image between each frame"),
         _("Setup"),
         "res/conditions/visibilite24.png",
         "res/conditions/visibilite.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .SetFunctionName("IsClearedBetweenFrames")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddAction("FillColor",
                _("Fill color"),
                _("Change the color used when filling"),
                _("Change fill color of _PARAM0_ to _PARAM1_"),
                _("Setup"),
                "res/actions/color24.png",
                "res/actions/color.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("color", _("Fill color"))
      .SetFunctionName("SetFillColor")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddAction("OutlineColor",
                _("Outline color"),
                _("Modify the color of the outline of future drawings."),
                _("Change outline color of _PARAM0_ to _PARAM1_"),
                _("Setup"),
                "res/actions/color24.png",
                "res/actions/color.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("color", _("Color"))
      .SetFunctionName("SetOutlineColor")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddAction("OutlineSize",
                _("Outline size"),
                _("Modify the size of the outline of future drawings."),
                _("the size of the outline"),
                _("Setup"),
                "res/actions/outlineSize24.png",
                "res/actions/outlineSize.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .UseStandardOperatorParameters("number")
      .SetFunctionName("SetOutlineSize")
      .SetGetter("GetOutlineSize")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddCondition("OutlineSize",
                   _("Outline size"),
                   _("Test the size of the outline."),
                   _("the size of the outline"),
                   _("Setup"),
                   "res/conditions/outlineSize24.png",
                   "res/conditions/outlineSize.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .UseStandardRelationalOperatorParameters("number")
      .SetFunctionName("GetOutlineSize")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddAction(
         "FillOpacity",
         _("Fill opacity"),
         _("Modify the opacity level used when filling future drawings."),
         _("the opacity of filling"),
         _("Setup"),
         "res/actions/opacity24.png",
         "res/actions/opacity.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .UseStandardOperatorParameters("number")
      .SetFunctionName("SetFillOpacity")
      .SetGetter("GetFillOpacity")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddCondition(
         "FillOpacity",
         _("Fill opacity"),
         _("Test the value of the opacity level used when filling."),
         _("the opacity of filling"),
         _("Setup"),
         "res/conditions/opacity24.png",
         "res/conditions/opacity.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .UseStandardRelationalOperatorParameters("number")
      .SetFunctionName("GetFillOpacity")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddAction(
         "OutlineOpacity",
         _("Outline opacity"),
         _("Modify the opacity of the outline of future drawings."),
         _("the opacity of the outline"),
         _("Setup"),
         "res/actions/opacity24.png",
         "res/actions/opacity.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .UseStandardOperatorParameters("number")
      .SetFunctionName("SetOutlineOpacity")
      .SetGetter("GetOutlineOpacity")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

  obj.AddCondition(
         "OutlineOpacity",
         _("Outline opacity"),
         _("Test the opacity of the outline."),
         _("the opacity of the outline"),
         _("Setup"),
         "res/conditions/opacity24.png",
         "res/conditions/opacity.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .UseStandardRelationalOperatorParameters("number")
      .SetFunctionName("GetOutlineOpacity")
      .SetIncludeFile("PrimitiveDrawing/ShapePainterObject.h");

#endif
}

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase {
 public:
  /**
   * Constructor of an extension declares everything the extension contains:
   * objects, actions, conditions and expressions.
   */
  Extension() {
    DeclarePrimitiveDrawingExtension(*this);
    AddRuntimeObject<ShapePainterObject, RuntimeShapePainterObject>(
        GetObjectMetadata("PrimitiveDrawing::Drawer"),
        "RuntimeShapePainterObject");

#if defined(GD_IDE_ONLY)
    AddAction("CopyImageOnAnother",
              _("Copy an image on another"),
              _("Copy an image on another.\nNote that the source image must be "
                "preferably kept loaded in memory."),
              _("Copy the image _PARAM1_ on _PARAM0_ at _PARAM2_;_PARAM3_"),
              _("Images"),
              "res/copy24.png",
              "res/copyicon.png")

        .AddParameter("string", _("Name of the image to modify"))
        .AddParameter("string", _("Name of the source image"))
        .AddParameter("expression", _("X position"))
        .AddParameter("expression", _("Y position"))
        .AddParameter(
            "yesorno",
            _("Should the copy take in account the source transparency\?"))
        .AddCodeOnlyParameter("currentScene", "")

        .SetFunctionName("GDpriv::PrimitiveDrawingTools::CopyImageOnAnother")
        .SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");

    AddAction("CaptureScreen",
              _("Capture the screen"),
              _("Capture the screen and save it into the specified folder "
                "and/or\nin the specified image."),
              _("Capture the screen ( Save it in file _PARAM1_ and/or in image "
                "_PARAM2_ )"),
              _("Images"),
              "res/imageicon24.png",
              "res/imageicon.png")

        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("File where save capture"), "", true)
        .SetDefaultValue("")
        .AddParameter("string",
                      _("Name of the image where capture must be saved"),
                      "",
                      true)
        .SetDefaultValue("")

        .SetFunctionName("GDpriv::PrimitiveDrawingTools::CaptureScreen")
        .SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");

    AddAction("CreateSFMLTexture",
              _("Create an image in memory"),
              _("Create an image in memory."),
              _("Create image _PARAM1_ in memory ( Width: _PARAM2_, Height: "
                "_PARAM3_, Color: _PARAM4_ )"),
              _("Images"),
              "res/imageicon24.png",
              "res/imageicon.png")

        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("Name of the image"))
        .AddParameter("expression", _("Width"), "", true)
        .AddParameter("expression", _("Height"), "", true)
        .AddParameter("color", _("Initial color"), "", true)
        .SetDefaultValue("0;0;0")

        .SetFunctionName("GDpriv::PrimitiveDrawingTools::CreateSFMLTexture")
        .SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");

    AddAction("OpenSFMLTextureFromFile",
              _("Open an image from a file"),
              _("Load in memory an image from a file."),
              _("Load in memory file _PARAM1_ inside image _PARAM2_"),
              _("Images"),
              "res/imageicon24.png",
              "res/imageicon.png")

        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("file", _("File"))
        .AddParameter("string", _("Name of the image"))

        .SetFunctionName(
            "GDpriv::PrimitiveDrawingTools::OpenSFMLTextureFromFile")
        .SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");

    AddAction("SaveSFMLTextureToFile",
              _("Save an image to a file"),
              _("Save an image to a file"),
              _("Save image _PARAM2_ to file _PARAM1_"),
              _("Images"),
              "res/imageicon24.png",
              "res/imageicon.png")

        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("file", _("File"))
        .AddParameter("string", _("Name of the image"))

        .SetFunctionName("GDpriv::PrimitiveDrawingTools::SaveSFMLTextureToFile")
        .SetIncludeFile("PrimitiveDrawing/PrimitiveDrawingTools.h");

#endif
    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if !defined(EMSCRIPTEN)
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase* GD_EXTENSION_API CreateGDExtension() {
  return new Extension;
}
#endif
