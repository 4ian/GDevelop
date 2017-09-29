/*
 * GDevelop Core
 * Copyright 2015-2016 Victor Levasseur (victorlevasseur52@gmail.com)
 * This project is released under the MIT License.
 */

#include "GDCore/IDE/ObjectOrGroupFinder.h"

#include <algorithm>
#include <assert.h>

#include "GDCore/CommonTools.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Tools/Localization.h"

namespace gd
{

ObjectOrGroupFinder::ObjectOrGroupFinder(const Project &project, const Layout *layout) :
    project(project),
    layout(layout),
    layoutsWithSameObjectName()
{

}

unsigned int ObjectOrGroupFinder::HasObjectOrGroupNamed(const gd::String &name, bool allLayouts)
{
    unsigned int flag = HasSameName::No;
    layoutsWithSameObjectName.clear();

    //Tests the current scene objects
    if(layout && layout->HasObjectNamed(name))
        flag = flag | HasSameName::AsObjectInLayout;

    //Tests current scene groups
    if(layout && layout->GetObjectGroups().Has(name))
        flag = flag | HasSameName::AsGroupInLayout;

    //Tests the global objects
    if(project.HasObjectNamed(name))
        flag = flag | HasSameName::AsGlobalObject;

    //Tests global groups
    if(project.GetObjectGroups().Has(name))
        flag = flag | HasSameName::AsGlobalGroup;

    //Tests other scenes' objects
    if(allLayouts)
    {
        for(std::size_t i = 0; i < project.GetLayoutsCount(); i++)
        {
            const gd::Layout &aLayout = project.GetLayout(i);

            if(layout && aLayout.GetName() == layout->GetName())
                continue;

            if(aLayout.HasObjectNamed(name))
            {
                layoutsWithSameObjectName.push_back(aLayout.GetName());

                flag = flag | AsObjectInAnotherLayout;
            }

            if(aLayout.GetObjectGroups().Has(name))
            {
                layoutsWithSameObjectName.push_back(aLayout.GetName());

                flag = flag | HasSameName::AsGroupInAnotherLayout;
            }
        }
    }

    return flag;
}

const std::vector<gd::String>& ObjectOrGroupFinder::GetLayoutsWithSameObjectName() const
{
    return layoutsWithSameObjectName;
}

}
