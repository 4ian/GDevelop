/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
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

    GetAllConditions()["CameraX"].SetFunctionName("GetCameraX").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllConditions()["CameraY"].SetFunctionName("GetCameraY").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    GetAllActions()["CameraX"].SetFunctionName("SetCameraX").SetManipulatedType("number").SetGetter("GetCameraX").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllActions()["CameraY"].SetFunctionName("SetCameraY").SetManipulatedType("number").SetGetter("GetCameraY").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    GetAllConditions()["CameraWidth"].SetFunctionName("GetCameraWidth").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllConditions()["CameraHeight"].SetFunctionName("GetCameraHeight").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllConditions()["CameraAngle"].SetFunctionName("GetCameraAngle").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    GetAllActions()["RotateCamera"].SetFunctionName("SetCameraAngle").SetGetter("GetCameraAngle").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    GetAllActions()["AddCamera"].SetFunctionName("AddCamera").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    GetAllActions()["DeleteCamera"].SetFunctionName("DeleteCamera").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    GetAllActions()["CameraSize"].SetFunctionName("SetCameraSize").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    GetAllActions()["CameraViewport"].SetFunctionName("SetCameraViewport").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    GetAllActions()["ZoomCamera"].SetFunctionName("SetCameraZoom").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    GetAllActions()["FixCamera"].SetFunctionName("CenterCameraOnObjectWithLimits").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    GetAllActions()["CentreCamera"].SetFunctionName("CenterCameraOnObject").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    GetAllActions()["ShowLayer"].SetFunctionName("ShowLayer").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllActions()["HideLayer"].SetFunctionName("HideLayer").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");;

    GetAllConditions()["LayerVisible"].SetFunctionName("LayerVisible").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllExpressions()["CameraWidth"].SetFunctionName("GetCameraWidth").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllExpressions()["CameraHeight"].SetFunctionName("GetCameraHeight").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllExpressions()["CameraViewportLeft"].SetFunctionName("GetCameraViewportLeft").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllExpressions()["CameraViewportTop"].SetFunctionName("GetCameraViewportTop").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllExpressions()["CameraViewportRight"].SetFunctionName("GetCameraViewportRight").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllExpressions()["CameraViewportBottom"].SetFunctionName("GetCameraViewportBottom").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllExpressions()["CameraX"].SetFunctionName("GetCameraX").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllExpressions()["VueX"].SetFunctionName("GetCameraX").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllExpressions()["CameraY"].SetFunctionName("GetCameraY").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllExpressions()["VueY"].SetFunctionName("GetCameraY").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllExpressions()["CameraRotation"].SetFunctionName("GetCameraRotation").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");
    GetAllExpressions()["VueRotation"].SetFunctionName("GetCameraRotation").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneCameraTools.h");

    #endif
}

