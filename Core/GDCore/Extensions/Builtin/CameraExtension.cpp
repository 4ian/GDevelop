/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd
{

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsCameraExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("BuiltinCamera",
                          _("Cameras and layers features"),
                          _("Built-in camera extension"),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)
    extension.AddCondition("CameraX",
                   _("Camera center X position"),
                   _("Compare the X position of the center of a camera."),
                   _("X position of camera _PARAM4_ is _PARAM1__PARAM2_ (layer: _PARAM3_)"),
                   _("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .AddParameter("layer", _("Layer (base layer if empty)"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number (default : 0)"), "",true).SetDefaultValue("0")
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddCondition("CameraY",
                   _("Camera center Y position"),
                   _("Compare the Y position of the center of a camera."),
                   _("The Y position of camera _PARAM4_ is _PARAM1__PARAM2_ (layer: _PARAM3_)"),
                   _("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .AddParameter("layer", _("Layer (base layer if empty)")).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number (default : 0)")).SetDefaultValue("0")
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddAction("CameraX",
                   _("Camera center X position"),
                   _("Change the X position of the center of the specified camera."),
                   _("Do _PARAM1__PARAM2_ to X position of camera _PARAM4_ (layer: _PARAM3_)"),
                   _("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .AddParameter("layer", _("Layer (base layer if empty)"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number (default : 0)"), "",true).SetDefaultValue("0")
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddAction("CameraY",
                   _("Camera center Y position"),
                   _("Change the Y position of the center of the specified camera."),
                   _("Do _PARAM1__PARAM2_ to Y position of camera _PARAM4_ (layer: _PARAM3_)"),
                   _("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .AddParameter("layer", _("Layer (base layer if empty)"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number (default : 0)"), "",true).SetDefaultValue("0")
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddCondition("CameraWidth",
                   _("Width of a camera"),
                   _("Test the width of a camera of a layer"),
                   _("The width of camera _PARAM2_ of layer _PARAM1_ is _PARAM3__PARAM4_"),
                   _("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer")).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddCondition("CameraHeight",
                   _("Height of a camera"),
                   _("Test the height of a camera of a layer"),
                   _("The height of camera _PARAM2_ of layer _PARAM1_ is _PARAM3__PARAM4_"),
                   _("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer (base layer if empty)")).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddCondition("CameraAngle",
                   _("Angle of a camera of a layer"),
                   _("Test a camera angle."),
                   _("Angle of camera is _PARAM1__PARAM2_ (layer: _PARAM3_, camera: _PARAM4_)"),
                   _("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .AddParameter("layer", _("Layer (base layer if empty)"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number (default : 0)"), "",true).SetDefaultValue("0")
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddAction("RotateCamera",
                   _("Change camera angle"),
                   _("This action modifies the angle of a camera in the specified layer."),
                   _("Do _PARAM1__PARAM2_ to angle of camera (layer: _PARAM3_, camera: _PARAM4_)"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .AddParameter("layer", _("Layer (base layer if empty)"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number (default : 0)"), "",true).SetDefaultValue("0")
        .SetManipulatedType("number");

    extension.AddAction("AddCamera",
                   _("Add a camera to a layer"),
                   _("This action adds a camera to a layer"),
                   _("Add a camera to layer _PARAM1_"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer (base layer if empty)")).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Width"), "",true)
        .AddParameter("expression", _("Height"), "",true)
        .AddParameter("expression", _("Render zone: Top left side: X Position (between 0 and 1)"), "",true)
        .AddParameter("expression", _("Render zone: Top left side: Y Position (between 0 and 1)"), "",true)
        .AddParameter("expression", _("Render zone: Bottom right side: X Position (between 0 and 1)"), "",true)
        .AddParameter("expression", _("Render zone: Bottom right side: Y Position (between 0 and 1)"), "",true)
        .MarkAsComplex();

    extension.AddAction("DeleteCamera",
                   _("Delete a camera of a layer"),
                   _("Remove the specified camera from a layer"),
                   _("Delete camera _PARAM2_ from layer _PARAM1_"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer (base layer if empty)")).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number"))
        .MarkAsComplex();

    extension.AddAction("CameraSize",
                   _("Modify the size of a camera"),
                   _("This action modifies the size of a camera of the specified layer. The zoom will be reset."),
                   _("Change the size of camera _PARAM2_ of _PARAM1_ to _PARAM3_*_PARAM4_"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer (base layer if empty)")).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number"))
        .AddParameter("expression", _("Width"))
        .AddParameter("expression", _("Height"))
        .MarkAsComplex();

    extension.AddAction("CameraViewport",
                   _("Modify the render zone of a camera"),
                   _("This action modifies the render zone of a camera of the specified layer."),
                   _("Set the render zone of camera _PARAM2_ from layer _PARAM1_ to _PARAM3_;_PARAM4_ _PARAM5_;_PARAM6_"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer (base layer if empty)")).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number"))
        .AddParameter("expression", _("Render zone: Top left side: X Position (between 0 and 1)"))
        .AddParameter("expression", _("Render zone: Top left side: Y Position (between 0 and 1)"))
        .AddParameter("expression", _("Render zone: Bottom right side: X Position (between 0 and 1)"))
        .AddParameter("expression", _("Render zone: Bottom right side: Y Position (between 0 and 1)"))
        .MarkAsComplex();

    extension.AddAction("ZoomCamera",
                   _("Change camera zoom."),
                   _("Change camera zoom."),
                   _("Change camera zoom to _PARAM1_ (layer : _PARAM2_, camera : _PARAM3_)"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Value (1:Initial zoom, 2:Zoom x2, 0.5:Unzoom x2...)"))
        .AddParameter("layer", _("Layer (base layer if empty)"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number (default : 0)"), "",true).SetDefaultValue("0");

    extension.AddAction("FixCamera",
                   _("Center the camera on an object within limits"),
                   _("Center the camera on the specified object, without leaving the specified limits."),
                   _("Center the camera on _PARAM1_ (limit : from _PARAM2_;_PARAM3_ to _PARAM4_;_PARAM5_) (layer: _PARAM7_, camera: _PARAM8_)"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectPtr", _("Object"))
        .AddParameter("expression", _("Top left side of the boundary: X Position"))
        .AddParameter("expression", _("Top left side of the boundary: Y Position"))
        .AddParameter("expression", _("Bottom right side of the boundary: X Position"))
        .AddParameter("expression", _("Bottom right side of the boundary: Y Position"))
        .AddParameter("yesorno", _("Anticipate the movement of the object (yes by default)"), "",true).SetDefaultValue("yes")
        .AddParameter("layer", _("Layer (base layer if empty)"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number (default : 0)"), "",true).SetDefaultValue("0")
        .MarkAsAdvanced();

    extension.AddAction("CentreCamera",
                   _("Center the camera on an object"),
                   _("Center the camera on the specified object."),
                   _("Center camera on _PARAM1_ (layer: _PARAM3_, camera: _PARAM4_)"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectPtr", _("Object"))
        .AddParameter("yesorno", _("Anticipate the movement of the object (yes by default)"), "",true).SetDefaultValue("yes")
        .AddParameter("layer", _("Layer (base layer if empty)"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number (default : 0)"), "",true).SetDefaultValue("0")
        .MarkAsSimple();

    extension.AddAction("ShowLayer",
                   _("Show a layer"),
                   _("Show a layer."),
                   _("Show layer _PARAM1_"),
                   _("Layers and cameras"),
                   "res/actions/layer24.png",
                   "res/actions/layer.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer (base layer if empty)")).SetDefaultValue("\"\"")
        .MarkAsAdvanced();

    extension.AddAction("HideLayer",
                   _("Hide a layer"),
                   _("Hide a layer."),
                   _("Hide layer _PARAM1_"),
                   _("Layers and cameras"),
                   "res/actions/layer24.png",
                   "res/actions/layer.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer (base layer if empty)")).SetDefaultValue("\"\"")
        .MarkAsAdvanced();

    extension.AddCondition("LayerVisible",
                   _("Visibility of a layer"),
                   _("Test if a layer is set as visible."),
                   _("Layer _PARAM1_ is visible"),
                   _("Layers and cameras"),
                   "res/conditions/layer24.png",
                   "res/conditions/layer.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer (base layer if empty)")).SetDefaultValue("\"\"")
        .MarkAsAdvanced();

    extension.AddAction("SetLayerEffectParameter",
                   _("Effect parameter"),
                   _("Change the parameter of an effect"),
                   _("Set _PARAM3_ to _PARAM4_ for effect _PARAM2_ of layer _PARAM1_"),
                   _("Layers and cameras/Effects"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer (base layer if empty)"), "",true).SetDefaultValue("\"\"")
        .AddParameter("string", _("Effect"))
        .AddParameter("string", _("Parameter name"))
        .AddParameter("expression", _("New value"))
        .MarkAsAdvanced();

    extension.AddCondition("LayerTimeScale",
                   _("Layer time scale"),
                   _("Compare the time scale applied to the objects of the layer."),
                   _("The time scale of layer _PARAM1_ is _PARAM2__PARAM3_"),
                   _("Layers and cameras/Time"),
                   "res/conditions/time24.png",
                   "res/conditions/time.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer (base layer if empty)"), "",true).SetDefaultValue("\"\"")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddAction("ChangeLayerTimeScale",
                   _("Change layer time scale"),
                   _("Change the time scale applied to the objects of the layer."),
                   _("Set time scale of layer _PARAM1_ to _PARAM2_"),
                   _("Layers and cameras/Time"),
                   "res/actions/time24.png",
                   "res/actions/time.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer (base layer if empty)"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Scale (1: Default, 2: 2x faster, 0.5: 2x slower...)"));

    extension.AddExpression("CameraWidth", _("Width of a camera of a layer"), _("Width of a camera of a layer"), _("Layers and cameras"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"))
        .AddParameter("expression", _("Camera number (default : 0)")).SetDefaultValue("0");

    extension.AddExpression("CameraHeight", _("Height of a camera of a layer"), _("Height of a camera of a layer"), _("Layers and cameras"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"))
        .AddParameter("expression", _("Camera number (default : 0)")).SetDefaultValue("0");

    extension.AddExpression("CameraViewportLeft", _("X position of the top left side point of a render zone"), _("X position of the top left side point of a render zone"), _("Layers and cameras"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"))
        .AddParameter("expression", _("Camera number (default : 0)")).SetDefaultValue("0");

    extension.AddExpression("CameraViewportTop", _("Y position of the top left side point of a render zone"), _("Y position of the top left side point of a render zone"), _("Layers and cameras"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"))
        .AddParameter("expression", _("Camera number (default : 0)")).SetDefaultValue("0");

    extension.AddExpression("CameraViewportRight", _("X position of the bottom right side point of a render zone"), _("X position of the bottom right side point of a render zone"), _("Layers and cameras"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"))
        .AddParameter("expression", _("Camera number (default : 0)")).SetDefaultValue("0");

    extension.AddExpression("CameraViewportBottom", _("Y position of the bottom right side point of a render zone"), _("Y position of the bottom right side point of a render zone"), _("Layers and cameras"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"))
        .AddParameter("expression", _("Camera number (default : 0)")).SetDefaultValue("0");

    extension.AddExpression("CameraX", _("Camera X position"), _("Camera X position"), _("Layers and cameras"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number (default : 0)"), "",true).SetDefaultValue("0");

    extension.AddExpression("VueX", _("Camera X position"), _("Camera X position"), _("Layers and cameras"), "res/actions/camera.png")
        .SetHidden()
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number (default : 0)"), "",true).SetDefaultValue("0");

    extension.AddExpression("CameraY", _("Camera Y position"), _("Camera Y position"), _("Layers and cameras"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number (default : 0)"), "",true).SetDefaultValue("0");

    extension.AddExpression("VueY", _("Camera Y position"), _("Camera Y position"), _("Layers and cameras"), "res/actions/camera.png")
        .SetHidden()
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number (default : 0)"), "",true).SetDefaultValue("0");

    extension.AddExpression("CameraRotation", _("Angle of a camera of a layer"), _("Angle of a camera of a layer"), _("Layers and cameras"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number (default : 0)"), "",true).SetDefaultValue("0");

    extension.AddExpression("VueRotation", _("Angle of a camera of a layer"), _("Angle of a camera of a layer"), _("Layers and cameras"), "res/actions/camera.png")
        .SetHidden()
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number (default : 0)"), "",true).SetDefaultValue("0");

    extension.AddExpression("LayerTimeScale", _("Time scale"), _("Time scale"), _("Layers and cameras"), "res/actions/time.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"));
    #endif
}

}
