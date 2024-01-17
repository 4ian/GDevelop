/**
GDevelop - Spine Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "SpineObjectConfiguration.h"

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

SpineAnimation SpineObjectConfiguration::badAnimation;

SpineObjectConfiguration::SpineObjectConfiguration()
    : scale(1), spineResourceName("") {};

bool SpineObjectConfiguration::UpdateProperty(const gd::String &propertyName, const gd::String &newValue) {
  if (propertyName == "scale") {
    scale = newValue.To<double>();
    return true;
  }
  if (propertyName == "spineResourceName") {
    spineResourceName = newValue;
    return true;
  }

  return false;
}

std::map<gd::String, gd::PropertyDescriptor>
SpineObjectConfiguration::GetProperties() const {
  std::map<gd::String, gd::PropertyDescriptor> objectProperties;

  objectProperties["scale"]
      .SetValue(gd::String::From(scale))
      .SetType("number")
      .SetLabel(_("Scale"))
      .SetGroup(_("Default size"));

  objectProperties["spineResourceName"]
      .SetValue(spineResourceName)
      .SetType("resource")
      .AddExtraInfo("spine")
      .SetLabel(_("Spine json"));

  return objectProperties;
}

bool SpineObjectConfiguration::UpdateInitialInstanceProperty(
  gd::InitialInstance &instance, const gd::String &propertyName,
  const gd::String &newValue, gd::Project &project, gd::Layout &layout
) {
  if (propertyName == "animation") {
    instance.SetRawDoubleProperty("animation", std::max(0, newValue.empty() ? 0 : newValue.To<int>()));
  }

  return true;
}

std::map<gd::String, gd::PropertyDescriptor>
SpineObjectConfiguration::GetInitialInstanceProperties(const gd::InitialInstance &instance, gd::Project &project, gd::Layout &layout) {
  std::map<gd::String, gd::PropertyDescriptor> properties;
  properties["animation"] =
      gd::PropertyDescriptor(gd::String::From(instance.GetRawDoubleProperty("animation")))
        .SetLabel(_("Animation"))
        .SetType("number");
  
  return properties;
}

void SpineObjectConfiguration::DoUnserializeFrom(gd::Project &project, const gd::SerializerElement &element) {
  auto &content = element.GetChild("content");

  scale = content.GetDoubleAttribute("scale");
  spineResourceName = content.GetStringAttribute("spineResourceName");

  RemoveAllAnimations();
  auto &animationsElement = content.GetChild("animations");
  animationsElement.ConsiderAsArrayOf("animation");
  for (std::size_t i = 0; i < animationsElement.GetChildrenCount(); ++i) {
    auto &animationElement = animationsElement.GetChild(i);
    SpineAnimation animation;
    animation.SetName(animationElement.GetStringAttribute("name", ""));
    animation.SetSource(animationElement.GetStringAttribute("source", ""));
    animation.SetShouldLoop(animationElement.GetBoolAttribute("loop", false));
    AddAnimation(animation);
  }
}

void SpineObjectConfiguration::DoSerializeTo(gd::SerializerElement &element) const {
  auto &content = element.AddChild("content");
  content.SetAttribute("scale", scale);
  content.SetAttribute("spineResourceName", spineResourceName);

  auto &animationsElement = content.AddChild("animations");
  animationsElement.ConsiderAsArrayOf("animation");
  for (auto &animation : animations) {
    auto &animationElement = animationsElement.AddChild("animation");
    animationElement.SetAttribute("name", animation.GetName());
    animationElement.SetAttribute("source", animation.GetSource());
    animationElement.SetAttribute("loop", animation.ShouldLoop());
  }
}

void SpineObjectConfiguration::ExposeResources(gd::ArbitraryResourceWorker &worker) {
  worker.ExposeSpine(spineResourceName);
  worker.ExposeEmbeddeds(spineResourceName);
}

const SpineAnimation &
SpineObjectConfiguration::GetAnimation(std::size_t nb) const {
  if (nb >= animations.size()) return badAnimation;

  return animations[nb];
}

SpineAnimation &SpineObjectConfiguration::GetAnimation(std::size_t nb) {
  if (nb >= animations.size()) return badAnimation;

  return animations[nb];
}

bool SpineObjectConfiguration::HasAnimationNamed(const gd::String &name) const {
  return !name.empty() && (find_if(animations.begin(), animations.end(),
                                   [&name](const SpineAnimation &animation) {
                                     return animation.GetName() == name;
                                   }) != animations.end());
}

void SpineObjectConfiguration::AddAnimation(const SpineAnimation &animation) {
  animations.push_back(animation);
}

bool SpineObjectConfiguration::RemoveAnimation(std::size_t nb) {
  if (nb >= GetAnimationsCount())
    return false;

  animations.erase(animations.begin() + nb);
  return true;
}

void SpineObjectConfiguration::SwapAnimations(std::size_t firstIndex, std::size_t secondIndex) {
  if (firstIndex < animations.size() && secondIndex < animations.size() && firstIndex != secondIndex) {
    std::swap(animations[firstIndex], animations[secondIndex]);
  }
}

void SpineObjectConfiguration::MoveAnimation(std::size_t oldIndex, std::size_t newIndex) {
  if (oldIndex >= animations.size() || newIndex >= animations.size()) {
    return;
  }

  auto animation = animations[oldIndex];
  animations.erase(animations.begin() + oldIndex);
  animations.insert(animations.begin() + newIndex, animation);
}
