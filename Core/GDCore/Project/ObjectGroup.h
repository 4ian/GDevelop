/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_OBJECTGROUP_H
#define GDCORE_OBJECTGROUP_H
#include <utility>
#include <vector>

#include "GDCore/String.h"

namespace gd {
class SerializerElement;
}

namespace gd {

/**
 * \brief Represents an object group.
 *
 * Objects groups do not really contains objects : They are just used in events,
 * so as to create events which can be applied to several objects.
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API ObjectGroup {
 public:
  ObjectGroup(){};
  virtual ~ObjectGroup(){};

  /**
   * \brief Return true if an object is found inside the ObjectGroup.
   */
  bool Find(const gd::String& name) const;

  /**
   * \brief Add an object name to the group.
   */
  void AddObject(const gd::String& name);

  /**
   * \brief Remove an object name from the group
   */
  void RemoveObject(const gd::String& name);

  /**
   * \brief Change the name of an object in the group
   */
  void RenameObject(const gd::String& oldName, const gd::String& newName);

  /** \brief Get group name
   */
  inline const gd::String& GetName() const { return name; };

  /** \brief Change group name
   */
  inline void SetName(const gd::String& name_) { name = name_; };

  /**
   * \brief Get a vector with objects names.
   */
  inline const std::vector<gd::String>& GetAllObjectsNames() const {
    return memberObjects;
  }

  /**
   * \brief Serialize the group.
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the group.
   */
  void UnserializeFrom(const SerializerElement& element);

 private:
  std::vector<gd::String> memberObjects;
  gd::String name;  ///< Group name
};

}  // namespace gd

#endif  // GDCORE_OBJECTGROUP_H
