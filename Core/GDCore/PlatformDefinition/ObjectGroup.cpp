/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "ObjectGroup.h"
#include <vector>
#include <string>
#include <algorithm>
#include "GDCore/Serialization/SerializerElement.h"

using namespace std;

namespace gd
{

bool ObjectGroup::Find(const string & name) const
{
    return std::find(memberObjects.begin(), memberObjects.end(), name) != memberObjects.end();
}

void ObjectGroup::AddObject(const string & name)
{
    if ( !Find(name) ) memberObjects.push_back(name);
}

void ObjectGroup::RemoveObject(const string & name)
{
    memberObjects.erase(std::remove(memberObjects.begin(), memberObjects.end(), name), memberObjects.end());
    return;
}

void ObjectGroup::SerializeTo(const std::vector < gd::ObjectGroup > & list, SerializerElement & element)
{
    element.ConsiderAsArrayOf("group");
    for ( unsigned int j = 0;j < list.size();j++ )
    {
        SerializerElement & groupElement = element.AddChild("group");

        groupElement.SetAttribute("name", list[j].GetName());

        SerializerElement & objectsElement = groupElement.AddChild("objects");
        objectsElement.ConsiderAsArrayOf("object");
        vector < string > allObjects = list[j].GetAllObjectsNames();
        for ( unsigned int k = 0;k < allObjects.size();k++ )
            objectsElement.AddChild("object").SetAttribute( "name", allObjects[k] );
    }
}

void ObjectGroup::UnserializeFrom(std::vector < gd::ObjectGroup > & list, const SerializerElement & element)
{
    element.ConsiderAsArrayOf("group", "Groupe");
    for (unsigned int i = 0; i < element.GetChildrenCount(); ++i)
    {
        SerializerElement & groupElement = element.GetChild(i);
        gd::ObjectGroup objectGroup;

        objectGroup.SetName(groupElement.GetStringAttribute("name", "", "nom"));

        //Compatibility with GD <= 3.3
        if ( groupElement.HasChild("Objet") )
        {
            for (unsigned int j = 0; j < groupElement.GetChildrenCount("Objet"); ++j)
                objectGroup.AddObject(groupElement.GetChild("Objet", j).GetStringAttribute("nom"));
        }
        //End of compatibility code
        else
        {
            SerializerElement & objectsElement = groupElement.GetChild("objects");
            objectsElement.ConsiderAsArrayOf("object");
            for (unsigned int j = 0; j < objectsElement.GetChildrenCount(); ++j)
                objectGroup.AddObject(objectsElement.GetChild(j).GetStringAttribute("name"));
        }

        list.push_back( objectGroup );
    }
}


}
