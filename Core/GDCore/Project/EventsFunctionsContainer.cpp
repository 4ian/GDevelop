/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EventsFunctionsContainer.h"

namespace gd {

gd::EventsFunction &EventsFunctionsContainer::InsertNewFunctionInFolder(
    const gd::String &name,
    gd::FunctionFolderOrFunction &functionFolderOrFunction,
    std::size_t position) {
  gd::EventsFunction &newlyCreatedFunction =
      InsertNewEventsFunction(name, GetEventsFunctionsCount());
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

void EventsFunctionsContainer::AddMissingFunctionsInRootFolder() {
  for (std::size_t i = 0; i < GetEventsFunctionsCount(); ++i) {
    auto &function = GetEventsFunction(i);
    if (!rootFolder->HasFunctionNamed(function.GetName())) {
      const gd::String &group = function.GetGroup();
      auto &folder = !group.empty() ? rootFolder->GetOrCreateChildFolder(group)
                                    : *rootFolder;
      folder.InsertFunction(&function);
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