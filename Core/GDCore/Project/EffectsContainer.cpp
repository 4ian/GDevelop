/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EffectsContainer.h"

#include "Effect.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd {
Effect EffectsContainer::badEffect;

EffectsContainer::EffectsContainer() {}

EffectsContainer::EffectsContainer(const EffectsContainer& other) {
  Init(other);
}

EffectsContainer& EffectsContainer::operator=(const EffectsContainer& rhs) {
  if (this != &rhs) Init(rhs);
  return *this;
}

void EffectsContainer::Init(const EffectsContainer& other) {
  effects.clear();
  for (auto& it : other.effects) {
    effects.push_back(std::make_shared<Effect>(*it));
  }
}

bool EffectsContainer::HasEffectNamed(const gd::String& name) const {
  return (find_if(effects.begin(),
                  effects.end(),
                  [&name](const std::shared_ptr<gd::Effect>& effect) {
                    return effect->GetName() == name;
                  }) != effects.end());
}

gd::Effect& EffectsContainer::GetEffect(const gd::String& name) {
  auto effect = find_if(effects.begin(),
                        effects.end(),
                        [&name](std::shared_ptr<gd::Effect>& effect) {
                          return effect->GetName() == name;
                        });

  if (effect != effects.end()) return **effect;

  return badEffect;
}

const gd::Effect& EffectsContainer::GetEffect(const gd::String& name) const {
  auto effect = find_if(effects.begin(),
                        effects.end(),
                        [&name](const std::shared_ptr<gd::Effect>& effect) {
                          return effect->GetName() == name;
                        });

  if (effect != effects.end()) return **effect;

  return badEffect;
}
gd::Effect& EffectsContainer::GetEffect(std::size_t index) {
  return *effects[index];
}
const gd::Effect& EffectsContainer::GetEffect(std::size_t index) const {
  return *effects[index];
}
std::size_t EffectsContainer::GetEffectsCount() const { return effects.size(); }
std::size_t EffectsContainer::GetEffectPosition(const gd::String& name) const {
  for (std::size_t i = 0; i < effects.size(); ++i) {
    if (effects[i]->GetName() == name) return i;
  }
  return gd::String::npos;
}

gd::Effect& EffectsContainer::InsertNewEffect(const gd::String& name,
                                              std::size_t position) {
  auto newEffect = std::make_shared<Effect>();
  newEffect->SetName(name);

  if (position < effects.size())
    effects.insert(effects.begin() + position, newEffect);
  else
    effects.push_back(newEffect);

  return *newEffect;
}

void EffectsContainer::InsertEffect(const gd::Effect& effect,
                                    std::size_t position) {
  auto newEffect = std::make_shared<gd::Effect>(effect);
  if (position < effects.size())
    effects.insert(effects.begin() + position, newEffect);
  else
    effects.push_back(newEffect);
}

void EffectsContainer::RemoveEffect(const gd::String& name) {
  auto effect = find_if(effects.begin(),
                        effects.end(),
                        [&name](const std::shared_ptr<gd::Effect>& effect) {
                          return effect->GetName() == name;
                        });
  if (effect == effects.end()) return;

  effects.erase(effect);
}

void EffectsContainer::SwapEffects(std::size_t firstEffectIndex,
                                   std::size_t secondEffectIndex) {
  if (firstEffectIndex >= effects.size() || secondEffectIndex >= effects.size())
    return;

  auto temp = effects[firstEffectIndex];
  effects[firstEffectIndex] = effects[secondEffectIndex];
  effects[secondEffectIndex] = temp;
}

void EffectsContainer::MoveEffect(std::size_t oldIndex, std::size_t newIndex) {
  if (oldIndex >= effects.size() || newIndex >= effects.size() ||
      newIndex == oldIndex)
    return;

  auto effect = effects[oldIndex];
  effects.erase(effects.begin() + oldIndex);
  effects.insert(effects.begin() + newIndex, effect);
}

void EffectsContainer::SerializeTo(SerializerElement& element) const {
  element.ConsiderAsArrayOf("effect");
  for (std::size_t i = 0; i < GetEffectsCount(); ++i) {
    SerializerElement& effectElement = element.AddChild("effect");
    GetEffect(i).SerializeTo(effectElement);
  }
}

void EffectsContainer::UnserializeFrom(const SerializerElement& element) {
  effects.clear();
  element.ConsiderAsArrayOf("effect");
  for (std::size_t i = 0; i < element.GetChildrenCount(); ++i) {
    const SerializerElement& effectElement = element.GetChild(i);

    auto effect = std::make_shared<Effect>();
    effect->UnserializeFrom(effectElement);
    effects.push_back(effect);
  }
}

}  // namespace gd
