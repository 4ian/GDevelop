/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCore/Project/InitialInstance.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"
#endif

namespace gd
{

gd::String * InitialInstance::badStringProperyValue = NULL;

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
std::map<gd::String, gd::PropertyDescriptor> InitialInstance::GetCustomProperties(gd::Project & project, gd::Layout & layout)
{
    //Find an object
    if ( layout.HasObjectNamed(GetObjectName()) )
        return layout.GetObject(GetObjectName()).GetInitialInstanceProperties(*this, project, layout);
    else if ( project.HasObjectNamed(GetObjectName()) )
        return project.GetObject(GetObjectName()).GetInitialInstanceProperties(*this, project, layout);

    std::map<gd::String, gd::PropertyDescriptor> nothing;
    return nothing;
}

bool InitialInstance::UpdateCustomProperty(const gd::String & name, const gd::String & value, gd::Project & project, gd::Layout & layout)
{
    if ( layout.HasObjectNamed(GetObjectName()) )
        return layout.GetObject(GetObjectName()).UpdateInitialInstanceProperty(*this, name, value, project, layout);
    else if ( project.HasObjectNamed(GetObjectName()) )
        return project.GetObject(GetObjectName()).UpdateInitialInstanceProperty(*this, name, value, project, layout);

    return false;
}

float InitialInstance::GetRawFloatProperty(const gd::String & name) const
{
	const auto & it = floatInfos.find(name);
	return it != floatInfos.end() ? it->second : 0;
}

const gd::String & InitialInstance::GetRawStringProperty(const gd::String & name) const
{
	if (!badStringProperyValue) badStringProperyValue = new gd::String("");

	const auto & it = stringInfos.find(name);
	return it != stringInfos.end() ? it->second : *badStringProperyValue;
}

#endif

}
