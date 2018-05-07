/**

GDevelop - LinkedObjects Extension
Copyright (c) 2011-2013 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef OBJECTSLINKSMANAGER_H
#define OBJECTSLINKSMANAGER_H
#include <map>
#include <set>
#include <string>
#include <vector>

class RuntimeObject;
class RuntimeScene;

namespace GDpriv {

namespace LinkedObjects {

/**
 * \brief Manage links between objects of a scene
 */
class GD_EXTENSION_API ObjectsLinksManager {
 public:
  /**
   * \brief Link two object
   */
  void LinkObjects(RuntimeObject* a, RuntimeObject* b);

  /**
   * \brief Remove link between a and b
   */
  void RemoveLinkBetween(RuntimeObject* a, RuntimeObject* b);

  /**
   * \brief Remove all links concerning the object
   */
  void RemoveAllLinksOf(RuntimeObject* object);

  /**
   * \brief Get a list of (raw pointers to) all objects linked with the
   * specified object
   */
  std::vector<RuntimeObject*> GetObjectsLinkedWith(RuntimeObject* object);

  /**
   * \brief Delete all links
   */
  void ClearAll();

  static std::map<RuntimeScene*, ObjectsLinksManager>
      managers;  // List of managers associated with scenes.

 private:
  std::map<RuntimeObject*, std::set<RuntimeObject*> > links;
};

}  // namespace LinkedObjects
}  // namespace GDpriv

#endif  // OBJECTSLINKSMANAGER_H
