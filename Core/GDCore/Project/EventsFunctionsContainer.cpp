/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EventsFunctionsContainer.h"

#include <unordered_set>

namespace gd {

gd::EventsFunction &EventsFunctionsContainer::InsertNewEventsFunctionInFolder(
    const gd::String &name,
    gd::FunctionFolderOrFunction &functionFolderOrFunction,
    std::size_t position) {
  gd::EventsFunction &newlyCreatedFunction =
      InsertNew(name, GetEventsFunctionsCount());
  functionFolderOrFunction.InsertFunction(&newlyCreatedFunction, position);
  return newlyCreatedFunction;
}

std::vector<const FunctionFolderOrFunction *>
EventsFunctionsContainer::GetAllFunctionFolderOrFunction() const {
  std::vector<const FunctionFolderOrFunction *> results;

  std::function<void(const FunctionFolderOrFunction &folder)>
      addChildrenOfFolder = [&](const FunctionFolderOrFunction &folder) {
        for (size_t i = 0; i < folder.GetChildrenCount(); ++i) {
          const auto &child = folder.GetChildAt(i);
          results.push_back(&child);

          if (child.IsFolder()) {
            addChildrenOfFolder(child);
          }
        }
      };

  addChildrenOfFolder(*rootFolder);

  return results;
}

void EventsFunctionsContainer::ReinitializeFolderStructure() {
  rootFolder->Clear();
  AddMissingFunctionsInRootFolder();
}


void EventsFunctionsContainer::AddMissingFunctionsInRootFolder() {
  // Get the names of the functions already in the folders once: searching the
  // folders for each function would be O(number of functions^2).
  std::unordered_set<gd::String> functionNamesInFolders;
  rootFolder->AddFunctionNamesTo(functionNamesInFolders);

  for (std::size_t i = 0; i < GetEventsFunctionsCount(); ++i) {
    auto &function = GetEventsFunction(i);
    if (functionNamesInFolders.find(function.GetName()) ==
        functionNamesInFolders.end()) {
      gd::EventsFunction *groupSource = &function;
      // Groups were implicit for ActionWithOperator
      if (function.GetFunctionType() ==
              gd::EventsFunction::ActionWithOperator) {
        const gd::String &getterName = function.GetGetterName();
        if (HasEventsFunctionNamed(getterName)) {
          groupSource = &GetEventsFunction(getterName);
        }
      }
      const gd::String &group = groupSource->GetGroup();
      // TODO Handle sub-folders
      auto &folder = !group.empty() ? rootFolder->GetOrCreateChildFolder(group)
                                    : *rootFolder;
      folder.InsertFunction(&function);
      // The function is now in the folders (unless the root is not a folder,
      // which only happens with an invalid serialized folder structure).
      if (rootFolder->IsFolder())
        functionNamesInFolders.insert(function.GetName());
    }
  }
}

void EventsFunctionsContainer::SerializeFoldersTo(
    SerializerElement &element) const {
  rootFolder->SerializeTo(element);
}

void EventsFunctionsContainer::UnserializeFoldersFrom(
    const SerializerElement &element) {
  rootFolder->UnserializeFrom(element, *this);
  rootFolder->UpdateGroupNameOfAllFunctions();
}

} // namespace gd