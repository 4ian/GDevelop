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

void ObjectsLinksManager::LinkObjects(boost::weak_ptr<Object> a, boost::weak_ptr<Object> b)
{
    {
        std::set< boost::weak_ptr<Object> > & objectLinks = links[a];
        objectLinks.insert(b);
    }
    {
        std::set< boost::weak_ptr<Object> > & objectLinks = links[b];
        objectLinks.insert(a);
    }
}

void ObjectsLinksManager::RemoveLinkBetween(boost::weak_ptr<Object> a, boost::weak_ptr<Object> b)
{
    {
        std::set< boost::weak_ptr<Object> > & objectLinks = links[a];
        objectLinks.erase(b);
    }
    {
        std::set< boost::weak_ptr<Object> > & objectLinks = links[b];
        objectLinks.erase(a);
    }
}

void ObjectsLinksManager::RemoveAllLinksOf(boost::weak_ptr<Object> object)
{
    std::set< boost::weak_ptr<Object> > & objectLinks = links[object];
    for (std::set< boost::weak_ptr<Object> >::iterator linkedObj = objectLinks.begin();linkedObj != objectLinks.end();++linkedObj)
    {
        if ( (*linkedObj).expired() )
        {
            links.erase((*linkedObj));  //If linked object does not exist anymore, take this opportunity to erase it from links list
        }
        else
        {
            std::set< boost::weak_ptr<Object> > & linkedObjectLinks = links[*linkedObj];
            linkedObjectLinks.erase(object);
        }
    }

    links.erase(object); //Remove all links of object
}

std::vector< Object* > ObjectsLinksManager::GetAllRawPointersToObjectsLinkedWith(boost::weak_ptr<Object> object)
{
    //Get links of object
    const std::set< boost::weak_ptr<Object> > & objectLinks = links[object];
    std::vector< Object* > list; list.reserve(objectLinks.size());

    //Create the list, avoiding dead links or links to just deleted objects
    for (std::set< boost::weak_ptr<Object> >::iterator linkedObj = objectLinks.begin();linkedObj != objectLinks.end();++linkedObj)
    {
        if ( !(*linkedObj).expired() && !(*linkedObj).lock()->GetName().empty() )
            list.push_back((*linkedObj).lock().get());
    }

    return list;
}

std::vector< Object* > ObjectsLinksManager::GetRawPointersToObjectsLinkedWith(boost::weak_ptr<Object> object, std::string linkedName)
{
    //Get links of object
    const std::set< boost::weak_ptr<Object> > & objectLinks = links[object];
    std::vector< Object* > list; list.reserve(objectLinks.size());

    //Create the list
    for (std::set< boost::weak_ptr<Object> >::iterator linkedObj = objectLinks.begin();linkedObj != objectLinks.end();++linkedObj)
    {
        if ( !(*linkedObj).expired() && (*linkedObj).lock()->GetName() == linkedName)
            list.push_back((*linkedObj).lock().get());
    }

    return list;
}

void ObjectsLinksManager::ClearAll()
{
    links.clear();
}


}
}
