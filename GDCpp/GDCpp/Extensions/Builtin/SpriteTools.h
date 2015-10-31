#ifndef SPRITETOOLS_H
#define SPRITETOOLS_H

#include <string>
#include <map>
#include <vector>

#include "GDCpp/String.h"

class RuntimeScene;
class RuntimeObject;

bool GD_API SpriteCollision(std::map <gd::String, std::vector<RuntimeObject*> *> objectsLists1, std::map <gd::String, std::vector<RuntimeObject*> *> objectsLists2, bool conditionInverted);

#endif // SPRITETOOLS_H
