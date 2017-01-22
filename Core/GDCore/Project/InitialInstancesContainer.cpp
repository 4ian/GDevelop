/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include <algorithm>
#include <iostream>
#include <map>

#include "GDCore/Project/InitialInstancesContainer.h"
#include "GDCore/Project/InitialInstance.h"
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
    initialInstances.clear();

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
    for(auto& instance : initialInstances)
        func(instance);
}

void InitialInstancesContainer::IterateOverInstancesWithZOrdering(gd::InitialInstanceFunctor & func, const gd::String & layerName)
{
    std::vector<std::reference_wrapper<gd::InitialInstance>> sortedInstances;
    std::copy_if(
        initialInstances.begin(),
        initialInstances.end(),
        std::inserter(sortedInstances, sortedInstances.begin()),
        [&layerName](InitialInstance & instance) { return instance.GetLayer() == layerName; });

    std::sort(
        sortedInstances.begin(),
        sortedInstances.end(),
        [](gd::InitialInstance & a, gd::InitialInstance & b) { return a.GetZOrder() < b.GetZOrder(); });

    for(auto& instance : sortedInstances)
        func(instance);
}

#if defined(GD_IDE_ONLY)
gd::InitialInstance & InitialInstancesContainer::InsertNewInitialInstance()
{
    gd::InitialInstance newInstance;
    initialInstances.push_back(newInstance);

    return initialInstances.back();
}

void InitialInstancesContainer::RemoveInstanceIf(std::function<bool(const gd::InitialInstance &)> predicat)
{
    // Note that we can't use erase–remove idiom here because remove_if would
    // move the instances, and the container must guarantee that iterators/pointers
    // to instances always remain valid.
    for (std::list<gd::InitialInstance>::iterator it = initialInstances.begin(), end = initialInstances.end(); it != end;)
    {
        if (predicat(*it))
            it = initialInstances.erase(it);
        else
            ++it;
    }
}

void InitialInstancesContainer::RemoveInstance(const gd::InitialInstance & instance)
{
    RemoveInstanceIf([&instance](const InitialInstance & currentInstance) {
        return &instance == &currentInstance;
    });
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
    for (gd::InitialInstance & instance : initialInstances)
    {
        if ( instance.GetObjectName() == oldName )
            instance.SetObjectName(newName);
    }
}

void InitialInstancesContainer::RemoveInitialInstancesOfObject(const gd::String & objectName)
{
    RemoveInstanceIf([&objectName](const InitialInstance & currentInstance) {
        return currentInstance.GetObjectName() == objectName;
    });
}

void InitialInstancesContainer::RemoveAllInstancesOnLayer(const gd::String & layerName)
{
    RemoveInstanceIf([&layerName](const InitialInstance & currentInstance) {
        return currentInstance.GetLayer() == layerName;
    });
}

void InitialInstancesContainer::MoveInstancesToLayer(const gd::String & fromLayer, const gd::String & toLayer)
{
    for (gd::InitialInstance & instance : initialInstances)
    {
        if ( instance.GetLayer() == fromLayer )
            instance.SetLayer(toLayer);
    }
}

bool InitialInstancesContainer::SomeInstancesAreOnLayer(const gd::String & layerName)
{
    return std::any_of(
        initialInstances.begin(),
        initialInstances.end(),
        [&layerName](const InitialInstance & currentInstance) { return currentInstance.GetLayer() == layerName; }
    );
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


void HighestZOrderFinder::operator()(gd::InitialInstance & instance)
{
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
