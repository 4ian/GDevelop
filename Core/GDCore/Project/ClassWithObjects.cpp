/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include <algorithm>
#include "GDCore/Project/ClassWithObjects.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd
{

ClassWithObjects::ClassWithObjects()
{
}

#if defined(GD_IDE_ONLY)
void ClassWithObjects::SerializeObjectsTo(SerializerElement & element) const
{
    element.ConsiderAsArrayOf("object");
    for ( std::size_t j = 0;j < initialObjects.size();j++ )
    {
        initialObjects[j]->SerializeTo(element.AddChild("object"));
    }

}
#endif

void ClassWithObjects::UnserializeObjectsFrom(gd::Project & project, const SerializerElement & element)
{
    initialObjects.clear();
    element.ConsiderAsArrayOf("object", "Objet");
    for (std::size_t i = 0; i < element.GetChildrenCount(); ++i)
    {
        const SerializerElement & objectElement = element.GetChild(i);

        gd::String type = objectElement.GetStringAttribute("type");
        std::shared_ptr<gd::Object> newObject =
            project.CreateObject(type, objectElement.GetStringAttribute("name", "", "nom"));

        if ( newObject != std::shared_ptr<gd::Object>() )
        {
            newObject->UnserializeFrom(project, objectElement);
            initialObjects.push_back( newObject );
        }
        else
            std::cout << "WARNING: Unknown object type \"" << type << "\"" << std::endl;
    }
}

bool ClassWithObjects::HasObjectNamed(const gd::String & name) const
{
    return ( find_if(initialObjects.begin(), initialObjects.end(), bind2nd(gd::ObjectHasName(), name)) != initialObjects.end() );
}
gd::Object & ClassWithObjects::GetObject(const gd::String & name)
{
    return *(*find_if(initialObjects.begin(), initialObjects.end(), bind2nd(gd::ObjectHasName(), name)));
}
const gd::Object & ClassWithObjects::GetObject(const gd::String & name) const
{
    return *(*find_if(initialObjects.begin(), initialObjects.end(), bind2nd(gd::ObjectHasName(), name)));
}
gd::Object & ClassWithObjects::GetObject(std::size_t index)
{
    return *initialObjects[index];
}
const gd::Object & ClassWithObjects::GetObject (std::size_t index) const
{
    return *initialObjects[index];
}
std::size_t ClassWithObjects::GetObjectPosition(const gd::String & name) const
{
    for (std::size_t i = 0;i<initialObjects.size();++i)
    {
        if ( initialObjects[i]->GetName() == name ) return i;
    }
    return gd::String::npos;
}
std::size_t ClassWithObjects::GetObjectsCount() const
{
    return initialObjects.size();
}
#if defined(GD_IDE_ONLY)
gd::Object & ClassWithObjects::InsertNewObject(gd::Project & project, const gd::String & objectType, const gd::String & name, std::size_t position)
{
    std::shared_ptr<gd::Object> newObject = project.GetCurrentPlatform().CreateObject(objectType, name);
    if (position<initialObjects.size())
        initialObjects.insert(initialObjects.begin()+position, newObject);
    else
        initialObjects.push_back(newObject);

    return *newObject;
}
#endif

gd::Object & ClassWithObjects::InsertObject(const gd::Object & object, std::size_t position)
{
    std::shared_ptr<gd::Object> newObject = std::shared_ptr<gd::Object>(object.Clone());
    if (position<initialObjects.size())
        initialObjects.insert(initialObjects.begin()+position, newObject);
    else
        initialObjects.push_back(newObject);

    return *newObject;
}

void ClassWithObjects::SwapObjects(std::size_t firstObjectIndex, std::size_t secondObjectIndex)
{
    if ( firstObjectIndex >= initialObjects.size() || secondObjectIndex >= initialObjects.size() )
        return;

    std::shared_ptr<gd::Object> temp = initialObjects[firstObjectIndex];
    initialObjects[firstObjectIndex] = initialObjects[secondObjectIndex];
    initialObjects[secondObjectIndex] = temp;
}

void ClassWithObjects::RemoveObject(const gd::String & name)
{
    std::vector< std::shared_ptr<gd::Object> >::iterator object = find_if(initialObjects.begin(), initialObjects.end(), bind2nd(ObjectHasName(), name));
    if ( object == initialObjects.end() ) return;

    initialObjects.erase(object);
}

}
