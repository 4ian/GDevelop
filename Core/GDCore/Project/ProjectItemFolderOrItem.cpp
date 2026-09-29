/*
 * GDevelop Core
 * Copyright 2008-2025 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/ProjectItemFolderOrItem.h"

#include <algorithm>
#include <memory>

#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Test.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/MakeUnique.h"

namespace gd {

template <>
const char* LayoutFolderOrLayout::GetTrackedClassName() {
  return "LayoutFolderOrLayout";
}
template <>
const char* ExternalLayoutFolderOrExternalLayout::GetTrackedClassName() {
  return "ExternalLayoutFolderOrExternalLayout";
}
template <>
const char* ExternalEventsFolderOrExternalEvents::GetTrackedClassName() {
  return "ExternalEventsFolderOrExternalEvents";
}
template <>
const char* TestFolderOrTest::GetTrackedClassName() {
  return "TestFolderOrTest";
}

template <class ItemType>
ProjectItemFolderOrItem<ItemType>&
ProjectItemFolderOrItem<ItemType>::GetBadFolderOrItem() {
  static ProjectItemFolderOrItem<ItemType> badFolderOrItem;
  return badFolderOrItem;
}

template <class ItemType>
ProjectItemFolderOrItem<ItemType>::ProjectItemFolderOrItem()
    : item(nullptr), folderName("__NULL") {}
template <class ItemType>
ProjectItemFolderOrItem<ItemType>::ProjectItemFolderOrItem(
    gd::String folderName_, ProjectItemFolderOrItem* parent_)
    : parent(parent_), item(nullptr), folderName(folderName_) {}
template <class ItemType>
ProjectItemFolderOrItem<ItemType>::ProjectItemFolderOrItem(
    ItemType* item_, ProjectItemFolderOrItem* parent_)
    : parent(parent_), item(item_) {}
template <class ItemType>
ProjectItemFolderOrItem<ItemType>::~ProjectItemFolderOrItem() {}

template <class ItemType>
bool ProjectItemFolderOrItem<ItemType>::HasItemNamed(const gd::String& name) {
  if (IsFolder()) {
    return std::any_of(
        children.begin(),
        children.end(),
        [&name](std::unique_ptr<ProjectItemFolderOrItem>& folderOrItem) {
          return folderOrItem->HasItemNamed(name);
        });
  }
  if (!item) return false;
  return item->GetName() == name;
}

template <class ItemType>
ProjectItemFolderOrItem<ItemType>&
ProjectItemFolderOrItem<ItemType>::GetItemNamed(const gd::String& name) {
  if (item && item->GetName() == name) {
    return *this;
  }
  if (IsFolder()) {
    for (std::size_t j = 0; j < children.size(); j++) {
      ProjectItemFolderOrItem& foundInChild = children[j]->GetItemNamed(name);
      if (&(foundInChild) != &GetBadFolderOrItem()) {
        return foundInChild;
      }
    }
  }
  return GetBadFolderOrItem();
}

template <class ItemType>
void ProjectItemFolderOrItem<ItemType>::SetFolderName(const gd::String& name) {
  if (!IsFolder()) return;
  folderName = name;
}

template <class ItemType>
ProjectItemFolderOrItem<ItemType>&
ProjectItemFolderOrItem<ItemType>::GetChildAt(std::size_t index) {
  if (index >= children.size()) return GetBadFolderOrItem();
  return *children[index];
}
template <class ItemType>
const ProjectItemFolderOrItem<ItemType>&
ProjectItemFolderOrItem<ItemType>::GetChildAt(std::size_t index) const {
  if (index >= children.size()) return GetBadFolderOrItem();
  return *children[index];
}

template <class ItemType>
ProjectItemFolderOrItem<ItemType>&
ProjectItemFolderOrItem<ItemType>::GetItemChild(const gd::String& name) {
  for (std::size_t j = 0; j < children.size(); j++) {
    if (!children[j]->IsFolder()) {
      if (children[j]->GetItem().GetName() == name) return *children[j];
    };
  }
  return GetBadFolderOrItem();
}

template <class ItemType>
void ProjectItemFolderOrItem<ItemType>::InsertItem(ItemType* insertedItem,
                                                   std::size_t position) {
  auto folderOrItem =
      gd::make_unique<ProjectItemFolderOrItem>(insertedItem, this);
  if (position < children.size()) {
    children.insert(children.begin() + position, std::move(folderOrItem));
  } else {
    children.push_back(std::move(folderOrItem));
  }
}

template <class ItemType>
std::size_t ProjectItemFolderOrItem<ItemType>::GetChildPosition(
    const ProjectItemFolderOrItem& child) const {
  for (std::size_t j = 0; j < children.size(); j++) {
    if (children[j].get() == &child) return j;
  }
  return gd::String::npos;
}

template <class ItemType>
ProjectItemFolderOrItem<ItemType>&
ProjectItemFolderOrItem<ItemType>::InsertNewFolder(
    const gd::String& newFolderName, std::size_t position) {
  auto newFolderPtr =
      gd::make_unique<ProjectItemFolderOrItem>(newFolderName, this);
  ProjectItemFolderOrItem& newFolder = *(*(children.insert(
      position < children.size() ? children.begin() + position : children.end(),
      std::move(newFolderPtr))));
  return newFolder;
};

template <class ItemType>
void ProjectItemFolderOrItem<ItemType>::RemoveRecursivelyItemNamed(
    const gd::String& name) {
  if (IsFolder()) {
    children.erase(
        std::remove_if(
            children.begin(),
            children.end(),
            [&name](std::unique_ptr<ProjectItemFolderOrItem>& folderOrItem) {
              return !folderOrItem->IsFolder() &&
                     folderOrItem->GetItem().GetName() == name;
            }),
        children.end());
    for (auto& it : children) {
      it->RemoveRecursivelyItemNamed(name);
    }
  }
};

template <class ItemType>
void ProjectItemFolderOrItem<ItemType>::Clear() {
  if (IsFolder()) {
    for (auto& it : children) {
      it->Clear();
    }
    children.clear();
  }
};

template <class ItemType>
bool ProjectItemFolderOrItem<ItemType>::IsADescendantOf(
    const ProjectItemFolderOrItem& otherFolderOrItem) {
  if (parent == nullptr) return false;
  if (&(*parent) == &otherFolderOrItem) return true;
  return parent->IsADescendantOf(otherFolderOrItem);
}

template <class ItemType>
void ProjectItemFolderOrItem<ItemType>::MoveChild(std::size_t oldIndex,
                                                  std::size_t newIndex) {
  if (!IsFolder()) return;
  if (oldIndex >= children.size() || newIndex >= children.size()) return;

  std::unique_ptr<ProjectItemFolderOrItem> folderOrItem =
      std::move(children[oldIndex]);
  children.erase(children.begin() + oldIndex);
  children.insert(children.begin() + newIndex, std::move(folderOrItem));
}

template <class ItemType>
void ProjectItemFolderOrItem<ItemType>::RemoveFolderChild(
    const ProjectItemFolderOrItem& childToRemove) {
  if (!IsFolder() || !childToRemove.IsFolder() ||
      childToRemove.GetChildrenCount() > 0) {
    return;
  }
  auto it = std::find_if(
      children.begin(),
      children.end(),
      [&childToRemove](std::unique_ptr<ProjectItemFolderOrItem>& child) {
        return child.get() == &childToRemove;
      });
  if (it == children.end()) return;

  children.erase(it);
}

template <class ItemType>
void ProjectItemFolderOrItem<ItemType>::MoveFolderOrItemToAnotherFolder(
    ProjectItemFolderOrItem& folderOrItem,
    ProjectItemFolderOrItem& newParentFolder,
    std::size_t newPosition) {
  if (!newParentFolder.IsFolder()) return;
  if (newParentFolder.IsADescendantOf(folderOrItem)) return;

  auto it = std::find_if(
      children.begin(),
      children.end(),
      [&folderOrItem](std::unique_ptr<ProjectItemFolderOrItem>& child) {
        return child.get() == &folderOrItem;
      });
  if (it == children.end()) return;

  std::unique_ptr<ProjectItemFolderOrItem> folderOrItemPtr = std::move(*it);
  children.erase(it);

  folderOrItemPtr->parent = &newParentFolder;
  newParentFolder.children.insert(
      newPosition < newParentFolder.children.size()
          ? newParentFolder.children.begin() + newPosition
          : newParentFolder.children.end(),
      std::move(folderOrItemPtr));
}

template <class ItemType>
void ProjectItemFolderOrItem<ItemType>::AddMissingItems(
    const std::vector<std::unique_ptr<ItemType>>& items) {
  for (const auto& listedItem : items) {
    if (!HasItemNamed(listedItem->GetName())) {
      InsertItem(listedItem.get());
    }
  }
}

template <class ItemType>
void ProjectItemFolderOrItem<ItemType>::SerializeTo(
    SerializerElement& element) const {
  if (IsFolder()) {
    element.SetAttribute("folderName", GetFolderName());
    if (children.size() > 0) {
      SerializerElement& childrenElement = element.AddChild("children");
      childrenElement.ConsiderAsArrayOf("folderOrItem");
      for (std::size_t j = 0; j < children.size(); j++) {
        children[j]->SerializeTo(childrenElement.AddChild("folderOrItem"));
      }
    }
  } else {
    element.SetAttribute("itemName", GetItem().GetName());
  }
}

template <class ItemType>
void ProjectItemFolderOrItem<ItemType>::UnserializeFromChildOf(
    const SerializerElement& parentElement,
    const gd::String& childName,
    const std::function<ItemType*(const gd::String&)>& findItem,
    const std::vector<std::unique_ptr<ItemType>>& items) {
  if (parentElement.HasChild(childName)) {
    UnserializeFrom(parentElement.GetChild(childName, 0), findItem);
  } else {
    Clear();
  }
  AddMissingItems(items);
}

template <class ItemType>
void ProjectItemFolderOrItem<ItemType>::UnserializeFrom(
    const SerializerElement& element,
    const std::function<ItemType*(const gd::String&)>& findItem) {
  children.clear();
  gd::String potentialFolderName = element.GetStringAttribute("folderName", "");

  if (!potentialFolderName.empty()) {
    item = nullptr;
    folderName = potentialFolderName;

    if (element.HasChild("children")) {
      const SerializerElement& childrenElements =
          element.GetChild("children", 0);
      childrenElements.ConsiderAsArrayOf("folderOrItem");
      for (std::size_t i = 0; i < childrenElements.GetChildrenCount(); ++i) {
        std::unique_ptr<ProjectItemFolderOrItem> childFolderOrItem =
            gd::make_unique<ProjectItemFolderOrItem>();
        childFolderOrItem->UnserializeFrom(childrenElements.GetChild(i),
                                           findItem);
        if (!childFolderOrItem->IsFolder() &&
            childFolderOrItem->item == nullptr) {
          // Ignore invalid references to missing items, that can happen
          // after manual edits or merges.
          continue;
        }
        childFolderOrItem->parent = this;
        children.push_back(std::move(childFolderOrItem));
      }
    }
  } else {
    folderName = "";
    gd::String itemName = element.GetStringAttribute("itemName");
    item = findItem(itemName);
    if (!item) {
      gd::LogError("Item with name " + itemName +
                   " not found in the project.");
    }
  }
};

template class ProjectItemFolderOrItem<gd::Layout>;
template class ProjectItemFolderOrItem<gd::ExternalLayout>;
template class ProjectItemFolderOrItem<gd::ExternalEvents>;
template class ProjectItemFolderOrItem<gd::Test>;

}  // namespace gd
