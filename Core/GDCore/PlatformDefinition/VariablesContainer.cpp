/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include <iostream>
#include "GDCore/String.h"
#include <algorithm>
#include "GDCore/PlatformDefinition/Variable.h"
#include "GDCore/TinyXml/tinyxml.h"
#include "GDCore/PlatformDefinition/VariablesContainer.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd
{

std::pair<gd::String, Variable> VariablesContainer::badVariable;

namespace {

//Tool functor used below
class VariableHasName
{
public:
    VariableHasName(gd::String const& name_) : name(name_) { }

    bool operator () (const std::pair<gd::String, gd::Variable> & p)
    {
        return (p.first == name);
    }

    gd::String name;
};

}

VariablesContainer::VariablesContainer()
{
}

bool VariablesContainer::Has(const gd::String & name) const
{
    std::vector < std::pair<gd::String, gd::Variable> >::const_iterator i =
        std::find_if(variables.begin(), variables.end(), VariableHasName(name));
    return (i != variables.end());
}

std::pair<gd::String, gd::Variable> & VariablesContainer::Get(std::size_t index)
{
    if ( index < variables.size() )
        return variables[index];

    return badVariable;
}

const std::pair<gd::String, gd::Variable> & VariablesContainer::Get(std::size_t index) const
{
    if ( index < variables.size() )
        return variables[index];

    return badVariable;
}

Variable & VariablesContainer::Get(const gd::String & name)
{
    std::vector < std::pair<gd::String, gd::Variable> >::iterator i =
        std::find_if(variables.begin(), variables.end(), VariableHasName(name));
    if (i != variables.end())
        return i->second;

    return badVariable.second;
}

const Variable & VariablesContainer::Get(const gd::String & name) const
{
    std::vector < std::pair<gd::String, gd::Variable> >::const_iterator i =
        std::find_if(variables.begin(), variables.end(), VariableHasName(name));
    if (i != variables.end())
        return i->second;

    return badVariable.second;
}

Variable & VariablesContainer::Insert(const gd::String & name, const gd::Variable & variable, std::size_t position)
{
    if (position<variables.size())
    {
        variables.insert(variables.begin()+position, std::make_pair(name, variable));
        return variables[position].second;
    }
    else
    {
        variables.push_back(std::make_pair(name, variable));
        return variables.back().second;
    }
}

#if defined(GD_IDE_ONLY)
void VariablesContainer::Remove(const gd::String & varName)
{
    variables.erase(std::remove_if(variables.begin(), variables.end(),
        VariableHasName(varName)), variables.end() );
}

std::size_t VariablesContainer::GetPosition(const gd::String & name) const
{
    for(std::size_t i = 0;i<variables.size();++i)
    {
        if ( variables[i].first == name )
            return i;
    }

    return gd::String::npos;
}

Variable & VariablesContainer::InsertNew(const gd::String & name, std::size_t position)
{
    Variable newVariable;
    return Insert(name, newVariable, position);
}

void VariablesContainer::Rename(const gd::String & oldName, const gd::String & newName)
{
    std::vector < std::pair<gd::String, gd::Variable> >::iterator i =
        std::find_if(variables.begin(), variables.end(), VariableHasName(oldName));
    if (i != variables.end()) i->first = newName;
}

void VariablesContainer::Swap(std::size_t firstVariableIndex, std::size_t secondVariableIndex)
{
    if ( firstVariableIndex >= variables.size() || secondVariableIndex >= variables.size() )
        return;

    std::pair<gd::String, gd::Variable> temp = variables[firstVariableIndex];
    variables[firstVariableIndex] = variables[secondVariableIndex];
    variables[secondVariableIndex] = temp;
}

void VariablesContainer::SerializeTo(SerializerElement & element) const
{
    element.ConsiderAsArrayOf("variable");
    for ( std::size_t j = 0;j < variables.size();j++ )
    {
        SerializerElement & variableElement = element.AddChild("variable");
        variableElement.SetAttribute("name", variables[j].first);
        variables[j].second.SerializeTo(variableElement);
    }
}
#endif

void VariablesContainer::UnserializeFrom(const SerializerElement & element)
{
    Clear();
    element.ConsiderAsArrayOf("variable", "Variable");
    for ( std::size_t j = 0;j < element.GetChildrenCount();j++ )
    {
        const SerializerElement & variableElement = element.GetChild(j);

        Variable variable;
        variable.UnserializeFrom(variableElement);
        Insert(variableElement.GetStringAttribute("name", "", "Name" ), variable, -1);
    }
}

}
