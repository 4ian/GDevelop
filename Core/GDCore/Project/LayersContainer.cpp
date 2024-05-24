/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "LayersContainer.h"

#include <algorithm>
#include <vector>

#include "Layer.h"
#include "Layout.h"

using namespace std;

namespace gd {

gd::Layer LayersContainer::badLayer;

LayersContainer::LayersContainer() {
  Reset();
}

void LayersContainer::Reset() {
  layers.clear();
  gd::Layer layer;
  layer.SetCameraCount(1);
  layers.push_back(layer);
}

gd::Layer& LayersContainer::GetLayer(const gd::String& name) {
  std::vector<gd::Layer>::iterator layer =
      find_if(layers.begin(), layers.end(), [&name](const gd::Layer& layer) {
        return layer.GetName() == name;
      });

  if (layer != layers.end()) return *layer;

  return badLayer;
}

const gd::Layer& LayersContainer::GetLayer(const gd::String& name) const {
  std::vector<gd::Layer>::const_iterator layer =
      find_if(layers.begin(), layers.end(), [&name](const gd::Layer& layer) {
        return layer.GetName() == name;
      });

  if (layer != layers.end()) return *layer;

  return badLayer;
}

gd::Layer& LayersContainer::GetLayer(std::size_t index) {
  return layers[index];
}

const gd::Layer& LayersContainer::GetLayer(std::size_t index) const {
  return layers[index];
}

std::size_t LayersContainer::GetLayersCount() const { return layers.size(); }

bool LayersContainer::HasLayerNamed(const gd::String& name) const {
  return (
      find_if(layers.begin(), layers.end(), [&name](const gd::Layer& layer) {
        return layer.GetName() == name;
      }) != layers.end());
}
std::size_t LayersContainer::GetLayerPosition(const gd::String& name) const {
  for (std::size_t i = 0; i < layers.size(); ++i) {
    if (layers[i].GetName() == name) return i;
  }
  return gd::String::npos;
}

void LayersContainer::InsertNewLayer(const gd::String& name,
                                     std::size_t position) {
  gd::Layer newLayer;
  newLayer.SetName(name);
  if (position < layers.size())
    layers.insert(layers.begin() + position, newLayer);
  else
    layers.push_back(newLayer);
}

void LayersContainer::InsertLayer(const gd::Layer& layer,
                                  std::size_t position) {
  if (position < layers.size())
    layers.insert(layers.begin() + position, layer);
  else
    layers.push_back(layer);
}

void LayersContainer::RemoveLayer(const gd::String& name) {
  std::vector<gd::Layer>::iterator layer =
      find_if(layers.begin(), layers.end(), [&name](const gd::Layer& layer) {
        return layer.GetName() == name;
      });
  if (layer == layers.end()) return;

  layers.erase(layer);
}

void LayersContainer::SwapLayers(std::size_t firstLayerIndex,
                                 std::size_t secondLayerIndex) {
  if (firstLayerIndex >= layers.size() || secondLayerIndex >= layers.size())
    return;

  std::iter_swap(layers.begin() + firstLayerIndex,
                 layers.begin() + secondLayerIndex);
}

void LayersContainer::MoveLayer(std::size_t oldIndex, std::size_t newIndex) {
  if (oldIndex >= layers.size() || newIndex >= layers.size()) return;

  auto layer = layers[oldIndex];
  layers.erase(layers.begin() + oldIndex);
  InsertLayer(layer, newIndex);
}

void LayersContainer::SerializeLayersTo(SerializerElement& element) const {
  element.ConsiderAsArrayOf("layer");
  for (std::size_t j = 0; j < GetLayersCount(); ++j)
    GetLayer(j).SerializeTo(element.AddChild("layer"));
}

void LayersContainer::UnserializeLayersFrom(const SerializerElement& element) {
  layers.clear();
  element.ConsiderAsArrayOf("layer", "Layer");
  for (std::size_t i = 0; i < element.GetChildrenCount(); ++i) {
    gd::Layer layer;
    layer.UnserializeFrom(element.GetChild(i));
    layers.push_back(layer);
  }
}

}  // namespace gd
