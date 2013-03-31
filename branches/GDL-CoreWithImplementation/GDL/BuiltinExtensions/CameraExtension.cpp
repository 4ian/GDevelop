/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/BuiltinExtensions/CameraExtension.h"
#include "GDL/ExtensionBase.h"

CameraExtension::CameraExtension()
{
    DECLARE_THE_EXTENSION("BuiltinCamera",
                          _("Cameras and layers features"),
                          _("Builtin camera extension"),
                          "Compil Games",
                          "Freeware")
    #if defined(GD_IDE_ONLY)

    DECLARE_CONDITION("CameraX",
                   _("Camera X position"),
                   _("Test the X position of a camera."),
                   _("X position of camera _PARAM4_ is _PARAM2__PARAM1_ ( Layer: _PARAM3_ )"),
                   _("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Value to test"), "",false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "",false);
        instrInfo.AddParameter("layer", _("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraX").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("CameraY",
                   _("Camera Y position"),
                   _("Test the Y position of a camera."),
                   _("The Y position of camera _PARAM4_ is _PARAM2__PARAM1_  ( Layer: _PARAM3_ )"),
                   _("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Value to test"), "",false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "",false);
        instrInfo.AddParameter("layer", _("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Camera number ( default : 0 )"), "",false).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraY").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");

    DECLARE_END_CONDITION()

    DECLARE_ACTION("CameraX",
                   _("Camera X position"),
                   _("Change X position of the specified camera."),
                   _("Do _PARAM2__PARAM1_ to X position of camera _PARAM4_ ( Layer: _PARAM3_ )"),
                   _("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Value"), "",false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "",false);
        instrInfo.AddParameter("layer", _("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("SetCameraX").SetManipulatedType("number").SetAssociatedGetter("GetCameraX").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("CameraY",
                   _("Camera Y position"),
                   _("Change Y position of the specified camera."),
                   _("Do _PARAM2__PARAM1_ to Y position of camera _PARAM4_ ( Layer: _PARAM3_ )"),
                   _("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Value"), "",false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "",false);
        instrInfo.AddParameter("layer", _("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("SetCameraY").SetManipulatedType("number").SetAssociatedGetter("GetCameraY").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");

    DECLARE_END_ACTION()

    DECLARE_CONDITION("CameraWidth",
                   _("Width of a camera"),
                   _("Test the width of a camera of a layer"),
                   _("The width of camera _PARAM2_ of layer _PARAM1_ is _PARAM3__PARAM4_"),
                   _("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Layer"), "",false).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Camera number"), "",false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "",false);
        instrInfo.AddParameter("expression", _("Value to test"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraWidth").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("CameraHeight",
                   _("Height of a camera"),
                   _("Test the height of a camera of a layer"),
                   _("The height of camera _PARAM2_ of layer _PARAM1_ is _PARAM3__PARAM4_"),
                   _("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Camera number"), "",false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "",false);
        instrInfo.AddParameter("expression", _("Value to test"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraHeight").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("CameraAngle",
                   _("Angle of a camera of a layer"),
                   _("Test a camera angle."),
                   _("Angle of camera is _PARAM2__PARAM1_ ( layer : _PARAM3_, camera : _PARAM4_ )"),
                   _("Layers and cameras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Value to test"), "",false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "",false);
        instrInfo.AddParameter("layer", _("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraAngle").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");

    DECLARE_END_CONDITION()

    DECLARE_ACTION("RotateCamera",
                   _("Change camera angle"),
                   _("This action modify the angle of a camera of the specified layer."),
                   _("Do _PARAM2__PARAM1_ to angle of camera ( layer : _PARAM3_, camera : _PARAM4_ )"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Value"), "",false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "",false);
        instrInfo.AddParameter("layer", _("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("SetCameraAngle").SetAssociatedGetter("GetCameraAngle").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("AddCamera",
                   _("Add a camera to a layer"),
                   _("This action add a camera to a layer"),
                   _("Add a camera to layer _PARAM1_"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Width"), "",true);
        instrInfo.AddParameter("expression", _("Height"), "",true);
        instrInfo.AddParameter("expression", _("Render zone: Top left side: X Position ( Between 0 and 1 )"), "",true);
        instrInfo.AddParameter("expression", _("Render zone: Top left side: Y Position ( Between 0 and 1 )"), "",true);
        instrInfo.AddParameter("expression", _("Render zone: Bottom right side: X Position ( Between 0 and 1 )"), "",true);
        instrInfo.AddParameter("expression", _("Render zone: Bottom right side: Y Position ( Between 0 and 1 )"), "",true);

        instrInfo.cppCallingInformation.SetFunctionName("AddCamera").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");
    DECLARE_END_ACTION()

    DECLARE_ACTION("DeleteCamera",
                   _("Delete a camera of a layer"),
                   _("Remove the specified camera from a layer"),
                   _("Delete camera _PARAM2_ from layer _PARAM1_"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Camera number"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("DeleteCamera").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");
    DECLARE_END_ACTION()

    DECLARE_ACTION("CameraSize",
                   _("Modify the size of a camera"),
                   _("This action modify the size of a camera of the specified layer. The zoom will be reset."),
                   _("Change the size of camera _PARAM2_ of _PARAM1_ to _PARAM3_*_PARAM4_"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Camera number"), "",false);
        instrInfo.AddParameter("expression", _("Width"), "",false);
        instrInfo.AddParameter("expression", _("Height"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("SetCameraSize").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");
    DECLARE_END_ACTION()

    DECLARE_ACTION("CameraViewport",
                   _("Modify the render zone of a camera"),
                   _("This action modify the render zone of a camera of the specified layer."),
                   _("Set the render zone of camera _PARAM2_ from layer _PARAM1_ to PARAM3_;_PARAM4_ _PARAM5_;_PARAM6_"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Camera number"), "",false);
        instrInfo.AddParameter("expression", _("Render zone: Top left side: X Position ( Between 0 and 1 )"), "",false);
        instrInfo.AddParameter("expression", _("Render zone: Top left side: X Position ( Between 0 and 1 )"), "",false);
        instrInfo.AddParameter("expression", _("Render zone: Bottom right side: X Position ( Between 0 and 1 )"), "",false);
        instrInfo.AddParameter("expression", _("Render zone: Bottom right side: X Position ( Between 0 and 1 )"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("SetCameraViewport").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("ZoomCamera",
                   _("Change camera zoom."),
                   _("Change camera zoom."),
                   _("Change camera zoom to _PARAM1_ ( layer : _PARAM2_, camera : _PARAM3_ )"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Value ( 1:Initial zoom, 2:Zoom x2, 0.5:Unzoom x2...)"), "",false);
        instrInfo.AddParameter("layer", _("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("SetCameraZoom").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("FixCamera",
                   _("Center the camera on an object within limits"),
                   _("Center the camera on the specified object, without leaving the specified limits."),
                   _("Center the camera on _PARAM1_ ( limit : from _PARAM3_;_PARAM4_ to _PARAM5_;_PARAM6_ )  ( layer : _PARAM8_, camera : _PARAM9_ )"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("object", _("Object"), "", false);
        instrInfo.AddCodeOnlyParameter("ptrToObjectOfParameter", "1");
        instrInfo.AddParameter("expression", _("Top left side of the boundary: X Position"), "",false);
        instrInfo.AddParameter("expression", _("Top left side of the boundary: Y Position"), "",false);
        instrInfo.AddParameter("expression", _("Bottom right side of the boundary: X Position"), "",false);
        instrInfo.AddParameter("expression", _("Bottom right side of the boundary: Y Position"), "",false);
        instrInfo.AddParameter("yesorno", _("Anticipating the displacement of the object (yes by default)"), "",true).SetDefaultValue("true");
        instrInfo.AddParameter("layer", _("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("CenterCameraOnObjectWithLimits").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("CentreCamera",
                   _("Center the camera on an object"),
                   _("Center the camera on the specified object."),
                   _("Center camera on _PARAM1_ ( layer : _PARAM4_, camera : _PARAM5_ )"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("object", _("Object"), "", false);
        instrInfo.AddCodeOnlyParameter("ptrToObjectOfParameter", "1");
        instrInfo.AddParameter("yesorno", _("Anticipating the displacement of the object (yes by default)"), "",true).SetDefaultValue("true");
        instrInfo.AddParameter("layer", _("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0");


        instrInfo.cppCallingInformation.SetFunctionName("CenterCameraOnObject").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("ShowLayer",
                   _("Show a layer"),
                   _("Show a layer."),
                   _("Show layer _PARAM1_"),
                   _("Layers and cameras"),
                   "res/actions/layer24.png",
                   "res/actions/layer.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"");

        instrInfo.cppCallingInformation.SetFunctionName("ShowLayer").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("HideLayer",
                   _("Hide a layer"),
                   _("Hide a layer."),
                   _("Hide layer _PARAM1_"),
                   _("Layers and cameras"),
                   "res/actions/layer24.png",
                   "res/actions/layer.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"");

        instrInfo.cppCallingInformation.SetFunctionName("HideLayer").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");;

    DECLARE_END_ACTION()

    DECLARE_CONDITION("LayerVisible",
                   _("Visibility of a layer"),
                   _("Test if a layer is displayed"),
                   _("Layer _PARAM1_ is visible"),
                   _("Layers and cameras"),
                   "res/conditions/layer24.png",
                   "res/conditions/layer.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"");

        instrInfo.cppCallingInformation.SetFunctionName("LayerVisible").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");;

    DECLARE_END_CONDITION()

    DECLARE_EXPRESSION("CameraWidth", _("Width of a camera of a layer"), _("Width of a camera of a layer"), _("Camera"), "res/actions/camera.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Layer"), "",false);
        instrInfo.AddParameter("expression", _("Camera number ( default : 0 )"), "",false).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraWidth").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("CameraHeight", _("Height of a camera of a layer"), _("Height of a camera of a layer"), _("Camera"), "res/actions/camera.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Layer"), "",false);
        instrInfo.AddParameter("expression", _("Camera number ( default : 0 )"), "",false).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraHeight").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("CameraViewportLeft", _("X position of the top left side point of a render zone"), _("X position of the top left side point of a render zone"), _("Camera"), "res/actions/camera.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Layer"), "",false);
        instrInfo.AddParameter("expression", _("Camera number ( default : 0 )"), "",false).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraViewportLeft").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("CameraViewportTop", _("Y position of the top left side point of a render zone"), _("Y position of the top left side point of a render zone"), _("Camera"), "res/actions/camera.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Layer"), "",false);
        instrInfo.AddParameter("expression", _("Camera number ( default : 0 )"), "",false).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraViewportTop").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("CameraViewportRight", _("X position of the bottom right side point of a render zone"), _("X position of the bottom right side point of a render zone"), _("Camera"), "res/actions/camera.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Layer"), "",false);
        instrInfo.AddParameter("expression", _("Camera number ( default : 0 )"), "",false).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraViewportRight").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("CameraViewportBottom", _("Y position of the bottom right side point of a render zone"), _("Y position of the bottom right side point of a render zone"), _("Camera"), "res/actions/camera.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Layer"), "",false);
        instrInfo.AddParameter("expression", _("Camera number ( default : 0 )"), "",false).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraViewportBottom").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("CameraX", _("Camera X position"), _("Camera X position"), _("Camera"), "res/actions/camera.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Layer"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraX").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("VueX", _("Camera X position"), _("Camera X position"), _("Camera"), "res/actions/camera.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Layer"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraX").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");
        instrInfo.SetHidden();
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("CameraY", _("Camera Y position"), _("Camera Y position"), _("Camera"), "res/actions/camera.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Layer"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraY").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("VueY", _("Camera Y position"), _("Camera Y position"), _("Camera"), "res/actions/camera.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Layer"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraY").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");
        instrInfo.SetHidden();
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("CameraRotation", _("Angle of a camera of a layer"), _("Angle of a camera of a layer"), _("Camera"), "res/actions/camera.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Layer"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraRotation").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("VueRotation", _("Angle of a camera of a layer"), _("Angle of a camera of a layer"), _("Camera"), "res/actions/camera.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Layer"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Camera number ( default : 0 )"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraRotation").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneCameraTools.h");
        instrInfo.SetHidden();
    DECLARE_END_EXPRESSION()
    #endif
}

