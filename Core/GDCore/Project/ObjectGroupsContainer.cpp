/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCore/String.h"
#include "GDCore/Project/ObjectGroup.h"
#include "GDCore/Project/ObjectGroupsContainer.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd
{

ObjectGroup ObjectGroupsContainer::badGroup;

bool ObjectGroupsContainer::Has(const gd::String & name) const
{
    auto i =
        std::find_if(objectGroups.begin(), objectGroups.end(), [&name](const ObjectGroup & group) { return group.GetName() == name; });
    return (i != objectGroups.end());
}

ObjectGroup & ObjectGroupsContainer::Get(std::size_t index)
{
    if ( index < objectGroups.size() )
        return objectGroups[index];

    return badGroup;
}

const ObjectGroup & ObjectGroupsContainer::Get(std::size_t index) const
{
    if ( index < objectGroups.size() )
        return objectGroups[index];

    return badGroup;
}

ObjectGroup & ObjectGroupsContainer::Get(const gd::String & name)
{
    auto i =
        std::find_if(objectGroups.begin(), objectGroups.end(), [&name](const ObjectGroup & group) { return group.GetName() == name; });
    if (i != objectGroups.end())
        return *i;

    return badGroup;
}

const ObjectGroup & ObjectGroupsContainer::Get(const gd::String & name) const
{
    auto i =
        std::find_if(objectGroups.begin(), objectGroups.end(), [&name](const ObjectGroup & group) { return group.GetName() == name; });
    if (i != objectGroups.end())
        return *i;

    return badGroup;
}

ObjectGroup & ObjectGroupsContainer::Insert(const gd::ObjectGroup & group, std::size_t position)
{
    if (position<objectGroups.size())
    {
        objectGroups.insert(objectGroups.begin()+position, group);
        return objectGroups[position];
    }
    else
    {
        objectGroups.push_back(group);
        return objectGroups.back();
    }
}

#if defined(GD_IDE_ONLY)
void ObjectGroupsContainer::Remove(const gd::String & name)
{
    objectGroups.erase(std::remove_if(objectGroups.begin(), objectGroups.end(),
        [&name](const ObjectGroup & group) { return group.GetName() == name; }), objectGroups.end() );
}

std::size_t ObjectGroupsContainer::GetPosition(const gd::String & name) const
{
    for(std::size_t i = 0;i<objectGroups.size();++i)
    {
        if ( objectGroups[i].GetName() == name )
            return i;
    }

    return gd::String::npos;
}

ObjectGroup & ObjectGroupsContainer::InsertNew(const gd::String & name, std::size_t position)
{
    ObjectGroup newGroup;
    newGroup.SetName(name);
    return Insert(newGroup, position);
}

bool ObjectGroupsContainer::Rename(const gd::String & oldName, const gd::String & newName)
{
    if (Has(newName)) return false;

    auto i =
        std::find_if(objectGroups.begin(), objectGroups.end(), [&oldName](const ObjectGroup & group) { return group.GetName() == oldName; });
    if (i != objectGroups.end()) i->SetName(newName);

    return true;
}

void ObjectGroupsContainer::Move(std::size_t oldIndex, std::size_t newIndex)
{
    if ( oldIndex >= objectGroups.size() || newIndex >= objectGroups.size() )
        return;

    auto group = objectGroups[oldIndex];
    objectGroups.erase(objectGroups.begin() + oldIndex);
    Insert(group, newIndex);
}
#endif

void ObjectGroupsContainer::SerializeTo(SerializerElement & element) const
{
    element.ConsiderAsArrayOf("group");
    for(auto & group : objectGroups)
    {
        SerializerElement & groupElement = element.AddChild("group");
        group.SerializeTo(groupElement);
    }
}

void ObjectGroupsContainer::UnserializeFrom(const SerializerElement & element)
{
    objectGroups.clear();
    element.ConsiderAsArrayOf("group", "Groupe");
    for (std::size_t i = 0; i < element.GetChildrenCount(); ++i)
    {
        SerializerElement & groupElement = element.GetChild(i);
        gd::ObjectGroup objectGroup;

        objectGroup.UnserializeFrom(groupElement);
        objectGroups.push_back(objectGroup);
    }
}


}
