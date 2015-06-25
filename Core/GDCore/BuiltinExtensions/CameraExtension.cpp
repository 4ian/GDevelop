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
                   _("Camera center X position"),
                   _("Compare the X position of a the center of a camera."),
                   GD_T("X position of camera _PARAM4_ is _PARAM1__PARAM2_ ( Layer: _PARAM3_ )"),
                   _("Layers and cameras"),
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
                   _("Camera center Y position"),
                   _("Compare the Y position of a the center of a camera."),
                   GD_T("The Y position of camera _PARAM4_ is _PARAM1__PARAM2_  ( Layer: _PARAM3_ )"),
                   _("Layers and cameras"),
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
                   _("Camera center X position"),
                   _("Change X position of the center of the specified camera."),
                   GD_T("Do _PARAM1__PARAM2_ to X position of camera _PARAM4_ ( Layer: _PARAM3_ )"),
                   _("Layers and cameras"),
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
                   _("Camera center Y position"),
                   _("Change Y position of the center of the specified camera."),
                   GD_T("Do _PARAM1__PARAM2_ to Y position of camera _PARAM4_ ( Layer: _PARAM3_ )"),
                   _("Layers and cameras"),
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
                   _("Width of a camera"),
                   _("Test the width of a camera of a layer"),
                   GD_T("The width of camera _PARAM2_ of layer _PARAM1_ is _PARAM3__PARAM4_"),
                   _("Layers and cameras"),
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
                   _("Height of a camera"),
                   _("Test the height of a camera of a layer"),
                   GD_T("The height of camera _PARAM2_ of layer _PARAM1_ is _PARAM3__PARAM4_"),
                   _("Layers and cameras"),
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
                   _("Angle of a camera of a layer"),
                   _("Test a camera angle."),
                   GD_T("Angle of camera is _PARAM1__PARAM2_ ( layer : _PARAM3_, camera : _PARAM4_ )"),
                   _("Layers and cameras"),
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
                   _("Change camera angle"),
                   _("This action modify the angle of a camera of the specified layer."),
                   GD_T("Do _PARAM1__PARAM2_ to angle of camera ( layer : _PARAM3_, camera : _PARAM4_ )"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("operator", GD_T("Modification's sign"), "",false)
        .AddParameter("expression", GD_T("Value"), "",false)
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",true).SetDefaultValue("0")
        .SetManipulatedType("number");

    extension.AddAction("AddCamera",
                   _("Add a camera to a layer"),
                   _("This action add a camera to a layer"),
                   GD_T("Add a camera to layer _PARAM1_"),
                   _("Layers and cameras"),
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
                   _("Delete a camera of a layer"),
                   _("Remove the specified camera from a layer"),
                   GD_T("Delete camera _PARAM2_ from layer _PARAM1_"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number"), "",false)
        .MarkAsComplex();

    extension.AddAction("CameraSize",
                   _("Modify the size of a camera"),
                   _("This action modify the size of a camera of the specified layer. The zoom will be reset."),
                   GD_T("Change the size of camera _PARAM2_ of _PARAM1_ to _PARAM3_*_PARAM4_"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number"), "",false)
        .AddParameter("expression", GD_T("Width"), "",false)
        .AddParameter("expression", GD_T("Height"), "",false)
        .MarkAsComplex();

    extension.AddAction("CameraViewport",
                   _("Modify the render zone of a camera"),
                   _("This action modify the render zone of a camera of the specified layer."),
                   GD_T("Set the render zone of camera _PARAM2_ from layer _PARAM1_ to PARAM3_;_PARAM4_ _PARAM5_;_PARAM6_"),
                   _("Layers and cameras"),
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
                   _("Change camera zoom."),
                   _("Change camera zoom."),
                   GD_T("Change camera zoom to _PARAM1_ ( layer : _PARAM2_, camera : _PARAM3_ )"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", GD_T("Value ( 1:Initial zoom, 2:Zoom x2, 0.5:Unzoom x2...)"), "",false)
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",true).SetDefaultValue("0");

    extension.AddAction("FixCamera",
                   _("Center the camera on an object within limits"),
                   _("Center the camera on the specified object, without leaving the specified limits."),
                   GD_T("Center the camera on _PARAM1_ ( limit : from _PARAM2_;_PARAM3_ to _PARAM4_;_PARAM5_ )  ( layer : _PARAM7_, camera : _PARAM8_ )"),
                   _("Layers and cameras"),
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
                   _("Center the camera on an object"),
                   _("Center the camera on the specified object."),
                   GD_T("Center camera on _PARAM1_ ( layer : _PARAM3_, camera : _PARAM4_ )"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectPtr", GD_T("Object"))
        .AddParameter("yesorno", GD_T("Anticipating the displacement of the object (yes by default)"), "",true).SetDefaultValue("true")
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",true).SetDefaultValue("0")
        .MarkAsSimple();

    extension.AddAction("ShowLayer",
                   _("Show a layer"),
                   _("Show a layer."),
                   GD_T("Show layer _PARAM1_"),
                   _("Layers and cameras"),
                   "res/actions/layer24.png",
                   "res/actions/layer.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"")
        .MarkAsAdvanced();

    extension.AddAction("HideLayer",
                   _("Hide a layer"),
                   _("Hide a layer."),
                   GD_T("Hide layer _PARAM1_"),
                   _("Layers and cameras"),
                   "res/actions/layer24.png",
                   "res/actions/layer.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"")
        .MarkAsAdvanced();

    extension.AddCondition("LayerVisible",
                   _("Visibility of a layer"),
                   _("Test if a layer is displayed"),
                   GD_T("Layer _PARAM1_ is visible"),
                   _("Layers and cameras"),
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
