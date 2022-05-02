/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"

#include <set>

#include "GDCore/CommonTools.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"

using namespace std;

namespace gd {

void EventsCodeGenerationContext::InheritsFrom(
    EventsCodeGenerationContext& parent_) {
  parent = &parent_;

  // Objects lists declared by parent became "already declared" in the child
  // context.
  alreadyDeclaredObjectsLists = parent_.alreadyDeclaredObjectsLists;
  std::copy(parent_.objectsListsToBeDeclared.begin(),
            parent_.objectsListsToBeDeclared.end(),
            std::inserter(alreadyDeclaredObjectsLists,
                          alreadyDeclaredObjectsLists.begin()));
  std::copy(parent_.objectsListsOrEmptyToBeDeclared.begin(),
            parent_.objectsListsOrEmptyToBeDeclared.end(),
            std::inserter(alreadyDeclaredObjectsLists,
                          alreadyDeclaredObjectsLists.begin()));
  std::copy(parent_.emptyObjectsListsToBeDeclared.begin(),
            parent_.emptyObjectsListsToBeDeclared.end(),
            std::inserter(alreadyDeclaredObjectsLists,
                          alreadyDeclaredObjectsLists.begin()));

  nearestAsyncParent = parent_.IsAsyncCallback() ? &parent_ : parent_.nearestAsyncParent;
  asyncDepth = parent_.asyncDepth;
  depthOfLastUse = parent_.depthOfLastUse;
  customConditionDepth = parent_.customConditionDepth;
  contextDepth = parent_.GetContextDepth() + 1;
  if (parent_.maxDepthLevel) {
    maxDepthLevel = parent_.maxDepthLevel;
    *maxDepthLevel = std::max(*maxDepthLevel, contextDepth);
  }
}

void EventsCodeGenerationContext::InheritsAsAsyncCallbackFrom(
    EventsCodeGenerationContext& parent_) {
  // Increasing the async depth is enough to mark the context as an async callback.
  InheritsFrom(parent_);
  asyncDepth = parent_.asyncDepth + 1;
}

void EventsCodeGenerationContext::Reuse(
    EventsCodeGenerationContext& parent_) {
  InheritsFrom(parent_);
  if (parent_.CanReuse())
    contextDepth = parent_.GetContextDepth();  // Keep same context depth
}

void EventsCodeGenerationContext::NotifyAsyncParentsAboutDeclaredObject(const gd::String& objectName) {
  gd::EventsCodeGenerationContext* asyncContext = IsAsyncCallback() ? this : nearestAsyncParent;
  for (;
        asyncContext != nullptr;
        asyncContext = asyncContext->parent->nearestAsyncParent)
    asyncContext->allObjectsListToBeDeclaredAcrossChildren.insert(objectName);
}

void EventsCodeGenerationContext::ObjectsListNeeded(
    const gd::String& objectName) {
  if (!IsToBeDeclared(objectName)) {
    objectsListsToBeDeclared.insert(objectName);

    if (IsInsideAsync()) {
      NotifyAsyncParentsAboutDeclaredObject(objectName);
    }
  }

  depthOfLastUse[objectName] = GetContextDepth();
}

void EventsCodeGenerationContext::ObjectsListNeededOrEmptyIfJustDeclared(
    const gd::String& objectName) {
  if (!IsToBeDeclared(objectName)) {
    objectsListsOrEmptyToBeDeclared.insert(objectName);

    if (IsInsideAsync()) {
      NotifyAsyncParentsAboutDeclaredObject(objectName);
    }
  }

  depthOfLastUse[objectName] = GetContextDepth();
}

void EventsCodeGenerationContext::EmptyObjectsListNeeded(
    const gd::String& objectName) {
  if (!IsToBeDeclared(objectName)) {
    emptyObjectsListsToBeDeclared.insert(objectName);
  }

  depthOfLastUse[objectName] = GetContextDepth();
}

std::set<gd::String> EventsCodeGenerationContext::GetAllObjectsToBeDeclared()
    const {
  std::set<gd::String> allObjectListsToBeDeclared(
      objectsListsToBeDeclared.begin(), objectsListsToBeDeclared.end());
  allObjectListsToBeDeclared.insert(objectsListsOrEmptyToBeDeclared.begin(),
                                    objectsListsOrEmptyToBeDeclared.end());
  allObjectListsToBeDeclared.insert(emptyObjectsListsToBeDeclared.begin(),
                                    emptyObjectsListsToBeDeclared.end());

  return allObjectListsToBeDeclared;
}

unsigned int EventsCodeGenerationContext::GetLastDepthObjectListWasNeeded(
    const gd::String& name) const {
  if (depthOfLastUse.count(name) != 0) return depthOfLastUse.find(name)->second;

  std::cout << "WARNING: During code generation, the last depth of an object "
               "list was 0."
            << std::endl;
  return 0;
}

bool EventsCodeGenerationContext::IsSameObjectsList(
    const gd::String& objectName,
    const EventsCodeGenerationContext& otherContext) const {
  return GetLastDepthObjectListWasNeeded(objectName) ==
         otherContext.GetLastDepthObjectListWasNeeded(objectName);
}

bool EventsCodeGenerationContext::ShouldUseAsyncObjectsList(
    const gd::String& objectName) const {
  if (!IsInsideAsync()) return false;

  // Check if the objects list was used after (or in) the nearest async callback context.
  const gd::EventsCodeGenerationContext* asyncContext = IsAsyncCallback() ? this : nearestAsyncParent;
  if (parent->GetLastDepthObjectListWasNeeded(objectName) >= asyncContext->GetContextDepth()) {
    // The object was used in a context after (or in) the nearest async parent context, so we're not getting it from the
    // async object lists (it was already gotten from there in this previous context).
    return false;
  }

  // If the objects list is declared in a parent of the nearest async context, it means
  // the async context had to use an async objects list to access it.
  return asyncContext->ObjectAlreadyDeclaredByParents(objectName);
};

}  // namespace gd
