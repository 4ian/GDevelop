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

#include "LinkedObjectsTools.h"
#include <iostream>
#include <string>
#include <boost/weak_ptr.hpp>
#include <boost/shared_ptr.hpp>
#include "GDCpp/RuntimeObject.h"
#include "GDCpp/RuntimeScene.h"
#include "ObjectsLinksManager.h"

using namespace std;

namespace GDpriv
{
namespace LinkedObjects
{

std::map < RuntimeScene* , ObjectsLinksManager > ObjectsLinksManager::managers;

bool GD_EXTENSION_API PickObjectsLinkedTo(RuntimeScene & scene,
                                          std::map <std::string, std::vector<RuntimeObject*> *> pickedObjectsLists,
                                          RuntimeObject * object)
{
    if (!object) return false;
    bool isTrue = false;

    //Create a boolean for each object
    std::vector < std::vector<bool> > pickedList;
    for(std::map <std::string, std::vector<RuntimeObject*> *>::const_iterator it = pickedObjectsLists.begin();
        it != pickedObjectsLists.end();++it)
    {
        std::vector<bool> arr;
        arr.assign(it->second->size(), false);
        pickedList.push_back(arr);
    }

    //Pick objects which are linked to the object
    unsigned int i = 0;
    for(std::map <std::string, std::vector<RuntimeObject*> *>::const_iterator it = pickedObjectsLists.begin();
        it != pickedObjectsLists.end();++it, ++i)
    {
        if ( !it->second ) continue;
        const std::vector<RuntimeObject*> & arr1 = *it->second;
        std::vector<RuntimeObject*> linkedObjects = ObjectsLinksManager::managers[&scene].GetObjectsLinkedWith(object);

        for(unsigned int k = 0;k<arr1.size();++k)
        {
            if ( std::find(linkedObjects.begin(), linkedObjects.end(), arr1[k]) != linkedObjects.end()) {
                pickedList[i][k] = true;
                isTrue = true;
            }
        }
    }

    //Trim not picked objects from arrays.
    i = 0;
    for(std::map <std::string, std::vector<RuntimeObject*> *>::const_iterator it = pickedObjectsLists.begin();
        it != pickedObjectsLists.end();++it, ++i)
    {
        size_t finalSize = 0;
        if ( !it->second ) continue;
        std::vector<RuntimeObject*> & arr = *it->second;

        for(unsigned int k = 0;k<arr.size();++k)
        {
            RuntimeObject * obj = arr[k];
            if ( pickedList[i][k] )
            {
                arr[finalSize] = obj;
                finalSize++;
            }
        }
        arr.resize(finalSize);
    }

    return isTrue;
}

void GD_EXTENSION_API LinkObjects(RuntimeScene & scene, RuntimeObject * a, RuntimeObject * b)
{
    if (!a || !b) return;
    ObjectsLinksManager::managers[&scene].LinkObjects(a, b);
}

void GD_EXTENSION_API RemoveLinkBetween(RuntimeScene & scene, RuntimeObject * a, RuntimeObject * b )
{
    if (!a || !b) return;
    ObjectsLinksManager::managers[&scene].RemoveLinkBetween(a, b);
}

void GD_EXTENSION_API RemoveAllLinksOf(RuntimeScene & scene, RuntimeObject * object)
{
    if (!object) return;
    ObjectsLinksManager::managers[&scene].RemoveAllLinksOf(object);
}

}
}

