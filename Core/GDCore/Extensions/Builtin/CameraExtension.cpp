/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Extensions/Metadata/MultipleInstructionMetadata.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd {

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsCameraExtension(
    gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "BuiltinCamera",
          _("Layers and cameras"),
          "Each scene can be composed of multiple layers. These conditions "
          "and actions allow to manipulate them during the game. In "
          "particular, you can move the camera of a layer to center it on an "
          "object or a position.",
          "Florian Rival",
          "Open source (MIT License)")
      .SetCategory("Camera")
      .SetExtensionHelpPath("/interface/scene-editor/layers-and-cameras");
  extension.AddInstructionOrExpressionGroupMetadata(_("Layers and cameras"))
      .SetIcon("res/conditions/camera24.png");
  extension.AddInstructionOrExpressionGroupMetadata(_("Effects"))
      .SetIcon("res/actions/effect_black.svg");

  extension
      .AddExpressionAndConditionAndAction(
          "number",
          "CameraCenterX",
          _("Camera center X position"),
          _("the X position of the center of a camera"),
          _("the X position of camera _PARAM4_ (layer: _PARAM3_)"),
          "",
          "res/conditions/camera24.png")
      .AddCodeOnlyParameter("currentScene", "")
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions())
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Camera number (default : 0)"), "", true)
      .SetDefaultValue("0")
      .MarkAsAdvanced();

  // Compatibility with GD <= 5.0.135
  extension.AddDuplicatedCondition("CameraX", "CameraCenterX")
      .SetHidden();  // Deprecated
  extension.AddDuplicatedExpression("CameraX", "CameraCenterX")
      .SetHidden();  // Deprecated
  extension.AddDuplicatedAction("SetCameraX", "SetCameraCenterX")
      .SetHidden();  // Deprecated

  extension.AddDuplicatedAction("CameraX", "SetCameraX")
      .SetHidden();  // Deprecated

  extension.AddDuplicatedExpression("VueX", "CameraX")
      .SetHidden();  // Deprecated
  // end of compatibility code

  extension
      .AddExpressionAndConditionAndAction(
          "number",
          "CameraCenterY",
          _("Camera center Y position"),
          _("the Y position of the center of a camera"),
          _("the Y position of camera _PARAM4_ (layer: _PARAM3_)"),
          "",
          "res/conditions/camera24.png")
      .AddCodeOnlyParameter("currentScene", "")
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions())
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Camera number (default : 0)"), "", true)
      .SetDefaultValue("0")
      .MarkAsAdvanced();

  // Compatibility with GD <= 5.0.135
  extension.AddDuplicatedCondition("CameraY", "CameraCenterY")
      .SetHidden();  // Deprecated
  extension.AddDuplicatedExpression("CameraY", "CameraCenterY")
      .SetHidden();  // Deprecated
  extension.AddDuplicatedAction("SetCameraY", "SetCameraCenterY")
      .SetHidden();  // Deprecated

  extension.AddDuplicatedAction("CameraY", "SetCameraY")
      .SetHidden();  // Deprecated

  extension.AddDuplicatedExpression("VueY", "CameraY")
      .SetHidden();  // Deprecated
  // end of compatibility code

  extension
      .AddExpressionAndCondition(
          "number",
          "CameraWidth",
          _("Width of a camera"),
          _("the width of a camera of a layer"),
          _("the width of camera _PARAM2_ of layer _PARAM1_"),
          "",
          "res/conditions/camera24.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Camera number"), "", true)
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions())
      .MarkAsAdvanced();

  extension
      .AddExpressionAndCondition(
          "number",
          "CameraHeight",
          _("Height of a camera"),
          _("the height of a camera of a layer"),
          _("the height of camera _PARAM2_ of layer _PARAM1_"),
          "",
          "res/conditions/camera24.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Camera number"), "", true)
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions())
      .MarkAsAdvanced();

  extension
      .AddExpressionAndCondition(
          "number",
          "CameraBorderLeft",
          _("Camera left border position"),
          _("the position of the left border of a camera"),
          _("the position of the left border of camera _PARAM2_ of layer "
            "_PARAM1_"),
          "",
          "res/conditions/camera24.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Camera number"), "", true)
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions())
      .MarkAsAdvanced();

  extension
      .AddExpressionAndCondition(
          "number",
          "CameraBorderRight",
          _("Camera right border position"),
          _("the position of the right border of a camera"),
          _("the position of the right border of camera _PARAM2_ of layer "
            "_PARAM1_"),
          "",
          "res/conditions/camera24.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Camera number"), "", true)
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions())
      .MarkAsAdvanced();

  extension
      .AddExpressionAndCondition(
          "number",
          "CameraBorderTop",
          _("Camera top border position"),
          _("the position of the top border of a camera"),
          _("the position of the top border of camera _PARAM2_ of layer "
            "_PARAM1_"),
          "",
          "res/conditions/camera24.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Camera number"), "", true)
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions())
      .MarkAsAdvanced();

  extension
      .AddExpressionAndCondition(
          "number",
          "CameraBorderBottom",
          _("Camera bottom border position"),
          _("the position of the bottom border of a camera"),
          _("the position of the bottom border of camera _PARAM2_ of layer "
            "_PARAM1_"),
          "",
          "res/conditions/camera24.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Camera number"), "", true)
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions())
      .MarkAsAdvanced();

  extension
      .AddExpressionAndConditionAndAction(
          "number",
          "CameraAngle",
          _("Angle of a camera of a layer"),
          _("the angle of rotation of a camera (in degrees)"),
          _("the angle of camera (layer: _PARAM3_, camera: _PARAM4_)"),
          "",
          "res/conditions/camera24.png")
      .AddCodeOnlyParameter("currentScene", "")
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions())
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Camera number (default : 0)"), "", true)
      .SetDefaultValue("0")
      .MarkAsAdvanced();

  extension.AddDuplicatedAction("RotateCamera", "SetCameraAngle").SetHidden();
  extension.AddDuplicatedExpression("CameraRotation", "CameraAngle")
      .SetHidden();
  extension.AddDuplicatedExpression("VueRotation", "CameraAngle").SetHidden();

  extension
      .AddAction("AddCamera",
                 _("Add a camera to a layer"),
                 _("This action adds a camera to a layer"),
                 _("Add a camera to layer _PARAM1_"),
                 "",
                 "res/actions/camera24.png",
                 "res/actions/camera.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"))
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Width"), "", true)
      .AddParameter("expression", _("Height"), "", true)
      .AddParameter(
          "expression",
          _("Render zone: Top left side: X Position (between 0 and 1)"),
          "",
          true)
      .AddParameter(
          "expression",
          _("Render zone: Top left side: Y Position (between 0 and 1)"),
          "",
          true)
      .AddParameter(
          "expression",
          _("Render zone: Bottom right side: X Position (between 0 and 1)"),
          "",
          true)
      .AddParameter(
          "expression",
          _("Render zone: Bottom right side: Y Position (between 0 and 1)"),
          "",
          true)
      .MarkAsComplex();

  extension
      .AddAction("DeleteCamera",
                 _("Delete a camera of a layer"),
                 _("Remove the specified camera from a layer"),
                 _("Delete camera _PARAM2_ from layer _PARAM1_"),
                 "",
                 "res/actions/camera24.png",
                 "res/actions/camera.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"))
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Camera number"))
      .MarkAsComplex();

  extension
      .AddAction("CameraSize",
                 _("Modify the size of a camera"),
                 _("This action modifies the size of a camera of the specified "
                   "layer. The zoom will be reset."),
                 _("Change the size of camera _PARAM2_ of _PARAM1_ to "
                   "_PARAM3_*_PARAM4_"),
                 "",
                 "res/actions/camera24.png",
                 "res/actions/camera.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"))
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Camera number"))
      .AddParameter("expression", _("Width"))
      .AddParameter("expression", _("Height"))
      .MarkAsComplex();

  extension
      .AddAction("CameraViewport",
                 _("Modify the render zone of a camera"),
                 _("This action modifies the render zone of a camera of the "
                   "specified layer."),
                 _("Set the render zone of camera _PARAM2_ from layer _PARAM1_ "
                   "to _PARAM3_;_PARAM4_ _PARAM5_;_PARAM6_"),
                 "",
                 "res/actions/camera24.png",
                 "res/actions/camera.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"))
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Camera number"))
      .AddParameter(
          "expression",
          _("Render zone: Top left side: X Position (between 0 and 1)"))
      .AddParameter(
          "expression",
          _("Render zone: Top left side: Y Position (between 0 and 1)"))
      .AddParameter(
          "expression",
          _("Render zone: Bottom right side: X Position (between 0 and 1)"))
      .AddParameter(
          "expression",
          _("Render zone: Bottom right side: Y Position (between 0 and 1)"))
      .MarkAsComplex();

  extension
      .AddAction("ZoomCamera",
                 _("Camera zoom"),
                 _("Change camera zoom."),
                 _("Change camera zoom to _PARAM1_ (layer: _PARAM2_, camera: "
                   "_PARAM3_)"),
                 "",
                 "res/actions/camera24.png",
                 "res/actions/camera.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression",
                    _("Value (1:Initial zoom, 2:Zoom x2, 0.5:Unzoom x2...)"))
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Camera number (default : 0)"), "", true)
      .SetDefaultValue("0");

  extension
      .AddAction(
          "FixCamera",
          _("Center the camera on an object within limits"),
          _("Center the camera on the specified object, without leaving the "
            "specified limits."),
          _("Center the camera on _PARAM1_ (limit : from _PARAM2_;_PARAM3_ to "
            "_PARAM4_;_PARAM5_) (layer: _PARAM7_, camera: _PARAM8_)"),
          "",
          "res/actions/camera24.png",
          "res/actions/camera.png")
      .SetHidden()
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("objectPtr", _("Object"))
      .AddParameter("expression",
                    _("Top left side of the boundary: X Position"))
      .AddParameter("expression",
                    _("Top left side of the boundary: Y Position"))
      .AddParameter("expression",
                    _("Bottom right side of the boundary: X Position"))
      .AddParameter("expression",
                    _("Bottom right side of the boundary: Y Position"))
      .AddParameter("yesorno",
                    _("Anticipate the movement of the object (yes by default)"),
                    "",
                    true)
      .SetDefaultValue("yes")
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Camera number (default : 0)"), "", true)
      .SetDefaultValue("0")
      .MarkAsAdvanced();

  extension
      .AddAction("ClampCamera",
                 _("Enforce camera boundaries"),
                 _("Enforce camera boundaries by moving the camera back inside "
                   "specified boundaries."),
                 _("Enforce camera boundaries (left: _PARAM1_, top: _PARAM2_ "
                   "right: _PARAM3_, bottom: _PARAM4_, layer: _PARAM5_)"),
                 "",
                 "res/actions/camera24.png",
                 "res/actions/camera.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Left bound X Position"))
      .AddParameter("expression", _("Top bound Y Position"))
      .AddParameter("expression", _("Right bound X Position"))
      .AddParameter("expression", _("Bottom bound Y Position"))
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Camera number (default : 0)"), "", true)
      .SetDefaultValue("0")
      .MarkAsAdvanced();

  extension
      .AddAction("CentreCamera",
                 _("Center the camera on an object"),
                 _("Center the camera on the specified object."),
                 _("Center camera on _PARAM1_ (layer: _PARAM3_)"),
                 _("Layers and cameras"),
                 "res/actions/camera24.png",
                 "res/actions/camera.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("objectPtr", _("Object"))
      .AddParameter("yesorno",
                    _("Anticipate the movement of the object (yes by default)"),
                    "",
                    true)
      .SetDefaultValue("yes")
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Camera number (default : 0)"), "", true)
      .SetDefaultValue("0")
      .MarkAsSimple();

  extension
      .AddAction("ShowLayer",
                 _("Show a layer"),
                 _("Show a layer."),
                 _("Show layer _PARAM1_"),
                 "",
                 "res/actions/layer24.png",
                 "res/actions/layer.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"))
      .SetDefaultValue("\"\"")
      .MarkAsAdvanced();

  extension
      .AddAction("HideLayer",
                 _("Hide a layer"),
                 _("Hide a layer."),
                 _("Hide layer _PARAM1_"),
                 "",
                 "res/actions/layer24.png",
                 "res/actions/layer.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"))
      .SetDefaultValue("\"\"")
      .MarkAsAdvanced();

  extension
      .AddCondition("LayerVisible",
                    _("Visibility of a layer"),
                    _("Test if a layer is set as visible."),
                    _("Layer _PARAM1_ is visible"),
                    "",
                    "res/conditions/layer24.png",
                    "res/conditions/layer.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"))
      .SetDefaultValue("\"\"")
      .MarkAsAdvanced();

  extension
      .AddAction(
          "SetLayerEffectParameter",
          _("Effect property (number)"),
          _("Change the value of a property of an effect.") + "\n" +
              _("You can find the property names (and change the effect "
                "names) in the effects window."),
          _("Set _PARAM3_ to _PARAM4_ for effect _PARAM2_ of layer _PARAM1_"),
          _("Effects"),
          "res/actions/effect_black.svg",
          "res/actions/effect_black.svg")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("layerEffectName", _("Effect name"))
      .AddParameter("layerEffectParameterName", _("Property name"))
      .AddParameter("expression", _("New value"))
      .MarkAsAdvanced();

  extension
      .AddAction(
          "SetLayerEffectStringParameter",
          _("Effect property (string)"),
          _("Change the value (string) of a property of an effect.") + "\n" +
              _("You can find the property names (and change the effect "
                "names) in the effects window."),
          _("Set _PARAM3_ to _PARAM4_ for effect _PARAM2_ of layer _PARAM1_"),
          _("Effects"),
          "res/actions/effect_black.svg",
          "res/actions/effect_black.svg")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("layerEffectName", _("Effect name"))
      .AddParameter("layerEffectParameterName", _("Property name"))
      .AddParameter("string", _("New value"))
      .MarkAsAdvanced();

  extension
      .AddAction(
          "SetLayerEffectBooleanParameter",
          _("Effect property (enable or disable)"),
          _("Enable or disable a property of an effect.") + "\n" +
              _("You can find the property names (and change the effect "
                "names) in the effects window."),
          _("Enable _PARAM3_ for effect _PARAM2_ of layer _PARAM1_: _PARAM4_"),
          _("Effects"),
          "res/actions/effect_black.svg",
          "res/actions/effect_black.svg")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("layerEffectName", _("Effect name"))
      .AddParameter("layerEffectParameterName", _("Property name"))
      .AddParameter("yesorno", _("Enable this property"))
      .MarkAsAdvanced();

  extension
      .AddCondition("LayerEffectEnabled",
                    _("Layer effect is enabled"),
                    _("The effect on a layer is enabled"),
                    _("Effect _PARAM2_ on layer _PARAM1_ is enabled"),
                    _(""),
                    "res/actions/effect_black.svg",
                    "res/actions/effect_black.svg")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("layerEffectName", _("Effect name"))
      .MarkAsAdvanced();

  extension
      .AddAction("EnableLayerEffect",
                 _("Enable layer effect"),
                 _("Enable an effect on a layer"),
                 _("Enable effect _PARAM2_ on layer _PARAM1_: _PARAM3_"),
                 _("Effects"),
                 "res/actions/effect_black.svg",
                 "res/actions/effect_black.svg")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("layerEffectName", _("Effect name"))
      .AddParameter("yesorno", _("Enable"), "", true)
      .MarkAsAdvanced();

  extension
      .AddCondition(
          "LayerTimeScale",
          _("Layer time scale"),
          _("Compare the time scale applied to the objects of the layer."),
          _("the time scale of layer _PARAM1_"),
          "",
          "res/conditions/time24.png",
          "res/conditions/time.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .UseStandardRelationalOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Time scale (1 by default)")))
      .MarkAsAdvanced();

  extension
      .AddAction(
          "ChangeLayerTimeScale",
          _("Layer time scale"),
          _("Change the time scale applied to the objects of the layer."),
          _("Set the time scale of layer _PARAM1_ to _PARAM2_"),
          "",
          "res/actions/time24.png",
          "res/actions/time.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("expression",
                    _("Scale (1: Default, 2: 2x faster, 0.5: 2x slower...)"));

  extension
      .AddCondition("LayerDefaultZOrder",
                    _("Layer default Z order"),
                    _("Compare the default Z order set to objects when they "
                      "are created on a layer."),
                    _("the default Z order of objects created on _PARAM1_"),
                    "",
                    "res/conditions/layer24.png",
                    "res/conditions/layer.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .UseStandardRelationalOperatorParameters(
          "number", gd::ParameterOptions::MakeNewOptions())
      .MarkAsAdvanced();

  extension
      .AddAction("SetLayerDefaultZOrder",
                 _("Layer default Z order"),
                 _("Change the default Z order set to objects when they are "
                   "created on a layer."),
                 _("Set the default Z order of objects created on _PARAM1_ to "
                   "_PARAM2_"),
                 "",
                 "res/actions/layer24.png",
                 "res/actions/layer.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("New default Z order"));

  extension
      .AddAction(
          "SetLayerAmbientLightColor",
          _("Ambient light color"),
          _("Set the ambient light color of the lighting layer in format "
            "\"R;G;B\" string."),
          _("Set the ambient color of the lighting layer _PARAM1_ to _PARAM2_"),
          _(""),
          "res/actions/color24.png",
          "res/actions/color.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"Lighting\"")
      .AddParameter("color", _("Color"))
      .MarkAsAdvanced();

  extension
      .AddExpression(
          "CameraViewportLeft",
          _("X position of the top left side point of a render zone"),
          _("X position of the top left side point of a render zone"),
          "",
          "res/actions/camera.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"))
      .AddParameter("expression", _("Camera number (default : 0)"))
      .SetDefaultValue("0");

  extension
      .AddExpression(
          "CameraViewportTop",
          _("Y position of the top left side point of a render zone"),
          _("Y position of the top left side point of a render zone"),
          "",
          "res/actions/camera.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"))
      .AddParameter("expression", _("Camera number (default : 0)"))
      .SetDefaultValue("0");

  extension
      .AddExpression(
          "CameraViewportRight",
          _("X position of the bottom right side point of a render zone"),
          _("X position of the bottom right side point of a render zone"),
          "",
          "res/actions/camera.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"))
      .AddParameter("expression", _("Camera number (default : 0)"))
      .SetDefaultValue("0");

  extension
      .AddExpression(
          "CameraViewportBottom",
          _("Y position of the bottom right side point of a render zone"),
          _("Y position of the bottom right side point of a render zone"),
          "",
          "res/actions/camera.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"))
      .AddParameter("expression", _("Camera number (default : 0)"))
      .SetDefaultValue("0");

  extension
      .AddExpression("CameraZoom",
                     _("Zoom of a camera of a layer"),
                     _("Zoom of a camera of a layer"),
                     "",
                     "res/actions/camera.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Camera number (default : 0)"), "", true)
      .SetDefaultValue("0");

  extension
      .AddExpression("LayerTimeScale",
                     _("Layer time scale"),
                     _("Returns the time scale of the specified layer."),
                     "",
                     "res/actions/time.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"));

  extension
      .AddExpression("LayerDefaultZOrder",
                     _("Default Z Order for a layer"),
                     _("Default Z Order for a layer"),
                     "",
                     "res/actions/camera.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("layer", _("Layer"));
}

}  // namespace gd
