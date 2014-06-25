/*
 * Game Develop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#include <iostream>
#include <string>
#include <algorithm>
#include "GDCore/PlatformDefinition/Variable.h"
#include "GDCore/TinyXml/tinyxml.h"
#include "GDCore/PlatformDefinition/VariablesContainer.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd
{

std::pair<std::string, Variable> VariablesContainer::badVariable;

namespace {

//Tool functor used below
class VariableHasName
{
public:
    VariableHasName(std::string const& name_) : name(name_) { }

    bool operator () (const std::pair<std::string, gd::Variable> & p)
    {
        return (p.first == name);
    }

    std::string name;
};

}

VariablesContainer::VariablesContainer()
{
}

bool VariablesContainer::Has(const std::string & name) const
{
    std::vector < std::pair<std::string, gd::Variable> >::const_iterator i =
        std::find_if(variables.begin(), variables.end(), VariableHasName(name));
    return (i != variables.end());
}

std::pair<std::string, gd::Variable> & VariablesContainer::Get(unsigned int index)
{
    if ( index < variables.size() )
        return variables[index];

    return badVariable;
}

const std::pair<std::string, gd::Variable> & VariablesContainer::Get(unsigned int index) const
{
    if ( index < variables.size() )
        return variables[index];

    return badVariable;
}

Variable & VariablesContainer::Get(const std::string & name)
{
    std::vector < std::pair<std::string, gd::Variable> >::iterator i =
        std::find_if(variables.begin(), variables.end(), VariableHasName(name));
    if (i != variables.end())
        return i->second;

    return badVariable.second;
}

const Variable & VariablesContainer::Get(const std::string & name) const
{
    std::vector < std::pair<std::string, gd::Variable> >::const_iterator i =
        std::find_if(variables.begin(), variables.end(), VariableHasName(name));
    if (i != variables.end())
        return i->second;

    return badVariable.second;
}

Variable & VariablesContainer::Insert(const std::string & name, const gd::Variable & variable, unsigned int position)
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
void VariablesContainer::Remove(const std::string & varName)
{
    variables.erase(std::remove_if(variables.begin(), variables.end(),
        VariableHasName(varName)), variables.end() );
}

unsigned int VariablesContainer::GetPosition(const std::string & name) const
{
    for(unsigned int i = 0;i<variables.size();++i)
    {
        if ( variables[i].first == name )
            return i;
    }

    return std::string::npos;
}

Variable & VariablesContainer::InsertNew(const std::string & name, unsigned int position)
{
    Variable newVariable;
    return Insert(name, newVariable, position);
}

void VariablesContainer::Rename(const std::string & oldName, const std::string & newName)
{
    std::vector < std::pair<std::string, gd::Variable> >::iterator i =
        std::find_if(variables.begin(), variables.end(), VariableHasName(oldName));
    if (i != variables.end()) i->first = newName;
}

void VariablesContainer::Swap(unsigned int firstVariableIndex, unsigned int secondVariableIndex)
{
    if ( firstVariableIndex >= variables.size() || secondVariableIndex >= variables.size() )
        return;

    std::pair<std::string, gd::Variable> temp = variables[firstVariableIndex];
    variables[firstVariableIndex] = variables[secondVariableIndex];
    variables[secondVariableIndex] = temp;
}

void VariablesContainer::SerializeTo(SerializerElement & element) const
{
    element.ConsiderAsArrayOf("variable");
    for ( unsigned int j = 0;j < variables.size();j++ )
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
    for ( unsigned int j = 0;j < element.GetChildrenCount();j++ )
    {
        const SerializerElement & variableElement = element.GetChild(j);

        Variable variable;
        variable.UnserializeFrom(variableElement);
        Insert(variableElement.GetStringAttribute("name", "", "Name" ), variable, -1);
    }
}

}
