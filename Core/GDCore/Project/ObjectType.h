/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include "GDCore/String.h"
#include <vector>

namespace gd {
class SerializerElement;
class Platform;
class ObjectsContainer;
} // namespace gd

namespace gd {

/**
 * \brief
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API ObjectType {
public:
  ObjectType();
  virtual ~ObjectType(){};

  /**
   * \brief Get the object type the behavior should be used with.
   */
  const gd::String &GetName() const { return name; };

  /**
   * \brief Set the object type the behavior should be used with.
   */
  ObjectType &SetName(const gd::String &name_) {
    name = name_;
    return *this;
  }

  bool IsBaseObject() const { return name.empty(); }

  bool IsMatchedBy(const gd::Platform &platform,
                   const ObjectsContainer &globalObjectsContainer,
                   const ObjectsContainer &objectsContainer,
                   const gd::String &objectName);

  /**
   * \brief Return true if an object is found inside the ObjectGroup.
   */
  bool HasCapability(const gd::String &name) const;

  /**
   * \brief Add an object name to the group.
   */
  ObjectType &AddCapability(const gd::String &name);

  /**
   * \brief Remove an object name from the group
   */
  void RemoveCapability(const gd::String &name);

  void SerializeTo(SerializerElement &element) const;

  void UnserializeFrom(const SerializerElement &element);

private:
  gd::String name;
  std::vector<gd::String> capabilities;
};

} // namespace gd
