/**

GDevelop - Particle System Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "Model3DObjectConfiguration.h"

#include "GDCore/CommonTools.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Project/InitialInstance.h"
#include "GDCore/Project/MeasurementUnit.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Localization.h"

#include <algorithm>

using namespace std;

Model3DObjectConfiguration::Model3DObjectConfiguration()
    : width(100), height(100), depth(100), rotationX(90), rotationY(0),
      rotationZ(90), modelResourceName(""), materialType("StandardWithoutMetalness"),
      originLocation("ModelOrigin"), centerLocation("CenteredOnZ"),
      keepAspectRatio(true), crossfadeDuration(0.1f), isCastingShadow(true), isReceivingShadow(true) {}

bool Model3DObjectConfiguration::UpdateProperty(const gd::String &propertyName,
                                                const gd::String &newValue) {
  if (propertyName == "width") {
    width = newValue.To<double>();
    return true;
  }
  if (propertyName == "height") {
    height = newValue.To<double>();
    return true;
  }
  if (propertyName == "depth") {
    depth = newValue.To<double>();
    return true;
  }
  if (propertyName == "rotationX") {
    rotationX = newValue.To<double>();
    return true;
  }
  if (propertyName == "rotationY") {
    rotationY = newValue.To<double>();
    return true;
  }
  if (propertyName == "rotationZ") {
    rotationZ = newValue.To<double>();
    return true;
  }
  if (propertyName == "modelResourceName") {
    modelResourceName = newValue;
    return true;
  }
  if (propertyName == "materialType") {
    auto normalizedValue = newValue.LowerCase();
    if (normalizedValue == "basic")
      materialType = "Basic";
    else if (normalizedValue == "standardwithoutmetalness")
      materialType = "StandardWithoutMetalness";
    else if (normalizedValue == "keeporiginal")
      materialType = "KeepOriginal";
    else
      return false;
    return true;
  }
  if (propertyName == "originLocation") {
    auto normalizedValue = newValue.LowerCase();
    if (normalizedValue == "modelorigin")
      originLocation = "ModelOrigin";
    else if (normalizedValue == "topleft")
      originLocation = "TopLeft";
    else if (normalizedValue == "objectcenter")
      originLocation = "ObjectCenter";
    else if (normalizedValue == "bottomcenterz")
      originLocation = "BottomCenterZ";
    else if (normalizedValue == "bottomcentery")
      originLocation = "BottomCenterY";
    else
      return false;
    return true;
  }
  if (propertyName == "centerLocation") {
    auto normalizedValue = newValue.LowerCase();
    if (normalizedValue == "modelorigin")
      centerLocation = "ModelOrigin";
    else if (normalizedValue == "objectcenter")
      centerLocation = "ObjectCenter";
    else if (normalizedValue == "centeredonz")
      centerLocation = "CenteredOnZ";
    else if (normalizedValue == "bottomcenterz")
      centerLocation = "BottomCenterZ";
    else if (normalizedValue == "bottomcentery")
      centerLocation = "BottomCenterY";
    else
      return false;
    return true;
  }
  if (propertyName == "keepAspectRatio") {
    keepAspectRatio = newValue == "1";
    return true;
  }
  if(propertyName == "crossfadeDuration") {
    crossfadeDuration = newValue.To<double>();
    return true;
  }
  if(propertyName == "isCastingShadow")
  {
    isCastingShadow = newValue == "1";
    return true;
  }
  if(propertyName == "isReceivingShadow")
  {
    isReceivingShadow = newValue == "1";
    return true;
  }

  return false;
}

std::map<gd::String, gd::PropertyDescriptor>
Model3DObjectConfiguration::GetProperties() const {
  std::map<gd::String, gd::PropertyDescriptor> objectProperties;

  objectProperties["width"]
      .SetValue(gd::String::From(width))
      .SetType("number")
      .SetLabel(_("Width"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetGroup(_("Default size"));

  objectProperties["height"]
      .SetValue(gd::String::From(height))
      .SetType("number")
      .SetLabel(_("Height"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetGroup(_("Default size"));

  objectProperties["depth"]
      .SetValue(gd::String::From(depth))
      .SetType("number")
      .SetLabel(_("Depth"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetGroup(_("Default size"));

  objectProperties["keepAspectRatio"]
      .SetValue(keepAspectRatio ? "true" : "false")
      .SetType("boolean")
      .SetLabel(_("Reduce initial dimensions to keep aspect ratio"))
      .SetGroup(_("Default size"));

  objectProperties["rotationX"]
      .SetValue(gd::String::From(rotationX))
      .SetType("number")
      .SetLabel(_("X"))
      .SetDescription(_("Rotation around X axis"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetDegreeAngle())
      .SetGroup(_("Default rotation"));

  objectProperties["rotationY"]
      .SetValue(gd::String::From(rotationY))
      .SetType("number")
      .SetLabel(_("Y"))
      .SetDescription(_("Rotation around Y axis"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetDegreeAngle())
      .SetGroup(_("Default rotation"));

  objectProperties["rotationZ"]
      .SetValue(gd::String::From(rotationZ))
      .SetType("number")
      .SetLabel(_("Z"))
      .SetDescription(_("Rotation around Z axis"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetDegreeAngle())
      .SetGroup(_("Default rotation"));

  objectProperties["modelResourceName"]
      .SetValue(modelResourceName)
      .SetType("resource")
      .AddExtraInfo("model3D")
      .SetLabel(_("3D model"));

  objectProperties["materialType"]
      .SetValue(materialType.empty() ? "Basic" : materialType)
      .SetType("choice")
      .AddChoice("Basic", _("Basic (no lighting, no shadows)"))
      .AddChoice("StandardWithoutMetalness", _("Standard (without metalness)"))
      .AddChoice("KeepOriginal", _("Keep original"))
      .SetLabel(_("Material"))
      .SetGroup(_("Lighting"));

  objectProperties["originLocation"]
      .SetValue(originLocation.empty() ? "TopLeft" : originLocation)
      .SetType("choice")
      .AddChoice("ModelOrigin", _("Model origin"))
      .AddChoice("TopLeft", _("Top left"))
      .AddChoice("ObjectCenter", _("Object center"))
      .AddChoice("BottomCenterZ", _("Bottom center (Z)"))
      .AddChoice("BottomCenterY", _("Bottom center (Y)"))
      .SetLabel(_("Origin point"))
      .SetGroup(_("Points"))
      .SetAdvanced(true);

  objectProperties["centerLocation"]
      .SetValue(centerLocation.empty() ? "ObjectCenter" : centerLocation)
      .SetType("choice")
      .AddChoice("ModelOrigin", _("Model origin"))
      .AddChoice("ObjectCenter", _("Object center"))
      .AddChoice("CenteredOnZ", _("Centered on Z only"))
      .AddChoice("BottomCenterZ", _("Bottom center (Z)"))
      .AddChoice("BottomCenterY", _("Bottom center (Y)"))
      .SetLabel(_("Center point"))
      .SetGroup(_("Points"))
      .SetAdvanced(true);

  objectProperties["crossfadeDuration"]
      .SetValue(gd::String::From(crossfadeDuration))
      .SetType("number")
      .SetLabel(_("Crossfade duration"))
      .SetGroup(_("Animations"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetSecond());

  objectProperties["isCastingShadow"]
      .SetValue(isCastingShadow ? "true" : "false")
      .SetType("boolean")
      .SetLabel(_("Shadow casting"))
      .SetGroup(_("Lighting"));

  objectProperties["isReceivingShadow"]
      .SetValue(isReceivingShadow ? "true" : "false")
      .SetType("boolean")
      .SetLabel(_("Shadow receiving"))
      .SetGroup(_("Lighting"));



  return objectProperties;
}

bool Model3DObjectConfiguration::UpdateInitialInstanceProperty(
    gd::InitialInstance &instance, const gd::String &propertyName,
    const gd::String &newValue) {
  return false;
}

std::map<gd::String, gd::PropertyDescriptor>
Model3DObjectConfiguration::GetInitialInstanceProperties(
    const gd::InitialInstance &instance) {
  std::map<gd::String, gd::PropertyDescriptor> instanceProperties;
  return instanceProperties;
}

void Model3DObjectConfiguration::DoUnserializeFrom(
    gd::Project &project, const gd::SerializerElement &element) {
  auto &content = element.GetChild("content");

  width = content.GetDoubleAttribute("width");
  height = content.GetDoubleAttribute("height");
  depth = content.GetDoubleAttribute("depth");
  rotationX = content.GetDoubleAttribute("rotationX");
  rotationY = content.GetDoubleAttribute("rotationY");
  rotationZ = content.GetDoubleAttribute("rotationZ");
  modelResourceName = content.GetStringAttribute("modelResourceName");
  materialType = content.GetStringAttribute("materialType");
  originLocation = content.GetStringAttribute("originLocation");
  centerLocation = content.GetStringAttribute("centerLocation");
  keepAspectRatio = content.GetBoolAttribute("keepAspectRatio");
  crossfadeDuration = content.GetDoubleAttribute("crossfadeDuration");
  isCastingShadow = content.GetBoolAttribute("isCastingShadow");
  isReceivingShadow = content.GetBoolAttribute("isReceivingShadow");

  RemoveAllSharedAnimationModelResources();
  if (content.HasChild("sharedAnimationModelResources")) {
    auto &sharedAnimationModelResourcesElement =
        content.GetChild("sharedAnimationModelResources");
    sharedAnimationModelResourcesElement.ConsiderAsArrayOf("resource");
    for (std::size_t i = 0;
         i < sharedAnimationModelResourcesElement.GetChildrenCount(); ++i) {
      auto &resourceElement = sharedAnimationModelResourcesElement.GetChild(i);
      AddSharedAnimationModelResource(
          resourceElement.GetStringAttribute("resourceName", ""));
    }
  }

  RemoveAllAnimations();
  auto &animationsElement = content.GetChild("animations");
  animationsElement.ConsiderAsArrayOf("animation");
  for (std::size_t i = 0; i < animationsElement.GetChildrenCount(); ++i) {
    auto &animationElement = animationsElement.GetChild(i);
    Model3DAnimation animation;
    animation.SetName(animationElement.GetStringAttribute("name", ""));
    animation.SetSource(animationElement.GetStringAttribute("source", ""));
    animation.SetSourceModelResourceName(
        animationElement.GetStringAttribute("sourceModelResourceName", ""));
    animation.SetShouldLoop(animationElement.GetBoolAttribute("loop", false));
    animation.SetShouldUseRootMotion(
        animationElement.GetBoolAttribute("useRootMotion", true));
    AddAnimation(animation);
  }
}

void Model3DObjectConfiguration::DoSerializeTo(
    gd::SerializerElement &element) const {
  auto &content = element.AddChild("content");
  content.SetAttribute("width", width);
  content.SetAttribute("height", height);
  content.SetAttribute("depth", depth);
  content.SetAttribute("rotationX", rotationX);
  content.SetAttribute("rotationY", rotationY);
  content.SetAttribute("rotationZ", rotationZ);
  content.SetAttribute("modelResourceName", modelResourceName);
  content.SetAttribute("materialType", materialType);
  content.SetAttribute("originLocation", originLocation);
  content.SetAttribute("centerLocation", centerLocation);
  content.SetAttribute("keepAspectRatio", keepAspectRatio);
  content.SetAttribute("crossfadeDuration", crossfadeDuration);
  content.SetAttribute("isCastingShadow", isCastingShadow);
  content.SetAttribute("isReceivingShadow", isReceivingShadow);

  auto &sharedAnimationModelResourcesElement =
      content.AddChild("sharedAnimationModelResources");
  sharedAnimationModelResourcesElement.ConsiderAsArrayOf("resource");
  for (const auto &resourceName : sharedAnimationModelResourceNames) {
    auto &resourceElement =
        sharedAnimationModelResourcesElement.AddChild("resource");
    resourceElement.SetAttribute("resourceName", resourceName);
  }

  auto &animationsElement = content.AddChild("animations");
  animationsElement.ConsiderAsArrayOf("animation");
  for (auto &animation : animations) {
    auto &animationElement = animationsElement.AddChild("animation");
    animationElement.SetAttribute("name", animation.GetName());
    animationElement.SetAttribute("source", animation.GetSource());
    animationElement.SetAttribute("sourceModelResourceName",
                                  animation.GetSourceModelResourceName());
    animationElement.SetAttribute("loop", animation.ShouldLoop());
    animationElement.SetAttribute("useRootMotion",
                                  animation.ShouldUseRootMotion());
  }
}

void Model3DObjectConfiguration::ExposeResources(
    gd::ArbitraryResourceWorker &worker) {
  worker.ExposeModel3D(modelResourceName);
  for (auto &resourceName : sharedAnimationModelResourceNames) {
    worker.ExposeModel3D(resourceName);
  }
  for (auto &animation : animations) {
    worker.ExposeModel3D(animation.GetSourceModelResourceName());
  }
}

const gd::String &
Model3DObjectConfiguration::GetAnimationName(size_t index) const {
  return GetAnimation(index).GetName();
}

bool Model3DObjectConfiguration::HasAnimationNamed(
    const gd::String &name) const {
  return !name.empty() && (find_if(animations.begin(), animations.end(),
                                   [&name](const Model3DAnimation &animation) {
                                     return animation.GetName() == name;
                                   }) != animations.end());
}

Model3DAnimation Model3DObjectConfiguration::badAnimation;

const Model3DAnimation &
Model3DObjectConfiguration::GetAnimation(std::size_t nb) const {
  if (nb >= animations.size())
    return badAnimation;

  return animations[nb];
}

Model3DAnimation &Model3DObjectConfiguration::GetAnimation(std::size_t nb) {
  if (nb >= animations.size())
    return badAnimation;

  return animations[nb];
}

void Model3DObjectConfiguration::AddAnimation(
    const Model3DAnimation &animation) {
  animations.push_back(animation);
}

bool Model3DObjectConfiguration::RemoveAnimation(std::size_t nb) {
  if (nb >= GetAnimationsCount())
    return false;

  animations.erase(animations.begin() + nb);
  return true;
}

void Model3DObjectConfiguration::SwapAnimations(std::size_t firstIndex,
                                                std::size_t secondIndex) {
  if (firstIndex < animations.size() && secondIndex < animations.size() &&
      firstIndex != secondIndex)
    std::swap(animations[firstIndex], animations[secondIndex]);
}

void Model3DObjectConfiguration::MoveAnimation(std::size_t oldIndex,
                                               std::size_t newIndex) {
  if (oldIndex >= animations.size() || newIndex >= animations.size())
    return;

  auto animation = animations[oldIndex];
  animations.erase(animations.begin() + oldIndex);
  animations.insert(animations.begin() + newIndex, animation);
}

gd::String Model3DObjectConfiguration::badSharedAnimationModelResourceName;

const gd::String &
Model3DObjectConfiguration::GetSharedAnimationModelResourceName(
    std::size_t index) const {
  if (index >= sharedAnimationModelResourceNames.size())
    return badSharedAnimationModelResourceName;

  return sharedAnimationModelResourceNames[index];
}

bool Model3DObjectConfiguration::HasSharedAnimationModelResourceNamed(
    const gd::String &resourceName) const {
  return !resourceName.empty() &&
         std::find(sharedAnimationModelResourceNames.begin(),
                   sharedAnimationModelResourceNames.end(),
                   resourceName) != sharedAnimationModelResourceNames.end();
}

void Model3DObjectConfiguration::AddSharedAnimationModelResource(
    const gd::String &resourceName) {
  if (resourceName.empty() ||
      HasSharedAnimationModelResourceNamed(resourceName))
    return;

  sharedAnimationModelResourceNames.push_back(resourceName);
}

bool Model3DObjectConfiguration::RemoveSharedAnimationModelResource(
    std::size_t index) {
  if (index >= sharedAnimationModelResourceNames.size())
    return false;

  sharedAnimationModelResourceNames.erase(
      sharedAnimationModelResourceNames.begin() + index);
  return true;
}
