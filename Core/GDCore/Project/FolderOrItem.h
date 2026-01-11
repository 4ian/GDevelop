/*
 * GDevelop Core
 * Copyright 2008-2025 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_FOLDERORITEM_H
#define GDCORE_FOLDERORITEM_H
#include <memory>
#include <vector>
#include <algorithm>

#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/String.h"
#include "GDCore/Project/QuickCustomization.h"
#include "GDCore/Tools/MakeUnique.h"
#include "GDCore/Tools/Log.h"

namespace gd {
class Project;
class SerializerElement;
}  // namespace gd

namespace gd {

/**
 * \brief Generic template class representing a folder structure to organize
 * items (objects, layouts, external events, etc.) in folders.
 *
 * \tparam T The type of item to organize (e.g., gd::Object, gd::Layout)
 *
 * \see gd::ObjectsContainer
 */
template <typename T>
class GD_CORE_API FolderOrItem {
 public:
  /**
   * \brief Default constructor creating an empty instance. Useful for the null
   * object pattern.
   */
  FolderOrItem();
  virtual ~FolderOrItem();
  
  /**
   * \brief Constructor for creating an instance representing a folder.
   */
  FolderOrItem(gd::String folderName_, FolderOrItem<T>* parent_ = nullptr);
  
  /**
   * \brief Constructor for creating an instance representing an item.
   */
  FolderOrItem(T* item_, FolderOrItem<T>* parent_ = nullptr);

  /**
   * \brief Returns the item behind the instance.
   */
  T& GetItem() const { return *item; }

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
   * \brief Returns true if the instance represents the item with the given
   * name or if any of the children does (recursive search).
   */
  template <typename GetNameFunc>
  bool HasItemNamed(const gd::String& name, GetNameFunc getName);
  
  /**
   * \brief Returns the child instance holding the item with the given name
   * (recursive search).
   */
  template <typename GetNameFunc>
  FolderOrItem<T>& GetItemNamed(const gd::String& name, GetNameFunc getName);

  /**
   * \brief Returns the number of children. Returns 0 if the instance represents
   * an item.
   */
  std::size_t GetChildrenCount() const {
    if (IsFolder()) return children.size();
    return 0;
  }
  
  /**
   * \brief Returns the child FolderOrItem at the given index.
   */
  FolderOrItem<T>& GetChildAt(std::size_t index);
  
  /**
   * \brief Returns the child FolderOrItem at the given index.
   */
  const FolderOrItem<T>& GetChildAt(std::size_t index) const;
  
  /**
   * \brief Returns the child FolderOrItem that represents the item
   * with the given name. To use only if sure that the instance holds the item
   * in its direct children (no recursive search).
   */
  template <typename GetNameFunc>
  FolderOrItem<T>& GetItemChild(const gd::String& name, GetNameFunc getName);

  /**
   * \brief Returns the parent of the instance. If the instance has no parent
   * (root folder), the null object is returned.
   */
  FolderOrItem<T>& GetParent() {
    if (parent == nullptr) {
      return GetBadFolderOrItem();
    }
    return *parent;
  }

  /**
   * \brief Returns true if the instance is a root folder (that's to say it
   * has no parent).
   */
  bool IsRootFolder() { return !item && !parent; }

  /**
   * \brief Moves a child from a position to a new one.
   */
  void MoveChild(std::size_t oldIndex, std::size_t newIndex);
  
  /**
   * \brief Removes the given child from the instance's children. If the given
   * child contains children of its own, does nothing.
   */
  void RemoveFolderChild(const FolderOrItem<T>& childToRemove);
  
  /**
   * \brief Removes the child representing the item with the given name from
   * the instance children and recursively does it for every folder children.
   */
  template <typename GetNameFunc>
  void RemoveRecursivelyItemNamed(const gd::String& name, GetNameFunc getName);
  
  /**
   * \brief Clears all children
   */
  void Clear();

  /**
   * \brief Inserts an instance representing the given item at the given
   * position.
   */
  void InsertItem(T* insertedItem, std::size_t position = (size_t)-1);
  
  /**
   * \brief Inserts an instance representing a folder with the given name at the
   * given position.
   */
  FolderOrItem<T>& InsertNewFolder(const gd::String& newFolderName,
                                   std::size_t position);
  
  /**
   * \brief Returns true if the instance is a descendant of the given instance
   * of FolderOrItem.
   */
  bool IsADescendantOf(const FolderOrItem<T>& otherFolderOrItem);

  /**
   * \brief Returns the position of the given instance of FolderOrItem
   * in the instance's children.
   */
  std::size_t GetChildPosition(const FolderOrItem<T>& child) const;
  
  /**
   * \brief Moves the given child FolderOrItem to the given folder at
   * the given position.
   */
  void MoveFolderOrItemToAnotherFolder(
      FolderOrItem<T>& folderOrItem,
      FolderOrItem<T>& newParentFolder,
      std::size_t newPosition);

  QuickCustomization::Visibility GetQuickCustomizationVisibility() const { 
    return quickCustomizationVisibility; 
  }
  
  void SetQuickCustomizationVisibility(QuickCustomization::Visibility visibility) {
    quickCustomizationVisibility = visibility;
  }

  /** \name Saving and loading
   * Members functions related to saving and loading the objects of the class.
   */
  ///@{
  /**
   * \brief Serialize the FolderOrItem instance.
   */
  template <typename GetNameFunc>
  void SerializeTo(SerializerElement& element, GetNameFunc getName) const;

  /**
   * \brief Unserialize the FolderOrItem instance.
   */
  template <typename ItemContainerType, typename GetItemFunc>
  void UnserializeFrom(gd::Project& project,
                       const SerializerElement& element,
                       ItemContainerType& itemContainer,
                       GetItemFunc getItem);
  ///@}

    /**
   * \brief Compatibility wrapper: GetObject() -> GetItem()
   */
  T& GetObject() const { return GetItem(); }
  
  /**
   * \brief Compatibility wrapper: HasObjectNamed() -> HasItemNamed()
   */
  bool HasObjectNamed(const gd::String& name) {
    return HasItemNamed(name, [](const T& item) {
      return item.GetName();
    });
  }
  
  /**
   * \brief Compatibility wrapper: GetObjectNamed() -> GetItemNamed()
   */
  FolderOrItem<T>& GetObjectNamed(const gd::String& name) {
    return GetItemNamed(name, [](const T& item) {
      return item.GetName();
    });
  }
  
  /**
   * \brief Compatibility wrapper: GetObjectChild() -> GetItemChild()
   */
  FolderOrItem<T>& GetObjectChild(const gd::String& name) {
    return GetItemChild(name, [](const T& item) {
      return item.GetName();
    });
  }
  
  /**
   * \brief Compatibility wrapper: InsertObject() -> InsertItem()
   */
  void InsertObject(T* insertedItem, std::size_t position = (size_t)-1) {
    InsertItem(insertedItem, position);
  }
  
  /**
   * \brief Compatibility wrapper: RemoveRecursivelyObjectNamed() -> RemoveRecursivelyItemNamed()
   */
  void RemoveRecursivelyObjectNamed(const gd::String& name) {
    RemoveRecursivelyItemNamed(name, [](const T& item) {
      return item.GetName();
    });
  }
  
  /**
   * \brief Compatibility wrapper: MoveObjectFolderOrObjectToAnotherFolder() -> MoveFolderOrItemToAnotherFolder()
   */
  void MoveObjectFolderOrObjectToAnotherFolder(
      FolderOrItem<T>& folderOrItem,
      FolderOrItem<T>& newParentFolder,
      std::size_t newPosition) {
    MoveFolderOrItemToAnotherFolder(folderOrItem, newParentFolder, newPosition);
  }

 private:
  static FolderOrItem<T>& GetBadFolderOrItem();

  FolderOrItem<T>* parent = nullptr;
  QuickCustomization::Visibility quickCustomizationVisibility;

  // Representing an item:
  T* item;  // nullptr if folderName is set.

  // or representing a folder:
  gd::String folderName;  // Empty if item is set.
  std::vector<std::unique_ptr<FolderOrItem<T>>> children;
};

// Template implementations must be in header file

template <typename T>
FolderOrItem<T>& FolderOrItem<T>::GetBadFolderOrItem() {
  static FolderOrItem<T> badFolderOrItem;
  return badFolderOrItem;
}

template <typename T>
FolderOrItem<T>::FolderOrItem()
    : folderName("__NULL"),
      item(nullptr),
      quickCustomizationVisibility(QuickCustomization::Visibility::Default) {}

template <typename T>
FolderOrItem<T>::FolderOrItem(gd::String folderName_, FolderOrItem<T>* parent_)
    : folderName(folderName_),
      parent(parent_),
      item(nullptr),
      quickCustomizationVisibility(QuickCustomization::Visibility::Default) {}

template <typename T>
FolderOrItem<T>::FolderOrItem(T* item_, FolderOrItem<T>* parent_)
    : item(item_),
      parent(parent_),
      quickCustomizationVisibility(QuickCustomization::Visibility::Default) {}

template <typename T>
FolderOrItem<T>::~FolderOrItem() {}

template <typename T>
template <typename GetNameFunc>
bool FolderOrItem<T>::HasItemNamed(const gd::String& name, GetNameFunc getName) {
  if (IsFolder()) {
    return std::any_of(
        children.begin(),
        children.end(),
        [&name, &getName](std::unique_ptr<FolderOrItem<T>>& folderOrItem) {
          return folderOrItem->HasItemNamed(name, getName);
        });
  }
  if (!item) return false;
  return getName(*item) == name;
}

template <typename T>
template <typename GetNameFunc>
FolderOrItem<T>& FolderOrItem<T>::GetItemNamed(const gd::String& name, GetNameFunc getName) {
  if (item && getName(*item) == name) {
    return *this;
  }
  if (IsFolder()) {
    for (std::size_t j = 0; j < children.size(); j++) {
      FolderOrItem<T>& foundInChild = children[j]->GetItemNamed(name, getName);
      if (&foundInChild != &GetBadFolderOrItem()) {
        return foundInChild;
      }
    }
  }
  return GetBadFolderOrItem();
}

template <typename T>
void FolderOrItem<T>::SetFolderName(const gd::String& name) {
  if (!IsFolder()) return;
  folderName = name;
}

template <typename T>
FolderOrItem<T>& FolderOrItem<T>::GetChildAt(std::size_t index) {
  if (index >= children.size()) return GetBadFolderOrItem();
  return *children[index];
}

template <typename T>
const FolderOrItem<T>& FolderOrItem<T>::GetChildAt(std::size_t index) const {
  if (index >= children.size()) return GetBadFolderOrItem();
  return *children[index];
}

template <typename T>
template <typename GetNameFunc>
FolderOrItem<T>& FolderOrItem<T>::GetItemChild(const gd::String& name, GetNameFunc getName) {
  for (std::size_t j = 0; j < children.size(); j++) {
    if (!children[j]->IsFolder()) {
      if (getName(children[j]->GetItem()) == name) return *children[j];
    }
  }
  return GetBadFolderOrItem();
}

template <typename T>
void FolderOrItem<T>::InsertItem(T* insertedItem, std::size_t position) {
  auto folderOrItem = gd::make_unique<FolderOrItem<T>>(insertedItem, this);
  if (position < children.size()) {
    children.insert(children.begin() + position, std::move(folderOrItem));
  } else {
    children.push_back(std::move(folderOrItem));
  }
}

template <typename T>
std::size_t FolderOrItem<T>::GetChildPosition(const FolderOrItem<T>& child) const {
  for (std::size_t j = 0; j < children.size(); j++) {
    if (children[j].get() == &child) return j;
  }
  return gd::String::npos;
}

template <typename T>
FolderOrItem<T>& FolderOrItem<T>::InsertNewFolder(const gd::String& newFolderName,
                                                   std::size_t position) {
  auto newFolderPtr = gd::make_unique<FolderOrItem<T>>(newFolderName, this);
  FolderOrItem<T>& newFolder = *(*(children.insert(
      position < children.size() ? children.begin() + position : children.end(),
      std::move(newFolderPtr))));
  return newFolder;
}

template <typename T>
template <typename GetNameFunc>
void FolderOrItem<T>::RemoveRecursivelyItemNamed(const gd::String& name, GetNameFunc getName) {
  if (IsFolder()) {
    children.erase(
        std::remove_if(children.begin(),
                       children.end(),
                       [&name, &getName](std::unique_ptr<FolderOrItem<T>>& folderOrItem) {
                         return !folderOrItem->IsFolder() &&
                                getName(folderOrItem->GetItem()) == name;
                       }),
        children.end());
    for (auto& it : children) {
      it->RemoveRecursivelyItemNamed(name, getName);
    }
  }
}

template <typename T>
void FolderOrItem<T>::Clear() {
  if (IsFolder()) {
    for (auto& it : children) {
      it->Clear();
    }
    children.clear();
  }
}

template <typename T>
bool FolderOrItem<T>::IsADescendantOf(const FolderOrItem<T>& otherFolderOrItem) {
  if (parent == nullptr) return false;
  if (&(*parent) == &otherFolderOrItem) return true;
  return parent->IsADescendantOf(otherFolderOrItem);
}

template <typename T>
void FolderOrItem<T>::MoveChild(std::size_t oldIndex, std::size_t newIndex) {
  if (!IsFolder()) return;
  if (oldIndex >= children.size() || newIndex >= children.size()) return;

  std::unique_ptr<FolderOrItem<T>> folderOrItem = std::move(children[oldIndex]);
  children.erase(children.begin() + oldIndex);
  children.insert(children.begin() + newIndex, std::move(folderOrItem));
}

template <typename T>
void FolderOrItem<T>::RemoveFolderChild(const FolderOrItem<T>& childToRemove) {
  if (!IsFolder() || !childToRemove.IsFolder() ||
      childToRemove.GetChildrenCount() > 0) {
    return;
  }
  auto it = std::find_if(
      children.begin(),
      children.end(),
      [&childToRemove](std::unique_ptr<FolderOrItem<T>>& child) {
        return child.get() == &childToRemove;
      });
  if (it == children.end()) return;

  children.erase(it);
}

template <typename T>
void FolderOrItem<T>::MoveFolderOrItemToAnotherFolder(
    FolderOrItem<T>& folderOrItem,
    FolderOrItem<T>& newParentFolder,
    std::size_t newPosition) {
  if (!newParentFolder.IsFolder()) return;
  if (newParentFolder.IsADescendantOf(folderOrItem)) return;

  auto it = std::find_if(
      children.begin(),
      children.end(),
      [&folderOrItem](std::unique_ptr<FolderOrItem<T>>& childFolderOrItem) {
        return childFolderOrItem.get() == &folderOrItem;
      });
  if (it == children.end()) return;

  std::unique_ptr<FolderOrItem<T>> folderOrItemPtr = std::move(*it);
  children.erase(it);

  folderOrItemPtr->parent = &newParentFolder;
  newParentFolder.children.insert(
      newPosition < newParentFolder.children.size()
          ? newParentFolder.children.begin() + newPosition
          : newParentFolder.children.end(),
      std::move(folderOrItemPtr));
}

template <typename T>
template <typename GetNameFunc>
void FolderOrItem<T>::SerializeTo(SerializerElement& element, GetNameFunc getName) const {
  if (IsFolder()) {
    element.SetAttribute("folderName", GetFolderName());
    if (children.size() > 0) {
      SerializerElement& childrenElement = element.AddChild("children");
      childrenElement.ConsiderAsArrayOf("folderOrItem");
      for (std::size_t j = 0; j < children.size(); j++) {
        children[j]->SerializeTo(childrenElement.AddChild("folderOrItem"), getName);
      }
    }
  } else {
    element.SetAttribute("itemName", getName(GetItem()));
  }

  if (quickCustomizationVisibility != QuickCustomization::Visibility::Default) {
    element.SetStringAttribute(
        "quickCustomizationVisibility",
        quickCustomizationVisibility == QuickCustomization::Visibility::Visible
            ? "visible"
            : "hidden");
  }
}

template <typename T>
template <typename ItemContainerType, typename GetItemFunc>
void FolderOrItem<T>::UnserializeFrom(
    gd::Project& project,
    const SerializerElement& element,
    ItemContainerType& itemContainer,
    GetItemFunc getItem) {
  children.clear();
  gd::String potentialFolderName = element.GetStringAttribute("folderName", "");

  if (!potentialFolderName.empty()) {
    // Dies ist ein Folder
    item = nullptr;
    folderName = potentialFolderName;

    if (element.HasChild("children")) {
      const SerializerElement& childrenElements = element.GetChild("children", 0);
      childrenElements.ConsiderAsArrayOf("folderOrItem");
      for (std::size_t i = 0; i < childrenElements.GetChildrenCount(); ++i) {
        std::unique_ptr<FolderOrItem<T>> childFolderOrItem =
            gd::make_unique<FolderOrItem<T>>();
        childFolderOrItem->UnserializeFrom(
            project, childrenElements.GetChild(i), itemContainer, getItem);
        childFolderOrItem->parent = this;
        
        // Nur gültige Children hinzufügen (nicht die mit __INVALID__)
        if (childFolderOrItem->folderName != "__INVALID__") {
          children.push_back(std::move(childFolderOrItem));
        }
      }
    }
} else {
    folderName = "";
    // WICHTIG: Für Kompatibilität beide Attribute-Namen prüfen!
    gd::String itemName = element.GetStringAttribute("itemName", "");
    if (itemName.empty()) {
        // Fallback für alte Projekte mit "objectName"
        itemName = element.GetStringAttribute("objectName", "");
    }
    
    if (itemName.empty()) {
        gd::LogWarning("Empty item name in folder structure, skipping.");
        folderName = "__INVALID__";
        return;
    }
    
    item = getItem(itemContainer, itemName);
    
    if (item == nullptr) {
        gd::LogWarning("Item '" + itemName + "' not found, skipping folder entry.");
        folderName = "__INVALID__";
        return;
    }
}

  if (element.HasChild("quickCustomizationVisibility")) {
    quickCustomizationVisibility =
        element.GetStringAttribute("quickCustomizationVisibility") == "visible"
            ? QuickCustomization::Visibility::Visible
            : QuickCustomization::Visibility::Hidden;
  } else {
    quickCustomizationVisibility = QuickCustomization::Visibility::Default;
  }
}

}  // namespace gd

#endif  // GDCORE_FOLDERORITEM_H