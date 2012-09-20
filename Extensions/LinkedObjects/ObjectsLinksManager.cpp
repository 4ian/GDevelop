/**

Game Develop - LinkedObjects Extension
Copyright (c) 2011-2012 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#include "ObjectsLinksManager.h"

#include "LinkedObjectsTools.h"
#include <iostream>
#include <string>
#include <boost/weak_ptr.hpp>
#include <boost/shared_ptr.hpp>
#include "GDL/Object.h"
#include "GDL/RuntimeScene.h"

using namespace std;

namespace GDpriv
{
namespace LinkedObjects
{

void ObjectsLinksManager::LinkObjects(Object * a, Object * b)
{
    {
        std::set< Object * > & objectLinks = links[a];
        objectLinks.insert(b);
    }
    {
        std::set< Object * > & objectLinks = links[b];
        objectLinks.insert(a);
    }
}

void ObjectsLinksManager::RemoveLinkBetween(Object * a, Object * b)
{
    {
        std::set< Object * > & objectLinks = links[a];
        objectLinks.erase(b);
    }
    {
        std::set< Object * > & objectLinks = links[b];
        objectLinks.erase(a);
    }
}

void ObjectsLinksManager::RemoveAllLinksOf(Object * object)
{
    std::set< Object * > & objectLinks = links[object];
    for (std::set< Object * >::iterator linkedObj = objectLinks.begin();linkedObj != objectLinks.end();++linkedObj)
    {
        std::set< Object * > & linkedObjectLinks = links[*linkedObj];
        linkedObjectLinks.erase(object);
    }

    links.erase(object); //Remove all links of object
}

std::vector< Object* > ObjectsLinksManager::GetAllRawPointersToObjectsLinkedWith(Object * object)
{
    //Get links of object
    const std::set< Object * > & objectLinks = links[object];
    std::vector< Object* > list; list.reserve(objectLinks.size());

    //Create the list, avoiding dead links or links to just deleted objects
    for (std::set< Object * >::iterator linkedObj = objectLinks.begin();linkedObj != objectLinks.end();++linkedObj)
    {
        if ( !(*linkedObj)->GetName().empty() )
            list.push_back((*linkedObj));
    }

    return list;
}

std::vector< Object* > ObjectsLinksManager::GetRawPointersToObjectsLinkedWith(Object * object, std::string linkedName)
{
    //Get links of object
    const std::set< Object * > & objectLinks = links[object];
    std::vector< Object* > list; list.reserve(objectLinks.size());

    //Create the list
    for (std::set< Object * >::iterator linkedObj = objectLinks.begin();linkedObj != objectLinks.end();++linkedObj)
    {
        if ( (*linkedObj)->GetName() == linkedName)
            list.push_back((*linkedObj));
    }

    return list;
}

void ObjectsLinksManager::ClearAll()
{
    links.clear();
}


}
}

