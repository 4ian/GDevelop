#include "EffectsContainer.h"

#include "Effect.h"

namespace gd {
Effect EffectsContainer::badEffect;

EffectsContainer::EffectsContainer() {}

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
bool EffectsContainer::HasEffectNamed(const gd::String& name) const {
  return (find_if(effects.begin(),
                  effects.end(),
                  [&name](const std::shared_ptr<gd::Effect>& effect) {
                    return effect->GetName() == name;
                  }) != effects.end());
}
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

}  // namespace gd
