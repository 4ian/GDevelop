/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/BuiltinExtensions/CameraExtension.h"
#include "GDL/ExtensionBase.h"

CameraExtension::CameraExtension()
{
    SetExtensionInformation("BuiltinCamera",
                          _("Cameras and layers features"),
                          _("Builtin camera extension"),
                          "Compil Games",
                          "Freeware");
    #if defined(GD_IDE_ONLY)

    AddCondition("CameraX",
                   _("Camera X position"),
                   _("Test the X position of a camera."),
                   _("X position of camera _PARAM4_ is _PARAM1__PARAM2_ ( Layer: _PARAM3_ )"),
                   _("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("relationalOperator", _("Sign of the test"), "",false)
        .AddParameter("expression", _("Value to test"), "",false)
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCameraX").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");



    AddCondition("CameraY",
                   _("Camera Y position"),
                   _("Test the Y position of a camera."),
                   _("The Y position of camera _PARAM4_ is _PARAM1__PARAM2_  ( Layer: _PARAM3_ )"),
                   _("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("relationalOperator", _("Sign of the test"), "",false)
        .AddParameter("expression", _("Value to test"), "",false)
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number ( default : 0 )"), "",false).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCameraY").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");



    AddAction("CameraX",
                   _("Camera X position"),
                   _("Change X position of the specified camera."),
                   _("Do _PARAM1__PARAM2_ to X position of camera _PARAM4_ ( Layer: _PARAM3_ )"),
                   _("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("operator", _("Modification's sign"), "",false)
        .AddParameter("expression", _("Value"), "",false)
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("SetCameraX").SetManipulatedType("number").SetAssociatedGetter("GetCameraX").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");

    AddAction("CameraY",
                   _("Camera Y position"),
                   _("Change Y position of the specified camera."),
                   _("Do _PARAM1__PARAM2_ to Y position of camera _PARAM4_ ( Layer: _PARAM3_ )"),
                   _("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("operator", _("Modification's sign"), "",false)
        .AddParameter("expression", _("Value"), "",false)
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("SetCameraY").SetManipulatedType("number").SetAssociatedGetter("GetCameraY").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");

    AddCondition("CameraWidth",
                   _("Width of a camera"),
                   _("Test the width of a camera of a layer"),
                   _("The width of camera _PARAM2_ of layer _PARAM1_ is _PARAM3__PARAM4_"),
                   _("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "",false).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number"), "",false)
        .AddParameter("relationalOperator", _("Sign of the test"), "",false)
        .AddParameter("expression", _("Value to test"), "",false)
        .codeExtraInformation.SetFunctionName("GetCameraWidth").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");



    AddCondition("CameraHeight",
                   _("Height of a camera"),
                   _("Test the height of a camera of a layer"),
                   _("The height of camera _PARAM2_ of layer _PARAM1_ is _PARAM3__PARAM4_"),
                   _("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number"), "",false)
        .AddParameter("relationalOperator", _("Sign of the test"), "",false)
        .AddParameter("expression", _("Value to test"), "",false)
        .codeExtraInformation.SetFunctionName("GetCameraHeight").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");



    AddCondition("CameraAngle",
                   _("Angle of a camera of a layer"),
                   _("Test a camera angle."),
                   _("Angle of camera is _PARAM1__PARAM2_ ( layer : _PARAM3_, camera : _PARAM4_ )"),
                   _("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("relationalOperator", _("Sign of the test"), "",false)
        .AddParameter("expression", _("Value to test"), "",false)
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCameraAngle").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");



    AddAction("RotateCamera",
                   _("Change camera angle"),
                   _("This action modify the angle of a camera of the specified layer."),
                   _("Do _PARAM1__PARAM2_ to angle of camera ( layer : _PARAM3_, camera : _PARAM4_ )"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("operator", _("Modification's sign"), "",false)
        .AddParameter("expression", _("Value"), "",false)
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("SetCameraAngle").SetAssociatedGetter("GetCameraAngle").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");

    AddAction("AddCamera",
                   _("Add a camera to a layer"),
                   _("This action add a camera to a layer"),
                   _("Add a camera to layer _PARAM1_"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Width"), "",true)
        .AddParameter("expression", _("Height"), "",true)
        .AddParameter("expression", _("Render zone: Top left side: X Position ( Between 0 and 1 )"), "",true)
        .AddParameter("expression", _("Render zone: Top left side: Y Position ( Between 0 and 1 )"), "",true)
        .AddParameter("expression", _("Render zone: Bottom right side: X Position ( Between 0 and 1 )"), "",true)
        .AddParameter("expression", _("Render zone: Bottom right side: Y Position ( Between 0 and 1 )"), "",true)
        .codeExtraInformation.SetFunctionName("AddCamera").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");

    AddAction("DeleteCamera",
                   _("Delete a camera of a layer"),
                   _("Remove the specified camera from a layer"),
                   _("Delete camera _PARAM2_ from layer _PARAM1_"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number"), "",false)
        .codeExtraInformation.SetFunctionName("DeleteCamera").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");

    AddAction("CameraSize",
                   _("Modify the size of a camera"),
                   _("This action modify the size of a camera of the specified layer. The zoom will be reset."),
                   _("Change the size of camera _PARAM2_ of _PARAM1_ to _PARAM3_*_PARAM4_"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number"), "",false)
        .AddParameter("expression", _("Width"), "",false)
        .AddParameter("expression", _("Height"), "",false)
        .codeExtraInformation.SetFunctionName("SetCameraSize").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");

    AddAction("CameraViewport",
                   _("Modify the render zone of a camera"),
                   _("This action modify the render zone of a camera of the specified layer."),
                   _("Set the render zone of camera _PARAM2_ from layer _PARAM1_ to PARAM3_;_PARAM4_ _PARAM5_;_PARAM6_"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number"), "",false)
        .AddParameter("expression", _("Render zone: Top left side: X Position ( Between 0 and 1 )"), "",false)
        .AddParameter("expression", _("Render zone: Top left side: X Position ( Between 0 and 1 )"), "",false)
        .AddParameter("expression", _("Render zone: Bottom right side: X Position ( Between 0 and 1 )"), "",false)
        .AddParameter("expression", _("Render zone: Bottom right side: X Position ( Between 0 and 1 )"), "",false)
        .codeExtraInformation.SetFunctionName("SetCameraViewport").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");

    AddAction("ZoomCamera",
                   _("Change camera zoom."),
                   _("Change camera zoom."),
                   _("Change camera zoom to _PARAM1_ ( layer : _PARAM2_, camera : _PARAM3_ )"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Value ( 1:Initial zoom, 2:Zoom x2, 0.5:Unzoom x2...)"), "",false)
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("SetCameraZoom").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");

    AddAction("FixCamera",
                   _("Center the camera on an object within limits"),
                   _("Center the camera on the specified object, without leaving the specified limits."),
                   _("Center the camera on _PARAM1_ ( limit : from _PARAM2_;_PARAM3_ to _PARAM4_;_PARAM5_ )  ( layer : _PARAM7_, camera : _PARAM8_ )"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectPtr", _("Object"))
        .AddParameter("expression", _("Top left side of the boundary: X Position"), "",false)
        .AddParameter("expression", _("Top left side of the boundary: Y Position"), "",false)
        .AddParameter("expression", _("Bottom right side of the boundary: X Position"), "",false)
        .AddParameter("expression", _("Bottom right side of the boundary: Y Position"), "",false)
        .AddParameter("yesorno", _("Anticipating the displacement of the object (yes by default)"), "",true).SetDefaultValue("true")
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("CenterCameraOnObjectWithLimits").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");

    AddAction("CentreCamera",
                   _("Center the camera on an object"),
                   _("Center the camera on the specified object."),
                   _("Center camera on _PARAM1_ ( layer : _PARAM4_, camera : _PARAM5_ )"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("objectPtr", _("Object"))
        .AddParameter("yesorno", _("Anticipating the displacement of the object (yes by default)"), "",true).SetDefaultValue("true")
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0")

        .codeExtraInformation.SetFunctionName("CenterCameraOnObject").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");

    AddAction("ShowLayer",
                   _("Show a layer"),
                   _("Show a layer."),
                   _("Show layer _PARAM1_"),
                   _("Layers and cameras"),
                   "res/actions/layer24.png",
                   "res/actions/layer.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"")
        .codeExtraInformation.SetFunctionName("ShowLayer").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    AddAction("HideLayer",
                   _("Hide a layer"),
                   _("Hide a layer."),
                   _("Hide layer _PARAM1_"),
                   _("Layers and cameras"),
                   "res/actions/layer24.png",
                   "res/actions/layer.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"")
        .codeExtraInformation.SetFunctionName("HideLayer").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");;

    AddCondition("LayerVisible",
                   _("Visibility of a layer"),
                   _("Test if a layer is displayed"),
                   _("Layer _PARAM1_ is visible"),
                   _("Layers and cameras"),
                   "res/conditions/layer24.png",
                   "res/conditions/layer.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"")
        .codeExtraInformation.SetFunctionName("LayerVisible").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");;



    AddExpression("CameraWidth", _("Width of a camera of a layer"), _("Width of a camera of a layer"), _("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "",false)
        .AddParameter("expression", _("Camera number ( default : 0 )"), "",false).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCameraWidth").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");


    AddExpression("CameraHeight", _("Height of a camera of a layer"), _("Height of a camera of a layer"), _("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "",false)
        .AddParameter("expression", _("Camera number ( default : 0 )"), "",false).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCameraHeight").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");


    AddExpression("CameraViewportLeft", _("X position of the top left side point of a render zone"), _("X position of the top left side point of a render zone"), _("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "",false)
        .AddParameter("expression", _("Camera number ( default : 0 )"), "",false).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCameraViewportLeft").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");


    AddExpression("CameraViewportTop", _("Y position of the top left side point of a render zone"), _("Y position of the top left side point of a render zone"), _("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "",false)
        .AddParameter("expression", _("Camera number ( default : 0 )"), "",false).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCameraViewportTop").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");


    AddExpression("CameraViewportRight", _("X position of the bottom right side point of a render zone"), _("X position of the bottom right side point of a render zone"), _("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "",false)
        .AddParameter("expression", _("Camera number ( default : 0 )"), "",false).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCameraViewportRight").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");


    AddExpression("CameraViewportBottom", _("Y position of the bottom right side point of a render zone"), _("Y position of the bottom right side point of a render zone"), _("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "",false)
        .AddParameter("expression", _("Camera number ( default : 0 )"), "",false).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCameraViewportBottom").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");


    AddExpression("CameraX", _("Camera X position"), _("Camera X position"), _("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCameraX").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");


    AddExpression("VueX", _("Camera X position"), _("Camera X position"), _("Camera"), "res/actions/camera.png")
        .SetHidden()
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCameraX").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");


    AddExpression("CameraY", _("Camera Y position"), _("Camera Y position"), _("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCameraY").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");


    AddExpression("VueY", _("Camera Y position"), _("Camera Y position"), _("Camera"), "res/actions/camera.png")
        .SetHidden()
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCameraY").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");


    AddExpression("CameraRotation", _("Angle of a camera of a layer"), _("Angle of a camera of a layer"), _("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCameraRotation").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");


    AddExpression("VueRotation", _("Angle of a camera of a layer"), _("Angle of a camera of a layer"), _("Camera"), "res/actions/camera.png")
        .SetHidden()
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "",true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCameraRotation").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");

    #endif
}

