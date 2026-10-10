/*
 * GDevelop Core
 * Copyright 2008-2025 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/LayoutFolderOrLayout.h"

#include <memory>

#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Log.h"

using namespace std;

namespace gd {

LayoutFolderOrLayout LayoutFolderOrLayout::badLayoutFolderOrLayout;

LayoutFolderOrLayout::LayoutFolderOrLayout()
    : folderName("__NULL"), layout(nullptr) {}
LayoutFolderOrLayout::LayoutFolderOrLayout(gd::String folderName_,
                                           LayoutFolderOrLayout* parent_)
    : folderName(folderName_), parent(parent_), layout(nullptr) {}
LayoutFolderOrLayout::LayoutFolderOrLayout(gd::Layout* layout_,
                                           LayoutFolderOrLayout* parent_)
    : layout(layout_), parent(parent_) {}
LayoutFolderOrLayout::~LayoutFolderOrLayout() {}

bool LayoutFolderOrLayout::HasLayoutNamed(const gd::String& name) {
  if (IsFolder()) {
    return std::any_of(
        children.begin(),
        children.end(),
        [&name](
            std::unique_ptr<gd::LayoutFolderOrLayout>& layoutFolderOrLayout) {
          return layoutFolderOrLayout->HasLayoutNamed(name);
        });
  }
  if (!layout) return false;
  return layout->GetName() == name;
}
LayoutFolderOrLayout& LayoutFolderOrLayout::GetLayoutNamed(
    const gd::String& name) {
  if (layout && layout->GetName() == name) {
    return *this;
  }
  if (IsFolder()) {
    for (std::size_t j = 0; j < children.size(); j++) {
      LayoutFolderOrLayout& foundInChild = children[j]->GetLayoutNamed(name);
      if (&(foundInChild) != &badLayoutFolderOrLayout) {
        return foundInChild;
      }
    }
  }
  return badLayoutFolderOrLayout;
}

void LayoutFolderOrLayout::SetFolderName(const gd::String& name) {
  if (!IsFolder()) return;
  folderName = name;
}

LayoutFolderOrLayout& LayoutFolderOrLayout::GetChildAt(std::size_t index) {
  if (index >= children.size()) return badLayoutFolderOrLayout;
  return *children[index];
}
const LayoutFolderOrLayout& LayoutFolderOrLayout::GetChildAt(
    std::size_t index) const {
  if (index >= children.size()) return badLayoutFolderOrLayout;
  return *children[index];
}
LayoutFolderOrLayout& LayoutFolderOrLayout::GetLayoutChild(
    const gd::String& name) {
  for (std::size_t j = 0; j < children.size(); j++) {
    if (!children[j]->IsFolder()) {
      if (children[j]->GetLayout().GetName() == name) return *children[j];
    };
  }
  return badLayoutFolderOrLayout;
}

void LayoutFolderOrLayout::InsertLayout(gd::Layout* insertedLayout,
                                        std::size_t position) {
  auto layoutFolderOrLayout =
      gd::make_unique<LayoutFolderOrLayout>(insertedLayout, this);
  if (position < children.size()) {
    children.insert(children.begin() + position,
                    std::move(layoutFolderOrLayout));
  } else {
    children.push_back(std::move(layoutFolderOrLayout));
  }
}

std::size_t LayoutFolderOrLayout::GetChildPosition(
    const LayoutFolderOrLayout& child) const {
  for (std::size_t j = 0; j < children.size(); j++) {
    if (children[j].get() == &child) return j;
  }
  return gd::String::npos;
}

LayoutFolderOrLayout& LayoutFolderOrLayout::InsertNewFolder(
    const gd::String& newFolderName, std::size_t position) {
  auto newFolderPtr =
      gd::make_unique<LayoutFolderOrLayout>(newFolderName, this);
  gd::LayoutFolderOrLayout& newFolder = *(*(children.insert(
      position < children.size() ? children.begin() + position : children.end(),
      std::move(newFolderPtr))));
  return newFolder;
};

LayoutFolderOrLayout& LayoutFolderOrLayout::GetOrCreateFolderChild(
    const gd::String& name) {
  for (std::size_t j = 0; j < children.size(); j++) {
    if (children[j]->IsFolder()) {
      if (children[j]->GetFolderName() == name) return *children[j];
    };
  }
  return InsertNewFolder(name, children.size());
}

void LayoutFolderOrLayout::RemoveRecursivelyLayoutNamed(
    const gd::String& name) {
  if (IsFolder()) {
    children.erase(
        std::remove_if(children.begin(),
                       children.end(),
                       [&name](std::unique_ptr<gd::LayoutFolderOrLayout>&
                                   layoutFolderOrLayout) {
                         return !layoutFolderOrLayout->IsFolder() &&
                                layoutFolderOrLayout->GetLayout().GetName() ==
                                    name;
                       }),
        children.end());
    for (auto& it : children) {
      it->RemoveRecursivelyLayoutNamed(name);
    }
  }
};

void LayoutFolderOrLayout::Clear() {
  if (IsFolder()) {
    for (auto& it : children) {
      it->Clear();
    }
    children.clear();
  }
};

bool LayoutFolderOrLayout::IsADescendantOf(
    const LayoutFolderOrLayout& otherLayoutFolderOrLayout) {
  if (parent == nullptr) return false;
  if (&(*parent) == &otherLayoutFolderOrLayout) return true;
  return parent->IsADescendantOf(otherLayoutFolderOrLayout);
}

void LayoutFolderOrLayout::MoveChild(std::size_t oldIndex,
                                     std::size_t newIndex) {
  if (!IsFolder()) return;
  if (oldIndex >= children.size() || newIndex >= children.size()) return;

  std::unique_ptr<gd::LayoutFolderOrLayout> layoutFolderOrLayout =
      std::move(children[oldIndex]);
  children.erase(children.begin() + oldIndex);
  children.insert(children.begin() + newIndex, std::move(layoutFolderOrLayout));
}

void LayoutFolderOrLayout::RemoveFolderChild(
    const LayoutFolderOrLayout& childToRemove) {
  if (!IsFolder() || !childToRemove.IsFolder() ||
      childToRemove.GetChildrenCount() > 0) {
    return;
  }
  std::vector<std::unique_ptr<gd::LayoutFolderOrLayout>>::iterator it = find_if(
      children.begin(),
      children.end(),
      [&childToRemove](std::unique_ptr<gd::LayoutFolderOrLayout>& child) {
        return child.get() == &childToRemove;
      });
  if (it == children.end()) return;

  children.erase(it);
}

void LayoutFolderOrLayout::MoveLayoutFolderOrLayoutToAnotherFolder(
    gd::LayoutFolderOrLayout& layoutFolderOrLayout,
    gd::LayoutFolderOrLayout& newParentFolder,
    std::size_t newPosition) {
  if (!newParentFolder.IsFolder()) return;
  if (newParentFolder.IsADescendantOf(layoutFolderOrLayout)) return;

  std::vector<std::unique_ptr<gd::LayoutFolderOrLayout>>::iterator it =
      find_if(children.begin(),
              children.end(),
              [&layoutFolderOrLayout](std::unique_ptr<gd::LayoutFolderOrLayout>&
                                          childLayoutFolderOrLayout) {
                return childLayoutFolderOrLayout.get() == &layoutFolderOrLayout;
              });
  if (it == children.end()) return;

  std::unique_ptr<gd::LayoutFolderOrLayout> layoutFolderOrLayoutPtr =
      std::move(*it);
  children.erase(it);

  layoutFolderOrLayoutPtr->parent = &newParentFolder;
  newParentFolder.children.insert(
      newPosition < newParentFolder.children.size()
          ? newParentFolder.children.begin() + newPosition
          : newParentFolder.children.end(),
      std::move(layoutFolderOrLayoutPtr));
}

void LayoutFolderOrLayout::SerializeTo(SerializerElement& element) const {
  if (IsFolder()) {
    element.SetAttribute("folderName", GetFolderName());
    if (children.size() > 0) {
      SerializerElement& childrenElement = element.AddChild("children");
      childrenElement.ConsiderAsArrayOf("layoutFolderOrLayout");
      for (std::size_t j = 0; j < children.size(); j++) {
        children[j]->SerializeTo(
            childrenElement.AddChild("layoutFolderOrLayout"));
      }
    }
  } else {
    element.SetAttribute("layoutName", GetLayout().GetName());
  }
}

void LayoutFolderOrLayout::UnserializeFrom(gd::Project& project,
                                           const SerializerElement& element) {
  children.clear();
  gd::String potentialFolderName = element.GetStringAttribute("folderName", "");

  if (!potentialFolderName.empty()) {
    layout = nullptr;
    folderName = potentialFolderName;

    if (element.HasChild("children")) {
      const SerializerElement& childrenElements =
          element.GetChild("children", 0);
      childrenElements.ConsiderAsArrayOf("layoutFolderOrLayout");
      for (std::size_t i = 0; i < childrenElements.GetChildrenCount(); ++i) {
        std::unique_ptr<LayoutFolderOrLayout> childLayoutFolderOrLayout =
            make_unique<LayoutFolderOrLayout>();
        childLayoutFolderOrLayout->UnserializeFrom(
            project, childrenElements.GetChild(i));
        if (!childLayoutFolderOrLayout->IsFolder() &&
            childLayoutFolderOrLayout->layout == nullptr) {
          // Ignore invalid references to missing layouts, that can happen
          // after manual edits or merges.
          continue;
        }
        childLayoutFolderOrLayout->parent = this;
        children.push_back(std::move(childLayoutFolderOrLayout));
      }
    }
  } else {
    folderName = "";
    gd::String layoutName = element.GetStringAttribute("layoutName");
    if (project.HasLayoutNamed(layoutName)) {
      layout = &project.GetLayout(layoutName);
    } else {
      gd::LogError("Layout with name " + layoutName +
                   " not found in the project.");
      layout = nullptr;
    }
  }
};

}  // namespace gd
