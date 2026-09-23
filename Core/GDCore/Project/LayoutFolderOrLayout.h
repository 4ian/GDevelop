/*
 * GDevelop Core
 * Copyright 2008-2025 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <memory>
#include <vector>

#include "GDCore/Project/MemoryTrackedRegistry.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/String.h"

namespace gd {
class Project;
class Layout;
class SerializerElement;
}  // namespace gd

namespace gd {

/**
 * \brief Class representing a folder structure in order to organize layouts
 * (scenes) in folders (to be used with a gd::Project.)
 *
 * \see gd::Project
 */
class GD_CORE_API LayoutFolderOrLayout {
 public:
  /**
   * \brief Default constructor creating an empty instance. Useful for the null
   * object pattern.
   */
  LayoutFolderOrLayout();
  virtual ~LayoutFolderOrLayout();
  /**
   * \brief Constructor for creating an instance representing a folder.
   */
  LayoutFolderOrLayout(gd::String folderName_,
                       LayoutFolderOrLayout* parent_ = nullptr);
  /**
   * \brief Constructor for creating an instance representing a layout.
   */
  LayoutFolderOrLayout(gd::Layout* layout_,
                       LayoutFolderOrLayout* parent_ = nullptr);

  /**
   * \brief Returns the layout behind the instance.
   */
  gd::Layout& GetLayout() const { return *layout; }

  /**
   * \brief Returns true if the instance represents a folder.
   */
  bool IsFolder() const { return !folderName.empty(); }
  /**
   * \brief Returns the name of the folder.
   */
  const gd::String& GetFolderName() const { return folderName; }

  /**
   * \brief Set the folder name. Does nothing if called on an instance not
   * representing a folder.
   */
  void SetFolderName(const gd::String& name);

  /**
   * \brief Returns true if the instance represents the layout with the given
   * name or if any of the children does (recursive search).
   */
  bool HasLayoutNamed(const gd::String& name);
  /**
   * \brief Returns the child instance holding the layout with the given name
   * (recursive search).
   */
  LayoutFolderOrLayout& GetLayoutNamed(const gd::String& name);

  /**
   * \brief Returns the number of children. Returns 0 if the instance represents
   * a layout.
   */
  std::size_t GetChildrenCount() const {
    if (IsFolder()) return children.size();
    return 0;
  }
  /**
   * \brief Returns the child LayoutFolderOrLayout at the given index.
   */
  LayoutFolderOrLayout& GetChildAt(std::size_t index);
  /**
   * \brief Returns the child LayoutFolderOrLayout at the given index.
   */
  const LayoutFolderOrLayout& GetChildAt(std::size_t index) const;
  /**
   * \brief Returns the child LayoutFolderOrLayout that represents the layout
   * with the given name. To use only if sure that the instance holds the layout
   * in its direct children (no recursive search).
   *
   * \note The equivalent method to get a folder by its name cannot be
   * implemented because there is no unicity enforced on the folder name.
   */
  LayoutFolderOrLayout& GetLayoutChild(const gd::String& name);

  /**
   * \brief Returns the parent of the instance. If the instance has no parent
   * (root folder), the null object is returned.
   */
  LayoutFolderOrLayout& GetParent() {
    if (parent == nullptr) {
      return badLayoutFolderOrLayout;
    }
    return *parent;
  };

  /**
   * \brief Returns true if the instance is a root folder (that's to say it
   * has no parent).
   */
  bool IsRootFolder() { return !layout && !parent; }

  /**
   * \brief Moves a child from a position to a new one.
   */
  void MoveChild(std::size_t oldIndex, std::size_t newIndex);
  /**
   * \brief Removes the given child from the instance's children. If the given
   * child contains children of its own, does nothing.
   */
  void RemoveFolderChild(const LayoutFolderOrLayout& childToRemove);
  /**
   * \brief Removes the child representing the layout with the given name from
   * the instance children and recursively does it for every folder children.
   */
  void RemoveRecursivelyLayoutNamed(const gd::String& name);
  /**
   * \brief Clears all children
   */
  void Clear();

  /**
   * \brief Inserts an instance representing the given layout at the given
   * position.
   */
  void InsertLayout(gd::Layout* insertedLayout,
                    std::size_t position = (size_t)-1);
  /**
   * \brief Inserts an instance representing a folder with the given name at the
   * given position.
   */
  LayoutFolderOrLayout& InsertNewFolder(const gd::String& newFolderName,
                                        std::size_t position);

  /**
   * \brief Return a folder with the given name and create it if it didn't
   * exist.
   */
  LayoutFolderOrLayout& GetOrCreateFolderChild(const gd::String& name);

  /**
   * \brief Returns true if the instance is a descendant of the given instance
   * of LayoutFolderOrLayout.
   */
  bool IsADescendantOf(const LayoutFolderOrLayout& otherLayoutFolderOrLayout);

  /**
   * \brief Returns the position of the given instance of LayoutFolderOrLayout
   * in the instance's children.
   */
  std::size_t GetChildPosition(const LayoutFolderOrLayout& child) const;
  /**
   * \brief Moves the given child LayoutFolderOrLayout to the given folder at
   * the given position.
   */
  void MoveLayoutFolderOrLayoutToAnotherFolder(
      gd::LayoutFolderOrLayout& layoutFolderOrLayout,
      gd::LayoutFolderOrLayout& newParentFolder,
      std::size_t newPosition);

  /** \name Saving and loading
   * Members functions related to saving and loading the layouts of the class.
   */
  ///@{
  /**
   * \brief Serialize the LayoutFolderOrLayout instance.
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the LayoutFolderOrLayout instance.
   */
  void UnserializeFrom(gd::Project& project, const SerializerElement& element);
  ///@}

 private:
  static gd::LayoutFolderOrLayout badLayoutFolderOrLayout;

  gd::LayoutFolderOrLayout* parent =
      nullptr;  // nullptr if root folder, points to the parent folder
                // otherwise.

  // Representing a layout:
  gd::Layout* layout;  // nullptr if folderName is set.

  // or representing a folder:
  gd::String folderName;  // Empty if layout is set.
  std::vector<std::unique_ptr<LayoutFolderOrLayout>>
      children;  // Folder children.

  gd::MemoryTracked _memoryTracked{this, "LayoutFolderOrLayout"};
};

}  // namespace gd
