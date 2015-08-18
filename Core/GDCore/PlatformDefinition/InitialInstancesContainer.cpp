/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include <iostream>
#include <algorithm>
#include <map>
#include "GDCore/PlatformDefinition/InitialInstancesContainer.h"
#include "GDCore/PlatformDefinition/InitialInstance.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/CommonTools.h"

using namespace std;

namespace gd
{

gd::InitialInstance InitialInstancesContainer::badPosition;

InitialInstancesContainer::~InitialInstancesContainer()
{
}

std::size_t InitialInstancesContainer::GetInstancesCount() const
{
    return initialInstances.size();
}

void InitialInstancesContainer::UnserializeFrom(const SerializerElement & element)
{
    element.ConsiderAsArrayOf("instance", "Objet");
    for (std::size_t i = 0; i < element.GetChildrenCount(); ++i)
    {
        const SerializerElement & instanceElement = element.GetChild(i);
        gd::InitialInstance newPosition;

        newPosition.SetObjectName(instanceElement.GetStringAttribute("name", "", "nom"));
        newPosition.SetX(instanceElement.GetDoubleAttribute("x"));
        newPosition.SetY(instanceElement.GetDoubleAttribute("y"));
        newPosition.SetAngle(instanceElement.GetDoubleAttribute("angle"));
        newPosition.SetHasCustomSize(instanceElement.GetBoolAttribute("customSize", false, "personalizedSize"));
        newPosition.SetCustomWidth(instanceElement.GetDoubleAttribute("width"));
        newPosition.SetCustomHeight(instanceElement.GetDoubleAttribute("height"));
        newPosition.SetZOrder(instanceElement.GetIntAttribute("zOrder", 0, "plan"));
        newPosition.SetLayer(instanceElement.GetStringAttribute("layer"));
        #if defined(GD_IDE_ONLY)
        newPosition.SetLocked(instanceElement.GetBoolAttribute( "locked", false ));
        #endif

        const SerializerElement & floatPropElement = instanceElement.GetChild("numberProperties" , 0 ,"floatInfos");
        floatPropElement.ConsiderAsArrayOf("property", "Info");
        for (std::size_t j = 0; j < floatPropElement.GetChildrenCount(); ++j)
        {
            gd::String name = floatPropElement.GetChild(j).GetStringAttribute("name");
            float value = floatPropElement.GetChild(j).GetDoubleAttribute("value");
            newPosition.floatInfos[name] = value;
        }

        const SerializerElement & stringPropElement = instanceElement.GetChild("stringProperties" , 0 ,"stringInfos");
        stringPropElement.ConsiderAsArrayOf("property", "Info");
        for (std::size_t j = 0; j < stringPropElement.GetChildrenCount(); ++j)
        {
            gd::String name = stringPropElement.GetChild(j).GetStringAttribute("name");
            gd::String value = stringPropElement.GetChild(j).GetStringAttribute("value");
            newPosition.stringInfos[name] = value;
        }

        newPosition.GetVariables().UnserializeFrom(instanceElement.GetChild("initialVariables", 0, "InitialVariables"));

        initialInstances.push_back( newPosition );
    }
}

void InitialInstancesContainer::IterateOverInstances(gd::InitialInstanceFunctor & func)
{
    for (std::list<gd::InitialInstance>::iterator it = initialInstances.begin(), end = initialInstances.end(); it != end; ++it)
        func(&(*it));
}

namespace
{

struct InstancesZOrderSort
{
   bool operator ()(gd::InitialInstance * a, gd::InitialInstance * b) const
   {
      return a->GetZOrder() < b->GetZOrder();
   }
};

}

void InitialInstancesContainer::IterateOverInstancesWithZOrdering(gd::InitialInstanceFunctor & func, const gd::String & layerName)
{
    std::vector<gd::InitialInstance*> sortedInstances;
    sortedInstances.reserve(initialInstances.size());
    for (std::list<gd::InitialInstance>::iterator it = initialInstances.begin(), end = initialInstances.end(); it != end; ++it)
    {
        if (it->GetLayer() == layerName )
            sortedInstances.push_back(&(*it));
    }

    std::sort(sortedInstances.begin(), sortedInstances.end(), gd::InstancesZOrderSort());
    for (std::size_t i = 0;i<sortedInstances.size();++i)
        func(sortedInstances[i]);
}

#if defined(GD_IDE_ONLY)
gd::InitialInstance & InitialInstancesContainer::InsertNewInitialInstance()
{
    gd::InitialInstance newInstance;
    initialInstances.push_back(newInstance);

    return initialInstances.back();
}

void InitialInstancesContainer::RemoveInstance(const gd::InitialInstance & instance)
{
    for (std::list<gd::InitialInstance>::iterator it = initialInstances.begin(), end = initialInstances.end(); it != end;)
    {
        if ( &(*it) == &instance )
            it = initialInstances.erase(it);
        else
            ++it;
    }
}

gd::InitialInstance & InitialInstancesContainer::InsertInitialInstance(const gd::InitialInstance & instance)
{
    try
    {
        const gd::InitialInstance & castedInstance = dynamic_cast<const gd::InitialInstance&>(instance);
        initialInstances.push_back(castedInstance);

        return initialInstances.back();
    }
    catch(...) { std::cout << "WARNING: Tried to add an gd::InitialInstance which is not a GD C++ Platform gd::InitialInstance to a GD C++ Platform project"; }

    return badPosition;
}

void InitialInstancesContainer::RenameInstancesOfObject(const gd::String & oldName, const gd::String & newName)
{
    for (std::list<gd::InitialInstance>::iterator it = initialInstances.begin(), end = initialInstances.end(); it != end; ++it)
    {
        if ( (*it).GetObjectName() == oldName )
            (*it).SetObjectName(newName);
    }
}

void InitialInstancesContainer::RemoveInitialInstancesOfObject(const gd::String & objectName)
{
    for (std::list<gd::InitialInstance>::iterator it = initialInstances.begin(), end = initialInstances.end(); it != end;)
    {
        if ( (*it).GetObjectName() == objectName )
            it = initialInstances.erase(it);
        else
            ++it;
    }
}

void InitialInstancesContainer::RemoveAllInstancesOnLayer(const gd::String & layerName)
{
    for (std::list<gd::InitialInstance>::iterator it = initialInstances.begin(), end = initialInstances.end(); it != end;)
    {
        if ( (*it).GetLayer() == layerName )
            it = initialInstances.erase(it);
        else
            ++it;
    }
}

void InitialInstancesContainer::MoveInstancesToLayer(const gd::String & fromLayer, const gd::String & toLayer)
{
    for (std::list<gd::InitialInstance>::iterator it = initialInstances.begin(), end = initialInstances.end(); it != end; ++it)
    {
        if ( (*it).GetLayer() == fromLayer )
            (*it).SetLayer(toLayer);
    }
}

bool InitialInstancesContainer::SomeInstancesAreOnLayer(const gd::String & layerName)
{
    for (std::list<gd::InitialInstance>::iterator it = initialInstances.begin(), end = initialInstances.end(); it != end; ++it)
    {
        if ( (*it).GetLayer() == layerName )
            return true;
    }
    return false;
}

void InitialInstancesContainer::Create(const InitialInstancesContainer & source)
{
    try
    {
        const InitialInstancesContainer & castedSource = dynamic_cast<const InitialInstancesContainer&>(source);
        operator=(castedSource);
    }
    catch(...) { std::cout << "WARNING: Tried to create a GD C++ Platform InitialInstancesContainer object from an object which is not of the same type."; }
}

void InitialInstancesContainer::SerializeTo(SerializerElement & element) const
{
    element.ConsiderAsArrayOf("instance");
    for (std::list<gd::InitialInstance>::const_iterator it = initialInstances.begin(), end = initialInstances.end(); it != end; ++it)
    {
        SerializerElement & instanceElement = element.AddChild("instance");
        instanceElement.SetAttribute( "name", (*it).GetObjectName() );
        instanceElement.SetAttribute( "x", (*it).GetX() );
        instanceElement.SetAttribute( "y", (*it).GetY() );
        instanceElement.SetAttribute( "zOrder", (*it).GetZOrder() );
        instanceElement.SetAttribute( "layer", (*it).GetLayer() );
        instanceElement.SetAttribute( "angle", (*it).GetAngle() );
        instanceElement.SetAttribute( "customSize", (*it).HasCustomSize() );
        instanceElement.SetAttribute( "width", (*it).GetCustomWidth() );
        instanceElement.SetAttribute( "height", (*it).GetCustomHeight() );
        instanceElement.SetAttribute( "locked", (*it).IsLocked() );

        SerializerElement & floatPropElement = instanceElement.AddChild("numberProperties");
        floatPropElement.ConsiderAsArrayOf("property");
        for(std::map<gd::String, float>::const_iterator floatInfo = (*it).floatInfos.begin(); floatInfo != (*it).floatInfos.end(); ++floatInfo)
        {
            floatPropElement.AddChild("property")
                .SetAttribute("name", floatInfo->first)
                .SetAttribute("value", floatInfo->second);
        }

        SerializerElement & stringPropElement = instanceElement.AddChild("stringProperties");
        stringPropElement.ConsiderAsArrayOf("property");
        for(std::map<gd::String, gd::String>::const_iterator stringInfo = (*it).stringInfos.begin(); stringInfo != (*it).stringInfos.end(); ++stringInfo)
        {
            stringPropElement.AddChild("property")
                .SetAttribute("name", stringInfo->first)
                .SetAttribute("value", stringInfo->second);
        }

        (*it).GetVariables().SerializeTo(instanceElement.AddChild("initialVariables"));
    }
}
#endif

InitialInstanceFunctor::~InitialInstanceFunctor()
{
};


void HighestZOrderFinder::operator()(gd::InitialInstance * instancePtr)
{
    gd::InitialInstance & instance = *instancePtr;
    if ( !layerRestricted || instance.GetLayer() == layerName)
    {
        if ( firstCall )
        {
            highestZOrder = instance.GetZOrder();
            lowestZOrder = instance.GetZOrder();
            firstCall = false;
        }
        else
        {
            if (highestZOrder < instance.GetZOrder()) highestZOrder = instance.GetZOrder();
            if (lowestZOrder > instance.GetZOrder()) lowestZOrder = instance.GetZOrder();
        }
    }
}

}
