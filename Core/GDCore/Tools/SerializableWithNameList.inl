/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/String.h"
#include "GDCore/Tools/MakeUnique.h"
#include "GDCore/Tools/PolymorphicClone.h"

namespace gd {

template <typename T>
SerializableWithNameList<T>::SerializableWithNameList() {}

template <typename T>
void SerializableWithNameList<T>::Insert(
    const SerializableWithNameList<T>& otherElements,
    size_t begin,
    size_t end,
    size_t position) {
  if (begin >= otherElements.size()) return;
  if (end < begin) return;
  if (end >= otherElements.size()) end = otherElements.size() - 1;

  for (std::size_t insertPos = 0; insertPos <= (end - begin); insertPos++) {
    if (position != (size_t)-1 && position + insertPos < elements.size())
      elements.insert(elements.begin() + position + insertPos,
                      gd::Clone(otherElements.elements[begin + insertPos]));
    else
      elements.push_back(gd::Clone(otherElements.elements[begin + insertPos]));
  }
}

template <typename T>
T& SerializableWithNameList<T>::Insert(const T& element, size_t position) {
  T& newElement = *(*(elements.insert(
      position < elements.size() ? elements.begin() + position : elements.end(),
      std::unique_ptr<T>(new T(element)))));

  return newElement;
}

template <typename T>
T& SerializableWithNameList<T>::InsertNew(const gd::String& name,
                                          std::size_t position) {
  T& newElement = *(*(elements.insert(
      position < elements.size() ? elements.begin() + position : elements.end(),
      std::unique_ptr<T>(new T()))));

  newElement.SetName(name);
  return newElement;
}

template <typename T>
void SerializableWithNameList<T>::Remove(size_t index) {
  elements.erase(elements.begin() + index);
}

template <typename T>
void SerializableWithNameList<T>::Remove(const gd::String& name) {
  typename std::vector<std::unique_ptr<T>>::iterator object =
      find_if(elements.begin(),
              elements.end(),
              [&name](const std::unique_ptr<T>& function) {
                return function->GetName() == name;
              });
  if (object == elements.end()) return;

  elements.erase(object);
}

template <typename T>
T& SerializableWithNameList<T>::Get(const gd::String& name) {
  return *(
      *find_if(elements.begin(),
               elements.end(),
               [&name](const std::unique_ptr<T>& function) {
                 return function->GetName() == name;
               }));
}

template <typename T>
const T& SerializableWithNameList<T>::Get(const gd::String& name) const {
  return *(
      *find_if(elements.begin(),
               elements.end(),
               [&name](const std::unique_ptr<T>& function) {
                 return function->GetName() == name;
               }));
}

template <typename T>
bool SerializableWithNameList<T>::Has(const gd::String& name) const {
  return find_if(elements.begin(),
                 elements.end(),
                 [&name](const std::unique_ptr<T>& function) {
                   return function->GetName() == name;
                 }) != elements.end();
}

template <typename T>
void SerializableWithNameList<T>::Move(std::size_t oldIndex,
                                       std::size_t newIndex) {
  if (oldIndex >= elements.size() || newIndex >= elements.size()) return;

  std::unique_ptr<T> object = std::move(elements[oldIndex]);
  elements.erase(elements.begin() + oldIndex);
  elements.insert(elements.begin() + newIndex, std::move(object));
}

template <typename T>
std::size_t SerializableWithNameList<T>::GetPosition(const T& element) const {
  for(std::size_t index = 0;index<elements.size();++index) {
    if (&element == elements[index].get()) return index;
  }

  return (size_t)-1;
}

template <typename T>
void SerializableWithNameList<T>::SerializeElementsTo(
    const gd::String& elementName, SerializerElement& serializerElement) const {
  serializerElement.ConsiderAsArrayOf(elementName);
  for (const auto& element : elements) {
    element->SerializeTo(serializerElement.AddChild(elementName));
  }
}

template <typename T>
void SerializableWithNameList<T>::UnserializeElementsFrom(
    const gd::String& elementName,
    gd::Project& project,
    const SerializerElement& serializerElement) {
  elements.clear();
  serializerElement.ConsiderAsArrayOf(elementName);
  for (std::size_t i = 0; i < serializerElement.GetChildrenCount(); ++i) {
    T& newElement = InsertNew("", GetCount());
    newElement.UnserializeFrom(project, serializerElement.GetChild(i));
  }
}

template <typename T>
void SerializableWithNameList<T>::UnserializeElementsFrom(
    const gd::String& elementName, const SerializerElement& serializerElement) {
  elements.clear();
  serializerElement.ConsiderAsArrayOf(elementName);
  for (std::size_t i = 0; i < serializerElement.GetChildrenCount(); ++i) {
    T& newElement = InsertNew("", GetCount());
    newElement.UnserializeFrom(serializerElement.GetChild(i));
  }
}

template <typename T>
SerializableWithNameList<T>::SerializableWithNameList(
    const SerializableWithNameList<T>& other) {
  Init(other);
}

template <typename T>
SerializableWithNameList<T>& SerializableWithNameList<T>::operator=(
    const SerializableWithNameList<T>& other) {
  if (this != &other) Init(other);

  return *this;
}

template <typename T>
void SerializableWithNameList<T>::Init(
    const gd::SerializableWithNameList<T>& other) {
  elements = gd::Clone(other.elements);
}

}  // namespace gd
