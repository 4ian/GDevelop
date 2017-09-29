/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/Project/ExternalEvents.h"
#include "ProjectStripper.h"

namespace gd
{

void GD_CORE_API ProjectStripper::StripProjectForExport(gd::Project & project)
{
    project.GetObjectGroups().Clear();
    while ( project.GetExternalEventsCount() > 0 ) project.RemoveExternalEvents(project.GetExternalEvents(0).GetName());

    for (unsigned int i = 0;i<project.GetLayoutsCount();++i)
    {
        project.GetLayout(i).GetObjectGroups().Clear();
        project.GetLayout(i).GetEvents().Clear();
    }
}

void GD_CORE_API ProjectStripper::StripProjectForLayoutEdition(gd::Project & project, const gd::String & layoutName)
{
    while ( project.GetExternalEventsCount() > 0 ) project.RemoveExternalEvents(project.GetExternalEvents(0).GetName());

    for (unsigned int i = 0;i<project.GetLayoutsCount();++i)
    {
		auto & layout = project.GetLayout(i);
        if (layoutName == layout.GetName()) continue;

        project.GetLayout(i).GetEvents().Clear();
        project.GetLayout(i).GetInitialInstances().Clear();
    }

	for (unsigned int i = 0;i<project.GetExternalEventsCount();++i)
	{
		project.GetExternalEvents(i).GetEvents().Clear();
	}

	for (unsigned int i = 0;i<project.GetExternalLayoutsCount();++i)
	{
		project.GetExternalLayout(i).GetInitialInstances().Clear();
	}
}

void GD_CORE_API ProjectStripper::StripProjectForExternalLayoutEdition(gd::Project & project, const gd::String & externalLayoutName)
{
    while ( project.GetExternalEventsCount() > 0 ) project.RemoveExternalEvents(project.GetExternalEvents(0).GetName());

    gd::String associatedLayoutName;
    if (project.HasExternalLayoutNamed(externalLayoutName))
    {
        associatedLayoutName =
            project.GetExternalLayout(externalLayoutName).GetAssociatedLayout();
    }

    for (unsigned int i = 0;i<project.GetLayoutsCount();++i)
    {
		auto & layout = project.GetLayout(i);
        if (!associatedLayoutName.empty() && associatedLayoutName == layout.GetName()) continue;

        project.GetLayout(i).GetEvents().Clear();
        project.GetLayout(i).GetInitialInstances().Clear();
    }

	for (unsigned int i = 0;i<project.GetExternalEventsCount();++i)
	{
		project.GetExternalEvents(i).GetEvents().Clear();
	}

	for (unsigned int i = 0;i<project.GetExternalLayoutsCount();++i)
	{
		auto & externalLayout = project.GetExternalLayout(i);
        if (externalLayoutName == externalLayout.GetName()) continue;

		externalLayout.GetInitialInstances().Clear();
	}
}

}
