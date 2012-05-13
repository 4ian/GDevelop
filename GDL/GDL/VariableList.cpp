/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include <iostream>
#include "GDL/VariableList.h"
#include "GDL/Variable.h"

Variable ListVariable::badVariable("badVariable");

#if defined(GD_IDE_ONLY)
Variable & ListVariable::GetVariable(const std::string & name)
{
    for (unsigned int i = 0;i<variables.size();++i)
    {
        if ( variables[i].GetName() == name)
            return variables[i];
    }

    return badVariable;
}

const Variable & ListVariable::GetVariable(const std::string & name) const
{
    for (unsigned int i = 0;i<variables.size();++i)
    {
        if ( variables[i].GetName() == name)
            return variables[i];
    }

    return badVariable;
}

inline void ListVariable::RemoveVariable(const std::string & varName)
{
    std::vector < Variable >::const_iterator end = variables.end();
    for (std::vector < Variable >::iterator i = variables.begin();i != end;++i)
    {
        if ( i->GetName() == varName)
        {
            variables.erase(i);
            return;
        }
    }

    return;
}
unsigned int ListVariable::GetVariablePosition(const std::string & name) const
{
    for (unsigned int i =0;i<variables.size();++i)
    {
        if ( variables[i].GetName() == name )
            return i;
    }
    return std::string::npos;
}

unsigned int ListVariable::GetVariableCount() const
{
    return variables.size();
}

void ListVariable::InsertNewVariable(const std::string & name, unsigned int position)
{
    std::cout << "Called";
    Variable newVariable(name);

    if (position<variables.size())
        variables.insert(variables.begin()+position, newVariable);
    else
        variables.push_back(newVariable);
}

void ListVariable::InsertVariable(const gd::Variable & variable, unsigned int position)
{
    try
    {
        const Variable & castedVariable = dynamic_cast<const Variable&>(variable);
        if (position<variables.size())
            variables.insert(variables.begin()+position, castedVariable);
        else
            variables.push_back(castedVariable);
    }
    catch(...) { std::cout << "WARNING: Tried to add a variable which is not a GD C++ Platform Variable to a GD C++ Platform project"; }
}

void ListVariable::Create(const gd::VariablesContainer & source)
{
    try
    {
        const ListVariable & castedSource = dynamic_cast<const ListVariable&>(source);
        operator=(castedSource);
    }
    catch(...) { std::cout << "WARNING: Tried to create a ListVariable object from an object which is not a ListVariable"; }
}

void ListVariable::SwapVariables(unsigned int firstVariableIndex, unsigned int secondVariableIndex)
{
    if ( firstVariableIndex >= variables.size() || secondVariableIndex >= variables.size() )
        return;

    Variable temp = variables[firstVariableIndex];
    variables[firstVariableIndex] = variables[secondVariableIndex];
    variables[secondVariableIndex] = temp;
}
#endif
