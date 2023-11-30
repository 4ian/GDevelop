/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include <algorithm>
#include <iostream>
#include <map>

#include "GDCore/CommonTools.h"
#include "GDCore/Project/InitialInstance.h"
#include "GDCore/Project/InitialInstancesContainer.h"
#include "GDCore/Serialization/SerializerElement.h"

using namespace std;

namespace gd {

gd::InitialInstance InitialInstancesContainer::badPosition;

InitialInstancesContainer::~InitialInstancesContainer() {}

std::size_t InitialInstancesContainer::GetInstancesCount() const {
  return initialInstances.size();
}

void InitialInstancesContainer::UnserializeFrom(
    const SerializerElement& element) {
  initialInstances.clear();

  element.ConsiderAsArrayOf("instance", "Objet");
  for (std::size_t i = 0; i < element.GetChildrenCount(); ++i) {
    gd::InitialInstance instance;
    instance.UnserializeFrom(element.GetChild(i));
    initialInstances.push_back(instance);
  }
}

void InitialInstancesContainer::IterateOverInstances(
    gd::InitialInstanceFunctor& func) {
  for (auto& instance : initialInstances) func(instance);
}

void InitialInstancesContainer::IterateOverInstancesWithZOrdering(
    gd::InitialInstanceFunctor& func, const gd::String& layerName) {
  std::vector<std::reference_wrapper<gd::InitialInstance>> sortedInstances;
  std::copy_if(initialInstances.begin(),
               initialInstances.end(),
               std::inserter(sortedInstances, sortedInstances.begin()),
               [&layerName](InitialInstance& instance) {
                 return instance.GetLayer() == layerName;
               });

  std::sort(sortedInstances.begin(),
            sortedInstances.end(),
            [](gd::InitialInstance& a, gd::InitialInstance& b) {
              return a.GetZOrder() < b.GetZOrder();
            });

  for (auto& instance : sortedInstances) func(instance);
}

gd::InitialInstance& InitialInstancesContainer::InsertNewInitialInstance() {
  gd::InitialInstance newInstance;
  initialInstances.push_back(newInstance);

  return initialInstances.back();
}

void InitialInstancesContainer::RemoveInstanceIf(
    std::function<bool(const gd::InitialInstance&)> predicate) {
  // Note that we can't use erase–remove idiom here because remove_if would
  // move the instances, and the container must guarantee that
  // iterators/pointers to instances always remain valid.
  for (std::list<gd::InitialInstance>::iterator it = initialInstances.begin(),
                                                end = initialInstances.end();
       it != end;) {
    if (predicate(*it))
      it = initialInstances.erase(it);
    else
      ++it;
  }
}

void InitialInstancesContainer::RemoveInstance(
    const gd::InitialInstance& instance) {
  RemoveInstanceIf([&instance](const InitialInstance& currentInstance) {
    return &instance == &currentInstance;
  });
}

gd::InitialInstance& InitialInstancesContainer::InsertInitialInstance(
    const gd::InitialInstance& instance) {
  try {
    const gd::InitialInstance& castedInstance =
        dynamic_cast<const gd::InitialInstance&>(instance);
    initialInstances.push_back(castedInstance);

    return initialInstances.back();
  } catch (...) {
    std::cout
        << "WARNING: Tried to add an gd::InitialInstance which is not a GD C++ "
           "Platform gd::InitialInstance to a GD C++ Platform project";
  }

  return badPosition;
}

void InitialInstancesContainer::RenameInstancesOfObject(
    const gd::String& oldName, const gd::String& newName) {
  for (gd::InitialInstance& instance : initialInstances) {
    if (instance.GetObjectName() == oldName) instance.SetObjectName(newName);
  }
}

void InitialInstancesContainer::RemoveInitialInstancesOfObject(
    const gd::String& objectName) {
  RemoveInstanceIf([&objectName](const InitialInstance& currentInstance) {
    return currentInstance.GetObjectName() == objectName;
  });
}

void InitialInstancesContainer::RemoveAllInstancesOnLayer(
    const gd::String& layerName) {
  RemoveInstanceIf([&layerName](const InitialInstance& currentInstance) {
    return currentInstance.GetLayer() == layerName;
  });
}

void InitialInstancesContainer::MoveInstancesToLayer(
    const gd::String& fromLayer, const gd::String& toLayer) {
  for (gd::InitialInstance& instance : initialInstances) {
    if (instance.GetLayer() == fromLayer) instance.SetLayer(toLayer);
  }
}

std::size_t InitialInstancesContainer::GetLayerInstancesCount(
    const gd::String &layerName) const {
  std::size_t count = 0;
  for (const gd::InitialInstance &instance : initialInstances) {
    if (instance.GetLayer() == layerName) {
      count++;
    }
  }
  return count;
}

bool InitialInstancesContainer::SomeInstancesAreOnLayer(
    const gd::String& layerName) const {
  return std::any_of(initialInstances.begin(),
                     initialInstances.end(),
                     [&layerName](const InitialInstance& currentInstance) {
                       return currentInstance.GetLayer() == layerName;
                     });
}

bool InitialInstancesContainer::HasInstancesOfObject(
    const gd::String& objectName) const {
  return std::any_of(initialInstances.begin(),
                     initialInstances.end(),
                     [&objectName](const InitialInstance& currentInstance) {
                       return currentInstance.GetObjectName() == objectName;
                     });
}

void InitialInstancesContainer::Create(
    const InitialInstancesContainer& source) {
  try {
    const InitialInstancesContainer& castedSource =
        dynamic_cast<const InitialInstancesContainer&>(source);
    operator=(castedSource);
  } catch (...) {
    std::cout << "WARNING: Tried to create a GD C++ Platform "
                 "InitialInstancesContainer object from an object which is not "
                 "of the same type.";
  }
}

void InitialInstancesContainer::SerializeTo(SerializerElement& element) const {
  element.ConsiderAsArrayOf("instance");
  for (auto instance : initialInstances)
    instance.SerializeTo(element.AddChild("instance"));
}

void InitialInstancesContainer::Clear() { initialInstances.clear(); }

InitialInstanceFunctor::~InitialInstanceFunctor(){};

void HighestZOrderFinder::operator()(gd::InitialInstance& instance) {
  if (!layerRestricted || instance.GetLayer() == layerName) {
    instancesCount++;

    if (firstCall) {
      highestZOrder = instance.GetZOrder();
      lowestZOrder = instance.GetZOrder();
      firstCall = false;
    } else {
      if (highestZOrder < instance.GetZOrder())
        highestZOrder = instance.GetZOrder();
      if (lowestZOrder > instance.GetZOrder())
        lowestZOrder = instance.GetZOrder();
    }
  }
}

}  // namespace gd
