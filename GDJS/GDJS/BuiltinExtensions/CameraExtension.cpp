/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
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
                          _("Cameras and layers features"),
                          _("Builtin camera extension"),
                          "Florian Rival",
                          "Open source (LGPL)");

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
        .codeExtraInformation.SetFunctionName("AddCamera").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

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
        .codeExtraInformation.SetFunctionName("DeleteCamera").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

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
        .codeExtraInformation.SetFunctionName("SetCameraSize").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

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
        .codeExtraInformation.SetFunctionName("SetCameraViewport").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    AddExpression("CameraViewportLeft", _("X position of the top left side point of a render zone"), _("X position of the top left side point of a render zone"), _("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "",false)
        .AddParameter("expression", _("Camera number ( default : 0 )"), "",false).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCameraViewportLeft").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");


    AddExpression("CameraViewportTop", _("Y position of the top left side point of a render zone"), _("Y position of the top left side point of a render zone"), _("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "",false)
        .AddParameter("expression", _("Camera number ( default : 0 )"), "",false).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCameraViewportTop").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");


    AddExpression("CameraViewportRight", _("X position of the bottom right side point of a render zone"), _("X position of the bottom right side point of a render zone"), _("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "",false)
        .AddParameter("expression", _("Camera number ( default : 0 )"), "",false).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCameraViewportRight").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");


    AddExpression("CameraViewportBottom", _("Y position of the bottom right side point of a render zone"), _("Y position of the bottom right side point of a render zone"), _("Camera"), "res/actions/camera.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "",false)
        .AddParameter("expression", _("Camera number ( default : 0 )"), "",false).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCameraViewportBottom").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");


*/
}

}
