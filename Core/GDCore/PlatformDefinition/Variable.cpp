/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDCore/PlatformDefinition/Variable.h"
#include <string>
#include <sstream>
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

const std::string & Variable::GetString() const
{
    if (isNumber)
    {
        stringstream s; s << (value);
        str = s.str();
        isNumber = false;
    }

    return str;
}

bool Variable::HasChild(const std::string & name) const
{
    return isStructure && children.find(name) != children.end();
}

/**
 * \brief Return the child with the specified name. 
 * 
 * If the variable is not a structure or has not
 * the specified child, an empty variable is returned.
 */
Variable & Variable::GetChild(const std::string & name)
{
    std::map<std::string, Variable>::iterator it = children.find(name);
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
const Variable & Variable::GetChild(const std::string & name) const
{
    std::map<std::string, Variable>::iterator it = children.find(name);
    if ( it != children.end() ) return it->second;

    isStructure = true;
    Variable newEmptyVariable;
    children[name] = newEmptyVariable;
    return children[name];
}

/**
 * \brief Remove the child with the specified name.
 * 
 * If the variable is not a structure or has not
 * the specified child, nothing is done.
 */
void Variable::RemoveChild(const std::string & name)
{
    if ( !isStructure ) return;
    children.erase(name);
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
        for (std::map<std::string, gd::Variable>::iterator i = children.begin(); i != children.end(); ++i)
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
            std::string name = child->Attribute("Name") ? child->Attribute("Name") : "";
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
