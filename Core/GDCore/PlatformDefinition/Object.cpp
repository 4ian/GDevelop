/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/PlatformDefinition/Automatism.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/Serialization/SerializerElement.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"
#endif
#if !defined(GD_NO_WX_GUI)
#include <SFML/Graphics.hpp>
#endif

namespace gd
{

Object::~Object()
{
    //Do not forget to delete automatisms which are managed using raw pointers.
    for (std::map<gd::String, Automatism* >::const_iterator it = automatisms.begin() ; it != automatisms.end(); ++it )
    	delete it->second;
}

Object::Object(const gd::String & name_) :
    name(name_)
{
}

void Object::Init(const gd::Object & object)
{
    name = object.name;
    type = object.type;
    objectVariables = object.objectVariables;

    //Do not forget to delete automatisms which are managed using raw pointers.
    for (std::map<gd::String, Automatism* >::const_iterator it = automatisms.begin() ; it != automatisms.end(); ++it )
    	delete it->second;

    automatisms.clear();
    for (std::map<gd::String, Automatism* >::const_iterator it = object.automatisms.begin() ; it != object.automatisms.end(); ++it )
    	automatisms[it->first] = it->second->Clone();
}


std::vector < gd::String > Object::GetAllAutomatismNames() const
{
    std::vector < gd::String > allNameIdentifiers;

    for (std::map<gd::String, Automatism* >::const_iterator it = automatisms.begin() ; it != automatisms.end(); ++it )
    	allNameIdentifiers.push_back(it->first);

    return allNameIdentifiers;
}

void Object::RemoveAutomatism(const gd::String & name)
{
    //Do not forget to delete automatisms which are managed using raw pointers.
    delete(automatisms[name]);

    automatisms.erase(name);
}

bool Object::RenameAutomatism(const gd::String & name, const gd::String & newName)
{
    if ( automatisms.find(name) == automatisms.end()
      || automatisms.find(newName) != automatisms.end() ) return false;

    Automatism * aut = automatisms.find(name)->second;
    automatisms.erase(name);
    automatisms[newName] = aut;
    aut->SetName(newName);

    return true;
}

gd::Automatism & Object::GetAutomatism(const gd::String & name)
{
    return *automatisms.find(name)->second;
}

const gd::Automatism & Object::GetAutomatism(const gd::String & name) const
{
    return *automatisms.find(name)->second;
}

bool Object::HasAutomatismNamed(const gd::String & name) const
{
    return automatisms.find(name) != automatisms.end();
}

bool Object::AddAutomatism(Automatism * automatism)
{
    if (automatism && !HasAutomatismNamed(automatism->GetName())) {
        automatisms[automatism->GetName()] = automatism;
        return true;
    }

    return false;
}

#if defined(GD_IDE_ONLY)
gd::Automatism * Object::AddNewAutomatism(gd::Project & project, const gd::String & type, const gd::String & name)
{
    Automatism * automatism = project.GetCurrentPlatform().CreateAutomatism(type);

    if ( automatism != NULL ) {
        automatism->SetName(name);
        automatisms[automatism->GetName()] = automatism;
    }

    return automatism;
}

sf::Vector2f Object::GetInitialInstanceDefaultSize(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const
{
    return sf::Vector2f(32,32);
}

sf::Vector2f Object::GetInitialInstanceOrigin(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const
{
    return sf::Vector2f(0,0);
}

std::map<gd::String, gd::PropertyDescriptor> Object::GetInitialInstanceProperties(const gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout)
{
    std::map<gd::String, gd::PropertyDescriptor> nothing;
    return nothing;
}

void Object::DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout)
{
#if !defined(GD_NO_WX_GUI)
    sf::RectangleShape mask(instance.HasCustomSize() ?
                            sf::Vector2f(instance.GetCustomWidth(),instance.GetCustomHeight()) :
                            GetInitialInstanceDefaultSize(instance, project, layout));
    mask.setPosition(instance.GetX(), instance.GetY());
    mask.setRotation(instance.GetAngle());
    mask.setFillColor(sf::Color( 147,151,255 ));
    mask.setOutlineThickness(1);
    mask.setOutlineColor(sf::Color( 255, 48, 69));
    renderTarget.draw(mask);
#endif
}
#endif

void Object::UnserializeFrom(gd::Project & project, const SerializerElement & element)
{
    //Name and type are already loaded.
    objectVariables.UnserializeFrom(element.GetChild("variables", 0, "Variables"));

    //Compatibility with GD <= 3.3
    if (element.HasChild("Automatism"))
    {
        for (std::size_t i = 0; i < element.GetChildrenCount("Automatism"); ++i)
        {
            SerializerElement & automatismElement = element.GetChild("Automatism", i);

            gd::String autoType = automatismElement.GetStringAttribute("type", "", "Type");
            gd::String autoName = automatismElement.GetStringAttribute("name", "", "Name");

            Automatism* automatism = project.CreateAutomatism(autoType);
            if ( automatism != NULL )
            {
                automatism->SetName(autoName);
                automatism->UnserializeFrom(automatismElement);
                automatisms[automatism->GetName()] = automatism;
            }
            else
                std::cout << "WARNING: Unknown automatism " << automatismElement.GetStringAttribute("type") << std::endl;
        }
    }
    //End of compatibility code
    else
    {
        SerializerElement & automatismsElement = element.GetChild("automatisms");
        automatismsElement.ConsiderAsArrayOf("automatism");
        for (std::size_t i = 0; i < automatismsElement.GetChildrenCount(); ++i)
        {
            SerializerElement & automatismElement = automatismsElement.GetChild(i);

            gd::String autoType = automatismElement.GetStringAttribute("type");
            gd::String autoName = automatismElement.GetStringAttribute("name");

            Automatism* automatism = project.CreateAutomatism(autoType);
            if ( automatism != NULL )
            {
                automatism->SetName(autoName);
                automatism->UnserializeFrom(automatismElement);
                automatisms[automatism->GetName()] = automatism;
            }
            else
                std::cout << "WARNING: Unknown automatism " << automatismElement.GetStringAttribute("type") << std::endl;
        }
    }

    DoUnserializeFrom(project, element);
}

#if defined(GD_IDE_ONLY)
void Object::SerializeTo(SerializerElement & element) const
{
    element.SetAttribute( "name", GetName() );
    element.SetAttribute( "type", GetType() );
    objectVariables.SerializeTo(element.AddChild("variables"));

    SerializerElement & automatismsElement = element.AddChild("automatisms");
    automatismsElement.ConsiderAsArrayOf("automatism");
    std::vector < gd::String > allAutomatisms = GetAllAutomatismNames();
    for (std::size_t i = 0;i<allAutomatisms.size();++i)
    {
        SerializerElement & automatismElement = automatismsElement.AddChild("automatism");

        automatismElement.SetAttribute( "type", GetAutomatism(allAutomatisms[i]).GetTypeName() );
        automatismElement.SetAttribute( "name", GetAutomatism(allAutomatisms[i]).GetName() );
        GetAutomatism(allAutomatisms[i]).SerializeTo(automatismElement);
    }

    DoSerializeTo(element);
}
#endif

}

gd::Object * CreateBaseObject(gd::String name)
{
    return new gd::Object(name);
}
