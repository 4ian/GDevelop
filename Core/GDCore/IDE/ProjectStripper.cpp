/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/Layout.h"
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
