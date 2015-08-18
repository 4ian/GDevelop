/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/PlatformDefinition/Behavior.h"
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
    //Do not forget to delete behaviors which are managed using raw pointers.
    for (std::map<gd::String, Behavior* >::const_iterator it = behaviors.begin() ; it != behaviors.end(); ++it )
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

    //Do not forget to delete behaviors which are managed using raw pointers.
    for (std::map<gd::String, Behavior* >::const_iterator it = behaviors.begin() ; it != behaviors.end(); ++it )
    	delete it->second;

    behaviors.clear();
    for (std::map<gd::String, Behavior* >::const_iterator it = object.behaviors.begin() ; it != object.behaviors.end(); ++it )
    	behaviors[it->first] = it->second->Clone();
}


std::vector < gd::String > Object::GetAllBehaviorNames() const
{
    std::vector < gd::String > allNameIdentifiers;

    for (std::map<gd::String, Behavior* >::const_iterator it = behaviors.begin() ; it != behaviors.end(); ++it )
    	allNameIdentifiers.push_back(it->first);

    return allNameIdentifiers;
}

void Object::RemoveBehavior(const gd::String & name)
{
    //Do not forget to delete behaviors which are managed using raw pointers.
    delete(behaviors[name]);

    behaviors.erase(name);
}

bool Object::RenameBehavior(const gd::String & name, const gd::String & newName)
{
    if ( behaviors.find(name) == behaviors.end()
      || behaviors.find(newName) != behaviors.end() ) return false;

    Behavior * aut = behaviors.find(name)->second;
    behaviors.erase(name);
    behaviors[newName] = aut;
    aut->SetName(newName);

    return true;
}

gd::Behavior & Object::GetBehavior(const gd::String & name)
{
    return *behaviors.find(name)->second;
}

const gd::Behavior & Object::GetBehavior(const gd::String & name) const
{
    return *behaviors.find(name)->second;
}

bool Object::HasBehaviorNamed(const gd::String & name) const
{
    return behaviors.find(name) != behaviors.end();
}

bool Object::AddBehavior(Behavior * behavior)
{
    if (behavior && !HasBehaviorNamed(behavior->GetName())) {
        behaviors[behavior->GetName()] = behavior;
        return true;
    }

    return false;
}

#if defined(GD_IDE_ONLY)
gd::Behavior * Object::AddNewBehavior(gd::Project & project, const gd::String & type, const gd::String & name)
{
    Behavior * behavior = project.GetCurrentPlatform().CreateBehavior(type);

    if ( behavior != NULL ) {
        behavior->SetName(name);
        behaviors[behavior->GetName()] = behavior;
    }

    return behavior;
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

    //Compatibility with GD <= 4
    auto renameOldType = [](gd::String name) {
        gd::String oldWord = "Automatism";
        while (name.find(oldWord) != gd::String::npos)
            name = name.replace(name.find(oldWord), oldWord.size(), "Behavior");

        return name;
    };
    //End of compatibility code

    //Compatibility with GD <= 3.3
    if (element.HasChild("Automatism"))
    {
        for (unsigned int i = 0; i < element.GetChildrenCount("Automatism"); ++i)
        {
            SerializerElement & behaviorElement = element.GetChild("Automatism", i);

            gd::String autoType = renameOldType(behaviorElement.GetStringAttribute("type", "", "Type"));
            gd::String autoName = behaviorElement.GetStringAttribute("name", "", "Name");

            Behavior* behavior = project.CreateBehavior(autoType);
            if ( behavior != NULL )
            {
                behavior->SetName(autoName);
                behavior->UnserializeFrom(behaviorElement);
                behaviors[behavior->GetName()] = behavior;
            }
            else
                std::cout << "WARNING: Unknown behavior " << behaviorElement.GetStringAttribute("type") << std::endl;
        }
    }
    //End of compatibility code
    else
    {
        SerializerElement & behaviorsElement = element.GetChild("behaviors", 0, "automatisms");
        behaviorsElement.ConsiderAsArrayOf("behavior", "automatism");
        for (unsigned int i = 0; i < behaviorsElement.GetChildrenCount(); ++i)
        {
            SerializerElement & behaviorElement = behaviorsElement.GetChild(i);

            gd::String autoType = renameOldType(behaviorElement.GetStringAttribute("type"));
            gd::String autoName = behaviorElement.GetStringAttribute("name");

            Behavior* behavior = project.CreateBehavior(autoType);
            if ( behavior != NULL )
            {
                behavior->SetName(autoName);
                behavior->UnserializeFrom(behaviorElement);
                behaviors[behavior->GetName()] = behavior;
            }
            else
                std::cout << "WARNING: Unknown behavior " << behaviorElement.GetStringAttribute("type") << std::endl;
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

    SerializerElement & behaviorsElement = element.AddChild("behaviors");
    behaviorsElement.ConsiderAsArrayOf("behavior");
    std::vector < gd::String > allBehaviors = GetAllBehaviorNames();
    for (unsigned int i = 0;i<allBehaviors.size();++i)
    {
        SerializerElement & behaviorElement = behaviorsElement.AddChild("behavior");

        behaviorElement.SetAttribute( "type", GetBehavior(allBehaviors[i]).GetTypeName() );
        behaviorElement.SetAttribute( "name", GetBehavior(allBehaviors[i]).GetName() );
        GetBehavior(allBehaviors[i]).SerializeTo(behaviorElement);
    }

    DoSerializeTo(element);
}
#endif

}

gd::Object * CreateBaseObject(gd::String name)
{
    return new gd::Object(name);
}
