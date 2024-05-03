/**

GDevelop - Primitive Drawing Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCore/Extensions/Metadata/MultipleInstructionMetadata.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"
#include "ShapePainterObject.h"

void DeclarePrimitiveDrawingExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "PrimitiveDrawing",
          _("Shape painter"),
          _("This provides an object that can be used to draw arbitrary shapes "
            "on the screen using events."),
          "Florian Rival and Aurélien Vivet",
          "Open source (MIT License)")
      .SetExtensionHelpPath("/objects/shape_painter");
  extension.AddInstructionOrExpressionGroupMetadata(_("Shape painter"))
      .SetIcon("CppPlatform/Extensions/primitivedrawingicon.png");

  gd::ObjectMetadata& obj =
      extension
          .AddObject<ShapePainterObject>(
              "Drawer",  //"Drawer" is kept for compatibility with GD<=3.6.76
              _("Shape painter"),
              _("Allows you to draw simple shapes on the screen using the "
                "events."),
              "CppPlatform/Extensions/primitivedrawingicon.png")
          .SetCategoryFullName(_("Advanced"))
          .AddDefaultBehavior("EffectCapability::EffectBehavior")
          .AddDefaultBehavior("ResizableCapability::ResizableBehavior")
          .AddDefaultBehavior("ScalableCapability::ScalableBehavior")
          .AddDefaultBehavior("FlippableCapability::FlippableBehavior");

#if defined(GD_IDE_ONLY)
  obj.AddAction(
         "Rectangle",
         _("Rectangle"),
         _("Draw a rectangle on screen"),
         _("Draw from _PARAM1_;_PARAM2_ to _PARAM3_;_PARAM4_ a rectangle "
           "with _PARAM0_"),
         _("Drawing"),
         "res/actions/rectangle24.png",
         "res/actions/rectangle.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("expression", _("Left X position"))
      .AddParameter("expression", _("Top Y position"))
      .AddParameter("expression", _("Right X position"))
      .AddParameter("expression", _("Bottom Y position"))
      .SetFunctionName("DrawRectangle");

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
      .SetFunctionName("DrawCircle");

  obj.AddAction("Line",
                _("Line"),
                "Draw a line on screen",
                "Draw from _PARAM1_;_PARAM2_ to _PARAM3_;_PARAM4_ a line "
                "(thickness: _PARAM5_) "
                "with _PARAM0_",
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
      .SetFunctionName("DrawLine");

  obj.AddAction("LineV2",
                _("Line"),
                _("Draw a line on screen"),
                _("Draw from _PARAM1_;_PARAM2_ to _PARAM3_;_PARAM4_ a line "
                  "(thickness: _PARAM5_) "
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
      .SetFunctionName("drawLineV2");

  obj.AddAction("Ellipse",
                _("Ellipse"),
                _("Draw an ellipse on screen"),
                _("Draw at _PARAM1_;_PARAM2_ an ellipse of width _PARAM3_ and "
                  "height _PARAM4_ "
                  "with _PARAM0_"),
                _("Drawing"),
                "res/actions/ellipse24.png",
                "res/actions/ellipse.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("expression", _("X position of center"))
      .AddParameter("expression", _("Y position of center"))
      .AddParameter("expression", _("The width of the ellipse"))
      .AddParameter("expression", _("The height of the ellipse"))
      .SetFunctionName("DrawEllipse");

  obj.AddAction("FilletRectangle",
              _("Fillet Rectangle"),
              _("Draw a fillet rectangle on screen"),
              _("Draw from _PARAM1_;_PARAM2_ to _PARAM3_;_PARAM4_ a fillet "
                "rectangle (fillet: _PARAM5_)" 
                "with _PARAM0_"),
                _("Drawing"),
                "res/actions/filletRectangle24.png",
                "res/actions/filletRectangle.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("expression", _("Left X position"))
      .AddParameter("expression", _("Top Y position"))
      .AddParameter("expression", _("Right X position"))
      .AddParameter("expression", _("Bottom Y position"))
      .AddParameter("expression", _("Fillet (in pixels)"))
      .SetFunctionName("DrawFilletRectangle");

    
  obj.AddAction("RoundedRectangle",
                _("Rounded rectangle"),
                _("Draw a rounded rectangle on screen"),
                _("Draw from _PARAM1_;_PARAM2_ to _PARAM3_;_PARAM4_ a rounded "
                  "rectangle (radius: _PARAM5_) "
                  "with _PARAM0_"),
                _("Drawing"),
                "res/actions/roundedRectangle24.png",
                "res/actions/roundedRectangle.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("expression", _("Left X position"))
      .AddParameter("expression", _("Top Y position"))
      .AddParameter("expression", _("Right X position"))
      .AddParameter("expression", _("Bottom Y position"))
      .AddParameter("expression", _("Radius (in pixels)"))
      .SetFunctionName("DrawRoundedRectangle");

  obj.AddAction("ChamferRectangle",
                _("Chamfer Rectangle"),
                _("Draw a chamfer rectangle on screen"),
                _("Draw from _PARAM1_;_PARAM2_ to _PARAM3_;_PARAM4_ a chamfer "
                  "rectangle (chamfer: _PARAM5_) "
                  "with _PARAM0_"),
                _("Drawing"),
                "res/actions/chamferRectangle24.png",
                "res/actions/chamferRectangle.png")
        .AddParameter("object", _("Shape Painter object"), "Drawer")
        .AddParameter("expression", _("Left X position"))
        .AddParameter("expression", _("Top Y position"))
        .AddParameter("expression", _("Right X position"))
        .AddParameter("expression", _("Bottom Y position"))
        .AddParameter("expression", _("Chamfer (in pixels)"))
        .SetFunctionName("DrawChamferRectangle");


  obj.AddAction("Torus",
               _("Torus"),
               _("Draw a torus on screen"),
               _("Draw at _PARAM1_;_PARAM2_ a torus with "
               "inner radius: _PARAM3_, outer radius: _PARAM4_ and "
               "with start arc angle: _PARAM5_°, end angle: _PARAM6_° "
               "with _PARAM0_"),
               _("Drawing"),
               "res/actions/torus24.png",
               "res/actions/torus.png")
        
        .AddParameter("object", _("Shape Painter object"), "Drawer")
        .AddParameter("expression", _("X position of center"))
        .AddParameter("expression", _("Y position of center"))
        .AddParameter("expression", _("Inner Radius (in pixels)"))
        .AddParameter("expression", _("Outer Radius (in pixels)"))
        .AddParameter("expression", _("Start Arc (in degrees)"))
        .AddParameter("expression", _("End Arc (in degrees)"))
        .SetFunctionName("DrawTorus");
  
  
  obj.AddAction("RegularPolygon",
                _("Regular Polygon"),
                _("Draw a regular polygon on screen"),
                _("Draw at _PARAM1_;_PARAM2_ a regular polygon with _PARAM3_ sides and radius: "
                  "_PARAM4_ (rotation: _PARAM5_) "
                  "with _PARAM0_"),
                  _("Drawing"),
                  "res/actions/regularPolygon24.png",
                  "res/actions/regularPolygon.png")

        .AddParameter("object", _("Shape Painter object"), "Drawer")
        .AddParameter("expression", _("X position of center"))
        .AddParameter("expression", _("Y position of center"))
        .AddParameter("expression",
              _("Number of sides of the polygon (minimum: 3)"))
        .AddParameter("expression", _("Radius (in pixels)"))
        .AddParameter("expression", _("Rotation (in degrees)"))
        .SetFunctionName("DrawRegularPolygon");

  obj.AddAction(
         "Star",
         _("Star"),
         _("Draw a star on screen"),
         _("Draw at _PARAM1_;_PARAM2_ a star with _PARAM3_ points and radius: "
           "_PARAM4_ (inner radius: _PARAM5_, rotation: _PARAM6_) "
           "with _PARAM0_"),
         _("Drawing"),
         "res/actions/star24.png",
         "res/actions/star.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("expression", _("X position of center"))
      .AddParameter("expression", _("Y position of center"))
      .AddParameter("expression",
                    _("Number of points of the star (minimum: 2)"))
      .AddParameter("expression", _("Radius (in pixels)"))
      .AddParameter("expression",
                    _("Inner radius (in pixels, half radius by default)"))
      .AddParameter("expression", _("Rotation (in degrees)"))
      .SetFunctionName("DrawStar");

  obj.AddAction("Arc",
                _("Arc"),
                _("Draw an arc on screen. If \"Close path\" is set to yes, a "
                  "line will be drawn between the start and end point of the "
                  "arc, closing the shape."),
                _("Draw at _PARAM1_;_PARAM2_ an arc with radius: _PARAM3_, "
                  "start angle: _PARAM4_, end angle: _PARAM5_ (anticlockwise: "
                  "_PARAM6_, close path: _PARAM7_) "
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
      .SetFunctionName("DrawArc");

  obj.AddAction("BezierCurve",
                _("Bezier curve"),
                _("Draw a bezier curve on screen"),
                _("Draw from _PARAM1_;_PARAM2_ to _PARAM7_;_PARAM8_ a bezier "
                  "curve (first control point: _PARAM3_;_PARAM4_, second "
                  "control point: _PARAM5_;_PARAM6_) "
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
      .SetFunctionName("drawBezierCurve");

  obj.AddAction("QuadraticCurve",
                _("Quadratic curve"),
                _("Draw a quadratic curve on screen"),
                _("Draw from _PARAM1_;_PARAM2_ to _PARAM5_;_PARAM6_ a "
                  "quadratic curve (control point: _PARAM3_;_PARAM4_) "
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
      .SetFunctionName("drawQuadraticCurve");

  obj.AddAction("BeginFillPath",
                _("Begin fill path"),
                _("Begin to draw a simple one-color fill. Subsequent actions, "
                  "such as \"Path line\" (in the Advanced category) can be "
                  "used to draw. Be sure to use \"End fill path\" action when "
                  "you're done drawing the shape."),
                _("Begins drawing filling of an advanced path "
                  "with _PARAM0_ (start: _PARAM1_;_PARAM2_)"),
                _("Advanced"),
                "res/actions/beginFillPath24.png",
                "res/actions/beginFillPath.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("expression", _("Start drawing x"))
      .AddParameter("expression", _("Start drawing y"))
      .SetFunctionName("beginFillPath");

  obj.AddAction("EndFillPath",
                _("End fill path"),
                _("Finish the filling drawing in an advanced path"),
                _("Finish the filling drawing in an advanced path "
                  "with _PARAM0_"),
                _("Advanced"),
                "res/actions/endFillPath24.png",
                "res/actions/endFillPath.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .SetFunctionName("endFillPath");

  obj.AddAction("MovePathTo",
                _("Move path drawing position"),
                _("Move the drawing position for the current path"),
                _("Move the drawing position of the path to _PARAM1_;_PARAM2_ "
                  "with _PARAM0_"),
                _("Advanced"),
                "res/actions/position24_black.png",
                "res/actions/position_black.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("expression", _("X position of start point"))
      .AddParameter("expression", _("Y position of start point"))
      .SetFunctionName("drawPathMoveTo");

  obj.AddAction("PathLineTo",
                _("Path line"),
                _("Add to a path a line to a position. The origin comes from "
                  "the previous action or from \"Begin fill path\" or \"Move "
                  "path drawing position\". By default, the start position "
                  "will be the object's position."),
                _("Add to a path a line to the position _PARAM1_;_PARAM2_ "
                  "with _PARAM0_"),
                _("Advanced"),
                "res/actions/line24.png",
                "res/actions/line.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("expression", _("X position of start point"))
      .AddParameter("expression", _("Y position of start point"))
      .SetFunctionName("drawPathLineTo");

  obj.AddAction("PathBezierCurveTo",
                _("Path bezier curve"),
                _("Add to a path a bezier curve to a position. The origin "
                  "comes from the previous action or from \"Begin fill path\" "
                  "or \"Move path drawing position\". By default, the start "
                  "position will be the object's position."),
                _("Add to a path a bezier curve to the position "
                  "_PARAM5_;_PARAM6_ (first control point: _PARAM1_;_PARAM2_, "
                  "second control point: _PARAM3_;_PARAM4_) "
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
      .SetFunctionName("drawPathBezierCurveTo");

  obj.AddAction("PathArc",
                _("Path arc"),
                _("Add to a path an arc to a position. The origin comes from "
                  "the previous action or from \"Begin fill path\" or \"Move "
                  "path drawing position\". By default, the start position "
                  "will be the object's position."),
                _("Add to a path an arc at the position _PARAM1_;_PARAM2_ "
                  "(radius: _PARAM3_, start angle: _PARAM4_, end angle: "
                  "_PARAM5_, anticlockwise: _PARAM6_) "
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
      .SetFunctionName("drawPathArc");

  obj.AddAction("PathQuadraticCurveTo",
                _("Path quadratic curve"),
                _("Add to a path a quadratic curve to a position. The origin "
                  "comes from the previous action or from \"Begin fill path\" "
                  "or \"Move path drawing position\". By default, the start "
                  "position will be the object's position."),
                _("Add to a path a quadratic curve to the position "
                  "_PARAM3_;_PARAM4_ (control point: _PARAM1_;_PARAM2_) "
                  "with _PARAM0_"),
                _("Advanced"),
                "res/actions/quadraticCurve24.png",
                "res/actions/quadraticCurve.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("expression", _("Control point x"))
      .AddParameter("expression", _("Control point y"))
      .AddParameter("expression", _("Destination point x"))
      .AddParameter("expression", _("Destination point y"))
      .SetFunctionName("drawPathQuadraticCurveTo");

  obj.AddAction("closePath",
                _("Close Path"),
                _("Close the path of the advanced shape. This closes the "
                  "outline between the last and the first point."),
                _("Close the path "
                  "with _PARAM0_"),
                _("Advanced"),
                "res/actions/closePath24.png",
                "res/actions/closePath.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .SetFunctionName("closePath");

  obj.AddScopedAction("ClearShapes",
                      _("Clear shapes"),
                      _("Clear the rendered shape(s). Useful if not set to be "
                        "done automatically."),
                      _("Clear the rendered image of _PARAM0_"),
                      _("Advanced"),
                      "res/actions/visibilite24.png",
                      "res/actions/visibilite.png")
      .AddParameter("object", _("Shape Painter object"), "Drawer");

  obj.AddAction(
         "ClearBetweenFrames",
         _("Clear between frames"),
         _("Activate (or deactivate) the clearing of the rendered shape at the "
           "beginning of each frame."),
         _("Clear the rendered image of _PARAM0_ between each frame: _PARAM1_"),
         _("Setup"),
         "res/actions/visibilite24.png",
         "res/actions/visibilite.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("yesorno", _("Clear between each frame"), "", true)
      .SetDefaultValue("yes")
      .SetFunctionName("SetClearBetweenFrames");

  obj.AddCondition(
         "ClearBetweenFrames",
         _("Clear between frames"),
         _("Check if the rendered image is cleared between frames."),
         _("_PARAM0_ is clearing its rendered image between each frame"),
         _("Setup"),
         "res/conditions/visibilite24.png",
         "res/conditions/visibilite.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .SetFunctionName("IsClearedBetweenFrames");

  obj.AddAction("FillColor",
                _("Fill color"),
                _("Change the color used when filling"),
                _("Change fill color of _PARAM0_ to _PARAM1_"),
                _("Setup"),
                "res/actions/color24.png",
                "res/actions/color.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("color", _("Fill color"))
      .SetFunctionName("SetFillColor");

  obj.AddExpression("FillColorRed",
                    _("Filing color red component"),
                    _("Filing color red component"),
                    "",
                    "res/actions/color.png")
      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .SetFunctionName("GetFillColorR");

  obj.AddExpression("FillColorGreen",
                    _("Filing color green component"),
                    _("Filing color green component"),
                    "",
                    "res/actions/color.png")
      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .SetFunctionName("GetFillColorG");

  obj.AddExpression("FillColorBlue",
                    _("Filing color blue component"),
                    _("Filing color blue component"),
                    "",
                    "res/actions/color.png")
      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .SetFunctionName("GetFillColorB");

  obj.AddAction("OutlineColor",
                _("Outline color"),
                _("Modify the color of the outline of future drawings."),
                _("Change outline color of _PARAM0_ to _PARAM1_"),
                _("Setup"),
                "res/actions/color24.png",
                "res/actions/color.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("color", _("Color"))
      .SetFunctionName("SetOutlineColor");

  obj.AddExpression("OutlineColorRed",
                    _("Outline color red component"),
                    _("Outline color red component"),
                    "",
                    "res/actions/color.png")
      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .SetFunctionName("GetOutlineColorR");

  obj.AddExpression("OutlineColorGreen",
                    _("Outline color green component"),
                    _("Outline color green component"),
                    "",
                    "res/actions/color.png")
      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .SetFunctionName("GetOutlineColorG");

  obj.AddExpression("OutlineColorBlue",
                    _("Outline color blue component"),
                    _("Outline color blue component"),
                    "",
                    "res/actions/color.png")
      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .SetFunctionName("GetOutlineColorB");

  obj.AddAction("OutlineSize",
                _("Outline size"),
                _("Modify the size of the outline of future drawings."),
                _("the size of the outline"),
                _("Setup"),
                "res/actions/outlineSize24_black.png",
                "res/actions/outlineSize_black.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .UseStandardOperatorParameters("number",
                                     gd::ParameterOptions::MakeNewOptions())
      .SetFunctionName("SetOutlineSize")
      .SetGetter("GetOutlineSize");

  obj.AddCondition("OutlineSize",
                   _("Outline size"),
                   _("Test the size of the outline."),
                   _("the size of the outline"),
                   _("Setup"),
                   "res/conditions/outlineSize24_black.png",
                   "res/conditions/outlineSize_black.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .UseStandardRelationalOperatorParameters(
          "number", gd::ParameterOptions::MakeNewOptions())
      .SetFunctionName("GetOutlineSize");

  obj.AddExpression("OutlineSize",
                    _("Outline size"),
                    _("Outline size"),
                    "",
                    "res/conditions/outlineSize_black.png")
      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .SetFunctionName("GetOutlineSize");

  obj.AddAction(
         "FillOpacity",
         _("Fill opacity"),
         _("Modify the opacity level used when filling future drawings."),
         _("the opacity of filling"),
         _("Setup"),
         "res/actions/opacity24.png",
         "res/actions/opacity.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .UseStandardOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Opacity (0-255)")))
      .SetFunctionName("SetFillOpacity")
      .SetGetter("GetFillOpacity");

  obj.AddCondition("FillOpacity",
                   _("Fill opacity"),
                   _("Test the value of the opacity level used when filling."),
                   _("the opacity of filling"),
                   _("Setup"),
                   "res/conditions/opacity24.png",
                   "res/conditions/opacity.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .UseStandardRelationalOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Opacity to compare to (0-255)")))
      .SetFunctionName("GetFillOpacity");

  obj.AddExpression("FillOpacity",
                    _("Filling opacity"),
                    _("Filling opacity"),
                    "",
                    "res/conditions/opacity.png")
      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .SetFunctionName("GetFillOpacity");

  obj.AddAction("OutlineOpacity",
                _("Outline opacity"),
                _("Modify the opacity of the outline of future drawings."),
                _("the opacity of the outline"),
                _("Setup"),
                "res/actions/opacity24.png",
                "res/actions/opacity.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .UseStandardOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Opacity (0-255)")))
      .SetFunctionName("SetOutlineOpacity")
      .SetGetter("GetOutlineOpacity");

  obj.AddCondition("OutlineOpacity",
                   _("Outline opacity"),
                   _("Test the opacity of the outline."),
                   _("the opacity of the outline"),
                   _("Setup"),
                   "res/conditions/opacity24.png",
                   "res/conditions/opacity.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .UseStandardRelationalOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Opacity to compare to (0-255)")))
      .SetFunctionName("GetOutlineOpacity");

  obj.AddExpression("OutlineOpacity",
                    _("Outline opacity"),
                    _("Outline opacity"),
                    "",
                    "res/conditions/opacity.png")
      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .SetFunctionName("GetOutlineOpacity");

  obj.AddAction(
         "UseRelativeCoordinates",
         _("Use relative coordinates"),
         _("Set if the object should use relative coordinates (by default) or "
           "not. It's recommended to use relative coordinates."),
         _("Use relative coordinates for _PARAM0_: _PARAM1_"),
         _("Setup"),
         "res/actions/position24_black.png",
         "res/actions/position_black.png")
      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .AddParameter("yesorno", _("Use relative coordinates?"), "", false)
      .SetDefaultValue("true")
      .SetFunctionName("setCoordinatesRelative");

  obj.AddCondition(
         "AreCoordinatesRelative",
         _("Relative coordinates"),
         _("Check if the coordinates of the shape painter is relative."),
         _("_PARAM0_ is using relative coordinates"),
         _("Setup"),
         "res/conditions/position24_black.png",
         "res/conditions/position_black.png")

      .AddParameter("object", _("Shape Painter object"), "Drawer")
      .SetFunctionName("AreCoordinatesRelative");

  // Deprecated
  obj.AddAction("Scale",
                _("Scale"),
                _("Modify the scale of the specified object."),
                _("the scale"),
                _("Size"),
                "res/actions/scale24_black.png",
                "res/actions/scale_black.png")
      .AddParameter("object", _("Object"), "Drawer")
      .UseStandardOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Scale (1 by default)")))
      .SetHidden()
      .MarkAsAdvanced();

  // Deprecated
  obj.AddExpressionAndConditionAndAction("number",
                                         "ScaleX",
                                         _("Scale on X axis"),
                                         _("the width's scale of an object"),
                                         _("the width's scale"),
                                         _("Size"),
                                         "res/actions/scaleWidth24_black.png")
      .AddParameter("object", _("Object"), "Drawer")
      .UseStandardParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Scale (1 by default)")))
      .SetHidden()
      .MarkAsAdvanced();

  // Deprecated
  obj.AddExpressionAndConditionAndAction("number",
                                         "ScaleY",
                                         _("Scale on Y axis"),
                                         _("the height's scale of an object"),
                                         _("the height's scale"),
                                         _("Size"),
                                         "res/actions/scaleHeight24_black.png")
      .AddParameter("object", _("Object"), "Drawer")
      .UseStandardParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Scale (1 by default)")))
      .SetHidden()
      .MarkAsAdvanced();

  obj.AddAction("FlipX",
                _("Flip the object horizontally"),
                _("Flip the object horizontally"),
                _("Flip horizontally _PARAM0_: _PARAM1_"),
                _("Effects"),
                "res/actions/flipX24.png",
                "res/actions/flipX.png")
      .AddParameter("object", _("Object"), "Drawer")
      .AddParameter("yesorno", _("Activate flipping"))
      .SetHidden()
      .MarkAsSimple();

  obj.AddAction("FlipY",
                _("Flip the object vertically"),
                _("Flip the object vertically"),
                _("Flip vertically _PARAM0_: _PARAM1_"),
                _("Effects"),
                "res/actions/flipY24.png",
                "res/actions/flipY.png")
      .AddParameter("object", _("Object"), "Drawer")
      .AddParameter("yesorno", _("Activate flipping"))
      .SetHidden()
      .MarkAsSimple();

  obj.AddCondition("FlippedX",
                   _("Horizontally flipped"),
                   _("Check if the object is horizontally flipped"),
                   _("_PARAM0_ is horizontally flipped"),
                   _("Effects"),
                   "res/actions/flipX24.png",
                   "res/actions/flipX.png")
      .AddParameter("object", _("Object"), "Drawer")
      .SetHidden();

  obj.AddCondition("FlippedY",
                   _("Vertically flipped"),
                   _("Check if the object is vertically flipped"),
                   _("_PARAM0_ is vertically flipped"),
                   _("Effects"),
                   "res/actions/flipY24.png",
                   "res/actions/flipY.png")
      .AddParameter("object", _("Object"), "Drawer")
      .SetHidden();

  // Deprecated
  obj.AddAction("Width",
                _("Width"),
                _("Change the width of an object."),
                _("the width"),
                _("Size"),
                "res/actions/scaleWidth24_black.png",
                "res/actions/scaleWidth_black.png")
      .AddParameter("object", _("Object"), "Drawer")
      .UseStandardOperatorParameters("number",
                                     gd::ParameterOptions::MakeNewOptions())
      .SetHidden()
      .MarkAsAdvanced();

  // Deprecated
  obj.AddAction("Height",
                _("Height"),
                _("Change the height of an object."),
                _("the height"),
                _("Size"),
                "res/actions/scaleHeight24_black.png",
                "res/actions/scaleHeight_black.png")
      .AddParameter("object", _("Object"), "Drawer")
      .UseStandardOperatorParameters("number",
                                     gd::ParameterOptions::MakeNewOptions())
      .SetHidden()
      .MarkAsAdvanced();

  obj.AddAction(
         "SetRotationCenter",
         _("Center of rotation"),
         _("Change the center of rotation of an object relatively to the "
           "object origin."),
         _("Change the center of rotation of _PARAM0_ to _PARAM1_, _PARAM2_"),
         _("Angle"),
         "res/actions/position24_black.png",
         "res/actions/position_black.png")
      .AddParameter("object", _("Object"), "Drawer")
      .AddParameter("expression", _("X position"))
      .AddParameter("expression", _("Y position"))
      .MarkAsAdvanced();

  obj.AddAction("SetRectangularCollisionMask",
                _("Collision Mask"),
                _("Change the collision mask of an object to a rectangle "
                  "relatively to the object origin."),
                _("Change the collision mask of _PARAM0_ to a rectangle from "
                  "_PARAM1_; _PARAM2_ to _PARAM3_; _PARAM4_"),
                _("Position"),
                "res/actions/position24_black.png",
                "res/actions/position_black.png")
      .AddParameter("object", _("Object"), "Drawer")
      .AddParameter("expression", _("Left X position"))
      .AddParameter("expression", _("Top Y position"))
      .AddParameter("expression", _("Right X position"))
      .AddParameter("expression", _("Bottom Y position"))
      .MarkAsAdvanced();

  obj.AddExpression("ToDrawingX",
                    _("X drawing coordinate of a point from the scene"),
                    _("X drawing coordinate of a point from the scene"),
                    _("Position"),
                    "res/actions/position_black.png")
      .AddParameter("object", _("Object"), "Drawer")
      .AddParameter("expression", _("X scene position"))
      .AddParameter("expression", _("Y scene position"));

  obj.AddExpression("ToDrawingY",
                    _("Y drawing coordinate of a point from the scene"),
                    _("Y drawing coordinate of a point from the scene"),
                    _("Position"),
                    "res/actions/position_black.png")
      .AddParameter("object", _("Object"), "Drawer")
      .AddParameter("expression", _("X scene position"))
      .AddParameter("expression", _("Y scene position"));

  obj.AddExpression("ToSceneX",
                    _("X scene coordinate of a point from the drawing"),
                    _("X scene coordinate of a point from the drawing"),
                    _("Position"),
                    "res/actions/position_black.png")
      .AddParameter("object", _("Object"), "Drawer")
      .AddParameter("expression", _("X drawing position"))
      .AddParameter("expression", _("Y drawing position"));

  obj.AddExpression("ToSceneY",
                    _("Y scene coordinate of a point from the drawing"),
                    _("Y scene coordinate of a point from the drawing"),
                    _("Position"),
                    "res/actions/position_black.png")
      .AddParameter("object", _("Object"), "Drawer")
      .AddParameter("expression", _("X drawing position"))
      .AddParameter("expression", _("Y drawing position"));

  obj.AddAction("SetAntialiasing",
                _("Anti-aliasing"),
                _("Anti-aliasing"),
                _("Set anti-aliasing of _PARAM0_ to _PARAM1_"),
                _("Setup"),
                "res/actions/antialiasing24.png",
                "res/actions/antialiasing.png")
      .AddParameter("object", _("Object"), "Drawer")
      .AddParameter("stringWithSelector",
                    _("Anti-aliasing quality level"),
                    "[\"none\",\"low\",\"medium\",\"high\"]");

  obj.AddCondition("CheckAntialiasing",
                   _("Anti-aliasing type"),
                   _("Checks the selected type of anti-aliasing"),
                   _("The anti-aliasing of _PARAM0_ is set to _PARAM1_"),
                   _("Setup"),
                   "res/actions/antialiasing24.png",
                   "res/actions/antialiasing.png")
      .AddParameter("object", _("Object"), "Drawer")
      .AddParameter("stringWithSelector",
                    _("Type of anti-aliasing to check the object against"),
                    "[\"none\",\"low\",\"medium\",\"high\"]");

  obj.AddStrExpression("Antialiasing",
                       _("Type of anti-aliasing used by a shape painter"),
                       _("Returns the type of anti-aliasing in use: none, low, "
                         "medium, or high."),
                       _("Setup"),
                       "res/actions/antialiasing.png")
      .AddParameter("object", _("Object"), "Drawer");
#endif
}
