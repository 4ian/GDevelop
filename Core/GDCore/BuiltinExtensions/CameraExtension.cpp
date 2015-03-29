/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
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
                          GD_T("Cameras and layers features"),
                          GD_T("Builtin camera extension"),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)
    extension.AddCondition("CameraX",
                   GD_T("Camera center X position"),
                   GD_T("Compare the X position of a the center of a camera."),
                   GD_T("X position of camera _PARAM4_ is _PARAM1__PARAM2_ ( Layer: _PARAM3_ )"),
                   GD_T("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("relationalOperator", GD_T("Sign of the test"), "",false)
        .AddParameter("expression", GD_T("Value to test"), "",false)
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",true).SetDefaultValue("0")
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddCondition("CameraY",
                   GD_T("Camera center Y position"),
                   GD_T("Compare the Y position of a the center of a camera."),
                   GD_T("The Y position of camera _PARAM4_ is _PARAM1__PARAM2_  ( Layer: _PARAM3_ )"),
                   GD_T("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("relationalOperator", GD_T("Sign of the test"), "",false)
        .AddParameter("expression", GD_T("Value to test"), "",false)
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",false).SetDefaultValue("0")
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddAction("CameraX",
                   GD_T("Camera center X position"),
                   GD_T("Change X position of the center of the specified camera."),
                   GD_T("Do _PARAM1__PARAM2_ to X position of camera _PARAM4_ ( Layer: _PARAM3_ )"),
                   GD_T("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("operator", GD_T("Modification's sign"), "",false)
        .AddParameter("expression", GD_T("Value"), "",false)
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",true).SetDefaultValue("0")
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddAction("CameraY",
                   GD_T("Camera center Y position"),
                   GD_T("Change Y position of the center of the specified camera."),
                   GD_T("Do _PARAM1__PARAM2_ to Y position of camera _PARAM4_ ( Layer: _PARAM3_ )"),
                   GD_T("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("operator", GD_T("Modification's sign"), "",false)
        .AddParameter("expression", GD_T("Value"), "",false)
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",true).SetDefaultValue("0")
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddCondition("CameraWidth",
                   GD_T("Width of a camera"),
                   GD_T("Test the width of a camera of a layer"),
                   GD_T("The width of camera _PARAM2_ of layer _PARAM1_ is _PARAM3__PARAM4_"),
                   GD_T("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer"), "",false).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number"), "",false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"), "",false)
        .AddParameter("expression", GD_T("Value to test"), "",false)
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddCondition("CameraHeight",
                   GD_T("Height of a camera"),
                   GD_T("Test the height of a camera of a layer"),
                   GD_T("The height of camera _PARAM2_ of layer _PARAM1_ is _PARAM3__PARAM4_"),
                   GD_T("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number"), "",false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"), "",false)
        .AddParameter("expression", GD_T("Value to test"), "",false)
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddCondition("CameraAngle",
                   GD_T("Angle of a camera of a layer"),
                   GD_T("Test a camera angle."),
                   GD_T("Angle of camera is _PARAM1__PARAM2_ ( layer : _PARAM3_, camera : _PARAM4_ )"),
                   GD_T("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("relationalOperator", GD_T("Sign of the test"), "",false)
        .AddParameter("expression", GD_T("Value to test"), "",false)
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",true).SetDefaultValue("0")
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddAction("RotateCamera",
                   GD_T("Change camera angle"),
                   GD_T("This action modify the angle of a camera of the specified layer."),
                   GD_T("Do _PARAM1__PARAM2_ to angle of camera ( layer : _PARAM3_, camera : _PARAM4_ )"),
                   GD_T("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("operator", GD_T("Modification's sign"), "",false)
        .AddParameter("expression", GD_T("Value"), "",false)
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",true).SetDefaultValue("0")
        .SetManipulatedType("number");

    extension.AddAction("AddCamera",
                   GD_T("Add a camera to a layer"),
                   GD_T("This action add a camera to a layer"),
                   GD_T("Add a camera to layer _PARAM1_"),
                   GD_T("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Width"), "",true)
        .AddParameter("expression", GD_T("Height"), "",true)
        .AddParameter("expression", GD_T("Render zone: Top left side: X Position ( Between 0 and 1 )"), "",true)
        .AddParameter("expression", GD_T("Render zone: Top left side: Y Position ( Between 0 and 1 )"), "",true)
        .AddParameter("expression", GD_T("Render zone: Bottom right side: X Position ( Between 0 and 1 )"), "",true)
        .AddParameter("expression", GD_T("Render zone: Bottom right side: Y Position ( Between 0 and 1 )"), "",true)
        .MarkAsComplex();

    extension.AddAction("DeleteCamera",
                   GD_T("Delete a camera of a layer"),
                   GD_T("Remove the specified camera from a layer"),
                   GD_T("Delete camera _PARAM2_ from layer _PARAM1_"),
                   GD_T("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number"), "",false)
        .MarkAsComplex();

    extension.AddAction("CameraSize",
                   GD_T("Modify the size of a camera"),
                   GD_T("This action modify the size of a camera of the specified layer. The zoom will be reset."),
                   GD_T("Change the size of camera _PARAM2_ of _PARAM1_ to _PARAM3_*_PARAM4_"),
                   GD_T("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number"), "",false)
        .AddParameter("expression", GD_T("Width"), "",false)
        .AddParameter("expression", GD_T("Height"), "",false)
        .MarkAsComplex();

    extension.AddAction("CameraViewport",
                   GD_T("Modify the render zone of a camera"),
                   GD_T("This action modify the render zone of a camera of the specified layer."),
                   GD_T("Set the render zone of camera _PARAM2_ from layer _PARAM1_ to PARAM3_;_PARAM4_ _PARAM5_;_PARAM6_"),
                   GD_T("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number"), "",false)
        .AddParameter("expression", GD_T("Render zone: Top left side: X Position ( Between 0 and 1 )"), "",false)
        .AddParameter("expression", GD_T("Render zone: Top left side: X Position ( Between 0 and 1 )"), "",false)
        .AddParameter("expression", GD_T("Render zone: Bottom right side: X Position ( Between 0 and 1 )"), "",false)
        .AddParameter("expression", GD_T("Render zone: Bottom right side: X Position ( Between 0 and 1 )"), "",false)
        .MarkAsComplex();

    extension.AddAction("ZoomCamera",
                   GD_T("Change camera zoom."),
                   GD_T("Change camera zoom."),
                   GD_T("Change camera zoom to _PARAM1_ ( layer : _PARAM2_, camera : _PARAM3_ )"),
                   GD_T("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", GD_T("Value ( 1:Initial zoom, 2:Zoom x2, 0.5:Unzoom x2...)"), "",false)
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",true).SetDefaultValue("0");

    extension.AddAction("FixCamera",
                   GD_T("Center the camera on an object within limits"),
                   GD_T("Center the camera on the specified object, without leaving the specified limits."),
                   GD_T("Center the camera on _PARAM1_ ( limit : from _PARAM2_;_PARAM3_ to _PARAM4_;_PARAM5_ )  ( layer : _PARAM7_, camera : _PARAM8_ )"),
                   GD_T("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectPtr", GD_T("Object"))
        .AddParameter("expression", GD_T("Top left side of the boundary: X Position"), "",false)
        .AddParameter("expression", GD_T("Top left side of the boundary: Y Position"), "",false)
        .AddParameter("expression", GD_T("Bottom right side of the boundary: X Position"), "",false)
        .AddParameter("expression", GD_T("Bottom right side of the boundary: Y Position"), "",false)
        .AddParameter("yesorno", GD_T("Anticipating the displacement of the object (yes by default)"), "",true).SetDefaultValue("true")
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",true).SetDefaultValue("0")
        .MarkAsAdvanced();

    extension.AddAction("CentreCamera",
                   GD_T("Center the camera on an object"),
                   GD_T("Center the camera on the specified object."),
                   GD_T("Center camera on _PARAM1_ ( layer : _PARAM3_, camera : _PARAM4_ )"),
                   GD_T("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectPtr", GD_T("Object"))
        .AddParameter("yesorno", GD_T("Anticipating the displacement of the object (yes by default)"), "",true).SetDefaultValue("true")
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",true).SetDefaultValue("0")
        .MarkAsSimple();

    extension.AddAction("ShowLayer",
                   GD_T("Show a layer"),
                   GD_T("Show a layer."),
                   GD_T("Show layer _PARAM1_"),
                   GD_T("Layers and cameras"),
                   "res/actions/layer24.png",
                   "res/actions/layer.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"")
        .MarkAsAdvanced();

    extension.AddAction("HideLayer",
                   GD_T("Hide a layer"),
                   GD_T("Hide a layer."),
                   GD_T("Hide layer _PARAM1_"),
                   GD_T("Layers and cameras"),
                   "res/actions/layer24.png",
                   "res/actions/layer.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"")
        .MarkAsAdvanced();

    extension.AddCondition("LayerVisible",
                   GD_T("Visibility of a layer"),
                   GD_T("Test if a layer is displayed"),
                   GD_T("Layer _PARAM1_ is visible"),
                   GD_T("Layers and cameras"),
                   "res/conditions/layer24.png",
                   "res/conditions/layer.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"")
        .MarkAsAdvanced();

    extension.AddExpression("CameraWidth", GD_T("Width of a camera of a layer"), GD_T("Width of a camera of a layer"), GD_T("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer"), "",false)
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",false).SetDefaultValue("0");

    extension.AddExpression("CameraHeight", GD_T("Height of a camera of a layer"), GD_T("Height of a camera of a layer"), GD_T("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer"), "",false)
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",false).SetDefaultValue("0");

    extension.AddExpression("CameraViewportLeft", GD_T("X position of the top left side point of a render zone"), GD_T("X position of the top left side point of a render zone"), GD_T("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer"), "",false)
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",false).SetDefaultValue("0");

    extension.AddExpression("CameraViewportTop", GD_T("Y position of the top left side point of a render zone"), GD_T("Y position of the top left side point of a render zone"), GD_T("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer"), "",false)
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",false).SetDefaultValue("0");

    extension.AddExpression("CameraViewportRight", GD_T("X position of the bottom right side point of a render zone"), GD_T("X position of the bottom right side point of a render zone"), GD_T("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer"), "",false)
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",false).SetDefaultValue("0");

    extension.AddExpression("CameraViewportBottom", GD_T("Y position of the bottom right side point of a render zone"), GD_T("Y position of the bottom right side point of a render zone"), GD_T("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer"), "",false)
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",false).SetDefaultValue("0");

    extension.AddExpression("CameraX", GD_T("Camera X position"), GD_T("Camera X position"), GD_T("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",true).SetDefaultValue("0");

    extension.AddExpression("VueX", GD_T("Camera X position"), GD_T("Camera X position"), GD_T("Camera"), "res/actions/camera.png")
        .SetHidden()
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",true).SetDefaultValue("0");

    extension.AddExpression("CameraY", GD_T("Camera Y position"), GD_T("Camera Y position"), GD_T("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",true).SetDefaultValue("0");

    extension.AddExpression("VueY", GD_T("Camera Y position"), GD_T("Camera Y position"), GD_T("Camera"), "res/actions/camera.png")
        .SetHidden()
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",true).SetDefaultValue("0");

    extension.AddExpression("CameraRotation", GD_T("Angle of a camera of a layer"), GD_T("Angle of a camera of a layer"), GD_T("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",true).SetDefaultValue("0");

    extension.AddExpression("VueRotation", GD_T("Angle of a camera of a layer"), GD_T("Angle of a camera of a layer"), GD_T("Camera"), "res/actions/camera.png")
        .SetHidden()
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",true).SetDefaultValue("0");

    #endif
}

}
