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
Effect Layer::badEffect;

Layer::Layer()
    : isVisible(true),
      isLightingLayer(false),
      followBaseLayerCamera(false),
      effectsContainer(std::make_unique<EffectsContainer>()) {}

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

  // TODO: Serialize EffectsContainer
  // SerializerElement& effectsElement = element.AddChild("effects");
  // effectsElement.ConsiderAsArrayOf("effect");
  // for (std::size_t i = 0; i < GetEffectsCount(); ++i) {
  //   SerializerElement& effectElement = effectsElement.AddChild("effect");
  //   GetEffect(i).SerializeTo(effectElement);
  // }
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

  // Compatibility with GD <= 3.3
  if (element.HasChild("Camera")) {
    for (std::size_t i = 0; i < element.GetChildrenCount("Camera"); ++i) {
      const SerializerElement& cameraElement = element.GetChild("Camera", i);
      SetCameraCount(GetCameraCount() + 1);
      Camera& camera = GetCamera(GetCameraCount() - 1);

      camera.SetUseDefaultSize(
          cameraElement.GetBoolAttribute("DefaultSize", true));
      camera.SetSize(cameraElement.GetDoubleAttribute("Width"),
                     cameraElement.GetDoubleAttribute("Height"));

      camera.SetUseDefaultViewport(
          cameraElement.GetBoolAttribute("DefaultViewport", true));
      camera.SetViewport(
          cameraElement.GetDoubleAttribute("ViewportLeft"),
          cameraElement.GetDoubleAttribute("ViewportTop"),
          cameraElement.GetDoubleAttribute("ViewportRight"),
          cameraElement.GetDoubleAttribute(
              "ViewportBottom"));  // (sf::Rect used Right and Bottom instead of
                                   // Width and Height before)
    }
  }
  // End of compatibility code
  else {
    SerializerElement& camerasElement = element.GetChild("cameras");
    camerasElement.ConsiderAsArrayOf("camera");
    for (std::size_t i = 0; i < camerasElement.GetChildrenCount(); ++i) {
      const SerializerElement& cameraElement = camerasElement.GetChild(i);

      SetCameraCount(GetCameraCount() + 1);
      Camera& camera = GetCamera(GetCameraCount() - 1);

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
              "viewportBottom"));  // (sf::Rect used Right and Bottom instead of
                                   // Width and Height before)
    }
  }

  // TODO: Unserialize EffectsContainer
  // effects.clear();
  // SerializerElement& effectsElement = element.GetChild("effects");
  // effectsElement.ConsiderAsArrayOf("effect");
  // for (std::size_t i = 0; i < effectsElement.GetChildrenCount(); ++i) {
  //   const SerializerElement& effectElement = effectsElement.GetChild(i);

  //   auto effect = std::make_shared<Effect>();
  //   effect->UnserializeFrom(effectElement);
  //   effects.push_back(effect);
  // }
}

gd::Effect& Layer::GetEffect(const gd::String& name) {
  return effectsContainer->GetEffect(name);
}
const gd::Effect& Layer::GetEffect(const gd::String& name) const {
  return effectsContainer->GetEffect(name);
}
gd::Effect& Layer::GetEffect(std::size_t index) {
  return effectsContainer->GetEffect(index);
}
const gd::Effect& Layer::GetEffect(std::size_t index) const {
  return effectsContainer->GetEffect(index);
}
std::size_t Layer::GetEffectsCount() const {
  return effectsContainer->GetEffectsCount();
}

bool Layer::HasEffectNamed(const gd::String& name) const {
  return effectsContainer->HasEffectNamed(name);
}
std::size_t Layer::GetEffectPosition(const gd::String& name) const {
  return effectsContainer->GetEffectPosition(name);
}

gd::Effect& Layer::InsertNewEffect(const gd::String& name,
                                   std::size_t position) {
  return effectsContainer->InsertNewEffect(name, position);
}

void Layer::InsertEffect(const gd::Effect& effect, std::size_t position) {
  effectsContainer->InsertEffect(effect, position);
}

void Layer::RemoveEffect(const gd::String& name) {
  effectsContainer->RemoveEffect(name);
}

void Layer::SwapEffects(std::size_t firstEffectIndex,
                        std::size_t secondEffectIndex) {
  effectsContainer->SwapEffects(firstEffectIndex, secondEffectIndex);
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
