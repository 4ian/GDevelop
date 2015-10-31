/*
 * GDevelop JS Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "CameraExtension.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs
{

CameraExtension::CameraExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsCameraExtension(*this);

    SetExtensionInformation("BuiltinCamera",
                          _("Cameras and layers features"),
                          _("Builtin camera extension"),
                          "Florian Rival",
                          "Open source (MIT License)");

    GetAllActions()["CameraX"].SetFunctionName("gdjs.evtTools.camera.setCameraX").SetGetter("gdjs.evtTools.camera.getCameraX");
    GetAllActions()["CameraY"].SetFunctionName("gdjs.evtTools.camera.setCameraY").SetGetter("gdjs.evtTools.camera.getCameraY");
    GetAllConditions()["CameraX"].SetFunctionName("gdjs.evtTools.camera.getCameraX");
    GetAllConditions()["CameraY"].SetFunctionName("gdjs.evtTools.camera.getCameraY");
    GetAllConditions()["CameraWidth"].SetFunctionName("gdjs.evtTools.camera.getCameraWidth");
    GetAllConditions()["CameraHeight"].SetFunctionName("gdjs.evtTools.camera.getCameraHeight");
    GetAllActions()["ShowLayer"].SetFunctionName("gdjs.evtTools.camera.showLayer");
    GetAllActions()["HideLayer"].SetFunctionName("gdjs.evtTools.camera.hideLayer");
    GetAllConditions()["LayerVisible"].SetFunctionName("gdjs.evtTools.camera.layerIsVisible");
    GetAllConditions()["CameraAngle"].SetFunctionName("gdjs.evtTools.camera.getCameraRotation");
    GetAllActions()["RotateCamera"].SetFunctionName("gdjs.evtTools.camera.setCameraRotation").SetGetter("gdjs.evtTools.camera.getCameraRotation");
    GetAllActions()["ZoomCamera"].SetFunctionName("gdjs.evtTools.camera.setCameraZoom");

    GetAllExpressions()["CameraX"].SetFunctionName("gdjs.evtTools.camera.getCameraX");
    GetAllExpressions()["VueX"].SetFunctionName("gdjs.evtTools.camera.getCameraX");
    GetAllExpressions()["CameraY"].SetFunctionName("gdjs.evtTools.camera.getCameraY");
    GetAllExpressions()["VueY"].SetFunctionName("gdjs.evtTools.camera.getCameraY");
    GetAllExpressions()["CameraRotation"].SetFunctionName("gdjs.evtTools.camera.getCameraRotation");
    GetAllExpressions()["VueRotation"].SetFunctionName("gdjs.evtTools.camera.getCameraRotation");
    GetAllExpressions()["CameraWidth"].SetFunctionName("gdjs.evtTools.camera.getCameraWidth");
    GetAllExpressions()["CameraHeight"].SetFunctionName("gdjs.evtTools.camera.getCameraHeight");

    GetAllActions()["FixCamera"].SetFunctionName("gdjs.evtTools.camera.centerCameraWithinLimits");
    GetAllActions()["CentreCamera"].SetFunctionName("gdjs.evtTools.camera.centerCamera");

    StripUnimplementedInstructionsAndExpressions(); //Unimplemented things are listed here:
/*
    AddAction("AddCamera",
                   _("Add a camera to a layer"),
                   _("This action add a camera to a layer"),
                   _("Add a camera to layer _PARAM1_"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer (base layer if empty)")).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Width"), "",true)
        .AddParameter("expression", _("Height"), "",true)
        .AddParameter("expression", _("Render zone: Top left side: X Position ( Between 0 and 1 )"), "",true)
        .AddParameter("expression", _("Render zone: Top left side: Y Position ( Between 0 and 1 )"), "",true)
        .AddParameter("expression", _("Render zone: Bottom right side: X Position ( Between 0 and 1 )"), "",true)
        .AddParameter("expression", _("Render zone: Bottom right side: Y Position ( Between 0 and 1 )"), "",true)
        .SetFunctionName("AddCamera").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");

    AddAction("DeleteCamera",
                   _("Delete a camera of a layer"),
                   _("Remove the specified camera from a layer"),
                   _("Delete camera _PARAM2_ from layer _PARAM1_"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer (base layer if empty)")).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number"))
        .SetFunctionName("DeleteCamera").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");

    AddAction("CameraSize",
                   _("Modify the size of a camera"),
                   _("This action modify the size of a camera of the specified layer. The zoom will be reset."),
                   _("Change the size of camera _PARAM2_ of _PARAM1_ to _PARAM3_*_PARAM4_"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer (base layer if empty)")).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number"))
        .AddParameter("expression", _("Width"))
        .AddParameter("expression", _("Height"))
        .SetFunctionName("SetCameraSize").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");

    AddAction("CameraViewport",
                   _("Modify the render zone of a camera"),
                   _("This action modify the render zone of a camera of the specified layer."),
                   _("Set the render zone of camera _PARAM2_ from layer _PARAM1_ to PARAM3_;_PARAM4_ _PARAM5_;_PARAM6_"),
                   _("Layers and cameras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer (base layer if empty)")).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number"))
        .AddParameter("expression", _("Render zone: Top left side: X Position ( Between 0 and 1 )"))
        .AddParameter("expression", _("Render zone: Top left side: X Position ( Between 0 and 1 )"))
        .AddParameter("expression", _("Render zone: Bottom right side: X Position ( Between 0 and 1 )"))
        .AddParameter("expression", _("Render zone: Bottom right side: X Position ( Between 0 and 1 )"))
        .SetFunctionName("SetCameraViewport").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");

    AddExpression("CameraViewportLeft", _("X position of the top left side point of a render zone"), _("X position of the top left side point of a render zone"), _("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"))
        .AddParameter("expression", _("Camera number (default : 0)")).SetDefaultValue("0")
        .SetFunctionName("GetCameraViewportLeft").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");


    AddExpression("CameraViewportTop", _("Y position of the top left side point of a render zone"), _("Y position of the top left side point of a render zone"), _("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"))
        .AddParameter("expression", _("Camera number (default : 0)")).SetDefaultValue("0")
        .SetFunctionName("GetCameraViewportTop").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");


    AddExpression("CameraViewportRight", _("X position of the bottom right side point of a render zone"), _("X position of the bottom right side point of a render zone"), _("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"))
        .AddParameter("expression", _("Camera number (default : 0)")).SetDefaultValue("0")
        .SetFunctionName("GetCameraViewportRight").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");


    AddExpression("CameraViewportBottom", _("Y position of the bottom right side point of a render zone"), _("Y position of the bottom right side point of a render zone"), _("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"))
        .AddParameter("expression", _("Camera number (default : 0)")).SetDefaultValue("0")
        .SetFunctionName("GetCameraViewportBottom").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");


*/
}

}
