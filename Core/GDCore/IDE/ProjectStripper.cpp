/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "ProjectStripper.h"

namespace gd
{

void GD_CORE_API ProjectStripper::StripProject(gd::Project & project)
{
    project.GetObjectGroups().clear();
    while ( project.GetExternalEventsCount() > 0 ) project.RemoveExternalEvents(project.GetExternalEvents(0).GetName());

    for (unsigned int i = 0;i<project.GetLayoutsCount();++i)
    {
        project.GetLayout(i).GetObjectGroups().clear();
        project.GetLayout(i).GetEvents().Clear();
    }
}

}
