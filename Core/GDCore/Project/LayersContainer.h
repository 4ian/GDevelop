/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once

#include <vector>

#include "GDCore/Project/Layer.h"
#include "GDCore/String.h"

namespace gd {

/**
 * \brief Contains the layers for a scene or a custom object.
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API LayersContainer {
 public:
  LayersContainer();

  /**
   * \brief Return true if the layer called "name" exists.
   */
  bool HasLayerNamed(const gd::String& name) const;

  /**
   * \brief Return a reference to the layer called "name".
   */
  Layer& GetLayer(const gd::String& name);

  /**
   * \brief Return a reference to the layer called "name".
   */
  const Layer& GetLayer(const gd::String& name) const;

  /**
   * \brief Return a reference to the layer at position "index" in the layers
   * list.
   */
  Layer& GetLayer(std::size_t index);

  /**
   * \brief Return a reference to the layer at position "index" in the layers
   * list.
   */
  const Layer& GetLayer(std::size_t index) const;

  /**
   * \brief Return the position of the layer called "name" in the layers list.
   */
  std::size_t GetLayerPosition(const gd::String& name) const;

  /**
   * The number of layers.
   */
  std::size_t GetLayersCount() const;

  /**
   * Add a new empty the layer sheet called "name" at the specified
   * position in the layers list.
   */
  void InsertNewLayer(const gd::String& name, std::size_t position);

  /**
   * Add a new layer constructed from the layer passed as parameter.
   *
   * \param theLayer The layer that must be copied and inserted.
   * \param position Insertion position.
   */
  void InsertLayer(const Layer& theLayer, std::size_t position);

  /**
   * Delete the layer named "name".
   */
  void RemoveLayer(const gd::String& name);

  /**
   * Swap the position of the specified layers.
   */
  void SwapLayers(std::size_t firstLayerIndex, std::size_t secondLayerIndex);

  /**
   * Change the position of the specified layer.
   */
  void MoveLayer(std::size_t oldIndex, std::size_t newIndex);

  void Reset();

  /**
   * \brief Serialize the layers.
   */
  void SerializeLayersTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the layers.
   */
  void UnserializeLayersFrom(const SerializerElement& element);

 private:
  static gd::Layer badLayer;  ///< Null object, returned when GetLayer can not
                              ///< find an appropriate layer.
  std::vector<gd::Layer> layers;  ///< Layers
};

}  // namespace gd