/**

GDevelop - LinkedObjects Extension
Copyright (c) 2011-2013 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef LINKEDOBJECTSTOOLS_H_INCLUDED
#define LINKEDOBJECTSTOOLS_H_INCLUDED
#include <map>
#include <string>
#include <vector>
#include "GDCpp/Runtime/String.h"
class RuntimeObject;
class RuntimeScene;

namespace GDpriv {

namespace LinkedObjects {

void GD_EXTENSION_API LinkObjects(RuntimeScene &scene,
                                  RuntimeObject *a,
                                  RuntimeObject *b);
void GD_EXTENSION_API RemoveLinkBetween(RuntimeScene &scene,
                                        RuntimeObject *a,
                                        RuntimeObject *b);
void GD_EXTENSION_API RemoveAllLinksOf(RuntimeScene &scene,
                                       RuntimeObject *object);
bool GD_EXTENSION_API PickObjectsLinkedTo(
    RuntimeScene &scene,
    std::map<gd::String, std::vector<RuntimeObject *> *> pickedObjectsLists,
    RuntimeObject *object);

}  // namespace LinkedObjects

}  // namespace GDpriv

#endif  // LINKEDOBJECTSTOOLS_H_INCLUDED
