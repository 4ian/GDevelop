/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#include <iostream>
#include <string>
#include "GDCore/PlatformDefinition/Variable.h"
#include "GDCore/TinyXml/tinyxml.h"
#include "GDCore/PlatformDefinition/VariablesContainer.h"
#include "GDCpp/RuntimeVariablesContainer.h"

BadVariable RuntimeVariablesContainer::badVariable;
BadRuntimeVariablesContainer RuntimeVariablesContainer::badVariablesContainer;

RuntimeVariablesContainer::RuntimeVariablesContainer(const gd::VariablesContainer & container)
{
    Merge(container);
}

RuntimeVariablesContainer& RuntimeVariablesContainer::operator=(const gd::VariablesContainer & container)
{
    Clear();
    Merge(container);
}

void RuntimeVariablesContainer::Clear()
{
    variablesArray.clear();
    for(std::map < std::string, gd::Variable* >::iterator it = variables.begin();it != variables.end();++it)
        delete it->second;
    variables.clear();
}

void RuntimeVariablesContainer::Merge(const gd::VariablesContainer & container)
{
    for ( unsigned int i = 0; i<container.Count();++i)
    {
        const std::pair<std::string, gd::Variable> & variable = container.Get(i);

        if ( Has(variable.first) )
            Get(variable.first) = variable.second;
        else
        {
            gd::Variable * newVariable = new gd::Variable(variable.second);
            variablesArray.push_back(newVariable);
            variables[variable.first] = newVariable;
        }
    }
}

gd::Variable & RuntimeVariablesContainer::Get(const std::string & name)
{
    std::map < std::string, gd::Variable* >::const_iterator var = variables.find(name);

    if ( var != variables.end() ) return *(var->second);

    gd::Variable * newVariable = new gd::Variable;
    variables[name] = newVariable;
    return *newVariable;
}

const gd::Variable & RuntimeVariablesContainer::Get(const std::string & name) const
{
    std::map < std::string, gd::Variable* >::const_iterator var = variables.find(name);

    if ( var != variables.end() ) return *(var->second);

    gd::Variable * newVariable = new gd::Variable;
    variables[name] = newVariable;
    return *newVariable;
}

gd::Variable & RuntimeVariablesContainer::GetBadVariable()
{
    return badVariable;
}

/**
 * \brief Return a "bad" variables container that can be used when no other valid container can be used.
 */
RuntimeVariablesContainer & RuntimeVariablesContainer::GetBadVariablesContainer()
{
    return badVariablesContainer;
}