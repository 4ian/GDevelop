/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#include <iostream>
#include <string>
#include "GDCore/PlatformDefinition/Variable.h"
#include "GDCore/TinyXml/tinyxml.h"
#include "GDCore/PlatformDefinition/VariablesContainer.h"

namespace gd
{

Variable VariablesContainer::badVariable("badVariable");

VariablesContainer::VariablesContainer()
{
}

Variable & VariablesContainer::GetVariable(const std::string & name)
{
    for (unsigned int i = 0;i<variables.size();++i)
    {
        if ( variables[i].GetName() == name)
            return variables[i];
    }

    return badVariable;
}

const Variable & VariablesContainer::GetVariable(const std::string & name) const
{
    for (unsigned int i = 0;i<variables.size();++i)
    {
        if ( variables[i].GetName() == name)
            return variables[i];
    }

    return badVariable;
}

#if defined(GD_IDE_ONLY)
inline void VariablesContainer::RemoveVariable(const std::string & varName)
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
unsigned int VariablesContainer::GetVariablePosition(const std::string & name) const
{
    for (unsigned int i =0;i<variables.size();++i)
    {
        if ( variables[i].GetName() == name )
            return i;
    }
    return std::string::npos;
}

unsigned int VariablesContainer::GetVariableCount() const
{
    return variables.size();
}

void VariablesContainer::InsertNewVariable(const std::string & name, unsigned int position)
{
    Variable newVariable(name);

    if (position<variables.size())
        variables.insert(variables.begin()+position, newVariable);
    else
        variables.push_back(newVariable);
}

void VariablesContainer::InsertVariable(const gd::Variable & variable, unsigned int position)
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

void VariablesContainer::Create(const gd::VariablesContainer & source)
{
    try
    {
        const VariablesContainer & castedSource = dynamic_cast<const VariablesContainer&>(source);
        operator=(castedSource);
    }
    catch(...) { std::cout << "WARNING: Tried to create a VariablesContainer object from an object which is not a VariablesContainer"; }
}

void VariablesContainer::SwapVariables(unsigned int firstVariableIndex, unsigned int secondVariableIndex)
{
    if ( firstVariableIndex >= variables.size() || secondVariableIndex >= variables.size() )
        return;

    Variable temp = variables[firstVariableIndex];
    variables[firstVariableIndex] = variables[secondVariableIndex];
    variables[secondVariableIndex] = temp;
}
#endif

void VariablesContainer::LoadFromXml(const TiXmlElement * rootElement)
{
    if ( rootElement == NULL ) return;

    Clear();
    const TiXmlElement * element = rootElement->FirstChildElement();

    while ( element )
    {
        std::string name = element->Attribute( "Name" ) != NULL ? element->Attribute( "Name" ) : "";
        Variable variable(name);
        if ( element->Attribute( "Value" ) != NULL ) variable.SetString(element->Attribute( "Value" ));

        variables.push_back(variable);
        element = element->NextSiblingElement();
    }
}

#if defined(GD_IDE_ONLY)
void VariablesContainer::SaveToXml(TiXmlElement * element) const
{
    if ( element == NULL ) return;

    for ( unsigned int j = 0;j < variables.size();j++ )
    {
        TiXmlElement * variable = new TiXmlElement( "Variable" );
        element->LinkEndChild( variable );

        variable->SetAttribute("Name", variables[j].GetName().c_str());
        variable->SetAttribute("Value", variables[j].GetString().c_str());
    }
}
#endif

}
