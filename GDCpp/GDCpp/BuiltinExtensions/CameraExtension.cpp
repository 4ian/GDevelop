/*
 * GDevelop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

#include "GDCpp/BuiltinExtensions/CameraExtension.h"
#include "GDCpp/ExtensionBase.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/BuiltinExtensions/CameraExtension.cpp"
#endif

CameraExtension::CameraExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsCameraExtension(*this);

    #if defined(GD_IDE_ONLY)

    GetAllConditions()["CameraX"].codeExtraInformation.SetFunctionName("GetCameraX").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllConditions()["CameraY"].codeExtraInformation.SetFunctionName("GetCameraY").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    GetAllActions()["CameraX"].codeExtraInformation.SetFunctionName("SetCameraX").SetManipulatedType("number").SetAssociatedGetter("GetCameraX").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllActions()["CameraY"].codeExtraInformation.SetFunctionName("SetCameraY").SetManipulatedType("number").SetAssociatedGetter("GetCameraY").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    GetAllConditions()["CameraWidth"].codeExtraInformation.SetFunctionName("GetCameraWidth").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllConditions()["CameraHeight"].codeExtraInformation.SetFunctionName("GetCameraHeight").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllConditions()["CameraAngle"].codeExtraInformation.SetFunctionName("GetCameraAngle").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    GetAllActions()["RotateCamera"].codeExtraInformation.SetFunctionName("SetCameraAngle").SetAssociatedGetter("GetCameraAngle").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    GetAllActions()["AddCamera"].codeExtraInformation.SetFunctionName("AddCamera").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    GetAllActions()["DeleteCamera"].codeExtraInformation.SetFunctionName("DeleteCamera").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    GetAllActions()["CameraSize"].codeExtraInformation.SetFunctionName("SetCameraSize").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    GetAllActions()["CameraViewport"].codeExtraInformation.SetFunctionName("SetCameraViewport").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    GetAllActions()["ZoomCamera"].codeExtraInformation.SetFunctionName("SetCameraZoom").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    GetAllActions()["FixCamera"].codeExtraInformation.SetFunctionName("CenterCameraOnObjectWithLimits").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    GetAllActions()["CentreCamera"].codeExtraInformation.SetFunctionName("CenterCameraOnObject").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    GetAllActions()["ShowLayer"].codeExtraInformation.SetFunctionName("ShowLayer").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllActions()["HideLayer"].codeExtraInformation.SetFunctionName("HideLayer").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");;

    GetAllConditions()["LayerVisible"].codeExtraInformation.SetFunctionName("LayerVisible").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllExpressions()["CameraWidth"].codeExtraInformation.SetFunctionName("GetCameraWidth").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllExpressions()["CameraHeight"].codeExtraInformation.SetFunctionName("GetCameraHeight").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllExpressions()["CameraViewportLeft"].codeExtraInformation.SetFunctionName("GetCameraViewportLeft").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllExpressions()["CameraViewportTop"].codeExtraInformation.SetFunctionName("GetCameraViewportTop").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllExpressions()["CameraViewportRight"].codeExtraInformation.SetFunctionName("GetCameraViewportRight").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllExpressions()["CameraViewportBottom"].codeExtraInformation.SetFunctionName("GetCameraViewportBottom").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllExpressions()["CameraX"].codeExtraInformation.SetFunctionName("GetCameraX").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllExpressions()["VueX"].codeExtraInformation.SetFunctionName("GetCameraX").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllExpressions()["CameraY"].codeExtraInformation.SetFunctionName("GetCameraY").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllExpressions()["VueY"].codeExtraInformation.SetFunctionName("GetCameraY").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllExpressions()["CameraRotation"].codeExtraInformation.SetFunctionName("GetCameraRotation").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllExpressions()["VueRotation"].codeExtraInformation.SetFunctionName("GetCameraRotation").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    #endif
}

