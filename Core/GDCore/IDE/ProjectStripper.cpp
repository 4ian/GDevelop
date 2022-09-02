/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ProjectStripper.h"

#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"

namespace gd {

void GD_CORE_API ProjectStripper::StripProjectForExport(gd::Project& project) {
  project.GetObjectGroups().Clear();
  while (project.GetExternalEventsCount() > 0)
    project.RemoveExternalEvents(project.GetExternalEvents(0).GetName());

  for (unsigned int i = 0; i < project.GetLayoutsCount(); ++i) {
    project.GetLayout(i).GetObjectGroups().Clear();
    project.GetLayout(i).GetEvents().Clear();
  }
  // TODO EBO Keep the EventsBasedObject object list or save the object type in the configurations.
  project.ClearEventsFunctionsExtensions();
}

}  // namespace gd
