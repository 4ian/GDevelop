/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/Layer.h"

#include "GDCore/CommonTools.h"
#include "GDCore/Project/Effect.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

Camera Layer::badCamera;

Layer::Layer()
    : isVisible(true), isLightingLayer(false), followBaseLayerCamera(false) {}

/**
 * Change cameras count, automatically adding/removing them.
 */
void Layer::SetCameraCount(std::size_t n) {
  while (cameras.size() < n) cameras.push_back(Camera());

  while (cameras.size() > n)
    cameras.erase(cameras.begin() + cameras.size() - 1);
}

#if defined(GD_IDE_ONLY)
void Layer::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("name", GetName());
  element.SetAttribute("visibility", GetVisibility());
  element.SetAttribute("isLightingLayer", IsLightingLayer());
  element.SetAttribute("followBaseLayerCamera", IsFollowingBaseLayerCamera());
  element.SetAttribute("ambientLightColorR", (int)GetAmbientLightColorRed());
  element.SetAttribute("ambientLightColorG", (int)GetAmbientLightColorGreen());
  element.SetAttribute("ambientLightColorB", (int)GetAmbientLightColorBlue());

  SerializerElement& camerasElement = element.AddChild("cameras");
  camerasElement.ConsiderAsArrayOf("camera");
  for (std::size_t c = 0; c < GetCameraCount(); ++c) {
    SerializerElement& cameraElement = camerasElement.AddChild("camera");
    cameraElement.SetAttribute("defaultSize", GetCamera(c).UseDefaultSize());
    cameraElement.SetAttribute("width", GetCamera(c).GetWidth());
    cameraElement.SetAttribute("height", GetCamera(c).GetHeight());

    cameraElement.SetAttribute("defaultViewport",
                               GetCamera(c).UseDefaultViewport());
    cameraElement.SetAttribute("viewportLeft", GetCamera(c).GetViewportX1());
    cameraElement.SetAttribute("viewportTop", GetCamera(c).GetViewportY1());
    cameraElement.SetAttribute("viewportRight", GetCamera(c).GetViewportX2());
    cameraElement.SetAttribute("viewportBottom", GetCamera(c).GetViewportY2());
  }

  SerializerElement& effectsElement = element.AddChild("effects");
  effectsContainer.SerializeTo(effectsElement);
}
#endif

/**
 * \brief Unserialize the layer.
 */
void Layer::UnserializeFrom(const SerializerElement& element) {
  SetName(element.GetStringAttribute("name", "", "Name"));
  SetVisibility(element.GetBoolAttribute("visibility", true, "Visibility"));
  SetLightingLayer(element.GetBoolAttribute("isLightingLayer", false));
  SetFollowBaseLayerCamera(
      element.GetBoolAttribute("followBaseLayerCamera", false));
  SetAmbientLightColor(element.GetIntAttribute("ambientLightColorR", 200),
                       element.GetIntAttribute("ambientLightColorG", 200),
                       element.GetIntAttribute("ambientLightColorB", 200));

  cameras.clear();
  SerializerElement& camerasElement = element.GetChild("cameras");
  camerasElement.ConsiderAsArrayOf("camera");
  for (std::size_t i = 0; i < camerasElement.GetChildrenCount(); ++i) {
    const SerializerElement& cameraElement = camerasElement.GetChild(i);

    Camera camera;
    camera.SetUseDefaultSize(
        cameraElement.GetBoolAttribute("defaultSize", true));
    camera.SetSize(cameraElement.GetDoubleAttribute("width"),
                    cameraElement.GetDoubleAttribute("height"));
    camera.SetUseDefaultViewport(
        cameraElement.GetBoolAttribute("defaultViewport", true));
    camera.SetViewport(
        cameraElement.GetDoubleAttribute("viewportLeft"),
        cameraElement.GetDoubleAttribute("viewportTop"),
        cameraElement.GetDoubleAttribute("viewportRight"),
        cameraElement.GetDoubleAttribute(
            "viewportBottom"));

    cameras.push_back(camera);
  }

  if (camerasElement.GetChildrenCount() > 50) {
    // Highly unlikely that we want as many cameras, as they were not even exposed in
    // the editor nor used in the game engine. Must be because of a bug in the editor that
    // duplicated cameras when cancelling changes on a layer.
    // Reset to one camera.
    SetCameraCount(1);
  }

  const SerializerElement& effectsElement = element.GetChild("effects");
  effectsContainer.UnserializeFrom(effectsElement);
}

gd::EffectsContainer& Layer::GetEffects() {
  return effectsContainer;
}

const gd::EffectsContainer& Layer::GetEffects() const {
  return effectsContainer;
}

Camera::Camera()
    : defaultSize(true),
      defaultViewport(true),
      x1(0),
      y1(0),
      x2(1),
      y2(1),
      width(0),
      height(0) {}

}  // namespace gd
