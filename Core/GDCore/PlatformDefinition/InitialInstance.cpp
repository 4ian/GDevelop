/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

#include "GDCore/PlatformDefinition/InitialInstance.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Object.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"
#endif

namespace gd
{

InitialInstance::InitialInstance() :
    objectName(""),
    x(0),
    y(0),
    angle(0),
    zOrder(0),
    layer(""),
    personalizedSize(false),
    width(0),
    height(0),
    locked(false)
{
}


#if defined(GD_IDE_ONLY)
std::map<std::string, gd::PropertyDescriptor> gd::InitialInstance::GetCustomProperties(gd::Project & project, gd::Layout & layout)
{
    //Find an object
    if ( layout.HasObjectNamed(GetObjectName()) )
        return layout.GetObject(GetObjectName()).GetInitialInstanceProperties(*this, project, layout);
    else if ( project.HasObjectNamed(GetObjectName()) )
        return project.GetObject(GetObjectName()).GetInitialInstanceProperties(*this, project, layout);

    std::map<std::string, gd::PropertyDescriptor> nothing;
    return nothing;
}

bool gd::InitialInstance::UpdateCustomProperty(const std::string & name, const std::string & value, gd::Project & project, gd::Layout & layout)
{
    if ( layout.HasObjectNamed(GetObjectName()) )
        return layout.GetObject(GetObjectName()).UpdateInitialInstanceProperty(*this, name, value, project, layout);
    else if ( project.HasObjectNamed(GetObjectName()) )
        return project.GetObject(GetObjectName()).UpdateInitialInstanceProperty(*this, name, value, project, layout);

    return false;
}

#endif

}
