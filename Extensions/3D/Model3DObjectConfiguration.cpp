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

using namespace std;

Model3DObjectConfiguration::Model3DObjectConfiguration()
    : width(100), height(100), depth(100), rotationX(0), rotationY(0),
      rotationZ(0), modelResourceName(""), materialType("StandardWithoutMetalness"),
      originLocation("ModelOrigin"), centerLocation("ModelOrigin"),
      keepAspectRatio(true) {}

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
    materialType = newValue;
    return true;
  }
  if (propertyName == "originLocation") {
    originLocation = newValue;
    return true;
  }
  if (propertyName == "centerLocation") {
    centerLocation = newValue;
    return true;
  }
  if (propertyName == "keepAspectRatio") {
    keepAspectRatio = newValue == "1";
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
      .SetLabel(_("Rotation around X axis"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetDegreeAngle())
      .SetGroup(_("Default orientation"));

  objectProperties["rotationY"]
      .SetValue(gd::String::From(rotationY))
      .SetType("number")
      .SetLabel(_("Rotation around Y axis"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetDegreeAngle())
      .SetGroup(_("Default orientation"));

  objectProperties["rotationZ"]
      .SetValue(gd::String::From(rotationZ))
      .SetType("number")
      .SetLabel(_("Rotation around Z axis"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetDegreeAngle())
      .SetGroup(_("Default orientation"));

  objectProperties["modelResourceName"]
      .SetValue(modelResourceName)
      .SetType("resource")
      .AddExtraInfo("model3D")
      .SetLabel(_("3D model"));

  objectProperties["materialType"]
      .SetValue(materialType.empty() ? "Basic" : materialType)
      .SetType("choice")
      .AddExtraInfo("Basic")
      .AddExtraInfo("StandardWithoutMetalness")
      .AddExtraInfo("KeepOriginal")
      .SetLabel(_("Material modifier"));

  objectProperties["originLocation"]
      .SetValue(originLocation.empty() ? "TopLeft" : originLocation)
      .SetType("choice")
      .AddExtraInfo("ModelOrigin")
      .AddExtraInfo("TopLeft")
      .AddExtraInfo("ObjectCenter")
      .AddExtraInfo("BottomCenterZ")
      .AddExtraInfo("BottomCenterY")
      .SetLabel(_("Origin point"));

  objectProperties["centerLocation"]
      .SetValue(centerLocation.empty() ? "ObjectCenter" : centerLocation)
      .SetType("choice")
      .AddExtraInfo("ModelOrigin")
      .AddExtraInfo("ObjectCenter")
      .AddExtraInfo("BottomCenterZ")
      .AddExtraInfo("BottomCenterY")
      .SetLabel(_("Center point"));

  return objectProperties;
}

bool Model3DObjectConfiguration::UpdateInitialInstanceProperty(
    gd::InitialInstance &instance, const gd::String &propertyName,
    const gd::String &newValue, gd::Project &project, gd::Layout &layout) {
  return false;
}

std::map<gd::String, gd::PropertyDescriptor>
Model3DObjectConfiguration::GetInitialInstanceProperties(
    const gd::InitialInstance &instance, gd::Project &project,
    gd::Layout &layout) {
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

  RemoveAllAnimations();
  auto &animationsElement = content.GetChild("animations");
  animationsElement.ConsiderAsArrayOf("animation");
  for (std::size_t i = 0; i < animationsElement.GetChildrenCount(); ++i) {
    auto &animationElement = animationsElement.GetChild(i);
    Model3DAnimation animation;
    animation.SetName(animationElement.GetStringAttribute("name", ""));
    animation.SetSource(animationElement.GetStringAttribute("source", ""));
    animation.SetShouldLoop(animationElement.GetBoolAttribute("loop", false));
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

  auto &animationsElement = content.AddChild("animations");
  animationsElement.ConsiderAsArrayOf("animation");
  for (auto &animation : animations) {
    auto &animationElement = animationsElement.AddChild("animation");
    animationElement.SetAttribute("name", animation.GetName());
    animationElement.SetAttribute("source", animation.GetSource());
    animationElement.SetAttribute("loop", animation.ShouldLoop());
  }
}

void Model3DObjectConfiguration::ExposeResources(
    gd::ArbitraryResourceWorker &worker) {
  worker.ExposeModel3D(modelResourceName);
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

bool Model3DObjectConfiguration::HasAnimationNamed(
    const gd::String &name) const {
  return !name.empty() && (find_if(animations.begin(), animations.end(),
                                   [&name](const Model3DAnimation &animation) {
                                     return animation.GetName() == name;
                                   }) != animations.end());
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
