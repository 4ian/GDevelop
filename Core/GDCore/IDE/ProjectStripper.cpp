/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ProjectStripper.h"

#include "GDCore/Project/EventsFunctionsContainer.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/IDE/WholeProjectBrowser.h"
#include "GDCore/IDE/Events/BehaviorDefaultFlagClearer.h"

namespace gd {

void GD_CORE_API ProjectStripper::StripProjectForExport(gd::Project &project) {
  project.GetObjectGroups().Clear();
  while (project.GetExternalEventsCount() > 0)
    project.RemoveExternalEvents(project.GetExternalEvents(0).GetName());

  gd::BehaviorDefaultFlagClearer behaviorDefaultFlagClearer;
  gd::WholeProjectBrowser wholeProjectBrowser;
  wholeProjectBrowser.ExposeObjects(project, behaviorDefaultFlagClearer);

  for (unsigned int i = 0; i < project.GetLayoutsCount(); ++i) {
    project.GetLayout(i).GetObjectGroups().Clear();
    project.GetLayout(i).GetEvents().Clear();
  }

  // Keep the EventsBasedObject object list because it's useful for the Runtime
  // to create the child-object.
  for (unsigned int extensionIndex = 0;
       extensionIndex < project.GetEventsFunctionsExtensionsCount();
       ++extensionIndex) {
    auto &extension = project.GetEventsFunctionsExtension(extensionIndex);
    auto &eventsBasedObjects = extension.GetEventsBasedObjects();
    if (eventsBasedObjects.size() == 0) {
      project.RemoveEventsFunctionsExtension(extension.GetName());
      extensionIndex--;
      continue;
    }
    for (unsigned int objectIndex = 0; objectIndex < eventsBasedObjects.size();
         ++objectIndex) {
      auto &eventsBasedObject = eventsBasedObjects.at(objectIndex);
      eventsBasedObject.SetFullName("");
      eventsBasedObject.SetDescription("");
      eventsBasedObject.GetEventsFunctions().GetInternalVector().clear();
      eventsBasedObject.GetPropertyDescriptors().GetInternalVector().clear();
    }
    extension.GetEventsBasedBehaviors().Clear();
  }
}

} // namespace gd
