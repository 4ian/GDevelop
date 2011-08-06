/**

Game Develop - LinkedObjects Extension
Copyright (c) 2011 Florian Rival (Florian.Rival@gmail.com)

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

#ifndef OBJECTSLINKSMANAGER_H
#define OBJECTSLINKSMANAGER_H
#include <string>
#include <map>
#include <vector>
#include <set>
#include <boost/weak_ptr.hpp>
class Object;
class Scene;
class RuntimeScene;

namespace GDpriv
{

namespace LinkedObjects
{

/**
 * \brief Manage links between objects of a scene
 */
class ObjectsLinksManager
{
public:
    /**
     * Link two object
     */
    void LinkObjects(boost::weak_ptr<Object> a, boost::weak_ptr<Object> b);

    /**
     * Remove link between a and b
     */
    void RemoveLinkBetween(boost::weak_ptr<Object> a, boost::weak_ptr<Object> b);

    /**
     * Remove all links concerning the object
     */
    void RemoveAllLinksOf(boost::weak_ptr<Object> object);

    /**
     * Get a list of all (raw pointers to) objects linked with the object
     */
    std::vector<Object*> GetAllRawPointersToObjectsLinkedWith(boost::weak_ptr<Object> object);


    /**
     * Get a list of (raw pointers to) objects, with the specified name, linked with the object
     */
    std::vector<Object*> GetRawPointersToObjectsLinkedWith(boost::weak_ptr<Object> object, std::string linkedName);

    /**
     * Delete all links
     */
    void ClearAll();

    static std::map < RuntimeScene* , ObjectsLinksManager > managers; //List of managers associated with scenes.

private:
    std::map < boost::weak_ptr<Object>, std::set< boost::weak_ptr<Object> > > links;
};

}
}

#endif // OBJECTSLINKSMANAGER_H
