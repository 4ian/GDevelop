/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "CameraExtension.h"

#include "GDCore/CommonTools.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs {

CameraExtension::CameraExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsCameraExtension(*this);

  GetAllActions()["CameraX"]  // Deprecated
      .SetFunctionName("gdjs.evtTools.camera.setCameraX")
      .SetGetter("gdjs.evtTools.camera.getCameraX");
  GetAllActions()["CameraY"]  // Deprecated
      .SetFunctionName("gdjs.evtTools.camera.setCameraY")
      .SetGetter("gdjs.evtTools.camera.getCameraY");
  GetAllActions()["SetCameraX"]  // Deprecated
      .SetFunctionName("gdjs.evtTools.camera.setCameraX")
      .SetGetter("gdjs.evtTools.camera.getCameraX");
  GetAllActions()["SetCameraY"]  // Deprecated
      .SetFunctionName("gdjs.evtTools.camera.setCameraY")
      .SetGetter("gdjs.evtTools.camera.getCameraY");
  GetAllActions()["SetCameraCenterX"]
      .SetFunctionName("gdjs.evtTools.camera.setCameraX")
      .SetGetter("gdjs.evtTools.camera.getCameraX");
  GetAllActions()["SetCameraCenterY"]
      .SetFunctionName("gdjs.evtTools.camera.setCameraY")
      .SetGetter("gdjs.evtTools.camera.getCameraY");

  GetAllConditions()["CameraX"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraX");  // Deprecated
  GetAllConditions()["CameraY"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraY");  // Deprecated
  GetAllConditions()["CameraCenterX"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraX");
  GetAllConditions()["CameraCenterY"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraY");
  GetAllConditions()["CameraWidth"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraWidth");
  GetAllConditions()["CameraHeight"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraHeight");
  GetAllConditions()["CameraBorderLeft"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraBorderLeft");
  GetAllConditions()["CameraBorderRight"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraBorderRight");
  GetAllConditions()["CameraBorderTop"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraBorderTop");
  GetAllConditions()["CameraBorderBottom"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraBorderBottom");
  GetAllActions()["ShowLayer"].SetFunctionName(
      "gdjs.evtTools.camera.showLayer");
  GetAllActions()["HideLayer"].SetFunctionName(
      "gdjs.evtTools.camera.hideLayer");
  GetAllConditions()["LayerVisible"].SetFunctionName(
      "gdjs.evtTools.camera.layerIsVisible");
  GetAllConditions()["CameraAngle"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraRotation");
  GetAllActions()["SetCameraAngle"]
      .SetFunctionName("gdjs.evtTools.camera.setCameraRotation")
      .SetGetter("gdjs.evtTools.camera.getCameraRotation");
  GetAllActions()["RotateCamera"]  // Deprecated
      .SetFunctionName("gdjs.evtTools.camera.setCameraRotation")
      .SetGetter("gdjs.evtTools.camera.getCameraRotation");
  GetAllActions()["ZoomCamera"].SetFunctionName(
      "gdjs.evtTools.camera.setCameraZoom");

  GetAllExpressions()["CameraX"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraX");  // Deprecated
  GetAllExpressions()["VueX"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraX");  // Deprecated
  GetAllExpressions()["CameraY"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraY");  // Deprecated
  GetAllExpressions()["VueY"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraY");  // Deprecated
  GetAllExpressions()["CameraCenterY"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraY");
  GetAllExpressions()["CameraCenterX"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraX");
  GetAllExpressions()["CameraBorderLeft"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraBorderLeft");
  GetAllExpressions()["CameraBorderRight"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraBorderRight");
  GetAllExpressions()["CameraBorderTop"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraBorderTop");
  GetAllExpressions()["CameraBorderBottom"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraBorderBottom");
  GetAllExpressions()["CameraAngle"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraRotation");
  GetAllExpressions()["CameraRotation"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraRotation");
  GetAllExpressions()["VueRotation"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraRotation");
  GetAllExpressions()["CameraZoom"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraZoom");
  GetAllExpressions()["CameraWidth"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraWidth");
  GetAllExpressions()["CameraHeight"].SetFunctionName(
      "gdjs.evtTools.camera.getCameraHeight");

  GetAllActions()["FixCamera"].SetFunctionName(
      "gdjs.evtTools.camera.centerCameraWithinLimits");  // Deprecated
  GetAllActions()["ClampCamera"].SetFunctionName(
      "gdjs.evtTools.camera.clampCamera");
  GetAllActions()["CentreCamera"].SetFunctionName(
      "gdjs.evtTools.camera.centerCamera");

  GetAllActions()["SetLayerEffectParameter"].SetFunctionName(
      "gdjs.evtTools.camera.setLayerEffectDoubleParameter");
  GetAllActions()["SetLayerEffectStringParameter"].SetFunctionName(
      "gdjs.evtTools.camera.setLayerEffectStringParameter");
  GetAllActions()["SetLayerEffectBooleanParameter"].SetFunctionName(
      "gdjs.evtTools.camera.setLayerEffectBooleanParameter");
  GetAllActions()["EnableLayerEffect"].SetFunctionName(
      "gdjs.evtTools.camera.enableLayerEffect");
  GetAllConditions()["LayerEffectEnabled"].SetFunctionName(
      "gdjs.evtTools.camera.layerEffectEnabled");

  GetAllConditions()["LayerTimeScale"].SetFunctionName(
      "gdjs.evtTools.camera.getLayerTimeScale");
  GetAllActions()["ChangeLayerTimeScale"].SetFunctionName(
      "gdjs.evtTools.camera.setLayerTimeScale");
  GetAllExpressions()["LayerTimeScale"].SetFunctionName(
      "gdjs.evtTools.camera.getLayerTimeScale");

  GetAllConditions()["LayerDefaultZOrder"].SetFunctionName(
      "gdjs.evtTools.camera.getLayerDefaultZOrder");
  GetAllActions()["SetLayerDefaultZOrder"].SetFunctionName(
      "gdjs.evtTools.camera.setLayerDefaultZOrder");
  GetAllExpressions()["LayerDefaultZOrder"].SetFunctionName(
      "gdjs.evtTools.camera.getLayerDefaultZOrder");

  GetAllActions()["SetLayerAmbientLightColor"].SetFunctionName(
      "gdjs.evtTools.camera.setLayerAmbientLightColor");

  StripUnimplementedInstructionsAndExpressions();  // Unimplemented things are
                                                   // listed here:
  /*
      AddAction("AddCamera",
                     _("Add a camera to a layer"),
                     _("This action add a camera to a layer"),
                     _("Add a camera to layer _PARAM1_"),
                     _("Layers and cameras"),
                     "res/actions/camera24.png",
                     "res/actions/camera.png")
          .AddCodeOnlyParameter("currentScene", "")
          .AddParameter("layer", _("Layer (base layer if
     empty)")).SetDefaultValue("\"\"") .AddParameter("expression", _("Width"),
     "",true) .AddParameter("expression", _("Height"), "",true)
          .AddParameter("expression", _("Render zone: Top left side: X Position
     ( Between 0 and 1 )"), "",true) .AddParameter("expression", _("Render zone:
     Top left side: Y Position ( Between 0 and 1 )"), "",true)
          .AddParameter("expression", _("Render zone: Bottom right side: X
     Position ( Between 0 and 1 )"), "",true) .AddParameter("expression",
     _("Render zone: Bottom right side: Y Position ( Between 0 and 1 )"),
     "",true)
          .SetFunctionName("AddCamera");

      AddAction("DeleteCamera",
                     _("Delete a camera of a layer"),
                     _("Remove the specified camera from a layer"),
                     _("Delete camera _PARAM2_ from layer _PARAM1_"),
                     _("Layers and cameras"),
                     "res/actions/camera24.png",
                     "res/actions/camera.png")
          .AddCodeOnlyParameter("currentScene", "")
          .AddParameter("layer", _("Layer (base layer if
     empty)")).SetDefaultValue("\"\"") .AddParameter("expression", _("Camera
     number"))
          .SetFunctionName("DeleteCamera");

      AddAction("CameraSize",
                     _("Modify the size of a camera"),
                     _("This action modify the size of a camera of the specified
     layer. The zoom will be reset."),
                     _("Change the size of camera _PARAM2_ of _PARAM1_ to
     _PARAM3_*_PARAM4_"),
                     _("Layers and cameras"),
                     "res/actions/camera24.png",
                     "res/actions/camera.png")
          .AddCodeOnlyParameter("currentScene", "")
          .AddParameter("layer", _("Layer (base layer if
     empty)")).SetDefaultValue("\"\"") .AddParameter("expression", _("Camera
     number")) .AddParameter("expression", _("Width"))
          .AddParameter("expression", _("Height"))
          .SetFunctionName("SetCameraSize");

      AddAction("CameraViewport",
                     _("Modify the render zone of a camera"),
                     _("This action modify the render zone of a camera of the
     specified layer."),
                     _("Set the render zone of camera _PARAM2_ from layer
     _PARAM1_ to PARAM3_;_PARAM4_ _PARAM5_;_PARAM6_"),
                     _("Layers and cameras"),
                     "res/actions/camera24.png",
                     "res/actions/camera.png")
          .AddCodeOnlyParameter("currentScene", "")
          .AddParameter("layer", _("Layer (base layer if
     empty)")).SetDefaultValue("\"\"") .AddParameter("expression", _("Camera
     number")) .AddParameter("expression", _("Render zone: Top left side: X
     Position ( Between 0 and 1 )")) .AddParameter("expression", _("Render zone:
     Top left side: X Position ( Between 0 and 1 )"))
          .AddParameter("expression", _("Render zone: Bottom right side: X
     Position ( Between 0 and 1 )")) .AddParameter("expression", _("Render zone:
     Bottom right side: X Position ( Between 0 and 1 )"))
          .SetFunctionName("SetCameraViewport");

      AddExpression("CameraViewportLeft", _("X position of the top left side
     point of a render zone"), _("X position of the top left side point of a
     render zone"), _("Camera"), "res/actions/camera.png")
          .AddCodeOnlyParameter("currentScene", "")
          .AddParameter("layer", _("Layer"))
          .AddParameter("expression", _("Camera number (default :
     0)")).SetDefaultValue("0")
          .SetFunctionName("GetCameraViewportLeft");


      AddExpression("CameraViewportTop", _("Y position of the top left side
     point of a render zone"), _("Y position of the top left side point of a
     render zone"), _("Camera"), "res/actions/camera.png")
          .AddCodeOnlyParameter("currentScene", "")
          .AddParameter("layer", _("Layer"))
          .AddParameter("expression", _("Camera number (default :
     0)")).SetDefaultValue("0")
          .SetFunctionName("GetCameraViewportTop");


      AddExpression("CameraViewportRight", _("X position of the bottom right
     side point of a render zone"), _("X position of the bottom right side point
     of a render zone"), _("Camera"), "res/actions/camera.png")
          .AddCodeOnlyParameter("currentScene", "")
          .AddParameter("layer", _("Layer"))
          .AddParameter("expression", _("Camera number (default :
     0)")).SetDefaultValue("0")
          .SetFunctionName("GetCameraViewportRight");


      AddExpression("CameraViewportBottom", _("Y position of the bottom right
     side point of a render zone"), _("Y position of the bottom right side point
     of a render zone"), _("Camera"), "res/actions/camera.png")
          .AddCodeOnlyParameter("currentScene", "")
          .AddParameter("layer", _("Layer"))
          .AddParameter("expression", _("Camera number (default :
     0)")).SetDefaultValue("0")
          .SetFunctionName("GetCameraViewportBottom");


  */
}

}  // namespace gdjs
