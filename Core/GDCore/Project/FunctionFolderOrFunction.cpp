/*
 * GDevelop Core
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/FunctionFolderOrFunction.h"

#include <memory>

#include "GDCore/Project/EventsFunction.h"
#include "GDCore/Project/EventsFunctionsContainer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Log.h"

using namespace std;

namespace gd {

FunctionFolderOrFunction FunctionFolderOrFunction::badFunctionFolderOrFunction;
gd::String FunctionFolderOrFunction::emptyGroupName;

FunctionFolderOrFunction::FunctionFolderOrFunction()
    : folderName("__NULL"), function(nullptr) {}
FunctionFolderOrFunction::FunctionFolderOrFunction(
    gd::String folderName_, FunctionFolderOrFunction *parent_)
    : folderName(folderName_), parent(parent_), function(nullptr) {}
FunctionFolderOrFunction::FunctionFolderOrFunction(
    gd::EventsFunction *function_, FunctionFolderOrFunction *parent_)
    : function(function_), parent(parent_) {}
FunctionFolderOrFunction::~FunctionFolderOrFunction() {}

bool FunctionFolderOrFunction::HasFunctionNamed(const gd::String &name) {
  if (IsFolder()) {
    return std::any_of(children.begin(), children.end(),
                       [&name](std::unique_ptr<gd::FunctionFolderOrFunction>
                                   &functionFolderOrFunction) {
                         return functionFolderOrFunction->HasFunctionNamed(
                             name);
                       });
  }
  if (!function)
    return false;
  return function->GetName() == name;
}

FunctionFolderOrFunction &
FunctionFolderOrFunction::GetOrCreateChildFolder(const gd::String &name) {
  if (!IsFolder()) {
    LogError("Try to create of a folder '" + name + "' inside a function");
    return gd::FunctionFolderOrFunction::badFunctionFolderOrFunction;
  }
  for (auto &&child : children) {
    if (child->IsFolder() && child->folderName == name) {
      return *child;
    }
  }
  return InsertNewFolder(name, GetChildrenCount());
}

FunctionFolderOrFunction &
FunctionFolderOrFunction::GetFunctionNamed(const gd::String &name) {
  if (function && function->GetName() == name) {
    return *this;
  }
  if (IsFolder()) {
    for (std::size_t j = 0; j < children.size(); j++) {
      FunctionFolderOrFunction &foundInChild =
          children[j]->GetFunctionNamed(name);
      if (&(foundInChild) != &badFunctionFolderOrFunction) {
        return foundInChild;
      }
    }
  }
  return badFunctionFolderOrFunction;
}

void FunctionFolderOrFunction::SetFolderName(const gd::String &name) {
  if (!IsFolder())
    return;
  folderName = name;
  UpdateGroupNameOfAllFunctions();
}

const gd::String FunctionFolderOrFunction::GetGroupPath() {
  auto *groupFolder = this;
  if (!groupFolder->IsFolder()) {
    groupFolder = groupFolder->parent;
  }
  if (groupFolder->IsRootFolder()) {
    return gd::FunctionFolderOrFunction::emptyGroupName;
  }
  gd::String groupPath = groupFolder->GetFolderName();
  groupFolder = groupFolder->parent;
  while (groupFolder->parent) {
    groupPath = groupFolder->GetFolderName() + "/" + groupPath;
    groupFolder = groupFolder->parent;
  }
  return groupPath;
}

void FunctionFolderOrFunction::UpdateGroupNameOfAllFunctions() {
  auto groupPath = GetGroupPath();
  if (IsFolder()) {
    DoUpdateGroupNameOfAllFunctions(groupPath);
  } else {
    function->SetGroup(groupPath);
  }
}

void FunctionFolderOrFunction::DoUpdateGroupNameOfAllFunctions(
    const gd::String &groupPath) {
  for (auto &&child : children) {
    if (child->IsFolder()) {
      child->DoUpdateGroupNameOfAllFunctions(
          groupPath.empty() ? child->folderName
                            : groupPath + "/" + child->folderName);
    } else {
      child->function->SetGroup(groupPath);
    }
  }
}

FunctionFolderOrFunction &
FunctionFolderOrFunction::GetChildAt(std::size_t index) {
  if (index >= children.size())
    return badFunctionFolderOrFunction;
  return *children[index];
}
const FunctionFolderOrFunction &
FunctionFolderOrFunction::GetChildAt(std::size_t index) const {
  if (index >= children.size())
    return badFunctionFolderOrFunction;
  return *children[index];
}
FunctionFolderOrFunction &
FunctionFolderOrFunction::GetFunctionChild(const gd::String &name) {
  for (std::size_t j = 0; j < children.size(); j++) {
    if (!children[j]->IsFolder()) {
      if (children[j]->GetFunction().GetName() == name)
        return *children[j];
    };
  }
  return badFunctionFolderOrFunction;
}

void FunctionFolderOrFunction::InsertFunction(
    gd::EventsFunction *insertedFunction, std::size_t position) {
  insertedFunction->SetGroup(GetGroupPath());
  auto functionFolderOrFunction =
      gd::make_unique<FunctionFolderOrFunction>(insertedFunction, this);
  if (position < children.size()) {
    children.insert(children.begin() + position,
                    std::move(functionFolderOrFunction));
  } else {
    children.push_back(std::move(functionFolderOrFunction));
  }
}

std::size_t FunctionFolderOrFunction::GetChildPosition(
    const FunctionFolderOrFunction &child) const {
  for (std::size_t j = 0; j < children.size(); j++) {
    if (children[j].get() == &child)
      return j;
  }
  return gd::String::npos;
}

FunctionFolderOrFunction &
FunctionFolderOrFunction::InsertNewFolder(const gd::String &newFolderName,
                                          std::size_t position) {
  auto newFolderPtr =
      gd::make_unique<FunctionFolderOrFunction>(newFolderName, this);
  gd::FunctionFolderOrFunction &newFolder = *(*(children.insert(
      position < children.size() ? children.begin() + position : children.end(),
      std::move(newFolderPtr))));
  return newFolder;
};

void FunctionFolderOrFunction::RemoveRecursivelyFunctionNamed(
    const gd::String &name) {
  if (IsFolder()) {
    children.erase(
        std::remove_if(
            children.begin(), children.end(),
            [&name](std::unique_ptr<gd::FunctionFolderOrFunction>
                        &functionFolderOrFunction) {
              return !functionFolderOrFunction->IsFolder() &&
                     functionFolderOrFunction->GetFunction().GetName() == name;
            }),
        children.end());
    for (auto &it : children) {
      it->RemoveRecursivelyFunctionNamed(name);
    }
  }
};

void FunctionFolderOrFunction::Clear() {
  if (IsFolder()) {
    for (auto &it : children) {
      it->Clear();
    }
    children.clear();
  }
};

bool FunctionFolderOrFunction::IsADescendantOf(
    const FunctionFolderOrFunction &otherFunctionFolderOrFunction) {
  if (parent == nullptr)
    return false;
  if (&(*parent) == &otherFunctionFolderOrFunction)
    return true;
  return parent->IsADescendantOf(otherFunctionFolderOrFunction);
}

void FunctionFolderOrFunction::MoveChild(std::size_t oldIndex,
                                         std::size_t newIndex) {
  if (!IsFolder())
    return;
  if (oldIndex >= children.size() || newIndex >= children.size())
    return;

  std::unique_ptr<gd::FunctionFolderOrFunction> functionFolderOrFunction =
      std::move(children[oldIndex]);
  children.erase(children.begin() + oldIndex);
  children.insert(children.begin() + newIndex,
                  std::move(functionFolderOrFunction));
}

void FunctionFolderOrFunction::RemoveFolderChild(
    const FunctionFolderOrFunction &childToRemove) {
  if (!IsFolder() || !childToRemove.IsFolder() ||
      childToRemove.GetChildrenCount() > 0) {
    return;
  }
  std::vector<std::unique_ptr<gd::FunctionFolderOrFunction>>::iterator it =
      find_if(children.begin(), children.end(),
              [&childToRemove](
                  std::unique_ptr<gd::FunctionFolderOrFunction> &child) {
                return child.get() == &childToRemove;
              });
  if (it == children.end())
    return;

  children.erase(it);
}

void FunctionFolderOrFunction::MoveFunctionFolderOrFunctionToAnotherFolder(
    gd::FunctionFolderOrFunction &functionFolderOrFunction,
    gd::FunctionFolderOrFunction &newParentFolder, std::size_t newPosition) {
  if (!newParentFolder.IsFolder())
    return;
  if (newParentFolder.IsADescendantOf(functionFolderOrFunction))
    return;

  std::vector<std::unique_ptr<gd::FunctionFolderOrFunction>>::iterator it =
      find_if(children.begin(), children.end(),
              [&functionFolderOrFunction](
                  std::unique_ptr<gd::FunctionFolderOrFunction>
                      &childFunctionFolderOrFunction) {
                return childFunctionFolderOrFunction.get() ==
                       &functionFolderOrFunction;
              });
  if (it == children.end())
    return;

  std::unique_ptr<gd::FunctionFolderOrFunction> functionFolderOrFunctionPtr =
      std::move(*it);
  children.erase(it);

  functionFolderOrFunctionPtr->parent = &newParentFolder;
  functionFolderOrFunctionPtr->UpdateGroupNameOfAllFunctions();

  newParentFolder.children.insert(newPosition < newParentFolder.children.size()
                                      ? newParentFolder.children.begin() +
                                            newPosition
                                      : newParentFolder.children.end(),
                                  std::move(functionFolderOrFunctionPtr));
}

void FunctionFolderOrFunction::SerializeTo(SerializerElement &element) const {
  if (IsFolder()) {
    element.SetAttribute("folderName", GetFolderName());
    if (children.size() > 0) {
      SerializerElement &childrenElement = element.AddChild("children");
      childrenElement.ConsiderAsArrayOf("functionFolderOrFunction");
      for (std::size_t j = 0; j < children.size(); j++) {
        children[j]->SerializeTo(
            childrenElement.AddChild("functionFolderOrFunction"));
      }
    }
  } else {
    element.SetAttribute("functionName", GetFunction().GetName());
  }
}

void FunctionFolderOrFunction::UnserializeFrom(const SerializerElement &element,
    gd::EventsFunctionsContainer &functionsContainer) {
  children.clear();
  gd::String potentialFolderName = element.GetStringAttribute("folderName", "");

  if (!potentialFolderName.empty()) {
    function = nullptr;
    folderName = potentialFolderName;

    if (element.HasChild("children")) {
      const SerializerElement &childrenElements =
          element.GetChild("children", 0);
      childrenElements.ConsiderAsArrayOf("functionFolderOrFunction");
      for (std::size_t i = 0; i < childrenElements.GetChildrenCount(); ++i) {
        std::unique_ptr<FunctionFolderOrFunction>
            childFunctionFolderOrFunction =
                make_unique<FunctionFolderOrFunction>();
        childFunctionFolderOrFunction->UnserializeFrom(
            childrenElements.GetChild(i), functionsContainer);
        childFunctionFolderOrFunction->parent = this;
        children.push_back(std::move(childFunctionFolderOrFunction));
      }
    }
  } else {
    folderName = "";
    gd::String functionName = element.GetStringAttribute("functionName");
    if (functionsContainer.HasEventsFunctionNamed(functionName)) {
      function = &functionsContainer.GetEventsFunction(functionName);
    } else {
      gd::LogError("Function with name " + functionName +
                   " not found in functions container.");
      function = nullptr;
    }
  }
};

} // namespace gd