/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/Object.h"
#include <iostream>
#include <string>
#include <vector>
#include <string>
#include <list>
#include <sstream>
#include <cstring>
#include <boost/shared_ptr.hpp>
#include "GDL/Log.h"
#include "GDL/Force.h"
#include "GDL/CommonTools.h"
#include "GDL/RuntimeScene.h"
#include "GDL/PolygonCollision.h"
#include "GDL/Automatism.h"
#include "GDL/Game.h"
#include "GDL/Polygon.h"
#include "GDL/ExtensionsManager.h"
#if defined(GD_IDE_ONLY)
#include <wx/panel.h>
#endif

using namespace std;

Object::Object(std::string name_) :
    name( name_ )
{
}

Object::~Object()
{
    //Do not forget to delete automatisms which are managed using raw pointers.
    for (std::map<std::string, Automatism* >::const_iterator it = automatisms.begin() ; it != automatisms.end(); ++it )
    	delete it->second;
}

void Object::Init(const Object & object)
{
    name = object.name;
    type = object.type;
    objectVariables = object.objectVariables;

    //Do not forget to delete automatisms which are managed using raw pointers.
    for (std::map<std::string, Automatism* >::const_iterator it = automatisms.begin() ; it != automatisms.end(); ++it )
    	delete it->second;

    automatisms.clear();
    for (std::map<std::string, Automatism* >::const_iterator it = object.automatisms.begin() ; it != object.automatisms.end(); ++it )
    	automatisms[it->first] = it->second->Clone();
}

std::vector < std::string > Object::GetAllAutomatismNames() const
{
    std::vector < std::string > allNameIdentifiers;

    for (std::map<std::string, Automatism* >::const_iterator it = automatisms.begin() ; it != automatisms.end(); ++it )
    	allNameIdentifiers.push_back(it->first);

    return allNameIdentifiers;
}

void Object::AddAutomatism(Automatism * automatism)
{
    automatisms[automatism->GetName()] = automatism;
}
#if defined(GD_IDE_ONLY)
void Object::RemoveAutomatism(const std::string & name)
{
    //Do not forget to delete automatisms which are managed using raw pointers.
    delete(automatisms[name]);

    automatisms.erase(name);
}

void Object::AddNewAutomatism(const std::string & type, const std::string & name)
{
    Automatism * automatism = ExtensionsManager::GetInstance()->CreateAutomatism(type);
    automatism->SetName(name);
    automatisms[automatism->GetName()] = automatism;
}
#endif

#if defined(GD_IDE_ONLY)
std::map<std::string, std::string> Object::GetInitialInstanceProperties(const gd::InitialInstance & position, Game & game, Scene & scene)
{
    std::map<std::string, std::string> nothing;
    return nothing;
}

void Object::EditObject( wxWindow* parent, gd::Project & project, gd::MainFrameWrapper & mainFrameWrapper_ )
{
    try
    {
        EditObject(parent, dynamic_cast<Game &>(project), mainFrameWrapper_);
    }
    catch(...)
    {
        std::cout << "Unable to edit object: IDE probably passed a gd::Project which is not a GD C++ Platform project" << std::endl;
    }
}
#endif

#if defined(GD_IDE_ONLY)
gd::Automatism & Object::GetAutomatism(const std::string & name)
{
    return *automatisms.find(name)->second;
}

const gd::Automatism & Object::GetAutomatism(const std::string & name) const
{
    return *automatisms.find(name)->second;
}
#endif

void DestroyBaseObject(Object * object)
{
    delete object;
}

Object * CreateBaseObject(std::string name)
{
    return new Object(name);
}

