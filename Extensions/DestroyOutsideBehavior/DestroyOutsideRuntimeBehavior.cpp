/**

GDevelop - DestroyOutside Behavior Extension
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "DestroyOutsideRuntimeBehavior.h"
#include <SFML/Graphics.hpp>
#include <iostream>
#include <memory>
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/Project/Layout.h"
#include "GDCpp/Runtime/RuntimeLayer.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/Serialization/SerializerElement.h"

DestroyOutsideRuntimeBehavior::DestroyOutsideRuntimeBehavior(
    const gd::SerializerElement& behaviorContent)
    : RuntimeBehavior(behaviorContent), extraBorder(0) {
  extraBorder = behaviorContent.GetDoubleAttribute("extraBorder", 0);
}

void DestroyOutsideRuntimeBehavior::DoStepPostEvents(RuntimeScene& scene) {
  bool erase = true;
  const RuntimeLayer& theLayer = scene.GetRuntimeLayer(object->GetLayer());
  float objCenterX = object->GetDrawableX() + object->GetCenterX();
  float objCenterY = object->GetDrawableY() + object->GetCenterY();
  for (std::size_t cameraIndex = 0; cameraIndex < theLayer.GetCameraCount();
       ++cameraIndex) {
    const RuntimeCamera& theCamera = theLayer.GetCamera(cameraIndex);

    float boundingCircleRadius =
        sqrt(object->GetWidth() * object->GetWidth() +
             object->GetHeight() * object->GetHeight()) /
        2.0;
    if (objCenterX + boundingCircleRadius + extraBorder <
            theCamera.GetViewCenter().x - theCamera.GetWidth() / 2.0 ||
        objCenterX - boundingCircleRadius - extraBorder >
            theCamera.GetViewCenter().x + theCamera.GetWidth() / 2.0 ||
        objCenterY + boundingCircleRadius + extraBorder <
            theCamera.GetViewCenter().y - theCamera.GetHeight() / 2.0 ||
        objCenterY - boundingCircleRadius - extraBorder >
            theCamera.GetViewCenter().y + theCamera.GetHeight() / 2.0) {
      // Ok we are outside the camera area.
    } else {
      // The object can be viewed by the camera.
      erase = false;
      break;
    }
  }

  if (erase) object->DeleteFromScene(scene);
}
