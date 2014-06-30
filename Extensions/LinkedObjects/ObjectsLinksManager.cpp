/**

Game Develop - LinkedObjects Extension
Copyright (c) 2011-2014 Florian Rival (Florian.Rival@gmail.com)

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
#include "GDCpp/RuntimeObject.h"
#include "GDCpp/RuntimeScene.h"

using namespace std;

namespace GDpriv
{
namespace LinkedObjects
{

void ObjectsLinksManager::LinkObjects(RuntimeObject * a, RuntimeObject * b)
{
    {
        std::set< RuntimeObject * > & objectLinks = links[a];
        objectLinks.insert(b);
    }
    {
        std::set< RuntimeObject * > & objectLinks = links[b];
        objectLinks.insert(a);
    }
}

void ObjectsLinksManager::RemoveLinkBetween(RuntimeObject * a, RuntimeObject * b)
{
    {
        std::set< RuntimeObject * > & objectLinks = links[a];
        objectLinks.erase(b);
    }
    {
        std::set< RuntimeObject * > & objectLinks = links[b];
        objectLinks.erase(a);
    }
}

void ObjectsLinksManager::RemoveAllLinksOf(RuntimeObject * object)
{
    std::set< RuntimeObject * > & objectLinks = links[object];
    for (std::set< RuntimeObject * >::iterator linkedObj = objectLinks.begin();linkedObj != objectLinks.end();++linkedObj)
    {
        std::set< RuntimeObject * > & linkedObjectLinks = links[*linkedObj];
        linkedObjectLinks.erase(object);
    }

    links.erase(object); //Remove all links of object
}

std::vector< RuntimeObject* > ObjectsLinksManager::GetObjectsLinkedWith(RuntimeObject * object)
{
    //Get links of object
    const std::set< RuntimeObject * > & objectLinks = links[object];
    std::vector< RuntimeObject* > list; list.reserve(objectLinks.size());

    //Create the list, avoiding dead links or links to just deleted objects
    for (std::set< RuntimeObject * >::iterator linkedObj = objectLinks.begin();linkedObj != objectLinks.end();++linkedObj)
    {
        if ( !(*linkedObj)->GetName().empty() )
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

