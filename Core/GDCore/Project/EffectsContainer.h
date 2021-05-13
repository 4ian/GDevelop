/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EFFECTS_CONTAINER_H
#define GDCORE_EFFECTS_CONTAINER_H
#include <memory>
#include <vector>

#include "GDCore/String.h"

namespace gd {
class Effect;
}
namespace gd {
class SerializerElement;
}

namespace gd {

/**
 * \brief Contains the effect applied to other entities (ie, Layer or Object)
 *
 * \see gd::EffectsContainer
 * \ingroup PlatformDefinition
 */
class GD_CORE_API EffectsContainer {
 public:
  EffectsContainer();
  EffectsContainer(const EffectsContainer& other);
  virtual ~EffectsContainer(){};

  EffectsContainer& operator=(const EffectsContainer& rhs);
  void Init(const EffectsContainer& other);
  /**
   * \brief Return true if the effect called "name" exists.
   */
  bool HasEffectNamed(const gd::String& name) const;

  /**
   * \brief Return a reference to the effect called "name".
   */
  Effect& GetEffect(const gd::String& name);

  /**
   * \brief Return a reference to the effect called "name".
   */
  const Effect& GetEffect(const gd::String& name) const;

  /**
   * Return a reference to the effect at position "index" in the effects list
   */
  Effect& GetEffect(std::size_t index);

  /**
   * Return a reference to the effect at position "index" in the effects list
   */
  const Effect& GetEffect(std::size_t index) const;

  /**
   * Return the position of the effect called "name" in the effects list
   */
  std::size_t GetEffectPosition(const gd::String& name) const;

  /**
   * Return the number of effecst.
   */
  std::size_t GetEffectsCount() const;

  /**
   * Add a new effect at the specified position in the effects list.
   */
  gd::Effect& InsertNewEffect(const gd::String& name, std::size_t position);

  /**
   * \brief Add a copy of the specified effect in the effects list.
   *
   * \note No pointer or reference must be kept on the layer passed as
   * parameter.
   *
   * \param theEffect The effect that must be copied and inserted
   * into the effects list
   * \param position Insertion position.
   */
  void InsertEffect(const Effect& theEffect, std::size_t position);

  /**
   * Remove the specified effect.
   */
  void RemoveEffect(const gd::String& name);

  /**
   * Swap the position of two effects.
   */
  void SwapEffects(std::size_t firstEffectIndex, std::size_t secondEffectIndex);

#if defined(GD_IDE_ONLY)
  /**
   * \brief Serialize effects container
   */
  void SerializeTo(SerializerElement& element) const;
#endif

  /**
   * \brief Unserialize the effects container.
   */
  void UnserializeFrom(const SerializerElement& element);

 private:
  std::vector<std::shared_ptr<gd::Effect>>
      effects;  ///< The effects contained by the container.

  static Effect badEffect;
};
}  // namespace gd

#endif
