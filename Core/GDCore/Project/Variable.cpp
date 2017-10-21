/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCore/Project/Variable.h"
#include "GDCore/String.h"
#include <sstream>
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/TinyXml/tinyxml.h"

using namespace std;

namespace gd
{

/**
 * Get value as a double
 */
double Variable::GetValue() const
{
    if (!isNumber)
    {
        stringstream ss; ss << str;
        ss >> value;
        isNumber = true;
    }

    return value;
}

const gd::String & Variable::GetString() const
{
    if (isNumber)
    {
        stringstream s; s << (value);
        str = s.str();
        isNumber = false;
    }

    return str;
}

bool Variable::HasChild(const gd::String & name) const
{
    return isStructure && children.find(name) != children.end();
}

/**
 * \brief Return the child with the specified name.
 *
 * If the variable is not a structure or has not
 * the specified child, an empty variable is returned.
 */
Variable & Variable::GetChild(const gd::String & name)
{
    std::map<gd::String, Variable>::iterator it = children.find(name);
    if ( it != children.end() ) return it->second;

    isStructure = true;
    Variable newEmptyVariable;
    children[name] = newEmptyVariable;
    return children[name];
}

/**
 * \brief Return the child with the specified name.
 *
 * If the variable is not a structure or has not
 * the specified child, an empty variable is returned.
 */
const Variable & Variable::GetChild(const gd::String & name) const
{
    std::map<gd::String, Variable>::iterator it = children.find(name);
    if ( it != children.end() ) return it->second;

    isStructure = true;
    Variable newEmptyVariable;
    children[name] = newEmptyVariable;
    return children[name];
}

void Variable::RemoveChild(const gd::String & name)
{
    if ( !isStructure ) return;
    children.erase(name);
}

bool Variable::RenameChild(const gd::String & oldName, const gd::String & newName)
{
    if ( !isStructure || !HasChild(oldName)|| HasChild(newName) ) return false;

    children[newName] = children[oldName];
    children.erase(oldName);

    return true;
}

void Variable::ClearChildren()
{
    if ( !isStructure ) return;
    children.clear();
}

void Variable::SerializeTo(SerializerElement & element) const
{
    if (!isStructure)
        element.SetAttribute("value", GetString());
    else
    {
        SerializerElement & childrenElement = element.AddChild("children");
        childrenElement.ConsiderAsArrayOf("variable");
        for (std::map<gd::String, gd::Variable>::iterator i = children.begin(); i != children.end(); ++i)
        {
            SerializerElement & variableElement = childrenElement.AddChild("variable");
            variableElement.SetAttribute("name", i->first);
            i->second.SerializeTo(variableElement);
        }
    }
}

void Variable::UnserializeFrom(const SerializerElement & element)
{
    isStructure = element.HasChild("children", "Children");

    if (isStructure)
    {
        const SerializerElement & childrenElement = element.GetChild("children", 0, "Children");
        childrenElement.ConsiderAsArrayOf("variable", "Variable");
        for (int i = 0; i < childrenElement.GetChildrenCount(); ++i)
        {
            const SerializerElement & childElement = childrenElement.GetChild(i);
            gd::String name = childElement.GetStringAttribute("name", "", "Name");

            gd::Variable childVariable;
            childVariable.UnserializeFrom(childElement);
            children[name] = childVariable;
        }
    }
    else
        SetString(element.GetStringAttribute("value", "", "Value"));
}

void Variable::SaveToXml(TiXmlElement * element) const
{
    if (!element) return;

    if ( !isStructure )
        element->SetAttribute("Value", GetString().c_str());
    else
    {
        TiXmlElement * childrenElem = new TiXmlElement( "Children" );
        element->LinkEndChild( childrenElem );
        for (std::map<gd::String, gd::Variable>::iterator i = children.begin(); i != children.end(); ++i)
        {
            TiXmlElement * variable = new TiXmlElement( "Variable" );
            childrenElem->LinkEndChild( variable );

            variable->SetAttribute("Name", i->first.c_str());
            i->second.SaveToXml(variable);
        }
    }
}

void Variable::LoadFromXml(const TiXmlElement * element)
{
    if (!element) return;

    isStructure = element->FirstChildElement("Children") != NULL;

    if ( isStructure )
    {
        const TiXmlElement * child = element->FirstChildElement("Children")->FirstChildElement();
        while ( child )
        {
            gd::String name = child->Attribute("Name") ? child->Attribute("Name") : "";
            gd::Variable childVariable;
            childVariable.LoadFromXml(child);
            children[name] = childVariable;

            child = child->NextSiblingElement();
        }
    }
    else if (element->Attribute("Value"))
        SetString(element->Attribute("Value"));
}

}
