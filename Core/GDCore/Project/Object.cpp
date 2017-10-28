/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
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

    behaviors.clear();
    for (auto it = object.behaviors.cbegin() ; it != object.behaviors.cend(); ++it )
    	behaviors[it->first] = std::unique_ptr<Behavior>(it->second->Clone());
}


std::vector < gd::String > Object::GetAllBehaviorNames() const
{
    std::vector < gd::String > allNameIdentifiers;

    for (std::map<gd::String, std::unique_ptr<gd::Behavior> >::const_iterator it = behaviors.begin() ; it != behaviors.end(); ++it )
    	allNameIdentifiers.push_back(it->first);

    return allNameIdentifiers;
}

void Object::RemoveBehavior(const gd::String & name)
{
    behaviors.erase(name);
}

bool Object::RenameBehavior(const gd::String & name, const gd::String & newName)
{
    if ( behaviors.find(name) == behaviors.end()
      || behaviors.find(newName) != behaviors.end() ) return false;

    std::unique_ptr<Behavior> aut = std::move(behaviors.find(name)->second);
    behaviors.erase(name);
    behaviors[newName] = std::move(aut);
    behaviors[newName]->SetName(newName);

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
    if (behavior && !HasBehaviorNamed(behavior->GetName()))
    {
        behaviors[behavior->GetName()] = std::unique_ptr<Behavior>(behavior);
        return true;
    }

    return false;
}

#if defined(GD_IDE_ONLY)
std::map<gd::String, gd::PropertyDescriptor> Object::GetProperties(gd::Project & project) const
{
    std::map<gd::String, gd::PropertyDescriptor> nothing;
    return nothing;
}

gd::Behavior * Object::AddNewBehavior(gd::Project & project, const gd::String & type, const gd::String & name)
{
    std::unique_ptr<gd::Behavior> behavior = project.GetCurrentPlatform().CreateBehavior(type);

    if ( behavior )
    {
        behavior->SetName(name);
        behaviors[name] = std::move(behavior);
        return behaviors[name].get();
    }
    else
    {
        return nullptr;
    }
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
    behaviors.clear();

    //Compatibility with GD <= 3.3
    if (element.HasChild("Automatism"))
    {
        for (std::size_t i = 0; i < element.GetChildrenCount("Automatism"); ++i)
        {
            SerializerElement & behaviorElement = element.GetChild("Automatism", i);

            gd::String autoType = behaviorElement.GetStringAttribute("type", "", "Type")
                .FindAndReplace("Automatism", "Behavior");
            gd::String autoName = behaviorElement.GetStringAttribute("name", "", "Name");

            std::unique_ptr<Behavior> behavior = project.CreateBehavior(autoType);
            if ( behavior )
            {
                behavior->SetName(autoName);
                behavior->UnserializeFrom(behaviorElement);
                behaviors[autoName] = std::move(behavior);
            }
            else
                std::cout << "WARNING: Unknown behavior " << autoType << std::endl;
        }
    }
    //End of compatibility code
    else
    {
        SerializerElement & behaviorsElement = element.GetChild("behaviors", 0, "automatisms");
        behaviorsElement.ConsiderAsArrayOf("behavior", "automatism");
        for (std::size_t i = 0; i < behaviorsElement.GetChildrenCount(); ++i)
        {
            SerializerElement & behaviorElement = behaviorsElement.GetChild(i);

            gd::String autoType = behaviorElement.GetStringAttribute("type")
                .FindAndReplace("Automatism", "Behavior"); //Compatibility with GD <= 4
            gd::String autoName = behaviorElement.GetStringAttribute("name");

            std::unique_ptr<Behavior> behavior = project.CreateBehavior(autoType);
            if ( behavior )
            {
                behavior->SetName(autoName);
                behavior->UnserializeFrom(behaviorElement);
                behaviors[autoName] = std::move(behavior);
            }
            else
                std::cout << "WARNING: Unknown behavior " << autoType << std::endl;
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
    for (std::size_t i = 0;i<allBehaviors.size();++i)
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
