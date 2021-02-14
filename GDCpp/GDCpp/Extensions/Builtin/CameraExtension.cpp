/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCpp/Extensions/Builtin/CameraExtension.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCpp/Extensions/ExtensionBase.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/Extensions/Builtin/CameraExtension.cpp"
#endif

CameraExtension::CameraExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsCameraExtension(*this);

#if defined(GD_IDE_ONLY)

  GetAllConditions()["CameraX"]
      .SetFunctionName("GetCameraX")
      .SetManipulatedType("number")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");
  GetAllConditions()["CameraY"]
      .SetFunctionName("GetCameraY")
      .SetManipulatedType("number")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");

  GetAllActions()["SetCameraX"]
      .SetFunctionName("SetCameraX")
      .SetManipulatedType("number")
      .SetGetter("GetCameraX")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");
  GetAllActions()["SetCameraY"]
      .SetFunctionName("SetCameraY")
      .SetManipulatedType("number")
      .SetGetter("GetCameraY")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");
  GetAllActions()["CameraX"] // Deprecated
      .SetFunctionName("SetCameraX")
      .SetManipulatedType("number")
      .SetGetter("GetCameraX")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");
  GetAllActions()["CameraY"] // Deprecated
      .SetFunctionName("SetCameraY")
      .SetManipulatedType("number")
      .SetGetter("GetCameraY")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");

  GetAllConditions()["CameraWidth"]
      .SetFunctionName("GetCameraWidth")
      .SetManipulatedType("number")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");
  GetAllConditions()["CameraHeight"]
      .SetFunctionName("GetCameraHeight")
      .SetManipulatedType("number")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");
  GetAllConditions()["CameraAngle"]
      .SetFunctionName("GetCameraAngle")
      .SetManipulatedType("number")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");

  GetAllActions()["SetCameraAngle"]
      .SetFunctionName("SetCameraAngle")
      .SetGetter("GetCameraAngle")
      .SetManipulatedType("number")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");

  GetAllActions()["RotateCamera"] // Deprecated
      .SetFunctionName("SetCameraAngle")
      .SetGetter("GetCameraAngle")
      .SetManipulatedType("number")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");

  GetAllActions()["AddCamera"]
      .SetFunctionName("AddCamera")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");

  GetAllActions()["DeleteCamera"]
      .SetFunctionName("DeleteCamera")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");

  GetAllActions()["CameraSize"]
      .SetFunctionName("SetCameraSize")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");

  GetAllActions()["CameraViewport"]
      .SetFunctionName("SetCameraViewport")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");

  GetAllActions()["ZoomCamera"]
      .SetFunctionName("SetCameraZoom")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");

  GetAllActions()["FixCamera"]
      .SetFunctionName("CenterCameraOnObjectWithLimits")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");

  GetAllActions()["CentreCamera"]
      .SetFunctionName("CenterCameraOnObject")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");

  GetAllActions()["ShowLayer"]
      .SetFunctionName("ShowLayer")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");

  GetAllActions()["HideLayer"]
      .SetFunctionName("HideLayer")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
  ;

  GetAllConditions()["LayerVisible"]
      .SetFunctionName("LayerVisible")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");

  GetAllConditions()["LayerTimeScale"]
      .SetFunctionName("GetLayerTimeScale")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");
  GetAllActions()["ChangeLayerTimeScale"]
      .SetFunctionName("SetLayerTimeScale")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");
  GetAllExpressions()["LayerTimeScale"]
      .SetFunctionName("GetLayerTimeScale")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");

  GetAllExpressions()["CameraWidth"]
      .SetFunctionName("GetCameraWidth")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");
  GetAllExpressions()["CameraHeight"]
      .SetFunctionName("GetCameraHeight")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");
  GetAllExpressions()["CameraViewportLeft"]
      .SetFunctionName("GetCameraViewportLeft")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");
  GetAllExpressions()["CameraViewportTop"]
      .SetFunctionName("GetCameraViewportTop")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");
  GetAllExpressions()["CameraViewportRight"]
      .SetFunctionName("GetCameraViewportRight")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");
  GetAllExpressions()["CameraViewportBottom"]
      .SetFunctionName("GetCameraViewportBottom")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");
  GetAllExpressions()["CameraX"]
      .SetFunctionName("GetCameraX")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");
  GetAllExpressions()["VueX"]
      .SetFunctionName("GetCameraX")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");
  GetAllExpressions()["CameraY"]
      .SetFunctionName("GetCameraY")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");
  GetAllExpressions()["VueY"]
      .SetFunctionName("GetCameraY")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");
  GetAllExpressions()["CameraAngle"]
      .SetFunctionName("GetCameraRotation")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");
  GetAllExpressions()["CameraRotation"]
      .SetFunctionName("GetCameraRotation")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");
  GetAllExpressions()["VueRotation"]
      .SetFunctionName("GetCameraRotation")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneCameraTools.h");

#endif
}
