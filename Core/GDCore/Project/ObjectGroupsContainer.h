/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_OBJECTGROUPSCONTAINER_H
#define GDCORE_OBJECTGROUPSCONTAINER_H
#include <algorithm>
#include <memory>
#include <vector>

#include "GDCore/Project/ObjectGroup.h"
#include "GDCore/String.h"
namespace gd {
class SerializerElement;
}

namespace gd {

/**
 * \brief A container for objects groups
 *
 * \see gd::Project
 * \see gd::Layout
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API ObjectGroupsContainer {
 public:
  ObjectGroupsContainer();
  ObjectGroupsContainer(const ObjectGroupsContainer&);
  virtual ~ObjectGroupsContainer(){};
  ObjectGroupsContainer& operator=(const ObjectGroupsContainer& rhs);

  /**
   * \brief Return true if the specified group is in the container
   */
  bool Has(const gd::String& name) const;

  /**
   * \brief Return a reference to the group called \a name.
   */
  ObjectGroup& Get(const gd::String& name);

  /**
   * \brief Return a reference to the group called \a name.
   */
  const ObjectGroup& Get(const gd::String& name) const;

  /**
   * \brief Return the group at position \index in the container.
   *
   * \note If index is invalid, an empty group is returned.
   */
  ObjectGroup& Get(std::size_t index);

  /**
   * \brief Return the group at position \index in the container.
   *
   * \note If index is invalid, an empty group is returned.
   */
  const ObjectGroup& Get(std::size_t index) const;

  /**
   * Add a new group constructed from the group passed as parameter.
   * \param objectGroup The group that must be copied and inserted into the
   * container \param position Insertion position. If the position is invalid,
   * the group is inserted at the end of the group list. \return Reference to
   * the newly added group
   */
  ObjectGroup& Insert(const ObjectGroup& objectGroup,
                      std::size_t position = -1);

  /**
   * \brief Return the number of groups.
   */
  std::size_t Count() const { return objectGroups.size(); };

  /**
   * \brief Return true if the container is empty.
   */
  bool IsEmpty() const { return objectGroups.empty(); };

  /**
   * \brief return the position of the group called "name" in the group list
   */
  std::size_t GetPosition(const gd::String& name) const;

  /**
   * \brief Add a new empty group at the specified position in the container.
   * \param name The new group name
   * \param position Insertion position. If the position is invalid, the group
   * is inserted at the end of the group list. \return Reference to the newly
   * added group
   */
  ObjectGroup& InsertNew(const gd::String& name, std::size_t position = -1);

  /**
   * \brief Remove the specified group from the container.
   */
  void Remove(const gd::String& name);

  /**
   * \brief Rename a group.
   * \return true if the group was renamed, false otherwise.
   */
  bool Rename(const gd::String& oldName, const gd::String& newName);

  /**
   * \brief Move the specified group at a new position in the list.
   */
  void Move(std::size_t oldIndex, std::size_t newIndex);

  /**
   * \brief Clear all groups of the container.
   */
  inline void Clear() { objectGroups.clear(); }

  /**
   * \brief Call the callback for each group name matching the specified search.
   */
  void ForEachNameMatchingSearch(const gd::String& search, std::function<void(const gd::String& name)> fn) const;
  ///@}

  /** \name Saving and loading
   * Members functions related to saving and loading the object.
   */
  ///@{
  /**
   * \brief Serialize objects groups container.
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the objects groups container.
   */
  void UnserializeFrom(const SerializerElement& element);
  ///@}

  /** \name std::vector API compatibility
   * These functions ensure that the class can be used just like a std::vector.
   */
  ///@{

  /**
   * \brief Alias for Count()
   * \see ObjectGroupsContainer::Count.
   */
  size_t size() const { return Count(); }

  /**
   * \brief Alias for IsEmpty()
   * \see ObjectGroupsContainer::IsEmpty.
   */
  bool empty() const { return IsEmpty(); }

  /**
   * \brief Alias for Get()
   * \see ObjectGroupsContainer::Get.
   */
  ObjectGroup& operator[](size_t index) { return Get(index); };

  /**
   * \brief Alias for Get()
   * \see ObjectGroupsContainer::Get.
   */
  const ObjectGroup& operator[](size_t index) const { return Get(index); };

  /**
   * \brief Alias for Get()
   * \see ObjectGroupsContainer::Get.
   */
  ObjectGroup& at(size_t index) { return Get(index); };

  /**
   * \brief Alias for Get()
   * \see ObjectGroupsContainer::Get.
   */
  const ObjectGroup& at(size_t index) const { return Get(index); };
  ///@}

  /**
   * Initialize from another object groups container. Used by copy-ctor and
   * assign-op. Don't forget to update me if members were changed!
   */
  void Init(const gd::ObjectGroupsContainer& other);

 private:
  std::vector<std::unique_ptr<gd::ObjectGroup>> objectGroups;
  static ObjectGroup badGroup;
};

}  // namespace gd

#endif  // GDCORE_OBJECTGROUPSCONTAINER_H
