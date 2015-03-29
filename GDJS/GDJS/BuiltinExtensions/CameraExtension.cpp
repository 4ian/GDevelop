/*
 * GDevelop JS Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "CameraExtension.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs
{

CameraExtension::CameraExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsCameraExtension(*this);

    SetExtensionInformation("BuiltinCamera",
                          GD_T("Cameras and layers features"),
                          GD_T("Builtin camera extension"),
                          "Florian Rival",
                          "Open source (MIT License)");

    GetAllActions()["CameraX"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.camera.setCameraX").SetAssociatedGetter("gdjs.evtTools.camera.getCameraX");
    GetAllActions()["CameraY"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.camera.setCameraY").SetAssociatedGetter("gdjs.evtTools.camera.getCameraY");
    GetAllConditions()["CameraX"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.camera.getCameraX");
    GetAllConditions()["CameraY"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.camera.getCameraY");
    GetAllConditions()["CameraWidth"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.camera.getCameraWidth");
    GetAllConditions()["CameraHeight"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.camera.getCameraHeight");
    GetAllActions()["ShowLayer"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.camera.showLayer");
    GetAllActions()["HideLayer"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.camera.hideLayer");
    GetAllConditions()["LayerVisible"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.camera.layerIsVisible");
    GetAllConditions()["CameraAngle"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.camera.getCameraRotation");
    GetAllActions()["RotateCamera"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.camera.setCameraRotation").SetAssociatedGetter("gdjs.evtTools.camera.getCameraRotation");
    GetAllActions()["ZoomCamera"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.camera.setCameraZoom");

    GetAllExpressions()["CameraX"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.camera.getCameraX");
    GetAllExpressions()["VueX"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.camera.getCameraX");
    GetAllExpressions()["CameraY"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.camera.getCameraY");
    GetAllExpressions()["VueY"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.camera.getCameraY");
    GetAllExpressions()["CameraRotation"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.camera.getCameraRotation");
    GetAllExpressions()["VueRotation"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.camera.getCameraRotation");
    GetAllExpressions()["CameraWidth"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.camera.getCameraWidth");
    GetAllExpressions()["CameraHeight"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.camera.getCameraHeight");

    GetAllActions()["FixCamera"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.camera.centerCameraWithinLimits");
    GetAllActions()["CentreCamera"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.camera.centerCamera");

    StripUnimplementedInstructionsAndExpressions(); //Unimplemented things are listed here:
/*
    AddAction("AddCamera",
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
        .codeExtraInformation.SetFunctionName("AddCamera").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    AddAction("DeleteCamera",
                   GD_T("Delete a camera of a layer"),
                   GD_T("Remove the specified camera from a layer"),
                   GD_T("Delete camera _PARAM2_ from layer _PARAM1_"),
                   GD_T("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",false).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number"), "",false)
        .codeExtraInformation.SetFunctionName("DeleteCamera").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    AddAction("CameraSize",
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
        .codeExtraInformation.SetFunctionName("SetCameraSize").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    AddAction("CameraViewport",
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
        .codeExtraInformation.SetFunctionName("SetCameraViewport").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    AddExpression("CameraViewportLeft", GD_T("X position of the top left side point of a render zone"), GD_T("X position of the top left side point of a render zone"), GD_T("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer"), "",false)
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",false).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCameraViewportLeft").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");


    AddExpression("CameraViewportTop", GD_T("Y position of the top left side point of a render zone"), GD_T("Y position of the top left side point of a render zone"), GD_T("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer"), "",false)
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",false).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCameraViewportTop").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");


    AddExpression("CameraViewportRight", GD_T("X position of the bottom right side point of a render zone"), GD_T("X position of the bottom right side point of a render zone"), GD_T("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer"), "",false)
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",false).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCameraViewportRight").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");


    AddExpression("CameraViewportBottom", GD_T("Y position of the bottom right side point of a render zone"), GD_T("Y position of the bottom right side point of a render zone"), GD_T("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer"), "",false)
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "",false).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCameraViewportBottom").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");


*/
}

}
