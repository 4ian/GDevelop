/*
 * GDevelop Core
 * Copyright 2008-2025 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <functional>
#include <memory>
#include <vector>

#include "GDCore/Project/MemoryTrackedRegistry.h"
#include "GDCore/String.h"

namespace gd {
class Layout;
class ExternalLayout;
class ExternalEvents;
class Test;
class SerializerElement;
}  // namespace gd

namespace gd {

/**
 * \brief Node of the folder structure used to organize a list of items of the
 * project (scenes, external layouts, external events or tests).
 *
 * A node is either a folder, holding other nodes, or a reference to an item.
 * The items themselves are owned by their list in the project: the folder
 * structure only points to them, so it must be updated when an item is
 * removed.
 *
 * \note The class is explicitly instantiated in ProjectItemFolderOrItem.cpp for
 * every supported item type.
 */
template <class ItemType>
class ProjectItemFolderOrItem {
 public:
  /**
   * \brief Default constructor creating an empty folder named "__NULL".
   */
  ProjectItemFolderOrItem();
  ProjectItemFolderOrItem(gd::String folderName_,
                          ProjectItemFolderOrItem* parent_ = nullptr);
  ProjectItemFolderOrItem(ItemType* item_,
                          ProjectItemFolderOrItem* parent_ = nullptr);
  virtual ~ProjectItemFolderOrItem();

  /**
   * \brief Get the item represented by this node (only valid if it's not a
   * folder).
   */
  ItemType& GetItem() const { return *item; }

  bool IsFolder() const { return !folderName.empty(); }
  const gd::String& GetFolderName() const { return folderName; }
  void SetFolderName(const gd::String& name);

  /**
   * \brief Return true if an item with this name is in this folder or in one
   * of its sub folders.
   */
  bool HasItemNamed(const gd::String& name);

  /**
   * \brief Return the node representing the item with this name, searched
   * recursively.
   */
  ProjectItemFolderOrItem& GetItemNamed(const gd::String& name);

  std::size_t GetChildrenCount() const {
    if (IsFolder()) return children.size();
    return 0;
  }
  ProjectItemFolderOrItem& GetChildAt(std::size_t index);
  const ProjectItemFolderOrItem& GetChildAt(std::size_t index) const;

  /**
   * \brief Return the direct child representing the item with this name.
   */
  ProjectItemFolderOrItem& GetItemChild(const gd::String& name);

  ProjectItemFolderOrItem& GetParent() {
    if (parent == nullptr) {
      return GetBadFolderOrItem();
    }
    return *parent;
  };

  bool IsRootFolder() { return !item && !parent; }

  void MoveChild(std::size_t oldIndex, std::size_t newIndex);

  /**
   * \brief Remove the given folder child, only if it's an empty folder.
   */
  void RemoveFolderChild(const ProjectItemFolderOrItem& childToRemove);

  /**
   * \brief Remove the nodes representing the item with this name, searched
   * recursively. The item itself is not destroyed.
   */
  void RemoveRecursivelyItemNamed(const gd::String& name);

  /**
   * \brief Remove all the children, recursively.
   */
  void Clear();

  void InsertItem(ItemType* insertedItem, std::size_t position = (size_t)-1);
  ProjectItemFolderOrItem& InsertNewFolder(const gd::String& newFolderName,
                                           std::size_t position);

  bool IsADescendantOf(const ProjectItemFolderOrItem& otherFolderOrItem);
  std::size_t GetChildPosition(const ProjectItemFolderOrItem& child) const;

  /**
   * \brief Move a child of this folder into another folder.
   */
  void MoveFolderOrItemToAnotherFolder(ProjectItemFolderOrItem& folderOrItem,
                                       ProjectItemFolderOrItem& newParentFolder,
                                       std::size_t newPosition);

  /**
   * \brief Insert, at the end of this folder, the items of the list that are
   * not yet in the folder structure.
   */
  void AddMissingItems(const std::vector<std::unique_ptr<ItemType>>& items);

  /** \name Serialization
   */
  ///@{
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the folder structure. `findItem` returns the item with
   * the given name, or nullptr if it does not exist.
   */
  void UnserializeFrom(
      const SerializerElement& element,
      const std::function<ItemType*(const gd::String&)>& findItem);

  /**
   * \brief Unserialize the folder structure saved in the child `childName` of
   * `parentElement` if any (otherwise the folder is emptied), then insert at
   * its end the items of the list it does not hold: projects saved before the
   * folders existed, or edited by hand, still show all their items.
   */
  void UnserializeFromChildOf(
      const SerializerElement& parentElement,
      const gd::String& childName,
      const std::function<ItemType*(const gd::String&)>& findItem,
      const std::vector<std::unique_ptr<ItemType>>& items);
  ///@}

 private:
  static ProjectItemFolderOrItem& GetBadFolderOrItem();
  static const char* GetTrackedClassName();

  ProjectItemFolderOrItem* parent =
      nullptr;  // nullptr if root folder, points to the parent folder
                // otherwise.

  // Representing an item:
  ItemType* item;  // nullptr if folderName is set.

  // or representing a folder:
  gd::String folderName;  // Empty if item is set.
  std::vector<std::unique_ptr<ProjectItemFolderOrItem>>
      children;  // Folder children.

  gd::MemoryTracked _memoryTracked{this, GetTrackedClassName()};
};

using LayoutFolderOrLayout = ProjectItemFolderOrItem<gd::Layout>;
using ExternalLayoutFolderOrExternalLayout =
    ProjectItemFolderOrItem<gd::ExternalLayout>;
using ExternalEventsFolderOrExternalEvents =
    ProjectItemFolderOrItem<gd::ExternalEvents>;
using TestFolderOrTest = ProjectItemFolderOrItem<gd::Test>;

}  // namespace gd
